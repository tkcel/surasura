import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AVAILABLE_LANGUAGES } from "@/constants/languages";
import { useState, useEffect } from "react";
import { Combobox } from "@/components/ui/combobox";
import { api } from "@/trpc/react";

export function LanguageSettings() {
  // Get dictation settings from tRPC
  const { data: dictationSettings, isLoading } =
    api.settings.getDictationSettings.useQuery();

  // Mutation for updating settings
  const updateDictationSettings = api.settings.setDictationSettings.useMutation(
    {
      onSuccess: () => {
        // Refetch to ensure UI is in sync
        utils.settings.getDictationSettings.invalidate();
      },
    },
  );

  const utils = api.useUtils();

  // Local state for immediate UI updates
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ja");
  const [autoDetect, setAutoDetect] = useState(true);

  // Sync local state with server data
  useEffect(() => {
    if (dictationSettings) {
      setSelectedLanguage(dictationSettings.selectedLanguage);
      setAutoDetect(dictationSettings.autoDetectEnabled);
    }
  }, [dictationSettings]);

  // Handle auto-detect toggle
  const handleAutoDetectChange = async (enabled: boolean) => {
    setAutoDetect(enabled);

    const newSettings = {
      autoDetectEnabled: enabled,
      selectedLanguage: enabled ? selectedLanguage : selectedLanguage || "ja",
    };

    try {
      await updateDictationSettings.mutateAsync(newSettings);
    } catch (error) {
      // Revert local state on error
      setAutoDetect(!enabled);
      console.error("Failed to update auto-detect setting:", error);
    }
  };

  // Handle language selection
  const handleLanguageChange = async (language: string) => {
    setSelectedLanguage(language);

    const newSettings = {
      autoDetectEnabled: autoDetect,
      selectedLanguage: language,
    };

    try {
      await updateDictationSettings.mutateAsync(newSettings);
    } catch (error) {
      // Revert local state on error
      setSelectedLanguage(dictationSettings?.selectedLanguage || "ja");
      console.error("Failed to update language setting:", error);
    }
  };

  return (
    <div className="">
      <div className="flex items-center justify-between mb-2">
        <div>
          <Label className="text-base font-semibold text-foreground">
            言語を自動検出
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            話されている言語を自動的に検出します。特定の言語を選択するにはオフにしてください。
          </p>
        </div>
        <Switch
          checked={autoDetect}
          onCheckedChange={handleAutoDetectChange}
          disabled={isLoading || updateDictationSettings.isPending}
        />
      </div>

      <div className="flex justify-between items-start mt-6 border-border border rounded-md p-4">
        <div
          className={cn(
            "flex items-start gap-2 flex-col",
            autoDetect && "opacity-50 pointer-events-none",
          )}
        >
          <Label className="text-sm font-medium text-foreground">
            言語
          </Label>
        </div>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div>
              <Combobox
                options={AVAILABLE_LANGUAGES.filter((l) => l.value !== "auto")}
                value={selectedLanguage}
                onChange={handleLanguageChange}
                placeholder="言語を選択..."
                disabled={
                  autoDetect || isLoading || updateDictationSettings.isPending
                }
              />
            </div>
          </TooltipTrigger>
          {autoDetect && (
            <TooltipContent className="max-w-sm text-center">
              言語を選択するには自動検出を無効にしてください。特定の言語を選択すると精度が向上する場合があります。
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </div>
  );
}
