import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { useAudioDevices } from "@/hooks/useAudioDevices";
import { toast } from "sonner";
import { Mic } from "lucide-react";

export function MicrophoneSettings() {
  const { data: settings, refetch: refetchSettings } =
    api.settings.getSettings.useQuery();
  const setPreferredMicrophone =
    api.settings.setPreferredMicrophone.useMutation();
  const { devices: audioDevices } = useAudioDevices();

  const currentMicrophoneName = settings?.recording?.preferredMicrophoneName;

  const handleMicrophoneChange = async (deviceName: string) => {
    try {
      // If "System Default" is selected, store null to follow system default
      const actualDeviceName = deviceName.startsWith("System Default")
        ? null
        : deviceName;

      await setPreferredMicrophone.mutateAsync({
        deviceName: actualDeviceName,
      });

      // Refetch settings to update UI
      await refetchSettings();

      toast.success(
        actualDeviceName
          ? `マイクを${deviceName}に変更しました`
          : "システムのデフォルトマイクを使用します",
      );
    } catch (error) {
      console.error("Failed to set preferred microphone:", error);
      toast.error("マイクの変更に失敗しました");
    }
  };

  // Find the current selection value
  const currentSelectionValue =
    currentMicrophoneName &&
    audioDevices.some((device) => device.label === currentMicrophoneName)
      ? currentMicrophoneName
      : audioDevices.find((d) => d.isDefault)?.label || "";

  return (
    <div className="flex items-center justify-between">
      <div>
        <Label className="text-base font-semibold text-foreground">
          マイク
        </Label>
        <p className="text-xs text-muted-foreground mb-2">
          使用するマイクを選択してください。
        </p>
      </div>
      <div className="min-w-[200px]">
        <Select
          value={currentSelectionValue}
          onValueChange={handleMicrophoneChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="マイクを選択" />
          </SelectTrigger>
          <SelectContent>
            {audioDevices.length === 0 ? (
              <SelectItem value="no-devices" disabled>
                マイクがありません
              </SelectItem>
            ) : (
              audioDevices.map((device) => (
                <SelectItem key={device.deviceId} value={device.label}>
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    <span>{device.label}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {audioDevices.length === 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            マイクが検出されませんでした。オーディオデバイスを確認してください。
          </p>
        )}
      </div>
    </div>
  );
}
