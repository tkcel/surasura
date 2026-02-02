import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { FolderOpen, CheckCircle, XCircle, ExternalLink, RefreshCw } from "lucide-react";

export default function PreferencesSettingsPage() {
  const [isResetting, setIsResetting] = useState(false);
  const utils = api.useUtils();
  const isMac = window.electronAPI.platform === "darwin";

  // Permission status query - refetch on window focus (no polling to avoid OS freeze)
  const permissionsQuery = api.onboarding.checkAllRequirements.useQuery(
    undefined,
    { refetchOnWindowFocus: true },
  );

  // Open accessibility settings mutation
  const openAccessibilitySettingsMutation =
    api.onboarding.openAccessibilitySettings.useMutation({
      onError: () => {
        toast.error("設定を開けませんでした");
      },
    });

  // Request microphone permission mutation
  const requestMicrophoneMutation =
    api.onboarding.requestMicrophonePermission.useMutation({
      onSuccess: (granted) => {
        if (granted) {
          toast.success("マイクのアクセスが許可されました");
        } else {
          toast.info("マイクのアクセスを許可してください");
        }
        utils.onboarding.checkAllRequirements.invalidate();
      },
      onError: () => {
        toast.error("マイクの権限リクエストに失敗しました");
      },
    });

  // Preferences queries and mutations
  const preferencesQuery = api.settings.getPreferences.useQuery();
  const updatePreferencesMutation = api.settings.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("設定を更新しました");
      utils.settings.getPreferences.invalidate();
    },
    onError: (error) => {
      console.error("Failed to update preferences:", error);
      toast.error("設定の更新に失敗しました。もう一度お試しください。");
    },
  });

  // Advanced settings queries
  const dataPathQuery = api.settings.getDataPath.useQuery();
  const logFilePathQuery = api.settings.getLogFilePath.useQuery();
  const audioFolderPathQuery = api.settings.getAudioFolderPath.useQuery();

  const resetAppMutation = api.settings.resetApp.useMutation({
    onMutate: () => {
      setIsResetting(true);
      toast.info("アプリをリセット中...");
    },
    onSuccess: () => {
      toast.success("アプリをリセットしました。再起動します...");
    },
    onError: (error) => {
      setIsResetting(false);
      console.error("Failed to reset app:", error);
      toast.error("アプリのリセットに失敗しました");
    },
  });

  const downloadLogFileMutation = api.settings.downloadLogFile.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("ログファイルを保存しました");
      }
    },
    onError: () => {
      toast.error("ログファイルの保存に失敗しました");
    },
  });

  const openFolderMutation = api.settings.openFolder.useMutation({
    onSuccess: (data) => {
      if (!data.success && data.error) {
        toast.error(`フォルダを開けませんでした: ${data.error}`);
      }
    },
    onError: (error) => {
      toast.error(`フォルダを開けませんでした: ${error.message}`);
    },
  });

  const showFileInFolderMutation = api.settings.showFileInFolder.useMutation({
    onError: (error) => {
      toast.error(`ファイルの場所を開けませんでした: ${error.message}`);
    },
  });

  // Preference handlers
  const handleLaunchAtLoginChange = (checked: boolean) => {
    updatePreferencesMutation.mutate({
      launchAtLogin: checked,
    });
  };

  const handleShowWidgetWhileInactiveChange = (checked: boolean) => {
    updatePreferencesMutation.mutate({
      showWidgetWhileInactive: checked,
    });
  };

  const handleShowInDockChange = (checked: boolean) => {
    updatePreferencesMutation.mutate({
      showInDock: checked,
    });
  };

  const handleSoundEnabledChange = (checked: boolean) => {
    updatePreferencesMutation.mutate({
      soundEnabled: checked,
    });
  };

  const handleOpenDataFolder = () => {
    if (dataPathQuery.data) {
      openFolderMutation.mutate({ path: dataPathQuery.data });
    }
  };

  const handleShowLogFile = () => {
    if (logFilePathQuery.data) {
      showFileInFolderMutation.mutate({ path: logFilePathQuery.data });
    }
  };

  const handleOpenAudioFolder = () => {
    if (audioFolderPathQuery.data) {
      openFolderMutation.mutate({ path: audioFolderPathQuery.data });
    }
  };

  const showWidgetWhileInactive =
    preferencesQuery.data?.showWidgetWhileInactive ?? true;
  const launchAtLogin = preferencesQuery.data?.launchAtLogin ?? true;
  const showInDock = preferencesQuery.data?.showInDock ?? true;
  const soundEnabled = preferencesQuery.data?.soundEnabled ?? true;

  // Permission status
  const microphoneGranted = permissionsQuery.data?.microphone ?? false;
  const accessibilityGranted = permissionsQuery.data?.accessibility ?? false;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-xl font-bold">環境設定</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          アプリケーションの動作と外観をカスタマイズします
        </p>
      </div>

      <div className="space-y-6">
        {/* Permissions Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>システム権限</CardTitle>
                <CardDescription>
                  surasuraが正常に動作するために必要な権限です
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await permissionsQuery.refetch();
                  toast.success("権限の状態を更新しました");
                }}
                disabled={permissionsQuery.isFetching}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1.5 ${permissionsQuery.isFetching ? "animate-spin" : ""}`}
                />
                状態を更新
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Microphone Permission */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {microphoneGranted ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <div className="space-y-1">
                  <Label className="text-base font-medium text-foreground">
                    マイクへのアクセス
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    音声入力に必要です
                  </p>
                </div>
              </div>
              {microphoneGranted ? (
                <span className="text-sm text-green-600">許可済み</span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => requestMicrophoneMutation.mutate()}
                  disabled={requestMicrophoneMutation.isPending}
                >
                  許可する
                </Button>
              )}
            </div>

            {/* Accessibility Permission (macOS only) */}
            {isMac && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {accessibilityGranted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div className="space-y-1">
                      <Label className="text-base font-medium text-foreground">
                        アクセシビリティ
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        自動ペースト機能に必要です
                      </p>
                    </div>
                  </div>
                  {accessibilityGranted ? (
                    <span className="text-sm text-green-600">許可済み</span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAccessibilitySettingsMutation.mutate()}
                      disabled={openAccessibilitySettingsMutation.isPending}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      設定を開く
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* General Settings Card */}
        <Card>
          <CardContent className="space-y-4">
            {/* Launch at Login Section */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium text-foreground">
                  ログイン時に起動
                </Label>
                <p className="text-xs text-muted-foreground">
                  ログイン時にアプリケーションを自動的に起動します
                </p>
              </div>
              <Switch
                checked={launchAtLogin}
                onCheckedChange={handleLaunchAtLoginChange}
                disabled={updatePreferencesMutation.isPending}
              />
            </div>

            <Separator />

            {/* Show Widget While Inactive Section */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium text-foreground">
                  非アクティブ時もウィジェットを表示
                </Label>
                <p className="text-xs text-muted-foreground">
                  録音していないときもウィジェットを画面に表示し続けます
                </p>
              </div>
              <Switch
                checked={showWidgetWhileInactive}
                onCheckedChange={handleShowWidgetWhileInactiveChange}
                disabled={updatePreferencesMutation.isPending}
              />
            </div>

            <Separator />

            {/* Show in Dock Section (macOS only) */}
            {isMac && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium text-foreground">
                      Dockにアプリを表示
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      macOSのDockにアプリケーションアイコンを表示します
                    </p>
                  </div>
                  <Switch
                    checked={showInDock}
                    onCheckedChange={handleShowInDockChange}
                    disabled={updatePreferencesMutation.isPending}
                  />
                </div>

                <Separator />
              </>
            )}

            {/* Sound Enabled Section */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium text-foreground">
                  効果音
                </Label>
                <p className="text-xs text-muted-foreground">
                  録音開始・停止・ペースト時に効果音を再生します
                </p>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={handleSoundEnabledChange}
                disabled={updatePreferencesMutation.isPending}
              />
            </div>

            <Separator />

            {/* Theme Section */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium text-foreground">
                  テーマ
                </Label>
                <p className="text-xs text-muted-foreground">
                  お好みのカラースキームを選択してください
                </p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>詳細設定</CardTitle>
            <CardDescription>高度な設定オプション</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="data-location">データの保存場所</Label>
              <div className="flex gap-2">
                <Input
                  id="data-location"
                  value={dataPathQuery.data || "読み込み中..."}
                  disabled
                  className="cursor-default flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleOpenDataFolder}
                  disabled={!dataPathQuery.data}
                  title="フォルダを開く"
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audio-location">オーディオの保存場所</Label>
              <div className="flex gap-2">
                <Input
                  id="audio-location"
                  value={audioFolderPathQuery.data || "読み込み中..."}
                  disabled
                  className="cursor-default flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleOpenAudioFolder}
                  disabled={!audioFolderPathQuery.data}
                  title="フォルダを開く"
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="log-location">ログファイルの場所</Label>
              <div className="flex gap-2">
                <Input
                  id="log-location"
                  value={logFilePathQuery.data || "読み込み中..."}
                  disabled
                  className="cursor-default flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShowLogFile}
                  disabled={!logFilePathQuery.data}
                  title="Finderで表示"
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadLogFileMutation.mutate()}
                  disabled={downloadLogFileMutation.isPending}
                >
                  ダウンロード
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone Card */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">危険な操作</CardTitle>
            <CardDescription>
              この操作は元に戻せません。すべてのデータが削除されます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reset-app">アプリをリセット</Label>
                  <p className="text-sm text-muted-foreground">
                    すべてのデータを削除して初期状態に戻します
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={isResetting}
                      id="reset-app"
                    >
                      リセット
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>本当にリセットしますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        この操作は元に戻せません。以下のデータがすべて削除されます：
                        <ul className="list-disc list-inside mt-2">
                          <li>すべての文字起こし履歴</li>
                          <li>辞書データ</li>
                          <li>すべての設定</li>
                        </ul>
                        <br />
                        アプリは初期状態で再起動されます。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <Button
                        variant="destructive"
                        onClick={() => resetAppMutation.mutate()}
                      >
                        すべて削除する
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
