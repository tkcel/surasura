import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useAudioDevices } from "@/hooks/useAudioDevices";
import {
  WIDGET_NOTIFICATION_TIMEOUT,
  getNotificationDescription,
} from "@/types/widget-notification";
import { WidgetToast } from "../components/WidgetToast";

/**
 * Hook to display widget notifications as toasts.
 * Mouse capture is handled by ToasterWrapper (hover-based),
 * so we don't need to manage it here.
 */
export const useWidgetNotifications = () => {
  const { data: settings } = api.settings.getSettings.useQuery();
  const { defaultDeviceName } = useAudioDevices();

  const getEffectiveMicName = () => {
    return settings?.recording?.preferredMicrophoneName || defaultDeviceName;
  };

  api.recording.widgetNotifications.useSubscription(undefined, {
    onData: (notification) => {
      const micName = getEffectiveMicName();
      const description = getNotificationDescription(
        notification.type,
        micName,
      );

      const toastId = `widget-notification-${Date.now()}`;

      toast.custom(
        () => (
          <WidgetToast
            title={notification.title}
            description={description}
            onDismiss={() => {
              toast.dismiss(toastId);
            }}
          />
        ),
        {
          id: toastId,
          unstyled: true,
          duration: WIDGET_NOTIFICATION_TIMEOUT,
        },
      );
    },
    onError: (error) => {
      console.error("Widget notification subscription error:", error);
    },
  });
};
