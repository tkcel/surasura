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
import { cn } from "@/lib/utils";

interface APIKeySetupScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function APIKeySetupScreen({ onNext, onBack }: APIKeySetupScreenProps) {
  // OpenAI state
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [showOpenaiApiKey, setShowOpenaiApiKey] = useState(false);
  const [isValidatingOpenai, setIsValidatingOpenai] = useState(false);
  const [isOpenaiConnected, setIsOpenaiConnected] = useState(false);

  // Get existing config
  const { data: openaiConfig, isLoading: isLoadingOpenai } =
    api.settings.getOpenAIConfig.useQuery();

  // Mutations
  const setOpenAIConfig = api.settings.setOpenAIConfig.useMutation();
  const validateOpenAIConnection =
    api.settings.validateOpenAIConnection.useMutation();

  // Initialize from stored config
  useEffect(() => {
    if (openaiConfig?.apiKey) {
      setOpenaiApiKey(openaiConfig.apiKey);
      setIsOpenaiConnected(true);
    }
  }, [openaiConfig]);

  // OpenAI is required for transcription
  const canContinue = isOpenaiConnected;

  // Validation handler
  const handleValidateOpenai = async () => {
    if (!openaiApiKey.trim()) {
      toast.error("APIキーを入力してください");
      return;
    }

    setIsValidatingOpenai(true);
    try {
      const result = await validateOpenAIConnection.mutateAsync({
        apiKey: openaiApiKey,
      });

      if (result.success) {
        await setOpenAIConfig.mutateAsync({ apiKey: openaiApiKey });
        setIsOpenaiConnected(true);
        toast.success("OpenAI APIキーを保存しました");
      } else {
        setIsOpenaiConnected(false);
        toast.error(result.error || "無効なAPIキーです");
      }
    } catch (error) {
      setIsOpenaiConnected(false);
      toast.error("APIキーの検証に失敗しました");
    } finally {
      setIsValidatingOpenai(false);
    }
  };

  const handleOpenPlatform = () => {
    window.open("https://platform.openai.com/api-keys", "_blank");
  };

  const handleContinue = () => {
    if (!canContinue) {
      toast.error("続行するにはOpenAI APIキーを設定してください");
      return;
    }
    onNext();
  };

  if (isLoadingOpenai) {
    return (
      <OnboardingLayout
        title="APIキーの設定"
        subtitle=""
        footer={
          <NavigationButtons onBack={onBack} onNext={() => {}} disableNext />
        }
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
      subtitle="音声認識とテキスト整形に使用します"
      footer={
        <NavigationButtons
          onBack={onBack}
          onNext={handleContinue}
          disableNext={!canContinue}
          nextLabel={canContinue ? "続ける" : "OpenAI APIキーを設定してください"}
        />
      }
    >
      <div className="space-y-4">
        {/* Info Alert */}
        <Alert className="border-blue-500/50 bg-blue-500/5">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            <div>
              音声認識とテキスト整形に使用します。
            </div>
          </AlertDescription>
        </Alert>

        {/* OpenAI Card */}
        <Card
          className={cn("overflow-hidden", isOpenaiConnected && "border-green-500/50")}
        >
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-start gap-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">OpenAI</h3>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600">
                    必須
                  </span>
                  {isOpenaiConnected && (
                    <span className="flex items-center gap-1 text-sm font-normal text-green-600">
                      <Check className="h-4 w-4" />
                      接続済み
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  文字起こしとテキスト整形
                </p>
              </div>
            </div>

            {/* API Key Input */}
            <div className="space-y-2">
              <Label>APIキー</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showOpenaiApiKey ? "text" : "password"}
                    placeholder="sk-..."
                    value={openaiApiKey}
                    onChange={(e) => {
                      setOpenaiApiKey(e.target.value);
                      if (isOpenaiConnected) setIsOpenaiConnected(false);
                    }}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowOpenaiApiKey(!showOpenaiApiKey)}
                  >
                    {showOpenaiApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={handleValidateOpenai}
                  disabled={isValidatingOpenai || !openaiApiKey.trim()}
                >
                  {isValidatingOpenai ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isOpenaiConnected ? (
                    "更新"
                  ) : (
                    "保存"
                  )}
                </Button>
              </div>
            </div>

            {/* Get API Key Link */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleOpenPlatform}
            >
              <ExternalLink className="h-4 w-4" />
              OpenAI PlatformでAPIキーを取得
            </Button>

            {/* Features */}
            <div className="text-sm">
              <ul className="space-y-0.5 text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  高精度な音声認識 (Whisper)
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  高品質なテキスト整形 (GPT-4o)
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  多言語対応
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </OnboardingLayout>
  );
}
