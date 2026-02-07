import {
  PipelineContext,
  StreamingPipelineContext,
  StreamingSession,
  TranscriptionProvider,
  FormattingProvider,
} from "../pipeline/core/pipeline-types";
import { createDefaultContext } from "../pipeline/core/context";
import { ProviderRegistry } from "../pipeline/core/provider-registry";
import { OpenAIWhisperProvider } from "../pipeline/providers/transcription/openai-whisper-provider";
import { OpenAIFormatter } from "../pipeline/providers/formatting/openai-formatter";
import { SettingsService } from "../services/settings-service";
import type { NativeBridge } from "./platform/native-bridge-service";
import type { OnboardingService } from "./onboarding-service";
import { createTranscription } from "../db/transcriptions";
import { getVocabulary, MAX_VOCABULARY_COUNT } from "../db/vocabulary";
import { logger } from "../main/logger";
import { v4 as uuid } from "uuid";
import { VADService } from "./vad-service";
import { Mutex } from "async-mutex";
import { dialog, clipboard } from "electron";

/**
 * Service for audio transcription and optional formatting
 */
export class TranscriptionService {
  private registry: ProviderRegistry;
  private openaiWhisperProvider: OpenAIWhisperProvider;
  private currentProvider: TranscriptionProvider | null = null;
  private streamingSessions = new Map<string, StreamingSession>();
  private vadService: VADService | null;
  private settingsService: SettingsService;
  private vadMutex: Mutex;
  private transcriptionMutex: Mutex;
  private lastTranscription: string | null = null;
  private formatterCache = new Map<string, OpenAIFormatter>();

  constructor(
    vadService: VADService,
    settingsService: SettingsService,
    private nativeBridge: NativeBridge | null,
    private onboardingService: OnboardingService | null,
  ) {
    this.registry = ProviderRegistry.getInstance();
    this.openaiWhisperProvider = new OpenAIWhisperProvider(settingsService);
    this.vadService = vadService;
    this.settingsService = settingsService;
    this.vadMutex = new Mutex();
    this.transcriptionMutex = new Mutex();

    // Register default providers
    this.registry.registerTranscriptionProvider(
      "openai-whisper",
      this.openaiWhisperProvider,
      { isDefault: true },
    );
  }

  /**
   * Select the appropriate transcription provider based on settings
   */
  private async selectProvider(): Promise<TranscriptionProvider> {
    // Get provider ID from pipeline settings (future: read from settings)
    const pipelineSettings = await this.settingsService.getPipelineSettings();
    const providerId =
      pipelineSettings?.transcriptionProviderId ?? "openai-whisper";

    // Try to get from registry
    const provider = this.registry.getTranscriptionProvider(providerId);
    if (provider) {
      this.currentProvider = provider;
      return provider;
    }

    // Fall back to default
    const defaultProvider = this.registry.getDefaultTranscriptionProvider();
    if (defaultProvider) {
      this.currentProvider = defaultProvider;
      return defaultProvider;
    }

    // Last resort: use the direct instance
    this.currentProvider = this.openaiWhisperProvider;
    return this.openaiWhisperProvider;
  }

  /**
   * Get a cached formatter instance, creating one if necessary
   */
  private getOrCreateFormatter(apiKey: string, modelId: string): OpenAIFormatter {
    const cacheKey = `${modelId}`;
    let formatter = this.formatterCache.get(cacheKey);

    if (!formatter) {
      formatter = new OpenAIFormatter(apiKey, modelId);
      this.formatterCache.set(cacheKey, formatter);
      logger.transcription.debug("Created new formatter instance", { modelId });
    }

    return formatter;
  }

