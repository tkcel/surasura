import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Combobox } from "@/components/ui/combobox";
import { useFormattingSettings } from "../hooks/use-formatting-settings";

export function FormattingSettings() {
  const {
    formattingEnabled,
    selectedModelId,
    formattingOptions,
    disableFormattingToggle,
    hasFormattingOptions,
    showApiKeyRequired,
    handleFormattingEnabledChange,
    handleFormattingModelChange,
  } = useFormattingSettings();

  return (
    <div className="">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <Label className="text-base font-semibold text-foreground">
              フォーマット
            </Label>
            <Badge className="text-[10px] px-1.5 py-0 bg-orange-500/20 text-orange-500 hover:bg-orange-500/20">
              Alpha
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            文字起こしに句読点や構造を適用します。
          </p>
        </div>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div>
              <Switch
                checked={formattingEnabled}
                onCheckedChange={handleFormattingEnabledChange}
                disabled={disableFormattingToggle}
              />
            </div>
          </TooltipTrigger>
          {disableFormattingToggle && (
            <TooltipContent className="max-w-sm text-center">
              フォーマットを有効にするには、OpenAI APIキーを設定してください。
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      {showApiKeyRequired && (
        <Link to="/settings/ai-models" className="inline-block">
          <Button variant="link" className="text-xs px-0">
            <Plus className="w-4 h-4" />
            OpenAI APIキーを設定
          </Button>
        </Link>
      )}

      {formattingEnabled && (
        <div className="mt-6 border-border border rounded-md p-4">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                フォーマットモデル
              </Label>
              <p className="text-xs text-muted-foreground mb-4">
                文字起こしのフォーマットに使用するモデルを選択してください。
              </p>
            </div>
            <div className="space-y-3">
              <Combobox
                options={formattingOptions}
                value={selectedModelId}
                onChange={handleFormattingModelChange}
                placeholder="モデルを選択..."
                disabled={!hasFormattingOptions}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
