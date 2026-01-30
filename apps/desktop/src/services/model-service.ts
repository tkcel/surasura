import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { app } from "electron";
import {
  AvailableWhisperModel,
  DownloadProgress,
  ModelManagerState,
  AVAILABLE_MODELS,
} from "../constants/models";
import { Model as DBModel, NewModel } from "../db/schema";
import {
  getModelsByProvider,
  getDownloadedWhisperModels,
  removeModel,
  modelExists,
  syncLocalWhisperModels,
  getAllModels,
  upsertModel,
} from "../db/models";
import { ValidationResult } from "../types/providers";
import { SettingsService } from "./settings-service";
import { logger } from "../main/logger";
import { getUserAgent } from "../utils/http-client";

// Type for models fetched from external APIs
type FetchedModel = Pick<DBModel, "id" | "name" | "provider"> &
  Partial<DBModel>;

interface ModelManagerEvents {
  "download-progress": (modelId: string, progress: DownloadProgress) => void;
  "download-complete": (modelId: string, downloadedModel: DBModel) => void;
  "download-error": (modelId: string, error: Error) => void;
  "download-cancelled": (modelId: string) => void;
  "model-deleted": (modelId: string) => void;
  "selection-changed": (
    oldModelId: string | null,
    newModelId: string | null,
    reason:
      | "manual"
      | "auto-first-download"
      | "auto-after-deletion"
      | "cleared",
    modelType: "speech" | "language",
  ) => void;
}

class ModelService extends EventEmitter {
  private state: ModelManagerState;
  private modelsDirectory: string;
  private settingsService: SettingsService;

  constructor(settingsService: SettingsService) {
    super();
    this.state = {
      activeDownloads: new Map(),
    };
    this.settingsService = settingsService;

    // Create models directory in app data
    this.modelsDirectory = path.join(app.getPath("userData"), "models");
    this.ensureModelsDirectory();
  }

  // Type-safe event emitter methods
  on<U extends keyof ModelManagerEvents>(
    event: U,
    listener: ModelManagerEvents[U],
  ): this {
    return super.on(event, listener);
  }

  emit<U extends keyof ModelManagerEvents>(
    event: U,
    ...args: Parameters<ModelManagerEvents[U]>
  ): boolean {
    return super.emit(event, ...args);
  }

  off<U extends keyof ModelManagerEvents>(
    event: U,
    listener: ModelManagerEvents[U],
  ): this {
    return super.off(event, listener);
  }

  once<U extends keyof ModelManagerEvents>(
    event: U,
    listener: ModelManagerEvents[U],
  ): this {
    return super.once(event, listener);
  }

