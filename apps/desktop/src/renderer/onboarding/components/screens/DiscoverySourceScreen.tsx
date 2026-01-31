import React, { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OnboardingLayout } from "../shared/OnboardingLayout";
import { NavigationButtons } from "../shared/NavigationButtons";
import { DiscoverySource } from "../../../../types/onboarding";
import { toast } from "sonner";

interface DiscoverySourceScreenProps {
  onNext: (source: DiscoverySource, details?: string) => void;
  onBack: () => void;
  initialSource?: DiscoverySource;
  initialDetails?: string;
}

/**
 * Discovery source screen - asks how users found Amical
 */
export function DiscoverySourceScreen({
  onNext,
  onBack,
  initialSource,
  initialDetails = "",
}: DiscoverySourceScreenProps) {
  const [selectedSource, setSelectedSource] = useState<DiscoverySource | null>(
    initialSource || null,
  );
  const [otherDetails, setOtherDetails] = useState(initialDetails);

  const sources = [
    {
      id: DiscoverySource.SearchEngine,
      label: "検索エンジン（Google、Bingなど）",
    },
    {
      id: DiscoverySource.SocialMedia,
      label: "SNS（Twitter、LinkedInなど）",
    },
    {
      id: DiscoverySource.WordOfMouth,
      label: "友人や同僚からの紹介",
    },
    {
      id: DiscoverySource.Other,
      label: "その他",
    },
  ];

  const handleContinue = () => {
    if (!selectedSource) {
      toast.error("Amicalをどこで知ったか選択してください");
      return;
    }

    if (selectedSource === DiscoverySource.Other && !otherDetails.trim()) {
      toast.error("「その他」の詳細を入力してください");
      return;
    }

    onNext(
      selectedSource,
      selectedSource === DiscoverySource.Other ? otherDetails : undefined,
    );
  };

  return (
    <OnboardingLayout
      title="Amicalをどこで知りましたか？"
      subtitle="ユーザーの皆様がどこから来ているか把握するのに役立ちます"
      footer={
        <NavigationButtons
          onBack={onBack}
          onNext={handleContinue}
          disableNext={
            !selectedSource ||
            (selectedSource === DiscoverySource.Other && !otherDetails.trim())
          }
        />
      }
    >
      <div className="space-y-6">
        {/* Discovery Sources */}
        <RadioGroup
          value={selectedSource || ""}
          onValueChange={(value) => setSelectedSource(value as DiscoverySource)}
          className="space-y-3"
        >
          {sources.map((source) => (
            <div key={source.id} className="flex items-center space-x-3">
              <RadioGroupItem value={source.id} id={source.id} />
              <Label
                htmlFor={source.id}
                className="flex-1 cursor-pointer font-normal"
              >
                {source.label}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {/* Other Details Input */}
        {selectedSource === DiscoverySource.Other && (
          <div className="space-y-2">
            <Label htmlFor="other-details">詳細を入力</Label>
            <Input
              id="other-details"
              placeholder="詳しく教えてください..."
              value={otherDetails}
              onChange={(e) => setOtherDetails(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {otherDetails.length}/100文字
            </p>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
}
