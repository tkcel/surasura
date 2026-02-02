import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { api } from "@/trpc/react";
import { RefreshCw, Check, Download, Loader2 } from "lucide-react";

const DISCORD_URL = "https://discord.gg/ffpmWv5d";
const AMICAL_URL = "https://github.com/amicalhq/amical";

const SURASURA_LICENSE = `surasura 非商用ライセンス

Copyright (c) 2026 Takashi Nemoto, KyoToku Inc.

【許可される行為】
本ソフトウェアは、以下の条件のもとで使用が許可されます：
- 個人的な使用
- 教育目的での使用
- 研究目的での使用
- 非営利団体による非商用目的での使用

【禁止される行為】
以下の行為は明示的に禁止されます：
- 商用目的での使用（直接的または間接的な収益を得る目的での使用）
- 本ソフトウェアの販売
- 本ソフトウェアを組み込んだ商用製品またはサービスの提供
- 商用サービスの一部としての本ソフトウェアの使用

商用利用をご希望の場合は、別途商用ライセンスをお問い合わせください。`;

const ORIGINAL_MIT_LICENSE = `MIT License

Copyright (c) 2025 Naomi Chopra, Haritabh Singh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

type UpdateStatus =
  | "idle"
  | "checking"
  | "no-update"
  | "update-available"
  | "downloading"
  | "downloaded"
  | "error";

export default function AboutSettingsPage() {
  const { data: version } = api.settings.getAppVersion.useQuery();
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>("idle");
  const [newVersion, setNewVersion] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  const checkForUpdatesMutation = api.updater.checkForUpdates.useMutation();
  const downloadUpdateMutation = api.updater.downloadUpdate.useMutation();
  const quitAndInstallMutation = api.updater.quitAndInstall.useMutation();
  const installOnNextRestartMutation =
    api.updater.installOnNextRestart.useMutation();

  // ダウンロード進捗をサブスクリプションで受け取る
  api.updater.onDownloadProgress.useSubscription(undefined, {
    enabled: updateStatus === "downloading",
    onData: (progress) => {
      setDownloadProgress(Math.round(progress.percent || 0));
      // 100%になったらダウンロード完了
      if (progress.percent >= 100) {
        setUpdateStatus("downloaded");
      }
    },
    onError: (error) => {
      console.error("Download progress subscription error:", error);
    },
  });

  const handleOpenDiscord = async () => {
    if (window.electronAPI?.openExternal) {
      await window.electronAPI.openExternal(DISCORD_URL);
    }
  };

  const handleOpenAmical = async () => {
    if (window.electronAPI?.openExternal) {
      await window.electronAPI.openExternal(AMICAL_URL);
    }
  };

  const handleCheckForUpdates = async () => {
    setUpdateStatus("checking");
    setErrorMessage(null);

    try {
      const result = await checkForUpdatesMutation.mutateAsync({
        userInitiated: true,
      });

      if (result.updateAvailable && result.newVersion) {
        setNewVersion(result.newVersion);
        setUpdateStatus("update-available");
        setShowUpdateDialog(true);
      } else {
        setUpdateStatus("no-update");
        // 3秒後にidleに戻す
        setTimeout(() => setUpdateStatus("idle"), 3000);
      }
    } catch (error) {
      setUpdateStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "アップデートの確認に失敗しました",
      );
    }
  };

  const handleDownloadAndInstallNow = async () => {
    setShowUpdateDialog(false);
    setUpdateStatus("downloading");
    setDownloadProgress(0);

    try {
      await downloadUpdateMutation.mutateAsync();

      // ダウンロード完了を待つ（実際にはsubscriptionで進捗を受け取る方が良いが、簡略化）
      // 今回はdownloadUpdateが完了したらダウンロード完了とみなす
      setUpdateStatus("downloaded");

      // 少し待ってからインストール
      setTimeout(() => {
        quitAndInstallMutation.mutate();
      }, 1000);
    } catch (error) {
      setUpdateStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "アップデートのダウンロードに失敗しました",
      );
    }
  };

  const handleInstallOnNextRestart = async () => {
    setShowUpdateDialog(false);
    setUpdateStatus("downloading");
    setDownloadProgress(0);

    try {
      await downloadUpdateMutation.mutateAsync();
      await installOnNextRestartMutation.mutateAsync();
      setUpdateStatus("downloaded");
    } catch (error) {
      setUpdateStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "アップデートのダウンロードに失敗しました",
      );
    }
  };

  const getUpdateButtonContent = () => {
    switch (updateStatus) {
      case "checking":
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            確認中...
          </>
        );
      case "no-update":
        return (
          <>
            <Check className="w-4 h-4 mr-2" />
            最新版です
          </>
        );
      case "downloading":
        return (
          <>
            <Download className="w-4 h-4 mr-2 animate-pulse" />
            ダウンロード中...
          </>
        );
      case "downloaded":
        return (
          <>
            <Check className="w-4 h-4 mr-2" />
            次回起動時に更新
          </>
        );
      case "error":
        return (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            再試行
          </>
        );
      default:
        return (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            アップデートを確認
          </>
        );
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-xl font-bold">このアプリについて</h1>
        <p className="text-muted-foreground mt-1 text-sm">バージョン情報</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">現在のバージョン</div>
              <Badge variant="secondary" className="mt-1">
                v{version || "..."}
              </Badge>
              {updateStatus === "downloaded" && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  v{newVersion} が次回起動時にインストールされます
                </p>
              )}
              {updateStatus === "error" && errorMessage && (
                <p className="text-sm text-destructive mt-2">{errorMessage}</p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleCheckForUpdates}
              disabled={
                updateStatus === "checking" || updateStatus === "downloading"
              }
            >
              {getUpdateButtonContent()}
            </Button>
          </CardContent>
        </Card>

        {updateStatus === "downloading" && (
          <Card>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>ダウンロード中...</span>
                  <span>{Math.round(downloadProgress)}%</span>
                </div>
                <Progress value={downloadProgress} />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="space-y-3">
            <div className="text-lg font-semibold">ご意見・ご要望</div>
            <p className="text-sm text-muted-foreground">
              ご意見・ご要望などはDiscordサーバーまでお寄せください。
            </p>
            <Button variant="outline" onClick={handleOpenDiscord}>
              <img
                src="icons/integrations/discord.svg"
                alt="Discord"
                className="w-4 h-4 mr-2"
              />
              Discordサーバーに参加
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer with license link */}
      <div className="mt-8 pt-4 border-t text-center">
        <p className="text-xs text-muted-foreground mb-2">
          このアプリは{" "}
          <button
            onClick={handleOpenAmical}
            className="font-medium hover:text-foreground hover:underline"
          >
            Amical
          </button>{" "}
          を参考に多くの機能を実装しています。開発者の皆様に感謝いたします。
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-xs text-muted-foreground hover:text-foreground hover:underline">
              ライセンス情報
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>ライセンス情報</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="surasura" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="surasura"><span className="font-brand">surasura</span></TabsTrigger>
                <TabsTrigger value="thirdparty">サードパーティ</TabsTrigger>
              </TabsList>
              <TabsContent value="surasura">
                <ScrollArea className="h-64 mt-2">
                  <pre className="p-4 bg-muted rounded-md text-xs whitespace-pre-wrap font-mono">
                    {SURASURA_LICENSE}
                  </pre>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="thirdparty">
                <p className="text-sm text-muted-foreground mb-2">
                  このアプリはAmical（MITライセンス）をベースに開発されています。
                </p>
                <ScrollArea className="h-56 mt-2">
                  <pre className="p-4 bg-muted rounded-md text-xs whitespace-pre-wrap font-mono">
                    {ORIGINAL_MIT_LICENSE}
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Update Available Dialog */}
      <AlertDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>新しいバージョンがあります</AlertDialogTitle>
            <AlertDialogDescription>
              v{newVersion} が利用可能です。今すぐアップデートしますか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setShowUpdateDialog(false)}>
              後で
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleInstallOnNextRestart}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              次回起動時にアップデート
            </AlertDialogAction>
            <AlertDialogAction onClick={handleDownloadAndInstallNow}>
              今すぐアップデート
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
