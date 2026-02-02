import dotenv from "dotenv";
dotenv.config();

import { app, ipcMain } from "electron";
import { logger } from "./logger";

import started from "electron-squirrel-startup";
import { AppManager } from "./core/app-manager";
import { isWindows } from "../utils/platform";

// Setup renderer logging relay (allows renderer to send logs to main process)
ipcMain.handle(
  "log-message",
  (_event, level: string, scope: string, ...args: unknown[]) => {
    const scopedLogger =
      logger[scope as keyof typeof logger] || logger.renderer;
    const logMethod = scopedLogger[level as keyof typeof scopedLogger];
    if (typeof logMethod === "function") {
      logMethod(...args);
    }
  },
);

if (started) {
  app.quit();
}

// Set App User Model ID for Windows (required for Squirrel.Windows)
if (isWindows()) {
  app.setAppUserModelId("com.surasura.desktop");
}

// Enforce single instance (skip in development for easier debugging)
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
const gotTheLock = isDev || app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Another instance is already running, quit this one
  app.quit();
}

// Auto-updater is now handled by AutoUpdaterService via electron-updater
// Users can manually check for updates in the About page

const appManager = new AppManager();

// Handle when another instance tries to start
app.on("second-instance", () => {
  // Someone tried to run a second instance, we should focus our window instead.
  appManager.handleSecondInstance();
});

app.whenReady().then(async () => {
  await appManager.initialize();
});
app.on("will-quit", () => appManager.cleanup());
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => appManager.handleActivate());
