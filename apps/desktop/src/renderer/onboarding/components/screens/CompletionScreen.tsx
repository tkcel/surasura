import React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OnboardingLayout } from "../shared/OnboardingLayout";
import { NavigationButtons } from "../shared/NavigationButtons";
import { OnboardingMicrophoneSelect } from "../shared/OnboardingMicrophoneSelect";
import { OnboardingShortcutInput } from "../shared/OnboardingShortcutInput";
import { CheckCircle, Settings, Info } from "lucide-react";
import { FeatureInterest } from "../../../../types/onboarding";

interface CompletionScreenProps {
  onComplete: () => void;
  onBack: () => void;
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
  preferences,
}: CompletionScreenProps) {
  return (
    <OnboardingLayout
      title="セットアップ完了！"
      titleIcon={<CheckCircle className="h-7 w-7 text-green-500" />}
      footer={
        <NavigationButtons
          onComplete={onComplete}
          onBack={onBack}
          showBack={true}
          showNext={false}
          showComplete={true}
          completeLabel="Surasuraを使い始める"
        />
      }
    >
      <div className="space-y-6">
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

        {/* Next Steps */}
        <Card className="border-primary/20 bg-primary/5 px-6 gap-2">
          <h3 className="font-medium">準備完了です！</h3>
          <div>
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-primary">•</span>
              <p className="text-sm">
                プッシュトゥトークのショートカットを使って文字起こしを開始
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
