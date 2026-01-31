import { FloatingButton } from "./components/FloatingButton";
import { useWidgetNotifications } from "../../hooks/useWidgetNotifications";
import { usePresetNotifications } from "@/hooks/usePresetNotifications";

export function WidgetPage() {
  useWidgetNotifications();
  usePresetNotifications();
  return <FloatingButton />;
}
