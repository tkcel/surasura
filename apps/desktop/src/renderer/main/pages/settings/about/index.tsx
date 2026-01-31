import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

const DISCORD_URL = "https://discord.gg/ffpmWv5d";

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
        <p className="text-muted-foreground mt-1 text-sm">
          バージョン情報
        </p>
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
    </div>
  );
}
