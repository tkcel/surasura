import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { ShortcutInput } from "@/components/shortcut-input";
import { api } from "@/trpc/react";
import { toast } from "sonner";

/**
 * Push to Talk shortcut input for onboarding
 * Wraps ShortcutInput with label and handles data fetching/saving
 */
export function OnboardingShortcutInput() {
  const [pushToTalkShortcut, setPushToTalkShortcut] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const utils = api.useUtils();
  const shortcutsQuery = api.settings.getShortcuts.useQuery();
  const setShortcutMutation = api.settings.setShortcut.useMutation({
    onSuccess: () => {
      utils.settings.getShortcuts.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
      // Revert to saved value
      utils.settings.getShortcuts.invalidate();
    },
  });

  // Load current shortcut
  useEffect(() => {
    if (shortcutsQuery.data) {
      setPushToTalkShortcut(shortcutsQuery.data.pushToTalk);
    }
  }, [shortcutsQuery.data]);

  const handleShortcutChange = (shortcut: string[]) => {
    setPushToTalkShortcut(shortcut);
    setShortcutMutation.mutate({
      type: "pushToTalk",
      shortcut: shortcut,
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <Label className="text-base font-semibold text-foreground">
          Push to Talk
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          キーを押している間、音声入力が有効になります
        </p>
      </div>
      <div className="min-w-[200px] flex justify-end">
        <ShortcutInput
          value={pushToTalkShortcut}
          onChange={handleShortcutChange}
          isRecordingShortcut={isRecording}
          onRecordingShortcutChange={setIsRecording}
        />
      </div>
    </div>
  );
}
