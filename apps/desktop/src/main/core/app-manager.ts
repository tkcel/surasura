import { app, ipcMain, shell, dialog } from "electron";
import { initializeDatabase } from "../../db";
import { logger } from "../logger";
import { WindowManager } from "./window-manager";
import { setupApplicationMenu } from "../menu";
import { ServiceManager } from "../managers/service-manager";
import { TrayManager } from "../managers/tray-manager";
import { createIPCHandler } from "electron-trpc-experimental/main";
import { router } from "../../trpc/router";
import { createContext } from "../../trpc/context";
import { cleanupAudioFiles } from "../../utils/audio-file-cleanup";
import type { OnboardingService } from "../../services/onboarding-service";
import type { RecordingManager } from "../managers/recording-manager";
import type { RecordingState } from "../../types/recording";
import type { SettingsService } from "../../services/settings-service";

export class AppManager {
  private windowManager!: WindowManager;
  private serviceManager: ServiceManager;
  private trayManager: TrayManager;
  private trpcHandler!: ReturnType<typeof createIPCHandler>;

  constructor() {
    this.serviceManager = ServiceManager.getInstance();
    this.trayManager = TrayManager.getInstance();
    // WindowManager created in initialize() after deps are ready
  }

  async initialize(): Promise<void> {
    await this.initializeDatabase();

    // Clean up old audio files on startup
    await cleanupAudioFiles();
    logger.main.info("Audio file cleanup completed");

    await this.serviceManager.initialize();

    // Initialize tRPC handler (services must be ready first)
    this.trpcHandler = createIPCHandler({
      router,
      windows: [],
      createContext: async () => createContext(this.serviceManager),
    });
    logger.main.info("tRPC handler initialized");

    // Create WindowManager now that all deps are ready
    const settingsService = this.serviceManager.getService("settingsService");
    this.windowManager = new WindowManager(settingsService, this.trpcHandler);

    // Register WindowManager with ServiceManager for getService("windowManager")
    this.serviceManager.setWindowManager(this.windowManager);

    // Get onboarding service and subscribe to lifecycle events
    const onboardingService =
      this.serviceManager.getService("onboardingService");
    this.setupOnboardingEventListeners(onboardingService);

    // Subscribe to recording state changes for widget visibility
    const recordingManager = this.serviceManager.getService("recordingManager");
    this.setupRecordingEventListeners(recordingManager);

    // Check if onboarding is needed using OnboardingService (single source of truth)
    const onboardingCheck = await onboardingService.checkNeedsOnboarding();

    // Sync auto-launch setting with OS on startup
    settingsService.syncAutoLaunch();
    logger.main.info("Auto-launch setting synced with OS");

    // Subscribe to settings changes for window updates
    this.setupSettingsEventListeners(settingsService);

    if (onboardingCheck.needed) {
      await onboardingService.startOnboardingFlow();
      await this.windowManager.createOrShowOnboardingWindow();
    } else {
      await this.setupWindows();
      // Start permission monitoring after normal app startup
      onboardingService.startPermissionMonitoring();
    }

    await this.setupMenu();

    // Initialize tray
    this.trayManager.initialize(this.windowManager);

    // Setup IPC handlers
    ipcMain.handle("open-external", async (_event, url: string) => {
      await shell.openExternal(url);
      logger.main.debug("Opening external URL", { url });
    });

    // Auto-update is now handled by update-electron-app in main.ts

    logger.main.info("Application initialized successfully");
  }

  private async initializeDatabase(): Promise<void> {
    await initializeDatabase();
    logger.db.info(
      "Database initialized and migrations completed successfully",
    );
  }

