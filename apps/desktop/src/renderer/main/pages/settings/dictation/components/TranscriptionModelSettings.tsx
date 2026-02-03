import { Label } from "@/components/ui/label";
import { useState, useEffect, useMemo } from "react";
import { Combobox } from "@/components/ui/combobox";
import { api } from "@/trpc/react";
import {
  SPEECH_MODEL_COSTS,
  formatSpeechCost,
  getSpeedLabel,
  getQualityLabel,
} from "../../../../../../constants/model-costs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export function TranscriptionModelSettings() {
  const utils = api.useUtils();

  // Get API configuration status
  const { data: openaiConfig } = api.settings.getOpenAIConfig.useQuery();

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

  // Build available models based on configured APIs
  const availableModels = useMemo(() => {
    if (!openaiConfig?.apiKey) return [];

    return SPEECH_MODEL_COSTS.map((m) => ({
      value: m.id,
      label: m.name,
      description: `${m.description} · ${formatSpeechCost(m)}`,
    }));
  }, [openaiConfig]);

  // Get selected model info for tooltip
  const selectedModelInfo = useMemo(() => {
    return SPEECH_MODEL_COSTS.find((m) => m.id === selectedModel);
  }, [selectedModel]);

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

  // If OpenAI API is not configured, show a message
  if (!openaiConfig?.apiKey) {
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
          <Badge variant="outline" className="text-muted-foreground">
            OpenAI APIキー未設定
          </Badge>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center gap-2">
          {selectedModelInfo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="text-xs cursor-help">
                    {getSpeedLabel(selectedModelInfo.speed)} /{" "}
                    {getQualityLabel(selectedModelInfo.accuracy)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-medium">{selectedModelInfo.name}</p>
                    <p className="text-muted-foreground">
                      {selectedModelInfo.description}
                    </p>
                    <p className="mt-1">
                      コスト: {formatSpeechCost(selectedModelInfo)}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Combobox
            options={availableModels}
            value={selectedModel}
            onChange={handleModelChange}
            placeholder="モデルを選択..."
            disabled={isLoading || setSpeechModel.isPending}
          />
        </div>
      </div>
    </div>
  );
}
