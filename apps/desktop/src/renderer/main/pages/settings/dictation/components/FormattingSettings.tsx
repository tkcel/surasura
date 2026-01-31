import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Save,
  Loader2,
  Trash2,
  X,
  Pencil,
  Check,
  RotateCcw,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Combobox } from "@/components/ui/combobox";
import { useFormattingSettings } from "../hooks/use-formatting-settings";
import { cn } from "@/lib/utils";

const MODEL_LABELS: Record<string, string> = {
  "gpt-4o-mini": "GPT-4o Mini",
  "gpt-4o": "GPT-4o",
};

export function FormattingSettings() {
  const {
    formattingEnabled,
    formattingOptions,
    activePreset,
    presets,
    isSaving,
    isDeleting,
    isEditMode,
    isCreatingNew,
    editingPresetId,
    editName,
    editModelId,
    editInstructions,
    disableFormattingToggle,
    showApiKeyRequired,
    hasUnsavedChanges,
    canCreatePreset,
    canResetToDefault,
    isDefaultPreset,
    maxPresets,
    maxNameLength,
    maxInstructionsLength,
    handleFormattingEnabledChange,
    handleSelectPreset,
    handleStartEditing,
    handleStartCreating,
    handleCancelEdit,
    handleSavePreset,
    handleDeletePreset,
    handleResetToDefault,
    handleEditNameChange,
    handleEditModelChange,
    handleEditInstructionsChange,
  } = useFormattingSettings();

  const nameLength = editName.length;
  const instructionsLength = editInstructions.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-base font-semibold text-foreground">
            AIフォーマット
          </Label>
          <p className="text-xs text-muted-foreground">
            音声認識後のテキストをAIで整形します
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
              OpenAI APIキーが必要です
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* API Key Required */}
      {showApiKeyRequired && (
        <Link to="/settings/ai-models" className="inline-block">
          <Button variant="link" className="text-xs px-0 h-auto">
            <Plus className="w-3.5 h-3.5 mr-1" />
            OpenAI APIキーを設定
          </Button>
        </Link>
      )}

      {/* Main Content */}
      {formattingEnabled && (
        <div className="space-y-4">
          {/* Presets Section */}
          <div className="rounded-lg border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">プリセット</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  使用するプリセットを選択（{presets.length}/{maxPresets}）
                </p>
              </div>
              {!isEditMode && (
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        handleStartCreating();
                      }}
                      disabled={!canCreatePreset}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      新規作成
                    </Button>
                  </TooltipTrigger>
                  {!canCreatePreset && (
                    <TooltipContent>
                      プリセットは{maxPresets}個まで作成できます
                    </TooltipContent>
                  )}
                </Tooltip>
              )}
            </div>

            {/* Preset List */}
            {!isEditMode && presets.length > 0 && (
              <div className="space-y-2">
                {presets.map((preset) => {
                  const isActive = activePreset?.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all",
                        isActive
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <button
                        onClick={() => handleSelectPreset(preset.id)}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-2">
                          {isActive && (
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                          <div className={cn(!isActive && "ml-6")}>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "font-medium text-sm",
                                  isActive && "text-primary"
                                )}
                              >
                                {preset.name}
                              </span>
                              {isActive && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                  使用中
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {MODEL_LABELS[preset.modelId] || preset.modelId}
                              {preset.instructions && (
                                <span className="mx-1">·</span>
                              )}
                              {preset.instructions && (
                                <span className="truncate">
                                  {preset.instructions.length > 30
                                    ? preset.instructions.slice(0, 30) + "..."
                                    : preset.instructions}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEditing(preset.id)}
                        className="ml-2 h-8 w-8 p-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}

              </div>
            )}

            {/* Empty State */}
            {!isEditMode && presets.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <p>プリセットがありません</p>
                <p className="text-xs mt-1">
                  「新規作成」をクリックして作成してください
                </p>
              </div>
            )}

            {/* Edit Form */}
            {isEditMode && (
              <div className="pt-4 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    {isCreatingNew ? "新規プリセット" : "プリセットを編集"}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="h-8"
                  >
                    <X className="w-4 h-4 mr-1" />
                    閉じる
                  </Button>
                </div>

                {/* Preset Name */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-sm">プリセット名</Label>
                    <span
                      className={cn(
                        "text-xs",
                        nameLength > maxNameLength
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {nameLength}/{maxNameLength}
                    </span>
                  </div>
                  <Input
                    value={editName}
                    onChange={(e) => handleEditNameChange(e.target.value)}
                    placeholder="例: ビジネスメール用"
                    maxLength={maxNameLength + 5}
                    className="h-9"
                  />
                </div>

                {/* Model Selection */}
                <div>
                  <Label className="text-sm mb-1.5 block">使用モデル</Label>
                  <Combobox
                    options={formattingOptions}
                    value={editModelId}
                    onChange={handleEditModelChange}
                    placeholder="モデルを選択..."
                  />
                </div>

                {/* Instructions */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-sm">フォーマット指示</Label>
                    <span
                      className={cn(
                        "text-xs",
                        instructionsLength > maxInstructionsLength
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {instructionsLength}/{maxInstructionsLength}
                    </span>
                  </div>
                  <Textarea
                    value={editInstructions}
                    onChange={(e) =>
                      handleEditInstructionsChange(e.target.value)
                    }
                    placeholder="例: 文末は「です・ます」調に統一してください。専門用語は英語のまま残してください。"
                    className="min-h-[120px] resize-y text-sm"
                    maxLength={maxInstructionsLength + 100}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    空欄の場合は標準のフォーマットのみ適用されます
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    {!isCreatingNew && editingPresetId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeletePreset}
                        disabled={isDeleting || isSaving}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-1.5" />
                        )}
                        削除
                      </Button>
                    )}
                    {isDefaultPreset && canResetToDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResetToDefault}
                        disabled={isSaving}
                      >
                        <RotateCcw className="w-4 h-4 mr-1.5" />
                        デフォルトに戻す
                      </Button>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSavePreset}
                    disabled={
                      isSaving ||
                      !editName.trim() ||
                      nameLength > maxNameLength ||
                      instructionsLength > maxInstructionsLength ||
                      (!isCreatingNew && !hasUnsavedChanges)
                    }
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-1.5" />
                    )}
                    {isCreatingNew ? "作成" : "保存"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
