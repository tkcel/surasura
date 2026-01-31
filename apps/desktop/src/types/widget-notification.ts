export type WidgetNotificationType = "no_audio" | "empty_transcript";

export interface WidgetNotificationAction {
  label: string;
  navigateTo?: string; // Route to navigate to in main window
}

export interface WidgetNotificationConfig {
  title: string;
  description: string;
  primaryAction?: WidgetNotificationAction;
}

export interface WidgetNotification {
  id: string;
  type: WidgetNotificationType;
  title: string;
  primaryAction?: WidgetNotificationAction;
  timestamp: number;
}

// Template function to generate description with mic name (used on frontend)
export const getNotificationDescription = (
  type: WidgetNotificationType,
  microphoneName?: string,
): string => {
  const micDisplay = microphoneName || "your microphone";
  switch (type) {
    case "no_audio":
      return `No audio from "${micDisplay}"`;
    case "empty_transcript":
      return `No speech detected from "${micDisplay}"`;
  }
};

export const WIDGET_NOTIFICATION_CONFIG: Record<
  WidgetNotificationType,
  WidgetNotificationConfig
> = {
  no_audio: {
    title: "No audio detected",
    description: "Check your microphone settings", // Fallback, replaced by template
    primaryAction: {
      label: "Configure Microphone",
      navigateTo: "/settings/dictation",
    },
  },
  empty_transcript: {
    title: "No speech detected",
    description: "Try speaking louder or closer to the mic", // Fallback, replaced by template
    primaryAction: {
      label: "Configure Microphone",
      navigateTo: "/settings/dictation",
    },
  },
};

export const WIDGET_NOTIFICATION_TIMEOUT = 5000;