  private setupOnboardingEventListeners(
    onboardingService: OnboardingService,
  ): void {
    // Handle onboarding completion
    onboardingService.on("completed", () => {
      const shouldRelaunch = process.env.NODE_ENV !== "development";
      logger.main.info("Onboarding completed event received", {
        shouldRelaunch,
      });

      this.windowManager.closeOnboardingWindow();

      if (shouldRelaunch) {
        // Production: relaunch app to reinitialize with new settings
        logger.main.info("Relaunching app after onboarding completion");
        app.relaunch();
        app.quit();
      } else {
        // Development: just show the main app windows
        logger.main.info("Dev mode: showing main app windows after onboarding");
        this.setupWindows();
        // Start permission monitoring after onboarding
        onboardingService.startPermissionMonitoring();
      }
    });

    // Handle onboarding cancellation
    onboardingService.on("cancelled", () => {
      logger.main.info("Onboarding cancelled event received, quitting app");
      this.windowManager.closeOnboardingWindow();
      app.quit();
    });

    // Handle accessibility permission lost
    onboardingService.on("accessibility-permission-lost", async () => {
      logger.main.warn("Accessibility permission lost, showing dialog");

      const result = await dialog.showMessageBox({
        type: "warning",
        title: "アクセシビリティ権限が無効になりました",
        message:
          "surasuraの自動ペースト機能を使用するには、アクセシビリティ権限が必要です。",
        detail:
          "アクセシビリティ権限が無効になりました。権限を再度有効にするか、セットアップを再開してください。",
        buttons: ["システム環境設定を開く", "セットアップを再開", "あとで"],
        defaultId: 0,
        cancelId: 2,
      });

      switch (result.response) {
        case 0: // Open System Preferences
          await shell.openExternal(
            "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility",
          );
          break;
        case 1: // Restart setup
          onboardingService.stopPermissionMonitoring();
          await onboardingService.startOnboardingFlow();
          await this.windowManager.createOrShowOnboardingWindow();
          break;
        case 2: // Later - do nothing
          break;
      }
    });

    logger.main.info("Onboarding event listeners set up");
  }

  private setupRecordingEventListeners(
    recordingManager: RecordingManager,
  ): void {
    recordingManager.on("state-changed", (state: RecordingState) => {
      this.updateWidgetVisibility(state === "idle").catch((error) => {
        logger.main.error("Failed to update widget visibility", error);
      });
    });

    logger.main.info("Recording state listener connected in AppManager");
  }

  private setupSettingsEventListeners(settingsService: SettingsService): void {
    // Handle preference changes (widget visibility, dock visibility)
    settingsService.on(
      "preferences-changed",
      async ({
        showWidgetWhileInactiveChanged,
        showInDockChanged,
      }: {
        showWidgetWhileInactiveChanged: boolean;
        showInDockChanged: boolean;
      }) => {
        if (showWidgetWhileInactiveChanged) {
          const recordingManager =
            this.serviceManager.getService("recordingManager");
          const isIdle = recordingManager.getState() === "idle";
          await this.updateWidgetVisibility(isIdle);
        }
        if (showInDockChanged) {
          settingsService.syncDockVisibility();
        }
      },
    );

    // Handle theme changes
    settingsService.on("theme-changed", async () => {
      await this.windowManager.updateAllWindowThemes();
    });

    // Handle active preset changes (for cross-window synchronization)
    settingsService.on(
      "active-preset-changed",
      ({
        presetId,
        presetName,
      }: {
        presetId: string | null;
        presetName: string | null;
      }) => {
        const mainWindow = this.windowManager.getMainWindow();
        const widgetWindow = this.windowManager.getWidgetWindow();

        const message = { type: "preset-changed", presetName };

        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("preset-notification", message);
        }
        if (widgetWindow && !widgetWindow.isDestroyed()) {
          widgetWindow.webContents.send("preset-notification", message);
        }

        logger.main.debug("Preset change notification sent to windows", {
          presetId,
          presetName,
        });
      },
    );

