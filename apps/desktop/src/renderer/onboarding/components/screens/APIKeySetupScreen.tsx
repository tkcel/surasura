import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OnboardingLayout } from "../shared/OnboardingLayout";
import { NavigationButtons } from "../shared/NavigationButtons";
import { api } from "@/trpc/react";
import { Check, Loader2, Eye, EyeOff, Info, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface APIKeySetupScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function APIKeySetupScreen({ onNext, onBack }: APIKeySetupScreenProps) {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Get existing OpenAI config
  const { data: openaiConfig, isLoading: isLoadingConfig } =
    api.settings.getOpenAIConfig.useQuery();

  // Mutations
  const setOpenAIConfig = api.settings.setOpenAIConfig.useMutation();
  const validateConnection = api.settings.validateOpenAIConnection.useMutation();

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

  const handleContinue = () => {
    if (!isConnected) {
      toast.error("続行するにはOpenAI APIキーを設定してください");
      return;
    }
    onNext();
  };

  const handleOpenPlatform = () => {
    window.open("https://platform.openai.com/api-keys", "_blank");
  };

  if (isLoadingConfig) {
    return (
      <OnboardingLayout
        title="APIキーの設定"
        subtitle=""
        footer={<NavigationButtons onBack={onBack} onNext={() => {}} disableNext />}
      >
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      title="APIキーの設定"
      subtitle="音声認識にOpenAI Whisper APIを使用します"
      footer={
        <NavigationButtons
          onBack={onBack}
          onNext={handleContinue}
          disableNext={!isConnected}
          nextLabel={isConnected ? "続ける" : "APIキーを設定してください"}
        />
      }
    >
      <div className="space-y-4">
        {/* Info Alert */}
        <Alert className="border-blue-500/50 bg-blue-500/5">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            <div>
              音声認識にはOpenAI Whisper APIを使用します。APIキーはOpenAIのプラットフォームから取得できます。
            </div>
          </AlertDescription>
        </Alert>

        {/* API Key Setup Card */}
        <Card className="p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">OpenAI APIキー</h3>
                    {isConnected && (
                      <span className="flex items-center gap-1 text-sm font-normal text-green-600">
                        <Check className="h-4 w-4" />
                        接続済み
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Whisper APIを使用するためにAPIキーが必要です
                  </p>
                </div>
              </div>
            </div>

            {/* API Key Input */}
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
                    className="pr-10"
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
              </div>
            </div>

            {/* Get API Key Link */}
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleOpenPlatform}
              >
                <ExternalLink className="h-4 w-4" />
                OpenAI PlatformでAPIキーを取得
              </Button>
            </div>

            {/* Features */}
            <div className="text-sm pt-2">
              <ul className="space-y-0.5 text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  高精度な音声認識
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  多言語対応
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  高速な処理
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </OnboardingLayout>
  );
}
