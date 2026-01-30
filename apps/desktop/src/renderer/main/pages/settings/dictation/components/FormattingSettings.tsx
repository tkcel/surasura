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
    showCloudRequiresSpeech,
    showCloudRequiresAuth,
    showCloudReady,
    showNoLanguageModels,
    handleFormattingEnabledChange,
    handleFormattingModelChange,
    handleCloudLogin,
    isLoginPending,
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
              フォーマットを有効にするには、言語モデルを同期するか、Amical Cloudの文字起こしを選択してください。
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      <Link
        to="/settings/ai-models"
        search={{ tab: "language" }}
        className="inline-block"
      >
        <Button variant="link" className="text-xs px-0">
          <Plus className="w-4 h-4" />
          言語モデルを管理
        </Button>
      </Link>

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
              {showCloudRequiresSpeech && (
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  <span>Amical Cloudの文字起こしが必要です。</span>
                  <Link to="/settings/ai-models" search={{ tab: "speech" }}>
                    <Button variant="outline" size="sm">
                      音声モデルを変更
                    </Button>
                  </Link>
                </div>
              )}
              {showCloudRequiresAuth && (
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  <span>Amical Cloudのフォーマットを使用するにはサインインが必要です。</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCloudLogin}
                    disabled={isLoginPending}
                  >
                    サインイン
                  </Button>
                </div>
              )}
              {showCloudReady && (
                <p className="text-xs text-muted-foreground">
                  Amical Cloudのフォーマットを使用中です。
                </p>
              )}
              {showNoLanguageModels && (
                <div className="flex items-center justify-between rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs text-muted-foreground">
                  <span>
                    フォーマットが実行されません — 言語モデルがありません。
                  </span>
                  <Link to="/settings/ai-models" search={{ tab: "language" }}>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      言語モデルを同期
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
