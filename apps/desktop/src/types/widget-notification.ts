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
  const micDisplay = microphoneName || "マイク";
  switch (type) {
    case "no_audio":
      return `「${micDisplay}」から音声が検出されませんでした`;
    case "empty_transcript":
      return `「${micDisplay}」から音声を認識できませんでした`;
  }
};

export const WIDGET_NOTIFICATION_CONFIG: Record<
  WidgetNotificationType,
  WidgetNotificationConfig
> = {
  no_audio: {
    title: "音声が検出されません",
    description: "マイクの設定を確認してください",
    primaryAction: {
      label: "マイク設定",
      navigateTo: "/settings/dictation",
    },
  },
  empty_transcript: {
    title: "音声を認識できません",
    description: "マイクに近づいて話してみてください",
    primaryAction: {
      label: "マイク設定",
      navigateTo: "/settings/dictation",
    },
  },
};

export const WIDGET_NOTIFICATION_TIMEOUT = 5000;
