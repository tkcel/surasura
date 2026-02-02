import { app } from "electron";
import { autoUpdater, UpdateInfo } from "electron-updater";
import { EventEmitter } from "events";
import { logger } from "../logger";

export interface UpdateCheckResult {
  updateAvailable: boolean;
  currentVersion: string;
  newVersion?: string;
  releaseNotes?: string;
}

export class AutoUpdaterService extends EventEmitter {
  private _isCheckingForUpdate = false;
  private _updateAvailable = false;
  private _updateInfo: UpdateInfo | null = null;
  private _updateDownloaded = false;

  constructor() {
    super();
    this.setupAutoUpdater();
  }

  private setupAutoUpdater(): void {
    // Configure auto-updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // Set feed URL to the release repository
    autoUpdater.setFeedURL({
      provider: "github",
      owner: "tkcel",
      repo: "surasura-releases",
    });

    // Set up event handlers
    autoUpdater.on("checking-for-update", () => {
      logger.updater.info("Checking for update...");
      this._isCheckingForUpdate = true;
      this.emit("checking-for-update");
    });

    autoUpdater.on("update-available", (info: UpdateInfo) => {
      logger.updater.info("Update available", { version: info.version });
      this._isCheckingForUpdate = false;
      this._updateAvailable = true;
      this._updateInfo = info;
      this.emit("update-available", info);
    });

    autoUpdater.on("update-not-available", (info: UpdateInfo) => {
      logger.updater.info("Update not available", {
        currentVersion: info.version,
      });
      this._isCheckingForUpdate = false;
      this._updateAvailable = false;
      this._updateInfo = null;
      this.emit("update-not-available", info);
    });

    autoUpdater.on("error", (error: Error) => {
      logger.updater.error("Update error", { error: error.message });
      this._isCheckingForUpdate = false;
      this.emit("error", error);
    });

    autoUpdater.on("download-progress", (progressObj) => {
      logger.updater.info("Download progress", {
        percent: progressObj.percent,
        transferred: progressObj.transferred,
        total: progressObj.total,
      });
      this.emit("download-progress", progressObj);
    });

    autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
      logger.updater.info("Update downloaded", { version: info.version });
      this._updateDownloaded = true;
      this.emit("update-downloaded", info);
    });
  }

  async checkForUpdates(userInitiated = false): Promise<UpdateCheckResult> {
    if (!app.isPackaged) {
      logger.updater.info(
        "Skipping update check in development mode",
      );
      return {
        updateAvailable: false,
        currentVersion: app.getVersion(),
      };
    }

    try {
      this._isCheckingForUpdate = true;
      const result = await autoUpdater.checkForUpdates();

      if (result && result.updateInfo) {
        const updateAvailable =
          result.updateInfo.version !== app.getVersion();
        return {
          updateAvailable,
          currentVersion: app.getVersion(),
          newVersion: result.updateInfo.version,
          releaseNotes:
            typeof result.updateInfo.releaseNotes === "string"
              ? result.updateInfo.releaseNotes
              : undefined,
        };
      }

      return {
        updateAvailable: false,
        currentVersion: app.getVersion(),
      };
    } catch (error) {
      logger.updater.error("Error checking for updates", {
        error: error instanceof Error ? error.message : String(error),
        userInitiated,
      });
      throw error;
    } finally {
      this._isCheckingForUpdate = false;
    }
  }

  async checkForUpdatesAndNotify(): Promise<void> {
    if (!app.isPackaged) {
      logger.updater.info(
        "Skipping background update check in development mode",
      );
      return;
    }

    try {
      await autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      logger.updater.error("Error in background update check", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  isCheckingForUpdate(): boolean {
    return this._isCheckingForUpdate;
  }

  isUpdateAvailable(): boolean {
    return this._updateAvailable;
  }

  isUpdateDownloaded(): boolean {
    return this._updateDownloaded;
  }

  getUpdateInfo(): UpdateInfo | null {
    return this._updateInfo;
  }

  async downloadUpdate(): Promise<void> {
    if (!this._updateAvailable) {
      logger.updater.warn("No update available to download");
      return;
    }

    try {
      await autoUpdater.downloadUpdate();
    } catch (error) {
      logger.updater.error("Error downloading update", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  quitAndInstall(): void {
    if (!this._updateDownloaded) {
      logger.updater.warn("No update downloaded to install");
      return;
    }

    logger.updater.info("Quitting and installing update...");
    autoUpdater.quitAndInstall(false, true);
  }

  installOnNextRestart(): void {
    if (!this._updateDownloaded) {
      logger.updater.warn("No update downloaded to install");
      return;
    }

    logger.updater.info("Update will be installed on next restart");
    // autoUpdater.autoInstallOnAppQuit is already true
    // Just quit the app normally later
  }
}
