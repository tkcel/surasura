import { logger } from "../logger";
import { TranscriptionService } from "../../services/transcription-service";
import { SettingsService } from "../../services/settings-service";
import { NativeBridge } from "../../services/platform/native-bridge-service";
import { AutoUpdaterService } from "../services/auto-updater";
import { RecordingManager } from "./recording-manager";
import { VADService } from "../../services/vad-service";
import { ShortcutManager } from "./shortcut-manager";
import { WindowManager } from "../core/window-manager";
import { isMacOS, isWindows } from "../../utils/platform";
import { OnboardingService } from "../../services/onboarding-service";
import { runHistoryCleanup } from "../../utils/history-cleanup";

/**
 * Service map for type-safe service access
 */
export interface ServiceMap {
  transcriptionService: TranscriptionService;
  settingsService: SettingsService;
  vadService: VADService;
  nativeBridge: NativeBridge;
  autoUpdaterService: AutoUpdaterService;
  recordingManager: RecordingManager;
  shortcutManager: ShortcutManager;
  windowManager: WindowManager;
  onboardingService: OnboardingService;
}

/**
 * Manages service initialization and lifecycle
 */
export class ServiceManager {
  private static instance: ServiceManager | null = null;
  private isInitialized = false;

  private transcriptionService: TranscriptionService | null = null;
  private settingsService: SettingsService | null = null;
  private vadService: VADService | null = null;
  private onboardingService: OnboardingService | null = null;