  async initialize(): Promise<void> {
    // Check if OpenAI API is configured
    const isApiConfigured = await this.isApiConfigured();
    if (!isApiConfigured) {
      logger.transcription.info(
        "OpenAI API key not configured - transcription will require API key setup",
      );
      setTimeout(async () => {
        const onboardingCheck =
          await this.onboardingService?.checkNeedsOnboarding();
        if (!onboardingCheck?.needed) {
          dialog.showMessageBox({
            type: "warning",
            title: "APIキーが必要です",
            message: "OpenAI APIキーが設定されていません。",
            detail:
              "音声入力を使用するには、設定画面でOpenAI APIキーを設定してください。",
            buttons: ["OK"],
          });
        }
      }, 2000); // Delay to ensure windows are ready
    }

    logger.transcription.info("Transcription service initialized");
  }

  /**
   * Check if OpenAI API is configured
   */
  public async isApiConfigured(): Promise<boolean> {
    return this.openaiWhisperProvider.isApiConfigured();
  }

  /**
   * Process a single audio chunk in streaming mode
   * For finalization, use finalizeSession() instead
   */
  async processStreamingChunk(options: {
    sessionId: string;
    audioChunk: Float32Array;
    recordingStartedAt?: number;
  }): Promise<string> {
    const { sessionId, audioChunk, recordingStartedAt } = options;

    // Run VAD on the audio chunk
    let speechProbability = 0;
    let isSpeaking = false;

    if (audioChunk.length > 0 && this.vadService) {
      // Acquire VAD mutex
      await this.vadMutex.acquire();
      try {
        // Pass Float32Array directly to VAD
        const vadResult = await this.vadService.processAudioFrame(audioChunk);

        speechProbability = vadResult.probability;
        isSpeaking = vadResult.isSpeaking;
      } finally {
        // Release VAD mutex - always release even on error
        this.vadMutex.release();
      }

      logger.transcription.debug("VAD result", {
        probability: speechProbability.toFixed(3),
        isSpeaking,
      });
    }

    // Acquire transcription mutex
    await this.transcriptionMutex.acquire();

    // Auto-create session if it doesn't exist
    let session = this.streamingSessions.get(sessionId);

    try {
      if (!session) {
        const context = await this.buildContext();
        const streamingContext: StreamingPipelineContext = {
          ...context,
          sessionId,
          isPartial: true,
          isFinal: false,
          accumulatedTranscription: [],
        };

        // Get accessibility context from NativeBridge
        streamingContext.sharedData.accessibilityContext =
          this.nativeBridge?.getAccessibilityContext() ?? null;

        session = {
          context: streamingContext,
          transcriptionResults: [],
          firstChunkReceivedAt: performance.now(),
          recordingStartedAt: recordingStartedAt,
        };

        this.streamingSessions.set(sessionId, session);

        logger.transcription.info("Started streaming session", {
          sessionId,
        });
      }

      // Direct frame to Whisper - it will handle aggregation and VAD internally
      const previousChunk =
        session.transcriptionResults.length > 0
          ? session.transcriptionResults[
              session.transcriptionResults.length - 1
            ]
          : undefined;
      const aggregatedTranscription = session.transcriptionResults.join("");

      // Select the appropriate provider
      const provider = await this.selectProvider();

      // Transcribe chunk (flush is done separately in finalizeSession)
      const chunkTranscription = await provider.transcribe({
        audioData: audioChunk,
        speechProbability: speechProbability,
        context: {
          sessionId,
          vocabulary: session.context.sharedData.vocabulary,
          accessibilityContext: session.context.sharedData.accessibilityContext,
          previousChunk,
          aggregatedTranscription: aggregatedTranscription || undefined,
          language: session.context.sharedData.userPreferences?.language,
        },
      });

      // Accumulate the result only if Whisper returned something
      // (it returns empty string while buffering)
      if (chunkTranscription.trim()) {
        session.transcriptionResults.push(chunkTranscription);
        logger.transcription.info("Whisper returned transcription", {
          sessionId,
          transcriptionLength: chunkTranscription.length,
          totalResults: session.transcriptionResults.length,
        });
      }

      logger.transcription.debug("Processed frame", {
        sessionId,
        frameSize: audioChunk.length,
        hadTranscription: chunkTranscription.length > 0,
      });
    } finally {
      // Release transcription mutex - always release even on error
      this.transcriptionMutex.release();
    }

    return session.transcriptionResults.join("");
  }

