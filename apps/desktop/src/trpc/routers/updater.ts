import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { createRouter, procedure } from "../trpc";
import { UpdateCheckResult } from "../../main/services/auto-updater";

// Download progress type from electron-updater
interface DownloadProgress {
  bytesPerSecond: number;
  percent: number;
  transferred: number;
  total: number;
}

export const updaterRouter = createRouter({
  // Check for updates (manual trigger) - returns result
  checkForUpdates: procedure
    .input(
      z
        .object({ userInitiated: z.boolean().optional().default(false) })
        .optional(),
    )
    .mutation(async ({ input, ctx }): Promise<UpdateCheckResult> => {
      try {
        const autoUpdaterService =
          ctx.serviceManager.getService("autoUpdaterService");
        if (!autoUpdaterService) {
          throw new Error("Auto-updater service not available");
        }

        const userInitiated = input?.userInitiated ?? false;
        const result = await autoUpdaterService.checkForUpdates(userInitiated);
        const logger = ctx.serviceManager.getLogger();
        logger?.updater.info("Update check completed via tRPC", {
          userInitiated,
          updateAvailable: result.updateAvailable,
        });

        return result;
      } catch (error) {
        const logger = ctx.serviceManager.getLogger();
        logger?.updater.error("Error checking for updates via tRPC", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }),

  // Check for updates and notify (background check)
  checkForUpdatesAndNotify: procedure.mutation(async ({ ctx }) => {
    try {
      const autoUpdaterService =
        ctx.serviceManager.getService("autoUpdaterService");
      if (!autoUpdaterService) {
        throw new Error("Auto-updater service not available");
      }

      await autoUpdaterService.checkForUpdatesAndNotify();
      const logger = ctx.serviceManager.getLogger();
      logger?.updater.info("Background update check initiated via tRPC");

      return { success: true };
    } catch (error) {
      const logger = ctx.serviceManager.getLogger();
      logger?.updater.error("Error in background update check via tRPC", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }),

  // Download available update
  downloadUpdate: procedure.mutation(async ({ ctx }) => {
    try {
      const autoUpdaterService =
        ctx.serviceManager.getService("autoUpdaterService");
      if (!autoUpdaterService) {
        throw new Error("Auto-updater service not available");
      }

      await autoUpdaterService.downloadUpdate();
      const logger = ctx.serviceManager.getLogger();
      logger?.updater.info("Update download initiated via tRPC");

      return { success: true };
    } catch (error) {
      const logger = ctx.serviceManager.getLogger();
      logger?.updater.error("Error downloading update via tRPC", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }),

  // Quit and install update immediately
  quitAndInstall: procedure.mutation(async ({ ctx }) => {
    try {
      const autoUpdaterService =
        ctx.serviceManager.getService("autoUpdaterService");
      if (!autoUpdaterService) {
        throw new Error("Auto-updater service not available");
      }

      const logger = ctx.serviceManager.getLogger();
      logger?.updater.info("Quit and install initiated via tRPC");
      autoUpdaterService.quitAndInstall();

      return { success: true };
    } catch (error) {
      const logger = ctx.serviceManager.getLogger();
      logger?.updater.error("Error quitting and installing via tRPC", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }),

  // Mark update to be installed on next restart
  installOnNextRestart: procedure.mutation(async ({ ctx }) => {
    try {
      const autoUpdaterService =
        ctx.serviceManager.getService("autoUpdaterService");
      if (!autoUpdaterService) {
        throw new Error("Auto-updater service not available");
      }

      const logger = ctx.serviceManager.getLogger();
      logger?.updater.info("Install on next restart initiated via tRPC");
      autoUpdaterService.installOnNextRestart();

      return { success: true };
    } catch (error) {
      const logger = ctx.serviceManager.getLogger();
      logger?.updater.error("Error setting install on next restart via tRPC", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }),

  // Get current update checking status
  isCheckingForUpdate: procedure.query(async ({ ctx }) => {
    try {
      const autoUpdaterService =
        ctx.serviceManager.getService("autoUpdaterService");
      if (!autoUpdaterService) {
        return false;
      }

      return autoUpdaterService.isCheckingForUpdate();
    } catch (error) {
      const logger = ctx.serviceManager.getLogger();
      logger?.updater.error("Error getting update checking status via tRPC", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }),

  // Get current update available status
  isUpdateAvailable: procedure.query(async ({ ctx }) => {
    try {
      const autoUpdaterService =
        ctx.serviceManager.getService("autoUpdaterService");
      if (!autoUpdaterService) {
        return false;
      }

      return autoUpdaterService.isUpdateAvailable();
    } catch (error) {
      const logger = ctx.serviceManager.getLogger();
      logger?.updater.error("Error getting update available status via tRPC", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }),

  // Get update downloaded status
  isUpdateDownloaded: procedure.query(async ({ ctx }) => {
    try {
      const autoUpdaterService =
        ctx.serviceManager.getService("autoUpdaterService");
      if (!autoUpdaterService) {
        return false;
      }

      return autoUpdaterService.isUpdateDownloaded();
    } catch (error) {
      const logger = ctx.serviceManager.getLogger();
      logger?.updater.error("Error getting update downloaded status via tRPC", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }),

  // Subscribe to download progress updates
  // Using Observable instead of async generator due to Symbol.asyncDispose conflict
  // Modern Node.js (20+) adds Symbol.asyncDispose to async generators natively,
  // which conflicts with electron-trpc's attempt to add the same symbol.
  // While Observables are deprecated in tRPC, they work without this conflict.
  // TODO: Remove this workaround when electron-trpc is updated to handle native Symbol.asyncDispose
  // eslint-disable-next-line deprecation/deprecation
  onDownloadProgress: procedure.subscription(({ ctx }) => {
    return observable<DownloadProgress>((emit) => {
      const autoUpdaterService =
        ctx.serviceManager.getService("autoUpdaterService");
      if (!autoUpdaterService) {
        throw new Error("Auto-updater service not initialized");
      }

      const handleDownloadProgress = (progressObj: DownloadProgress) => {
        emit.next(progressObj);
      };

      autoUpdaterService.on("download-progress", handleDownloadProgress);

      // Cleanup function
      return () => {
        autoUpdaterService?.off("download-progress", handleDownloadProgress);
      };
    });
  }),

  // Subscribe to update downloaded event
  // eslint-disable-next-line deprecation/deprecation
  onUpdateDownloaded: procedure.subscription(({ ctx }) => {
    return observable<{ version: string }>((emit) => {
      const autoUpdaterService =
        ctx.serviceManager.getService("autoUpdaterService");
      if (!autoUpdaterService) {
        throw new Error("Auto-updater service not initialized");
      }

      const handleUpdateDownloaded = (info: { version: string }) => {
        emit.next({ version: info.version });
      };

      autoUpdaterService.on("update-downloaded", handleUpdateDownloaded);

      // Cleanup function
      return () => {
        autoUpdaterService?.off("update-downloaded", handleUpdateDownloaded);
      };
    });
  }),
});
