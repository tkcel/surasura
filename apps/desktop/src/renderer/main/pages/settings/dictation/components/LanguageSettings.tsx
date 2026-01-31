import { Label } from "@/components/ui/label";
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

  // Sync local state with server data
  useEffect(() => {
    if (dictationSettings) {
      setSelectedLanguage(dictationSettings.selectedLanguage);
    }
  }, [dictationSettings]);

  // Handle language selection
  const handleLanguageChange = async (language: string) => {
    setSelectedLanguage(language);

    try {
      await updateDictationSettings.mutateAsync({
        selectedLanguage: language,
      });
    } catch (error) {
      // Revert local state on error
      setSelectedLanguage(dictationSettings?.selectedLanguage || "ja");
      console.error("Failed to update language setting:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <Label className="text-base font-semibold text-foreground">
            言語
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            音声認識に使用する言語を選択してください。
          </p>
        </div>
        <Combobox
          options={AVAILABLE_LANGUAGES.filter((l) => l.value !== "auto")}
          value={selectedLanguage}
          onChange={handleLanguageChange}
          placeholder="言語を選択..."
          disabled={isLoading || updateDictationSettings.isPending}
        />
      </div>
    </div>
  );
}