  /**
   * Cancel a streaming session without processing
   * Used when recording is cancelled (e.g., quick tap, accidental activation)
   */
  async cancelStreamingSession(sessionId: string): Promise<void> {
    if (this.streamingSessions.has(sessionId)) {
      // Acquire mutex to prevent race with processStreamingChunk
      await this.transcriptionMutex.acquire();
      try {
        // Clear provider buffers to prevent audio bleed into next session
        this.currentProvider?.reset();

        this.streamingSessions.delete(sessionId);
        logger.transcription.info("Streaming session cancelled", { sessionId });
      } finally {
        this.transcriptionMutex.release();
      }
    }
  }

  /**
   * Finalize a streaming session - flush provider, format, save to DB
   * Call this instead of processStreamingChunk with isFinal=true
   */
  async finalizeSession(options: {
    sessionId: string;
    audioFilePath?: string;
    recordingStartedAt?: number;
    recordingStoppedAt?: number;
  }): Promise<string> {
    const { sessionId, audioFilePath, recordingStartedAt, recordingStoppedAt } =
      options;

    const session = this.streamingSessions.get(sessionId);
    if (!session) {
      logger.transcription.warn("No session found to finalize", { sessionId });
      return "";
    }

    // Update session timestamps
    session.finalizationStartedAt = performance.now();
    session.recordingStoppedAt = recordingStoppedAt;
    if (recordingStartedAt && !session.recordingStartedAt) {
      session.recordingStartedAt = recordingStartedAt;
    }

    const formatterConfig = await this.settingsService.getFormatterConfig();

    // Flush provider to get any remaining buffered audio
    await this.transcriptionMutex.acquire();
    try {
      const previousChunk =
        session.transcriptionResults.length > 0
          ? session.transcriptionResults[
              session.transcriptionResults.length - 1
            ]
          : undefined;
      const aggregatedTranscription = session.transcriptionResults.join("");

      const provider = await this.selectProvider();
      const finalTranscription = await provider.flush({
        sessionId,
        vocabulary: session.context.sharedData.vocabulary,
        accessibilityContext: session.context.sharedData.accessibilityContext,
        previousChunk,
        aggregatedTranscription: aggregatedTranscription || undefined,
        language: session.context.sharedData.userPreferences?.language,
        formattingEnabled: false,
      });

      if (finalTranscription.trim()) {
        session.transcriptionResults.push(finalTranscription);
        logger.transcription.info("Whisper returned final transcription", {
          sessionId,
          transcriptionLength: finalTranscription.length,
          totalResults: session.transcriptionResults.length,
        });
      }
    } finally {
      this.transcriptionMutex.release();
    }

    let completeTranscription = session.transcriptionResults.join("");

    // Apply simple pre-formatting (handles Whisper leading space artifact)
    const preSelectionText =
      session.context.sharedData.accessibilityContext?.context?.textSelection
        ?.preSelectionText;
    completeTranscription = this.preFormatLocalTranscription(
      completeTranscription,
      preSelectionText,
    );

    let formattingDuration: number | undefined;

    logger.transcription.info("Finalizing streaming session", {
      sessionId,
      rawTranscriptionLength: completeTranscription.length,
      chunkCount: session.transcriptionResults.length,
    });

    // Fetch formatter config on-demand
    let formattingUsed = false;
    let formattingModel: string | undefined;

    if (!formatterConfig || !formatterConfig.enabled) {
      logger.transcription.debug("Formatting skipped: disabled in config");
    } else if (!completeTranscription.trim().length) {
      logger.transcription.debug("Formatting skipped: empty transcription");
    } else {
      // Get active preset to determine model
      const activePreset = await this.settingsService.getActivePreset();

      // Determine model ID from preset or config
      const modelId =
        activePreset?.modelId ||
        formatterConfig.modelId ||
        (await this.settingsService.getDefaultLanguageModel()) ||
        "gpt-4o-mini";

      // Use OpenAI formatter
      const openaiConfig = await this.settingsService.getOpenAIConfig();
      if (!openaiConfig?.apiKey) {
        logger.transcription.warn("Formatting skipped: OpenAI API key missing");
      } else {
        logger.transcription.info("Starting formatting", {
          sessionId,
          provider: "OpenAI",
          model: modelId,
          presetName: activePreset?.name,
        });

        // Use cached formatter instance
        const formatter = this.getOrCreateFormatter(openaiConfig.apiKey, modelId);
        const result = await this.formatWithProvider(
          formatter,
          sessionId,
          completeTranscription,
          session,
        );
        if (result) {
          completeTranscription = result.text;
          formattingDuration = result.duration;
          formattingUsed = true;
          formattingModel = modelId;
        }
      }
    }

    // Apply vocabulary replacements (final post-processing step)
    const replacements = session.context.sharedData.replacements;
    if (replacements.size > 0) {
      const beforeReplacements = completeTranscription;
      completeTranscription = this.applyReplacements(
        completeTranscription,
        replacements,
      );
      if (beforeReplacements !== completeTranscription) {
        logger.transcription.info("Applied vocabulary replacements", {
          sessionId,
          replacementCount: replacements.size,
          originalLength: beforeReplacements.length,
          newLength: completeTranscription.length,
        });
      }
    }

    // Save directly to database
    logger.transcription.info("Saving transcription with audio file", {
      sessionId,
      audioFilePath,
      hasAudioFile: !!audioFilePath,
    });

    await createTranscription({
      text: completeTranscription,
      language: session.context.sharedData.userPreferences?.language || "en",
      duration: session.context.sharedData.audioMetadata?.duration,
      speechModel: "whisper-local",
      formattingModel,
      audioFile: audioFilePath,
      meta: {
        sessionId,
        source: session.context.sharedData.audioMetadata?.source,
        vocabularySize: session.context.sharedData.vocabulary?.length || 0,
        formattingStyle:
          session.context.sharedData.userPreferences?.formattingStyle,
      },
    });

    this.streamingSessions.delete(sessionId);

    // Save as last transcription for paste-last feature
    if (completeTranscription.trim()) {
      this.lastTranscription = completeTranscription;
    }

    logger.transcription.info("Streaming session completed", { sessionId });
    return completeTranscription;
  }

