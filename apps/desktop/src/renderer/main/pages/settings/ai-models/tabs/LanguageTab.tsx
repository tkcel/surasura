"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api as trpc } from "@/trpc/react";
import { toast } from "sonner";
import { Check, Loader2, Eye, EyeOff, Info } from "lucide-react";

export default function LanguageTab() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Formatter config (for disabling when API key is removed)
  const { data: formatterConfig } = trpc.settings.getFormatterConfig.useQuery();

  // Get existing OpenAI config
  const { data: openaiConfig, isLoading: isLoadingConfig } =
    trpc.settings.getOpenAIConfig.useQuery();

  // Mutations
  const setOpenAIConfig = trpc.settings.setOpenAIConfig.useMutation();
  const validateConnection =
    trpc.settings.validateOpenAIConnection.useMutation();
  const setFormatterConfig = trpc.settings.setFormatterConfig.useMutation();

  // Initialize from stored config
  useEffect(() => {
    if (openaiConfig?.apiKey) {
      setApiKey(openaiConfig.apiKey);
      setIsConnected(true);
    }
  }, [openaiConfig]);

  const handleValidateAndSave = async () => {
    if (!apiKey.trim()) {
      toast.error("APIキーを入力してください");
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateConnection.mutateAsync({ apiKey });

      if (result.success) {
        await setOpenAIConfig.mutateAsync({ apiKey });
        setIsConnected(true);
        toast.success("OpenAI APIキーを保存しました");
      } else {
        setIsConnected(false);
        toast.error(result.error || "無効なAPIキーです");
      }
    } catch (error) {
      setIsConnected(false);
      toast.error("APIキーの検証に失敗しました");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveApiKey = async () => {
    try {
      await setOpenAIConfig.mutateAsync({ apiKey: "" });
      setApiKey("");
      setIsConnected(false);
      // Disable formatter if it was enabled
      if (formatterConfig?.enabled) {
        await setFormatterConfig.mutateAsync({
          enabled: false,
          modelId: undefined,
        });
      }
      toast.success("OpenAI APIキーを削除しました");
    } catch (error) {
      toast.error("APIキーの削除に失敗しました");
    }
  };

  if (isLoadingConfig) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          OpenAI API 設定
          {isConnected && (
            <span className="flex items-center gap-1 text-sm font-normal text-green-600">
              <Check className="h-4 w-4" />
              接続済み
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            OpenAI APIは文字起こしとテキストの整形に使用されます。APIキーは{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              platform.openai.com
            </a>{" "}
            から取得できます。
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="api-key">APIキー</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (isConnected) setIsConnected(false);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              onClick={handleValidateAndSave}
              disabled={isValidating || !apiKey.trim()}
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isConnected ? (
                "更新"
              ) : (
                "保存"
              )}
            </Button>
            {isConnected && (
              <Button variant="outline" onClick={handleRemoveApiKey}>
                削除
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
