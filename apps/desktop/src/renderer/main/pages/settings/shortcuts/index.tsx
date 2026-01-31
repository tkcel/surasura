import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShortcutInput } from "@/components/shortcut-input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export function ShortcutsSettingsPage() {
  const [pushToTalkShortcut, setPushToTalkShortcut] = useState<string[]>([]);
  const [toggleRecordingShortcut, setToggleRecordingShortcut] = useState<
    string[]
  >([]);
  const [pasteLastTranscriptionShortcut, setPasteLastTranscriptionShortcut] =
    useState<string[]>([]);
  const [recordingShortcut, setRecordingShortcut] = useState<
    "pushToTalk" | "toggleRecording" | "pasteLastTranscription" | null
  >(null);

  // tRPC queries and mutations
  const shortcutsQuery = api.settings.getShortcuts.useQuery();
  const utils = api.useUtils();

  const setShortcutMutation = api.settings.setShortcut.useMutation({
    onSuccess: (data, variables) => {
      utils.settings.getShortcuts.invalidate();

      // Show warning if there is one
      if (data.warning) {
        toast.warning(data.warning);
      } else {
        const messages: Record<string, string> = {
          pushToTalk: "プッシュトゥトークのショートカットを更新しました",
          toggleRecording: "録音切り替えのショートカットを更新しました",
          pasteLastTranscription:
            "履歴ペーストのショートカットを更新しました",
        };
        toast.success(messages[variables.type]);
      }
    },
    onError: (error) => {
      toast.error(error.message);
      // Revert to saved value
      utils.settings.getShortcuts.invalidate();
    },
  });

  // Load shortcuts when query data is available
  useEffect(() => {
    if (shortcutsQuery.data) {
      setPushToTalkShortcut(shortcutsQuery.data.pushToTalk);
      setToggleRecordingShortcut(shortcutsQuery.data.toggleRecording);
      setPasteLastTranscriptionShortcut(
        shortcutsQuery.data.pasteLastTranscription,
      );
    }
  }, [shortcutsQuery.data]);

  const handlePushToTalkChange = (shortcut: string[]) => {
    setPushToTalkShortcut(shortcut);
    setShortcutMutation.mutate({
      type: "pushToTalk",
      shortcut: shortcut,
    });
  };

  const handleToggleRecordingChange = (shortcut: string[]) => {
    setToggleRecordingShortcut(shortcut);
    setShortcutMutation.mutate({
      type: "toggleRecording",
      shortcut: shortcut,
    });
  };

  const handlePasteLastTranscriptionChange = (shortcut: string[]) => {
    setPasteLastTranscriptionShortcut(shortcut);
    setShortcutMutation.mutate({
      type: "pasteLastTranscription",
      shortcut: shortcut,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold">ショートカット</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          音声入力とハンズフリーモードのキーボードショートカットを設定します
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-8">
            <div>
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <Label className="text-base font-semibold text-foreground">
                    プッシュトゥトーク
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md">
                    キーを押している間、音声入力を行います
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end min-w-[260px]">
                  <ShortcutInput
                    value={pushToTalkShortcut}
                    onChange={handlePushToTalkChange}
                    isRecordingShortcut={recordingShortcut === "pushToTalk"}
                    onRecordingShortcutChange={(recording) =>
                      setRecordingShortcut(recording ? "pushToTalk" : null)
                    }
                  />
                </div>
              </div>
              <Separator className="my-4" />
            </div>

            <div>
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <Label className="text-base font-semibold text-foreground">
                    ハンズフリーモード
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md">
                    1回押すと音声入力を開始し、もう1回押すと停止します
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end min-w-[260px]">
                  <ShortcutInput
                    value={toggleRecordingShortcut}
                    onChange={handleToggleRecordingChange}
                    isRecordingShortcut={
                      recordingShortcut === "toggleRecording"
                    }
                    onRecordingShortcutChange={(recording) =>
                      setRecordingShortcut(recording ? "toggleRecording" : null)
                    }
                  />
                </div>
              </div>
              <Separator className="my-4" />
            </div>

            <div>
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <Label className="text-base font-semibold text-foreground">
                    履歴ペースト
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md">
                    直前の文字起こし結果を再度ペーストします
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end min-w-[260px]">
                  <ShortcutInput
                    value={pasteLastTranscriptionShortcut}
                    onChange={handlePasteLastTranscriptionChange}
                    isRecordingShortcut={
                      recordingShortcut === "pasteLastTranscription"
                    }
                    onRecordingShortcutChange={(recording) =>
                      setRecordingShortcut(
                        recording ? "pasteLastTranscription" : null,
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
