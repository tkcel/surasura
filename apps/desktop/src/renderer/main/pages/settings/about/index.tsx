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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";

const DISCORD_URL = "https://discord.gg/ffpmWv5d";

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

export default function AboutSettingsPage() {
  const { data: version } = api.settings.getAppVersion.useQuery();

  const handleOpenDiscord = async () => {
    if (window.electronAPI?.openExternal) {
      await window.electronAPI.openExternal(DISCORD_URL);
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
            </div>
          </CardContent>
        </Card>

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
                <TabsTrigger value="surasura">surasura</TabsTrigger>
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
    </div>
  );
}