  /**
   * Get the last successful transcription
   */
  getLastTranscription(): string | null {
    return this.lastTranscription;
  }

  private async buildContext(): Promise<PipelineContext> {
    // Create default context
    const context = createDefaultContext(uuid());

    // Load dictation settings to get language preference
    const dictationSettings = await this.settingsService.getDictationSettings();
    if (dictationSettings) {
      context.sharedData.userPreferences.language =
        dictationSettings.selectedLanguage || "ja";
    }

    // Load vocabulary, replacements, and dictionary entries
    const vocabEntries = await getVocabulary({ limit: MAX_VOCABULARY_COUNT });
    for (const entry of vocabEntries) {
      // Always add word to vocabulary for Whisper hints
      context.sharedData.vocabulary.push(entry.word);

      // Build dictionary entry with readings
      const readings: string[] = [];
      if (entry.reading1) readings.push(entry.reading1);
      if (entry.reading2) readings.push(entry.reading2);
      if (entry.reading3) readings.push(entry.reading3);

      if (readings.length > 0) {
        context.sharedData.dictionaryEntries.push({
          word: entry.word,
          readings,
        });

        // Add readings as replacements for post-processing
        for (const reading of readings) {
          context.sharedData.replacements.set(reading, entry.word);
        }
      }

      // Legacy fallback: handle old isReplacement entries that haven't been migrated
      if (entry.isReplacement && entry.replacementWord) {
        context.sharedData.replacements.set(
          entry.word,
          entry.replacementWord,
        );
      }
    }

    return context;
  }

