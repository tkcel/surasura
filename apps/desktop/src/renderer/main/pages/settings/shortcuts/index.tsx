import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShortcutInput } from "@/components/shortcut-input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type ShortcutType =
  | "pushToTalk"
  | "toggleRecording"
  | "pasteLastTranscription"
  | "cancelRecording"
  | "selectPreset1"
  | "selectPreset2"
  | "selectPreset3"
  | "selectPreset4"
  | "selectPreset5";

// Helper to compare arrays
function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

// Component to show reset link with default shortcut
function ResetToDefaultLink({
  currentValue,
  defaultValue,
  onReset,
}: {
  currentValue: string[];
  defaultValue: string[] | undefined;
  onReset: () => void;
}) {
  if (!defaultValue || defaultValue.length === 0) return null;
  if (arraysEqual(currentValue, defaultValue)) return null;

  const displayValue = defaultValue.join(" + ");
  return (
    <button
      onClick={onReset}
      className="text-xs text-muted-foreground hover:text-primary hover:underline cursor-pointer transition-colors"
    >
      デフォルトに戻す ({displayValue})
    </button>
  );
}

export function ShortcutsSettingsPage() {
  const [pushToTalkShortcut, setPushToTalkShortcut] = useState<string[]>([]);
  const [toggleRecordingShortcut, setToggleRecordingShortcut] = useState<
    string[]
  >([]);
  const [pasteLastTranscriptionShortcut, setPasteLastTranscriptionShortcut] =
    useState<string[]>([]);
  const [cancelRecordingShortcut, setCancelRecordingShortcut] = useState<
    string[]
  >([]);
  const [selectPreset1Shortcut, setSelectPreset1Shortcut] = useState<string[]>(
    [],
  );
  const [selectPreset2Shortcut, setSelectPreset2Shortcut] = useState<string[]>(
    [],
  );
  const [selectPreset3Shortcut, setSelectPreset3Shortcut] = useState<string[]>(
    [],
  );
  const [selectPreset4Shortcut, setSelectPreset4Shortcut] = useState<string[]>(
    [],
  );
  const [selectPreset5Shortcut, setSelectPreset5Shortcut] = useState<string[]>(
    [],
  );
  const [recordingShortcut, setRecordingShortcut] =
    useState<ShortcutType | null>(null);

  // tRPC queries and mutations
  const shortcutsQuery = api.settings.getShortcuts.useQuery();
  const defaultShortcutsQuery = api.settings.getDefaultShortcuts.useQuery();
  const formatterConfigQuery = api.settings.getFormatterConfig.useQuery();
  const utils = api.useUtils();

  const setShortcutMutation = api.settings.setShortcut.useMutation({
    onSuccess: (data, variables) => {
      // Update local state on success
      const setters: Record<ShortcutType, (v: string[]) => void> = {
        pushToTalk: setPushToTalkShortcut,
        toggleRecording: setToggleRecordingShortcut,
        pasteLastTranscription: setPasteLastTranscriptionShortcut,
        cancelRecording: setCancelRecordingShortcut,
        selectPreset1: setSelectPreset1Shortcut,
        selectPreset2: setSelectPreset2Shortcut,
        selectPreset3: setSelectPreset3Shortcut,
        selectPreset4: setSelectPreset4Shortcut,
        selectPreset5: setSelectPreset5Shortcut,
      };
      setters[variables.type](variables.shortcut);
      utils.settings.getShortcuts.invalidate();

      // Show warning if there is one
      if (data.warning) {
        toast.warning(data.warning);
      } else {
        const messages: Record<string, string> = {
          pushToTalk: "Push to Talkのショートカットを更新しました",
          toggleRecording: "録音切り替えのショートカットを更新しました",
          pasteLastTranscription: "履歴ペーストのショートカットを更新しました",
          cancelRecording: "録音キャンセルのショートカットを更新しました",
          selectPreset1: "プリセット1のショートカットを更新しました",
          selectPreset2: "プリセット2のショートカットを更新しました",
          selectPreset3: "プリセット3のショートカットを更新しました",
          selectPreset4: "プリセット4のショートカットを更新しました",
          selectPreset5: "プリセット5のショートカットを更新しました",
        };
        toast.success(messages[variables.type]);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleResetSingleShortcut = (type: ShortcutType) => {
    if (!defaultShortcutsQuery.data) return;
    const defaultValue =
      defaultShortcutsQuery.data[
        type as keyof typeof defaultShortcutsQuery.data
      ] || [];
    setShortcutMutation.mutate({
      type,
      shortcut: defaultValue,
    });
  };

  // Load shortcuts when query data is available
  useEffect(() => {
    if (shortcutsQuery.data) {
      setPushToTalkShortcut(shortcutsQuery.data.pushToTalk);
      setToggleRecordingShortcut(shortcutsQuery.data.toggleRecording);
      setPasteLastTranscriptionShortcut(
        shortcutsQuery.data.pasteLastTranscription,
      );
      setCancelRecordingShortcut(shortcutsQuery.data.cancelRecording);
      setSelectPreset1Shortcut(shortcutsQuery.data.selectPreset1);
      setSelectPreset2Shortcut(shortcutsQuery.data.selectPreset2);
      setSelectPreset3Shortcut(shortcutsQuery.data.selectPreset3);
      setSelectPreset4Shortcut(shortcutsQuery.data.selectPreset4);
      setSelectPreset5Shortcut(shortcutsQuery.data.selectPreset5);
    }
  }, [shortcutsQuery.data]);

  const handlePushToTalkChange = (shortcut: string[]) => {
    setShortcutMutation.mutate({
      type: "pushToTalk",
      shortcut: shortcut,
    });
  };

  const handleToggleRecordingChange = (shortcut: string[]) => {
    setShortcutMutation.mutate({
      type: "toggleRecording",
      shortcut: shortcut,
    });
  };

  const handlePasteLastTranscriptionChange = (shortcut: string[]) => {
    setShortcutMutation.mutate({
      type: "pasteLastTranscription",
      shortcut: shortcut,
    });
  };

  const handleCancelRecordingChange = (shortcut: string[]) => {
    setShortcutMutation.mutate({
      type: "cancelRecording",
      shortcut: shortcut,
    });
  };

  const handlePresetShortcutChange = (
    presetNumber: 1 | 2 | 3 | 4 | 5,
    shortcut: string[],
  ) => {
    const types: ShortcutType[] = [
      "selectPreset1",
      "selectPreset2",
      "selectPreset3",
      "selectPreset4",
      "selectPreset5",
    ];
    setShortcutMutation.mutate({
      type: types[presetNumber - 1],
      shortcut: shortcut,
    });
  };

  const defaults = defaultShortcutsQuery.data;

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
          <CardContent className="space-y-8 pt-6">
            <div>
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <Label className="text-base font-semibold text-foreground">
                    Push to Talk
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md">
                    キーを押している間、音声入力を行います
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3 min-w-[200px]">
                  <ShortcutInput
                    value={pushToTalkShortcut}
                    onChange={handlePushToTalkChange}
                    isRecordingShortcut={recordingShortcut === "pushToTalk"}
                    onRecordingShortcutChange={(recording) =>
                      setRecordingShortcut(recording ? "pushToTalk" : null)
                    }
                  />
                  <ResetToDefaultLink
                    currentValue={pushToTalkShortcut}
                    defaultValue={defaults?.pushToTalk}
                    onReset={() => handleResetSingleShortcut("pushToTalk")}
                  />
                </div>
              </div>
              <Separator className="mt-8" />
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
                <div className="flex flex-col items-end gap-3 min-w-[200px]">
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
                  <ResetToDefaultLink
                    currentValue={toggleRecordingShortcut}
                    defaultValue={defaults?.toggleRecording}
                    onReset={() => handleResetSingleShortcut("toggleRecording")}
                  />
                </div>
              </div>
              <Separator className="mt-8" />
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
                <div className="flex flex-col items-end gap-3 min-w-[200px]">
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
                  <ResetToDefaultLink
                    currentValue={pasteLastTranscriptionShortcut}
                    defaultValue={[]}
                    onReset={() =>
                      handleResetSingleShortcut("pasteLastTranscription")
                    }
                  />
                </div>
              </div>
              <Separator className="mt-8" />
            </div>

            <div>
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <Label className="text-base font-semibold text-foreground">
                    録音キャンセル
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md">
                    音声入力中に押すと、録音をキャンセルします
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3 min-w-[200px]">
                  <ShortcutInput
                    value={cancelRecordingShortcut}
                    onChange={handleCancelRecordingChange}
                    isRecordingShortcut={
                      recordingShortcut === "cancelRecording"
                    }
                    onRecordingShortcutChange={(recording) =>
                      setRecordingShortcut(recording ? "cancelRecording" : null)
                    }
                  />
                  <ResetToDefaultLink
                    currentValue={cancelRecordingShortcut}
                    defaultValue={defaults?.cancelRecording}
                    onReset={() => handleResetSingleShortcut("cancelRecording")}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">プリセット切り替え</CardTitle>
            <p className="text-xs text-muted-foreground">
              AIフォーマットのプリセットを素早く切り替えるショートカットです
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {([1, 2, 3, 4, 5] as const).map((num) => {
              const shortcuts = [
                selectPreset1Shortcut,
                selectPreset2Shortcut,
                selectPreset3Shortcut,
                selectPreset4Shortcut,
                selectPreset5Shortcut,
              ];
              const shortcutTypes: ShortcutType[] = [
                "selectPreset1",
                "selectPreset2",
                "selectPreset3",
                "selectPreset4",
                "selectPreset5",
              ];
              const defaultKeys = [
                defaults?.selectPreset1,
                defaults?.selectPreset2,
                defaults?.selectPreset3,
                defaults?.selectPreset4,
                defaults?.selectPreset5,
              ];
              const presetName =
                formatterConfigQuery.data?.presets?.[num - 1]?.name;
              return (
                <div key={num}>
                  <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    <div>
                      <Label className="text-sm font-medium text-foreground">
                        プリセット {num}
                        {presetName && (
                          <span className="ml-2 text-xs text-muted-foreground font-normal">
                            ({presetName})
                          </span>
                        )}
                      </Label>
                    </div>
                    <div className="flex flex-col items-end gap-3 min-w-[200px]">
                      <ShortcutInput
                        value={shortcuts[num - 1]}
                        onChange={(shortcut) =>
                          handlePresetShortcutChange(num, shortcut)
                        }
                        isRecordingShortcut={
                          recordingShortcut === shortcutTypes[num - 1]
                        }
                        onRecordingShortcutChange={(recording) =>
                          setRecordingShortcut(
                            recording ? shortcutTypes[num - 1] : null,
                          )
                        }
                      />
                      <ResetToDefaultLink
                        currentValue={shortcuts[num - 1]}
                        defaultValue={defaultKeys[num - 1]}
                        onReset={() =>
                          handleResetSingleShortcut(shortcutTypes[num - 1])
                        }
                      />
                    </div>
                  </div>
                  {num < 5 && <Separator className="my-4" />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
