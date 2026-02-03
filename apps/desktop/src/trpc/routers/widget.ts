import { createRouter, procedure } from "../trpc";
import { z } from "zod";
import { logger } from "@/main/logger";

export const widgetRouter = createRouter({
  setIgnoreMouseEvents: procedure
    .input(
      z.object({
        ignore: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const windowManager = ctx.serviceManager.getService("windowManager");
      if (!windowManager) {
        logger.main.error("Window manager service not available");
        return false;
      }

      const widgetWindow = windowManager.getWidgetWindow();
      if (!widgetWindow) {
        logger.main.error("Widget window not available");
        return false;
      }

      try {
        widgetWindow.setIgnoreMouseEvents(input.ignore, {
          forward: true,
        });
        logger.main.debug("Set widget ignore mouse events", input);
        return true;
      } catch (error) {
        logger.main.error("Failed to set widget ignore mouse events", { error });
        return false;
      }
    }),

  // Navigate to a route in the main window (show and focus it first)
  navigateMainWindow: procedure
    .input(
      z.object({
        route: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const windowManager = ctx.serviceManager.getService("windowManager");
      if (!windowManager) {
        logger.main.error("Window manager service not available");
        return false;
      }

      // Check if window already exists before creating
      const windowExisted = windowManager.getMainWindow() !== null;

      // Create or show main window, passing route for new window case
      // If window is being created fresh, the route is baked into the URL hash
      // to avoid race condition where renderer isn't ready for IPC events
      await windowManager.createOrShowMainWindow(input.route);

      // If window already existed, send navigation event via IPC
      // (renderer is already loaded and listening)
      if (windowExisted) {
        const mainWindow = windowManager.getMainWindow();
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("navigate", input.route);
        }
      }

      logger.main.info("Navigated main window", {
        route: input.route,
        windowExisted,
      });
      return true;
    }),
});