  private nativeBridge: NativeBridge | null = null;
  private autoUpdaterService: AutoUpdaterService | null = null;
  private recordingManager: RecordingManager | null = null;
  private shortcutManager: ShortcutManager | null = null;
  private windowManager: WindowManager | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.main.warn(
        "ServiceManager is already initialized, skipping initialization",
      );
      return;
    }

    try {
      this.initializeSettingsService();
      await this.initializeOnboardingService();
      this.initializePlatformServices();
      await this.initializeVADService();
      await this.initializeAIServices();
      this.initializeRecordingManager();
      await this.initializeShortcutManager();
      this.initializeAutoUpdater();

      // Run history cleanup on startup (non-blocking)
      this.runStartupCleanup();

      this.isInitialized = true;
      logger.main.info("Services initialized successfully");
    } catch (error) {
      logger.main.error("Failed to initialize services:", error);
      throw error;
    }
  }

  private initializeSettingsService(): void {
    this.settingsService = new SettingsService();
    logger.main.info("Settings service initialized");
  }

  private async initializeOnboardingService(): Promise<void> {
    if (!this.settingsService) {
      logger.main.warn("Settings service not available for onboarding");
      return;
    }

    this.onboardingService = OnboardingService.getInstance(this.settingsService);
    logger.main.info("Onboarding service initialized");
  }

  private async initializeVADService(): Promise<void> {
    try {
      this.vadService = new VADService();
      await this.vadService.initialize();
      logger.main.info("VAD service initialized");
    } catch (error) {
      logger.main.error("Failed to initialize VAD service:", error);
      // Don't throw - VAD is not critical for basic functionality
    }
  }

  private async initializeAIServices(): Promise<void> {
    try {
      if (!this.settingsService) {
        throw new Error("Settings service not initialized");
      }

      this.transcriptionService = new TranscriptionService(
        this.vadService!,
        this.settingsService,
        this.nativeBridge,
        this.onboardingService,
      );
      await this.transcriptionService.initialize();

      logger.transcription.info("Transcription Service initialized", {
        client: "OpenAI Whisper API",
      });
    } catch (error) {
      logger.transcription.error(
        "Error initializing Transcription Service:",
        error,
      );
      logger.transcription.warn(
        "Transcription will not work until configuration is fixed",
      );
      this.transcriptionService = null;
    }
  }

  private initializePlatformServices(): void {
    // Initialize platform-specific bridge
    if (isMacOS() || isWindows()) {
      this.nativeBridge = new NativeBridge();
    }
  }

  private initializeRecordingManager(): void {
    this.recordingManager = new RecordingManager(this);
    logger.main.info("Recording manager initialized");
  }

  private async initializeShortcutManager(): Promise<void> {
    if (!this.recordingManager || !this.settingsService) {
      throw new Error(
        "RecordingManager and SettingsService must be initialized first",
      );
    }
    this.shortcutManager = new ShortcutManager(this.settingsService);
    await this.shortcutManager.initialize(this.nativeBridge);

    // Connect shortcut events to recording manager
    this.recordingManager.setupShortcutListeners(this.shortcutManager);

    // Connect preset selection shortcut events
    this.setupPresetShortcutListeners(this.shortcutManager);

    logger.main.info("Shortcut manager initialized");
  }

  private setupPresetShortcutListeners(shortcutManager: ShortcutManager): void {
    // Track last triggered index to avoid repeated triggers while keys are held
    let lastTriggeredIndex: number | null = null;
    let lastTriggerTime = 0;
    const DEBOUNCE_MS = 500;

    shortcutManager.on("select-preset-triggered", async (index: number) => {
      const now = Date.now();

      // Debounce: ignore if same index triggered within debounce period
      if (index === lastTriggeredIndex && now - lastTriggerTime < DEBOUNCE_MS) {
        return;
      }

      lastTriggeredIndex = index;
      lastTriggerTime = now;

      try {
        if (!this.settingsService) {
          logger.main.warn(
            "SettingsService not available for preset selection",
          );
          return;
        }

        const preset = await this.settingsService.selectPresetByIndex(index);

        if (preset) {
          logger.main.info("Preset selected via shortcut", {
            index,
            presetId: preset.id,
            presetName: preset.name,
          });
          // IPC notification is handled by AppManager via "active-preset-changed" event
        } else {
          logger.main.debug("Preset selection skipped", {
            index,
            reason: "Index out of range or formatter disabled",
          });
        }
      } catch (error) {
        logger.main.error("Failed to select preset via shortcut", {
          error,
          index,
        });
      }
    });

    // Reset last triggered index when modifier keys are released
    shortcutManager.on("activeKeysChanged", (keys: string[]) => {
      if (!keys.includes("Cmd") && !keys.includes("Ctrl")) {
        lastTriggeredIndex = null;
      }
    });

    logger.main.info("Preset shortcut listeners initialized");
  }

  private initializeAutoUpdater(): void {
    this.autoUpdaterService = new AutoUpdaterService();
  }

  /**
   * Run startup cleanup tasks (non-blocking)
   * - History cleanup: 30日以上経過した履歴を削除、500件を超えた分を削除
   */
  private runStartupCleanup(): void {
    // Run cleanup asynchronously to not block startup
    runHistoryCleanup()
      .then((result) => {
        if (result.totalDeleted > 0) {
          logger.main.info("Startup history cleanup completed", result);
        }
      })
      .catch((error) => {
        logger.main.error("Startup history cleanup failed", { error });
      });
  }

  getLogger() {
    return logger;
  }

  getService<K extends keyof ServiceMap>(serviceName: K): ServiceMap[K] {
    if (!this.isInitialized) {
      throw new Error(
        "ServiceManager not initialized. Call initialize() first.",
      );
    }

    const services: ServiceMap = {
      transcriptionService: this.transcriptionService!,
      settingsService: this.settingsService!,
      vadService: this.vadService!,
      nativeBridge: this.nativeBridge!,
      autoUpdaterService: this.autoUpdaterService!,
      recordingManager: this.recordingManager!,
      shortcutManager: this.shortcutManager!,
      windowManager: this.windowManager!,
      onboardingService: this.onboardingService!,
    };

    return services[serviceName];
  }

  async cleanup(): Promise<void> {
    if (this.shortcutManager) {
      logger.main.info("Cleaning up shortcut manager...");
      this.shortcutManager.cleanup();
    }
    if (this.recordingManager) {
      logger.main.info("Cleaning up recording manager...");
      await this.recordingManager.cleanup();
    }

    if (this.vadService) {
      logger.main.info("Cleaning up VAD service...");
      await this.vadService.dispose();
    }

    if (this.nativeBridge) {
      logger.main.info("Stopping native helper...");
      this.nativeBridge.stopHelper();
    }
  }

  getOnboardingService(): OnboardingService | null {
    return this.onboardingService;
  }

  getSettingsService(): SettingsService | null {
    return this.settingsService;
  }

  static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  setWindowManager(windowManager: WindowManager): void {
    this.windowManager = windowManager;
    logger.main.info("Window manager registered with ServiceManager");
  }
}
