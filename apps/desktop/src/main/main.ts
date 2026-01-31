import dotenv from "dotenv";
dotenv.config();

import { app, ipcMain } from "electron";
import { logger } from "./logger";

import started from "electron-squirrel-startup";
import { AppManager } from "./core/app-manager";
import { updateElectronApp } from "update-electron-app";
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

// Enforce single instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Another instance is already running, quit this one
  app.quit();
}

// Set up auto-updater for production builds
if (app.isPackaged && !isWindows()) {
  updateElectronApp({
    notifyUser: false,
  });
}
if (app.isPackaged && isWindows()) {
  // Check if running with --squirrel-firstrun (Windows only)
  const isSquirrelFirstRun = process.argv.includes("--squirrel-firstrun");
  // Delay update check on Windows to avoid Squirrel file lock issues
  if (isWindows() && !isSquirrelFirstRun) {
    setTimeout(() => {
      updateElectronApp({
        notifyUser: false,
      });
    }, 60000); // 60 second delay
  }
}

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