    logger.main.info("Settings event listeners set up");
  }

  private async updateWidgetVisibility(isIdle: boolean): Promise<void> {
    const settingsService = this.serviceManager.getService("settingsService");
    const preferences = await settingsService.getPreferences();

    if (preferences.showWidgetWhileInactive || !isIdle) {
      this.windowManager.showWidget();
    } else {
      this.windowManager.hideWidget();
    }
  }

  private async setupWindows(): Promise<void> {
    await this.windowManager.createWidgetWindow();

    // AppManager decides initial widget visibility based on settings
    const settingsService = this.serviceManager.getService("settingsService");
    const preferences = await settingsService.getPreferences();
    if (preferences.showWidgetWhileInactive) {
      this.windowManager.showWidget();
    }

    this.windowManager.createOrShowMainWindow();

    // Apply dock visibility based on user preference (macOS only)
    if (app.dock) {
      if (preferences.showInDock) {
        app.dock
          .show()
          .then(() => {
            logger.main.info("Showing app in dock based on preference");
          })
          .catch((error) => {
            logger.main.error("Error showing app in dock", error);
          });
      } else {
        app.dock.hide();
        logger.main.info("Hiding app from dock based on preference");
      }
    }
  }

  private async setupMenu(): Promise<void> {
    setupApplicationMenu(
      () => this.windowManager.createOrShowMainWindow(),
      () => {
        const autoUpdaterService =
          this.serviceManager.getService("autoUpdaterService");
        if (autoUpdaterService) {
          autoUpdaterService.checkForUpdates(true);
        }
      },
      () => this.windowManager.openAllDevTools(),
    );
  }

  async cleanup(): Promise<void> {
    // Stop permission monitoring
    const onboardingService =
      this.serviceManager.getService("onboardingService");
    if (onboardingService) {
      onboardingService.stopPermissionMonitoring();
    }

    await this.serviceManager.cleanup();
    if (this.windowManager) {
      this.windowManager.cleanup();
    }
    if (this.trayManager) {
      this.trayManager.cleanup();
    }
  }

  handleSecondInstance(): void {
    // If onboarding is in progress, focus onboarding window instead
    const onboardingWindow = this.windowManager.getOnboardingWindow();
    if (onboardingWindow && !onboardingWindow.isDestroyed()) {
      onboardingWindow.show();
      onboardingWindow.focus();
      logger.main.info(
        "Second instance attempted during onboarding, focusing onboarding window",
      );
      return;
    }

    // When a second instance tries to start, focus our existing window
    const mainWindow = this.windowManager.getMainWindow();
    const widgetWindow = this.windowManager.getWidgetWindow();

    // Try to show and focus the main window first
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
      mainWindow.show();
    } else if (widgetWindow && !widgetWindow.isDestroyed()) {
      // If no main window, focus the widget window
      widgetWindow.focus();
      widgetWindow.show();
    } else {
      // If no windows are open, create them
      this.windowManager.createOrShowMainWindow();
    }

    logger.main.info("Second instance attempted, focusing existing window");
  }

  async handleActivate(): Promise<void> {
    logger.main.info("Handle activate called");
    // If onboarding is in progress, just focus that window
    const onboardingWindow = this.windowManager.getOnboardingWindow();
    if (onboardingWindow && !onboardingWindow.isDestroyed()) {
      onboardingWindow.show();
      onboardingWindow.focus();
      return;
    }

    // Normal activation logic for main app
    const allWindows = this.windowManager.getAllWindows();

    if (allWindows.every((w) => !w || w.isDestroyed())) {
      // All windows destroyed - recreate widget with proper visibility
      await this.windowManager.createWidgetWindow();
      const settingsService = this.serviceManager.getService("settingsService");
      const preferences = await settingsService.getPreferences();
      if (preferences.showWidgetWhileInactive) {
        this.windowManager.showWidget();
      }
    } else {
      const widgetWindow = this.windowManager.getWidgetWindow();
      if (!widgetWindow || widgetWindow.isDestroyed()) {
        // Widget destroyed - recreate with proper visibility
        await this.windowManager.createWidgetWindow();
        const settingsService =
          this.serviceManager.getService("settingsService");
        const preferences = await settingsService.getPreferences();
        if (preferences.showWidgetWhileInactive) {
          this.windowManager.showWidget();
        }
      } else {
        widgetWindow.show();
      }
      this.windowManager.createOrShowMainWindow();
    }
  }
}
