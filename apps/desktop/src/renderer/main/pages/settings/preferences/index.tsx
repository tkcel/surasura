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
import { FolderOpen } from "lucide-react";

export default function PreferencesSettingsPage() {
  const [isResetting, setIsResetting] = useState(false);
  const utils = api.useUtils();

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

  // Advanced settings queries and mutations
  const telemetryQuery = api.settings.getTelemetrySettings.useQuery();
  const dataPathQuery = api.settings.getDataPath.useQuery();
  const logFilePathQuery = api.settings.getLogFilePath.useQuery();
  const audioFolderPathQuery = api.settings.getAudioFolderPath.useQuery();
  const machineIdQuery = api.settings.getMachineId.useQuery();

  const updateTelemetrySettingsMutation =
    api.settings.updateTelemetrySettings.useMutation({
      onSuccess: () => {
        utils.settings.getTelemetrySettings.invalidate();
        utils.settings.getTelemetryConfig.invalidate();
        toast.success("テレメトリー設定を更新しました");
      },
      onError: (error) => {
        console.error("Failed to update telemetry settings:", error);
        toast.error("テレメトリー設定の更新に失敗しました");
      },
    });

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

  // Advanced settings handlers
  const handleTelemetryChange = (checked: boolean) => {
    updateTelemetrySettingsMutation.mutate({
      enabled: checked,
    });
  };

  const handleCopyMachineId = async () => {
    if (machineIdQuery.data) {
      await navigator.clipboard.writeText(machineIdQuery.data);
      toast.success("マシンIDをコピーしました");
    }
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
  const isMac = window.electronAPI.platform === "darwin";

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
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="telemetry">改善のために匿名で情報を提供する</Label>
                <p className="text-sm text-muted-foreground">
                  匿名の使用状況データを共有してSurasuraの改善に協力する
                </p>
              </div>
              <Switch
                id="telemetry"
                checked={telemetryQuery.data?.enabled ?? true}
                onCheckedChange={handleTelemetryChange}
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="machine-id">マシンID</Label>
              <div className="flex gap-2">
                <Input
                  id="machine-id"
                  value={machineIdQuery.data || "読み込み中..."}
                  disabled
                  className="cursor-default flex-1 font-mono text-xs"
                />
                <Button
                  variant="outline"
                  onClick={handleCopyMachineId}
                  disabled={!machineIdQuery.data}
                >
                  コピー
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
