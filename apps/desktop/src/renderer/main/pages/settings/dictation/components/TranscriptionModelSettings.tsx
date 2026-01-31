import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Combobox } from "@/components/ui/combobox";
import { api } from "@/trpc/react";

const WHISPER_MODELS = [
  {
    value: "whisper-1",
    label: "Whisper-1 (OpenAI)",
  },
];

export function TranscriptionModelSettings() {
  const utils = api.useUtils();

  // Get current speech model
  const { data: defaultSpeechModel, isLoading } =
    api.settings.getDefaultSpeechModel.useQuery();

  // Mutation for updating speech model
  const setSpeechModel = api.settings.setDefaultSpeechModel.useMutation({
    onSuccess: () => {
      utils.settings.getDefaultSpeechModel.invalidate();
    },
  });

  // Local state for immediate UI updates
  const [selectedModel, setSelectedModel] = useState<string>("whisper-1");

  // Sync local state with server data
  useEffect(() => {
    if (defaultSpeechModel) {
      setSelectedModel(defaultSpeechModel);
    }
  }, [defaultSpeechModel]);

  // Handle model selection
  const handleModelChange = async (modelId: string) => {
    setSelectedModel(modelId);

    try {
      await setSpeechModel.mutateAsync({ modelId });
    } catch (error) {
      // Revert local state on error
      setSelectedModel(defaultSpeechModel || "whisper-1");
      console.error("Failed to update speech model setting:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <Label className="text-base font-semibold text-foreground">
            文字起こしモデル
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            音声を文字に変換するモデルを選択してください。
          </p>
        </div>
        <Combobox
          options={WHISPER_MODELS}
          value={selectedModel}
          onChange={handleModelChange}
          placeholder="モデルを選択..."
          disabled={isLoading || setSpeechModel.isPending}
        />
      </div>
    </div>
  );
}
