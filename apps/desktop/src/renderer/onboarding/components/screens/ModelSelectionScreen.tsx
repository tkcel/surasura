import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OnboardingLayout } from "../shared/OnboardingLayout";
import { NavigationButtons } from "../shared/NavigationButtons";
import { ModelSetupModal } from "./ModelSetupModal";
import { ModelType } from "../../../../types/onboarding";
import { Laptop, Check, Star, Info } from "lucide-react";
import { toast } from "sonner";

interface ModelSelectionScreenProps {
  onNext: (modelType: ModelType, recommendationFollowed: boolean) => void;
  onBack: () => void;
  initialSelection?: ModelType;
}

/**
 * Model selection screen - focuses on local model setup
 * (Cloud model option has been removed)
 */
export function ModelSelectionScreen({
  onNext,
  onBack,
  initialSelection,
}: ModelSelectionScreenProps) {
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(
    initialSelection || ModelType.Local,
  );
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupComplete, setSetupComplete] = useState<{
    [ModelType.Cloud]: boolean;
    [ModelType.Local]: boolean;
  }>({
    [ModelType.Cloud]: false,
    [ModelType.Local]: false,
  });

  const handleModelSelect = () => {
    setSelectedModel(ModelType.Local);
    setShowSetupModal(true);
  };

  const handleSetupComplete = () => {
    setSetupComplete((prev) => ({
      ...prev,
      [ModelType.Local]: true,
    }));
  };

  const handleContinue = () => {
    if (!setupComplete[ModelType.Local]) {
      toast.error("Please complete setup to continue");
      return;
    }

    onNext(ModelType.Local, true);
  };

  const canContinue = setupComplete[ModelType.Local];
  const isComplete = setupComplete[ModelType.Local];

  return (
    <OnboardingLayout
      title="Set Up Speech Recognition"
      subtitle="Download a local Whisper model to transcribe your audio"
      footer={
        <NavigationButtons
          onBack={onBack}
          onNext={handleContinue}
          disableNext={!canContinue}
          nextLabel={canContinue ? "Continue" : "Complete setup to continue"}
        />
      }
    >
      <div className="space-y-4">
        {/* Info Alert */}
        <Alert className="border-blue-500/50 bg-blue-500/5">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            <div>
              Amical uses local Whisper models for speech recognition. Your
              audio never leaves your device.
            </div>
          </AlertDescription>
        </Alert>

        {/* Local Model Option */}
        <Card
          className={`cursor-pointer transition-colors ${
            selectedModel === ModelType.Local
              ? "border-primary bg-primary/5"
              : "hover:border-muted-foreground/50"
          }`}
          onClick={handleModelSelect}
        >
          <div className="flex items-start gap-4 px-4">
            <div className="flex-1 space-y-2">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-slate-500/10">
                    <Laptop className="h-6 w-6 text-slate-500" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Local Whisper Model</h3>
                    </div>
                    <p className="text-sm">
                      Private, offline speech recognition on your device
                    </p>
                  </div>
                </div>
                {isComplete && (
                  <div className="rounded-full bg-green-500/10 p-1">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground">
                Download and run Whisper models locally. Multiple sizes
                available from tiny (~78MB) to large (~3.1GB). Larger models are
                more accurate but slower.
              </p>

              {/* Features */}
              <div className="text-sm">
                <ul className="space-y-0.5 text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    Full privacy - audio stays on your device
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    Works completely offline
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    No subscription required
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Settings Note */}
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-4">
          <Star className="h-4 w-4 mt-0.5 text-yellow-500 shrink-0" />
          <p className="text-sm text-muted-foreground">
            You can download additional models and configure OpenAI API for text
            formatting in Settings.
          </p>
        </div>
      </div>

      {/* Setup Modal */}
      <ModelSetupModal
        isOpen={showSetupModal}
        onClose={(wasCompleted) => {
          setShowSetupModal(false);
        }}
        modelType={ModelType.Local}
        onContinue={() => {
          handleSetupComplete();
          onNext(ModelType.Local, true);
        }}
      />
    </OnboardingLayout>
  );
}
