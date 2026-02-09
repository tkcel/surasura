import { useState } from "react";
import { FloatingButton } from "./components/FloatingButton";
import { useWidgetNotifications } from "../../hooks/useWidgetNotifications";
import { usePresetNotifications } from "@/hooks/usePresetNotifications";
import { api } from "@/trpc/react";
import { PasteFallbackPanel } from "../../components/PasteFallbackPanel";

export function WidgetPage() {
  const [pasteFallbackText, setPasteFallbackText] = useState<string | null>(
    null,
  );

  const { data: activePreset } = api.settings.getActivePreset.useQuery();

  // Dedicated subscription for paste fallback
  api.recording.pasteFallback.useSubscription(undefined, {
    onData: (transcription) => {
      setPasteFallbackText(transcription);
    },
  });

  // Close panel when recording starts
  api.recording.stateUpdates.useSubscription(undefined, {
    onData: (update) => {
      if (update.state === "starting" || update.state === "recording") {
        setPasteFallbackText(null);
      }
    },
  });

  useWidgetNotifications();
  usePresetNotifications();

  return (
    <div className="flex flex-col items-center justify-end h-full">
      {pasteFallbackText && (
        <PasteFallbackPanel
          text={pasteFallbackText}
          presetName={activePreset?.name}
          onClose={() => setPasteFallbackText(null)}
        />
      )}
      <FloatingButton />
    </div>
  );
}