  // Initialize and validate models on startup
  async initialize(): Promise<void> {
    try {
      // Sync Whisper models with filesystem
      const whisperModelsData = AVAILABLE_MODELS.map((model) => ({
        id: model.id,
        name: model.name,
        description: model.description,
        size: model.sizeFormatted,
        checksum: model.checksum,
        speed: model.speed,
        accuracy: model.accuracy,
        filename: model.filename,
      }));

      const syncResult = await syncLocalWhisperModels(
        this.modelsDirectory,
        whisperModelsData,
      );

      logger.main.info("Model manager initialized", {
        added: syncResult.added,
        updated: syncResult.updated,
        removed: syncResult.removed,
      });

      // Restore selected model from settings and validate availability
      const savedSelection = await this.settingsService.getDefaultSpeechModel();

      if (!savedSelection) {
        // No saved selection, check if we have downloaded models to auto-select
        const downloadedModels = await this.getValidDownloadedModels();
        const downloadedModelCount = Object.keys(downloadedModels).length;

        if (downloadedModelCount > 0) {
          // Auto-select the best available model using the preferred order
          const preferredOrder = [
            "whisper-large-v3-turbo",
            "whisper-large-v3",
            "whisper-medium",
            "whisper-small",
            "whisper-base",
            "whisper-tiny",
          ];

          for (const candidateId of preferredOrder) {
            if (downloadedModels[candidateId]) {
              await this.applySpeechModelSelection(
                candidateId,
                "auto-first-download",
                null,
              );
              logger.main.info("Auto-selected speech model on initialization", {
                modelId: candidateId,
                availableModels: Object.keys(downloadedModels),
              });
              break;
            }
          }
        }
      }

      // Validate all default models after sync
      await this.validateAndClearInvalidDefaults();
    } catch (error) {
      logger.main.error("Error initializing model manager", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private ensureModelsDirectory(): void {
    if (!fs.existsSync(this.modelsDirectory)) {
      fs.mkdirSync(this.modelsDirectory, { recursive: true });
      logger.main.info("Created models directory", {
        path: this.modelsDirectory,
      });
    }
  }

  // Get all available models from manifest
  getAvailableModels(): AvailableWhisperModel[] {
    return AVAILABLE_MODELS;
  }

  // Get downloaded models from database
  async getDownloadedModels(): Promise<Record<string, DBModel>> {
    const models = await getDownloadedWhisperModels();
    const record: Record<string, DBModel> = {};

    for (const model of models) {
      record[model.id] = model;
    }

    return record;
  }

  // Get only valid downloaded models (files that exist on disk)
  // Since we sync on init and only store downloaded models, all models in DB are valid
  async getValidDownloadedModels(): Promise<Record<string, DBModel>> {
    return this.getDownloadedModels();
  }

  // Check if a model is downloaded
  // Since we only store downloaded models, just check if it exists in DB
  async isModelDownloaded(modelId: string): Promise<boolean> {
    const models = await getModelsByProvider("local-whisper");
    return models.some((m) => m.id === modelId);
  }

  // Get download progress for a model
  getDownloadProgress(modelId: string): DownloadProgress | null {
    return this.state.activeDownloads.get(modelId) || null;
  }

  // Get all active downloads
  getActiveDownloads(): DownloadProgress[] {
    return Array.from(this.state.activeDownloads.values());
  }

  // Download a model
  async downloadModel(modelId: string): Promise<void> {
    const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    if (await this.isModelDownloaded(modelId)) {
      throw new Error(`Model already downloaded: ${modelId}`);
    }

    if (this.state.activeDownloads.has(modelId)) {
      throw new Error(`Download already in progress: ${modelId}`);
    }

    const abortController = new AbortController();
    const downloadPath = path.join(this.modelsDirectory, model.filename);

    const progress: DownloadProgress = {
      modelId,
      progress: 0,
      status: "downloading",
      bytesDownloaded: 0,
      totalBytes: model.size,
      abortController,
    };

    this.state.activeDownloads.set(modelId, progress);
    this.emit("download-progress", modelId, progress);

    try {
      logger.main.info("Starting model download", {
        modelId,
        size: model.sizeFormatted,
        url: model.downloadUrl,
      });

      const response = await fetch(model.downloadUrl, {
        signal: abortController.signal,
        headers: {
          "User-Agent": getUserAgent(),
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to download: ${response.status} ${response.statusText}`,
        );
      }

      const totalBytes =
        parseInt(response.headers.get("content-length") || "0") || model.size;
      progress.totalBytes = totalBytes;

      const fileStream = fs.createWriteStream(downloadPath);
      let bytesDownloaded = 0;
      let lastProgressEmit = 0;

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        if (abortController.signal.aborted) {
          fileStream.close();
          fs.unlinkSync(downloadPath);
          throw new Error("Download cancelled");
        }

        fileStream.write(value);
        bytesDownloaded += value.length;

        progress.bytesDownloaded = bytesDownloaded;
        progress.progress = Math.round((bytesDownloaded / totalBytes) * 100);

        // Emit progress every 1% or 1MB to avoid too many events
        const progressPercent = progress.progress;
        if (
          progressPercent - lastProgressEmit >= 1 ||
          bytesDownloaded - (lastProgressEmit * totalBytes) / 100 >= 1024 * 1024
        ) {
          this.emit("download-progress", modelId, { ...progress });
          lastProgressEmit = progressPercent;
        }
      }

      fileStream.end();

      // Get actual file size (no validation against expected size)
      const stats = fs.statSync(downloadPath);
      logger.main.info("Download completed", {
        modelId,
        expectedSize: totalBytes,
        actualSize: stats.size,
        sizeDifference: Math.abs(stats.size - totalBytes),
      });

      // Verify checksum if provided
      if (model.checksum) {
        const fileChecksum = await this.calculateFileChecksum(downloadPath);
        if (fileChecksum !== model.checksum) {
          fs.unlinkSync(downloadPath);
          throw new Error(
            `Checksum mismatch. Expected: ${model.checksum}, Got: ${fileChecksum}`,
          );
        }
      }

      // Create/update model record in database with download info
      await upsertModel({
        id: model.id,
        provider: "local-whisper",
        name: model.name,
        type: "speech",
        size: model.sizeFormatted,
        description: model.description,
        checksum: model.checksum,
        speed: model.speed,
        accuracy: model.accuracy,
        localPath: downloadPath,
        sizeBytes: stats.size,
        downloadedAt: new Date(),
        context: null,
        originalModel: null,
      });

      // Get the updated model from database
      const downloadedModel = await getModelsByProvider("local-whisper").then(
        (models) => models.find((m) => m.id === model.id),
      );

      if (!downloadedModel) {
        throw new Error("Failed to retrieve downloaded model from database");
      }

      // Clean up active download
      this.state.activeDownloads.delete(modelId);

      logger.main.info("Model download completed", {
        modelId,
        path: downloadPath,
        size: stats.size,
      });

      // Auto-select if this is the first model
      const allDownloadedModels = await this.getValidDownloadedModels();
      const downloadedModelCount = Object.keys(allDownloadedModels).length;
      const currentSelection =
        await this.settingsService.getDefaultSpeechModel();

      if (downloadedModelCount === 1 && !currentSelection) {
        await this.applySpeechModelSelection(
          modelId,
          "auto-first-download",
          null,
        );
        logger.main.info("Auto-selected first downloaded model", { modelId });
      }

      this.emit("download-complete", modelId, downloadedModel);
    } catch (error) {
      // Clean up on error
      this.state.activeDownloads.delete(modelId);

      if (fs.existsSync(downloadPath)) {
        fs.unlinkSync(downloadPath);
      }

      const err = error instanceof Error ? error : new Error(String(error));

      if (abortController.signal.aborted) {
        logger.main.info("Model download cancelled", { modelId });
        this.emit("download-cancelled", modelId);
        return; // Don't throw - it's an intentional cancellation
      } else {
        logger.main.error("Model download failed", {
          modelId,
          error: err.message,
        });
        this.emit("download-error", modelId, err);
        throw err; // Only throw for actual errors
      }
    }
  }

  // Cancel a model download
  cancelDownload(modelId: string): void {
    const download = this.state.activeDownloads.get(modelId);
    if (!download) {
      throw new Error(`No active download found for model: ${modelId}`);
    }

    download.status = "cancelling";
    download.abortController?.abort();

    // Immediately remove from active downloads to prevent restart issues
    this.state.activeDownloads.delete(modelId);

    logger.main.info("Cancelled model download", { modelId });
    this.emit("download-cancelled", modelId);
  }

  // Delete a downloaded model
  async deleteModel(modelId: string): Promise<void> {
    const models = await getModelsByProvider("local-whisper");
    const downloadedModel = models.find((m) => m.id === modelId);

    if (!downloadedModel) {
      throw new Error(`Model not found: ${modelId}`);
    }

    // Check if this is the selected model BEFORE deletion
    const currentSelection = await this.settingsService.getDefaultSpeechModel();
    const wasSelected = currentSelection === modelId;

    // Delete file
    if (downloadedModel.localPath && fs.existsSync(downloadedModel.localPath)) {
      fs.unlinkSync(downloadedModel.localPath);
      logger.main.info("Deleted model file", {
        modelId,
        path: downloadedModel.localPath,
      });
    }

    // Remove the model record from database (we only store downloaded models)
    await removeModel(downloadedModel.provider, downloadedModel.id);

    // Handle selection update if needed
    if (wasSelected) {
      // Try to auto-select next best model
      const remainingModels = await this.getValidDownloadedModels();
      const preferredOrder = [
        "whisper-large-v3-turbo",
        "whisper-large-v1",
        "whisper-medium",
        "whisper-small",
        "whisper-base",
        "whisper-tiny",
      ];

      let autoSelected = false;
      for (const candidateId of preferredOrder) {
        if (remainingModels[candidateId]) {
          await this.applySpeechModelSelection(
            candidateId,
            "auto-after-deletion",
            modelId,
          );
          logger.main.info("Auto-selected new model after deletion", {
            oldModel: modelId,
            newModel: candidateId,
          });
          autoSelected = true;
          break;
        }
      }

      if (!autoSelected) {
        // No models left, selection cleared
        await this.applySpeechModelSelection(null, "cleared", modelId);
        logger.main.info(
          "No models available for auto-selection after deletion",
        );
      }
    }

    this.emit("model-deleted", modelId);

    // Validate all default models after deletion
    await this.validateAndClearInvalidDefaults();
  }

  // Calculate file checksum (SHA-1)
  private async calculateFileChecksum(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash("sha1");
      const stream = fs.createReadStream(filePath);

      stream.on("data", (data) => hash.update(data));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", reject);
    });
  }

  // Get models directory path
  getModelsDirectory(): string {
    return this.modelsDirectory;
  }

  // Check if any models are available for transcription
  async isAvailable(): Promise<boolean> {
    const downloadedModels = await this.getValidDownloadedModels();
    return Object.keys(downloadedModels).length > 0;
  }

  // Get available model IDs for transcription
  async getAvailableModelsForTranscription(): Promise<string[]> {
    const downloadedModels = await this.getValidDownloadedModels();
    return Object.keys(downloadedModels);
  }

  // Get currently selected model for transcription
  async getSelectedModel(): Promise<string | null> {
    return (await this.settingsService.getDefaultSpeechModel()) || null;
  }

  private async syncFormatterConfigForSpeechChange(
    oldModelId: string | null,
    newModelId: string | null,
  ): Promise<void> {
    if (oldModelId === newModelId) {
      return;
    }

    const formatterConfig =
      (await this.settingsService.getFormatterConfig()) || { enabled: false };
    const currentModelId = formatterConfig.modelId;
    const fallbackModelId = formatterConfig.fallbackModelId;
    const movedToCloud = newModelId === "amical-cloud";
    const movedFromCloud = oldModelId === "amical-cloud";
    const usingCloudFormatting = currentModelId === "amical-cloud";

    let nextConfig = { ...formatterConfig };
    let updated = false;

    if (movedToCloud && !usingCloudFormatting) {
      if (currentModelId && currentModelId !== "amical-cloud") {
        nextConfig.fallbackModelId = currentModelId;
      } else if (!fallbackModelId) {
        const defaultLanguageModel =
          await this.settingsService.getDefaultLanguageModel();
        if (defaultLanguageModel) {
          nextConfig.fallbackModelId = defaultLanguageModel;
        }
      }

      nextConfig.modelId = "amical-cloud";
      nextConfig.enabled = true;
      updated = true;
    } else if (movedFromCloud && usingCloudFormatting) {
      const fallback =
        fallbackModelId ||
        (await this.settingsService.getDefaultLanguageModel());

      nextConfig.modelId =
        fallback && fallback !== "amical-cloud" ? fallback : undefined;
      updated = true;
    }

    if (updated) {
      await this.settingsService.setFormatterConfig(nextConfig);
    }
  }

  private async applySpeechModelSelection(
    modelId: string | null,
    reason:
      | "manual"
      | "auto-first-download"
      | "auto-after-deletion"
      | "cleared",
    oldModelId?: string | null,
  ): Promise<void> {
    const previousModelId = oldModelId ?? (await this.getSelectedModel());

    if (previousModelId === modelId) {
      return;
    }

    await this.settingsService.setDefaultSpeechModel(modelId || undefined);
    await this.syncFormatterConfigForSpeechChange(previousModelId, modelId);

    this.emit("selection-changed", previousModelId, modelId, reason, "speech");
    logger.main.info("Model selection changed", {
      from: previousModelId,
      to: modelId,
      reason,
    });
  }

  // Set selected model for transcription
  async setSelectedModel(modelId: string | null): Promise<void> {
    const oldModelId = await this.getSelectedModel();

    // If setting to a specific model, validate it exists and is downloaded
    if (modelId) {
      const downloadedModels = await this.getValidDownloadedModels();
      if (!downloadedModels[modelId]) {
        throw new Error(`Model not downloaded: ${modelId}`);
      }
    }

    await this.applySpeechModelSelection(modelId, "manual", oldModelId);
  }

  // Get best available model path for transcription (used by WhisperProvider)
  async getBestAvailableModelPath(): Promise<string | null> {
    const downloadedModels = await this.getValidDownloadedModels();
    const selectedModelId = await this.getSelectedModel();

    // If a specific model is selected and available, use it
    if (selectedModelId && downloadedModels[selectedModelId]) {
      return downloadedModels[selectedModelId].localPath;
    }

    // Otherwise, find the best available model (prioritize by quality)
    const preferredOrder = [
      "whisper-large-v3-turbo",
      "whisper-large-v1",
      "whisper-medium",
      "whisper-small",
      "whisper-base",
      "whisper-tiny",
    ];

    for (const modelId of preferredOrder) {
      const model = downloadedModels[modelId];
      if (model?.localPath) {
        return model.localPath;
      }
    }

    return null;
  }

  // Cleanup - cancel all active downloads
  cleanup(): void {
    logger.main.info("Cleaning up model downloads", {
      activeDownloads: this.state.activeDownloads.size,
    });

    for (const [modelId] of this.state.activeDownloads) {
      try {
        this.cancelDownload(modelId);
      } catch (error) {
        logger.main.warn("Error cancelling download during cleanup", {
          modelId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  // ============================================
  // OpenAI API Methods
  // ============================================

  /**
   * Validate OpenAI connection by testing API key
   */
  async validateOpenAIConnection(apiKey: string): Promise<ValidationResult> {
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": getUserAgent(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          (errorData as any)?.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        return {
          success: false,
          error: errorMessage,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }

  /**
   * Get all synced provider models from database
   */
  async getSyncedProviderModels(): Promise<DBModel[]> {
    const models = await getAllModels();
    // Filter to only remote provider models (exclude local-whisper)
    return models.filter((m) => m.provider !== "local-whisper");
  }

  // ============================================
  // Unified Model Selection Methods
  // ============================================

  /**
   * Get default language model
   */
  async getDefaultLanguageModel(): Promise<string | null> {
    const modelId = await this.settingsService.getDefaultLanguageModel();
    return modelId || null;
  }

  /**
   * Set default language model
   */
  async setDefaultLanguageModel(modelId: string | null): Promise<void> {
    await this.settingsService.setDefaultLanguageModel(modelId || undefined);
  }

  /**
   * Validate and clear invalid default models
   * Checks if default models still exist in the database
   * Clears any that don't exist and emits selection-changed events
   */
  async validateAndClearInvalidDefaults(): Promise<void> {
    // Check default speech model
    const defaultSpeechModel =
      await this.settingsService.getDefaultSpeechModel();
    if (defaultSpeechModel) {
      const existsInDb = await modelExists("local-whisper", defaultSpeechModel);

      // Local models must exist in DB
      if (!existsInDb) {
        logger.main.info("Clearing invalid default speech model", {
          modelId: defaultSpeechModel,
        });
        await this.applySpeechModelSelection(
          null,
          "auto-after-deletion",
          defaultSpeechModel,
        );
      }
    }
  }
}

export { ModelService };
