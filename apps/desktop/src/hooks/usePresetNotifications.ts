import { useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/trpc/react";

interface PresetNotification {
  type: "preset-changed" | "presets-updated";
  presetName?: string;
}

/**
 * Hook to listen for preset change notifications from main process
 * and refresh UI accordingly
 */
export function usePresetNotifications() {
  const utils = api.useUtils();

  useEffect(() => {
    const handlePresetNotification = (notification: PresetNotification) => {
      if (notification.type === "preset-changed") {
        // Active preset was changed (via shortcut etc.)
        toast.success("プリセット変更完了", {
          description: notification.presetName,
          duration: 1000,
        });

        // Invalidate queries to refresh UI
        utils.settings.getActivePreset.invalidate();
        utils.settings.getFormatterConfig.invalidate();
      } else if (notification.type === "presets-updated") {
        // Presets list was updated (create, update, delete)
        // Silently refresh without toast
        utils.settings.getActivePreset.invalidate();
        utils.settings.getFormatterConfig.invalidate();
      }
    };

    window.electronAPI?.on?.("preset-notification", handlePresetNotification);

    return () => {
      window.electronAPI?.off?.(
        "preset-notification",
        handlePresetNotification,
      );
    };
  }, [utils]);
}
