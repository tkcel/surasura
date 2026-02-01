import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OnboardingLayout } from "../shared/OnboardingLayout";
import { NavigationButtons } from "../shared/NavigationButtons";
import { OnboardingMicrophoneSelect } from "../shared/OnboardingMicrophoneSelect";
import { OnboardingShortcutInput } from "../shared/OnboardingShortcutInput";
import { CheckCircle, Settings, Info, AlertCircle, ArrowRight } from "lucide-react";
import { FeatureInterest, OnboardingScreen } from "../../../../types/onboarding";
import { api } from "@/trpc/react";

interface CompletionScreenProps {
  onComplete: () => void;
  onBack: () => void;
  onNavigateToScreen: (screen: OnboardingScreen) => void;
  preferences: {
    featureInterests?: FeatureInterest[];
  };
}

/**
 * Completion screen - final screen showing setup is complete
 */
export function CompletionScreen({
  onComplete,
  onBack,
  onNavigateToScreen,
  preferences,
}: CompletionScreenProps) {
  // Check all requirements
  const { data: requirements, refetch } =
    api.onboarding.checkAllRequirements.useQuery(undefined, {
      refetchInterval: 2000, // Poll every 2 seconds
    });

  // Determine if all requirements are met
  const allRequirementsMet =
    requirements?.microphone &&
    (requirements?.accessibility || requirements?.platform !== "darwin") &&
    requirements?.apiKey;

  // Build list of missing requirements with navigation info
  const missingRequirements: {
    label: string;
    screen: OnboardingScreen;
  }[] = [];
  if (requirements && !requirements.microphone) {
    missingRequirements.push({
      label: "マイク権限",
      screen: OnboardingScreen.Permissions,
    });
  }
  if (
    requirements &&
    !requirements.accessibility &&
    requirements.platform === "darwin"
  ) {
    missingRequirements.push({
      label: "アクセシビリティ権限",
      screen: OnboardingScreen.Permissions,
    });
  }
  if (requirements && !requirements.apiKey) {
    missingRequirements.push({
      label: "OpenAI APIキー",
      screen: OnboardingScreen.APIKeySetup,
    });
  }

  // Dynamic title based on requirements status
  const title = allRequirementsMet
    ? "セットアップ完了！"
    : "あと少しで完了です";
  const titleIcon = allRequirementsMet ? (
    <CheckCircle className="h-7 w-7 text-green-500" />
  ) : (
    <AlertCircle className="h-7 w-7 text-amber-500" />
  );

  return (
    <OnboardingLayout
      title={title}
      titleIcon={titleIcon}
      footer={
        <NavigationButtons
          onComplete={onComplete}
          onBack={onBack}
          showBack={true}
          showNext={false}
          showComplete={true}
          completeLabel="surasuraを使い始める"
          disableComplete={!allRequirementsMet}
        />
      }
    >
      <div className="space-y-6">
        {/* Missing Requirements Warning */}
        {missingRequirements.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
              <div className="flex-1">
                <h4 className="font-medium text-destructive">
                  必須要件が不足しています
                </h4>
                <div className="mt-3 space-y-2">
                  {missingRequirements.map((req) => (
                    <div
                      key={req.label}
                      className="flex items-center justify-between gap-2 rounded-md bg-background/50 px-3 py-2"
                    >
                      <span className="text-sm text-destructive/90">
                        {req.label}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigateToScreen(req.screen)}
                        className="h-7 gap-1 text-xs"
                      >
                        設定する
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Configuration */}
        <Card className="p-6">
          <h3 className="mb-4 font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            クイック設定
          </h3>
          <div className="space-y-4">
            <OnboardingMicrophoneSelect />
            <Separator />
            <OnboardingShortcutInput />
          </div>
        </Card>

        {/* Next Steps - only show when all requirements are met */}
        {allRequirementsMet && (
          <Card className="border-primary/20 bg-primary/5 px-6 gap-2">
            <h3 className="font-medium">準備完了です！</h3>
            <div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-primary">•</span>
                <p className="text-sm">
                  Push to Talkのショートカットを使って文字起こしを開始
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-primary">•</span>
                <p className="text-sm">
                  フローティングウィジェットをクリックして素早くアクセス
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-primary">•</span>
                <p className="text-sm">
                  設定画面でさらにカスタマイズ
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Info Note */}
        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
          <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            すべての設定はアプリケーションの設定からいつでも変更できます。
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