  /**
   * Simple pre-formatter for local Transcription models.
   * Handles leading space based on insertion context to avoid double spaces or unwanted leading whitespace.
   * Runs before LLM formatter (if configured) to ensure clean input.
   */
  private preFormatLocalTranscription(
    transcription: string,
    preSelectionText: string | null | undefined,
  ): string {
    if (!transcription.startsWith(" ")) {
      return transcription;
    }

    // Strip leading space only if previous text exists and ends with ASCII whitespace.
    // When there's no previous text (null/undefined/""), keep the leading space.
    const shouldStripLeadingSpace =
      preSelectionText !== undefined &&
      preSelectionText !== null &&
      (preSelectionText.length === 0 || /[ \t\r\n]$/.test(preSelectionText));

    return shouldStripLeadingSpace ? transcription.slice(1) : transcription;
  }

  /**
   * Apply vocabulary replacements to transcription text.
   * Uses case-insensitive Unicode-aware word boundary matching to replace terms.
   * Works across all languages and scripts (Latin, Cyrillic, CJK, Arabic, etc.).
   * Runs after LLM formatting as the final post-processing step.
   */
  private applyReplacements(
    text: string,
    replacements: Map<string, string>,
  ): string {
    if (replacements.size === 0 || !text) {
      return text;
    }

    let result = text;

    for (const [word, replacement] of replacements) {
      // Escape special regex characters in the word
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Use Unicode-aware word boundaries:
      // - \p{L} matches any Unicode letter (Latin, Cyrillic, CJK, Arabic, etc.)
      // - \p{N} matches any Unicode number
      // - Negative lookbehind/lookahead ensures word is not part of a larger word
      const regex = new RegExp(
        `(?<![\\p{L}\\p{N}])${escapedWord}(?![\\p{L}\\p{N}])`,
        "giu",
      );
      result = result.replace(regex, replacement);
    }

    return result;
  }

  private async formatWithProvider(
    provider: FormattingProvider,
    sessionId: string,
    text: string,
    session: StreamingSession,
  ): Promise<{ text: string; duration: number } | null> {
    const startTime = performance.now();
    const style = session.context.sharedData.userPreferences?.formattingStyle;

    // Get active preset for custom formatting instructions
    const activePreset = await this.settingsService.getActivePreset();

    // Get clipboard content for {{clipboard}} template variable
    let clipboardText: string | undefined;
    try {
      clipboardText = clipboard.readText();
    } catch (error) {
      logger.transcription.warn("Failed to read clipboard", { error });
    }

    try {
      const formattedText = await provider.format({
        text,
        context: {
          style,
          vocabulary: session.context.sharedData.vocabulary,
          dictionaryEntries: session.context.sharedData.dictionaryEntries,
          accessibilityContext: session.context.sharedData.accessibilityContext,
          clipboardText,
          previousChunk:
            session.transcriptionResults.length > 1
              ? session.transcriptionResults[
                  session.transcriptionResults.length - 2
                ]
              : undefined,
          aggregatedTranscription: text,
          preset: activePreset,
        },
      });

      const duration = performance.now() - startTime;

      logger.transcription.info("Text formatted successfully", {
        sessionId,
        originalLength: text.length,
        formattedLength: formattedText.length,
        formattingDuration: duration,
      });

      return { text: formattedText, duration };
    } catch (error) {
      logger.transcription.error("Formatting failed, using unformatted text", {
        sessionId,
        error,
      });
      return null;
    }
  }

  /**
   * Cleanup method
   */
  async dispose(): Promise<void> {
    await this.openaiWhisperProvider.dispose();
    this.formatterCache.clear();
    // VAD service is managed by ServiceManager
    logger.transcription.info("Transcription service disposed");
  }
}
