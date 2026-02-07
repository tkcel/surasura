import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Save,
  Loader2,
  Trash2,
  Pencil,
  Check,
  RotateCcw,
  Sparkles,
  HelpCircle,
  X,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { useFormattingSettings } from "../hooks/use-formatting-settings";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PRESET_COLORS, PRESET_TYPES, type PresetColorId, type PresetTypeId } from "@/types/formatter";
import {
  getLanguageModelCost,
  getSpeedLabel,
  getQualityLabel,
  formatLanguageCost,
} from "../../../../../../constants/model-costs";
import { InstructionsEditor, type InstructionsEditorHandle } from "./InstructionsEditor";
import { FORMATTING_VARIABLES, type FormattingVariableKey } from "../constants/formatting-variables";

const MODEL_LABELS: Record<string, string> = {
  "gpt-4.1-nano": "GPT-4.1 Nano",
  "gpt-4o-mini": "GPT-4o Mini",
  "gpt-4.1-mini": "GPT-4.1 Mini",
  "gpt-4.1": "GPT-4.1",
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
    handleEditTypeChange,
    handleEditModelChange,
    handleEditInstructionsChange,
    handleEditColorChange,
    editType,
    editColor,
    pendingTypeChange,
    handleConfirmTypeChange,
    handleCancelTypeChange,
    handleConfirmResetAll,
    isResettingAll,
  } = useFormattingSettings();

  const instructionsEditorRef = useRef<InstructionsEditorHandle>(null);
  const [isVariableHelpOpen, setIsVariableHelpOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);

  // ドロワーが閉じた時に編集状態をリセット
  useEffect(() => {
    if (!isEditMode) {
      setIsEditingInstructions(false);
    }
  }, [isEditMode]);

  const insertVariable = (variable: string) => {
    instructionsEditorRef.current?.insertVariable(variable);
  };

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
            </div>

            {/* Preset List */}
            {presets.length > 0 && (
              <div className="space-y-2">
                {presets.map((preset, index) => {
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
                          <span className="text-xs text-muted-foreground w-4 text-center flex-shrink-0">
                            {index + 1}
                          </span>
                          {isActive ? (
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          ) : (
                            <Sparkles className={cn("w-4 h-4 flex-shrink-0", PRESET_COLORS.find(c => c.id === preset.color)?.class ?? "text-yellow-500")} />
                          )}
                          <div>
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
            {presets.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <p>プリセットがありません</p>
                <p className="text-xs mt-1">
                  「新規作成」をクリックして作成してください
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleConfirmResetAll}
                  disabled={isResettingAll}
                  className="mt-3"
                >
                  {isResettingAll ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                  )}
                  デフォルトに復元
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Preset Drawer */}
      <Drawer open={isEditMode} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DrawerContent
          className="h-[100vh] max-h-[100vh] data-[vaul-drawer-direction=bottom]:max-h-[100vh] data-[vaul-drawer-direction=bottom]:mt-0 overflow-hidden"
          onOpenAutoFocus={(e) => e.preventDefault()}
          showHandle={false}
        >
          {/* Header with safe area */}
          <div className="flex items-center justify-end px-4 pt-2 pb-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCancelEdit}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-6 p-4 flex-1 overflow-y-auto">
            {/* Preset Name */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">プリセット名</Label>
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
                className="h-10"
              />
            </div>

            {/* Type Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">プリセットタイプ</Label>
              <div className="flex gap-3">
                {PRESET_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleEditTypeChange(type.id as PresetTypeId)}
                    className={cn(
                      "flex-1 p-4 rounded-lg border transition-all text-left",
                      editType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {type.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">アイコンの色</Label>
              <div className="flex gap-2">
                {PRESET_COLORS.map((color) => (
                  <Tooltip key={color.id} delayDuration={100}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleEditColorChange(color.id as PresetColorId)}
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                          "hover:bg-muted focus:outline-none",
                          editColor === color.id && "bg-muted ring-2 ring-primary"
                        )}
                      >
                        <Sparkles className={cn("w-6 h-6", color.class)} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {color.label}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">使用モデル</Label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Combobox
                    options={formattingOptions}
                    value={editModelId}
                    onChange={handleEditModelChange}
                    placeholder="モデルを選択..."
                  />
                </div>
                {(() => {
                  const modelInfo = getLanguageModelCost(editModelId);
                  return modelInfo ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="text-xs cursor-help">
                            {getSpeedLabel(modelInfo.speed)} / {getQualityLabel(modelInfo.quality)}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p className="font-medium">{modelInfo.name}</p>
                            <p className="text-muted-foreground">{modelInfo.description}</p>
                            <p className="mt-1">コスト: {formatLanguageCost(modelInfo)}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : null;
                })()}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">フォーマット指示</Label>
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

              {/* Variable Buttons */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">変数を挿入:</span>
                {(Object.entries(FORMATTING_VARIABLES) as [FormattingVariableKey, typeof FORMATTING_VARIABLES[FormattingVariableKey]][]).map(([variable, { label, colorClass }]) => (
                  <Badge
                    key={variable}
                    variant="secondary"
                    className={cn(
                      "px-2 py-1 text-xs cursor-pointer hover:opacity-80 transition-opacity",
                      colorClass
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertVariable(variable)}
                  >
                    {label}
                  </Badge>
                ))}
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setIsVariableHelpOpen(true)}
                    >
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>変数の使い方</TooltipContent>
                </Tooltip>
              </div>

              <InstructionsEditor
                ref={instructionsEditorRef}
                value={editInstructions}
                onChange={handleEditInstructionsChange}
                maxLength={maxInstructionsLength + 100}
                isEditing={isEditingInstructions}
                onEditingChange={setIsEditingInstructions}
              />
              <p className="text-xs text-muted-foreground mt-2">
                空欄の場合は標準のフォーマットのみ適用されます
              </p>
            </div>

            {/* Secondary actions at bottom of content */}
            <div className="flex items-center gap-4 pt-4">
              {isDefaultPreset && canResetToDefault && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  disabled={isSaving}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 disabled:opacity-50"
                >
                  デフォルトに戻す
                </button>
              )}
              {!isCreatingNew && editingPresetId && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting || isSaving}
                  className="text-xs text-muted-foreground hover:text-destructive underline underline-offset-2 disabled:opacity-50"
                >
                  {isDeleting ? "削除中..." : "プリセットを削除する"}
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border mt-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
            >
              キャンセル
            </Button>
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
        </DrawerContent>
      </Drawer>

      {/* Variable Help Modal */}
      <Dialog open={isVariableHelpOpen} onOpenChange={setIsVariableHelpOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>変数の使い方</DialogTitle>
            <DialogDescription>
              フォーマット指示内で変数を使うと、音声入力時の状況に応じた動的な指示が可能になります。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              {(Object.entries(FORMATTING_VARIABLES) as [FormattingVariableKey, typeof FORMATTING_VARIABLES[FormattingVariableKey]][]).map(([variable, { label, colorClass }]) => (
                <div key={variable} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="secondary"
                      className={cn("px-1.5 py-0.5 text-xs", colorClass)}
                    >
                      {label}
                    </Badge>
                    <code className="text-xs font-mono text-muted-foreground">{variable}</code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {variable === "{{transcription}}" && "音声認識結果に置き換わります。指示文の中で音声認識結果をどう扱うか明示的に指定できます。"}
                    {variable === "{{clipboard}}" && "クリップボードの内容に置き換わります。コピーしたテキストを参照した指示を作成できます。"}
                    {variable === "{{appName}}" && "フォーカス中のアプリケーション名に置き換わります。ペースト先のアプリに適した形式で出力するよう指示できます。"}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs font-medium mb-2">使用例</p>
              <div className="p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground space-y-3">
                <div>
                  <p>
                    現在「<Badge variant="secondary" className={cn("px-1 py-0 text-xs mx-0.5", FORMATTING_VARIABLES["{{appName}}"].colorClass)}>アプリ名</Badge>」を使用中です。このアプリに適した形式で「<Badge variant="secondary" className={cn("px-1 py-0 text-xs mx-0.5", FORMATTING_VARIABLES["{{transcription}}"].colorClass)}>音声認識結果</Badge>」を整形してください。
                  </p>
                  <p className="text-muted-foreground/70 text-xs mt-1">→ ペースト先のアプリに適した形式で出力</p>
                </div>
                <div>
                  <p>
                    「<Badge variant="secondary" className={cn("px-1 py-0 text-xs mx-0.5", FORMATTING_VARIABLES["{{clipboard}}"].colorClass)}>クリップボード</Badge>」を参考に、「<Badge variant="secondary" className={cn("px-1 py-0 text-xs mx-0.5", FORMATTING_VARIABLES["{{transcription}}"].colorClass)}>音声認識結果</Badge>」の内容を整形してください。
                  </p>
                  <p className="text-muted-foreground/70 text-xs mt-1">→ クリップボードのテキストを参考に整形</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Type Change Confirmation Dialog */}
      <AlertDialog open={pendingTypeChange !== null} onOpenChange={(open) => !open && handleCancelTypeChange()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>プリセットタイプを変更</AlertDialogTitle>
            <AlertDialogDescription>
              プリセットタイプを「{pendingTypeChange === "formatting" ? "整形" : "回答"}」に変更すると、
              フォーマット指示がデフォルトの内容に置き換わります。
              <br /><br />
              現在の指示文は失われます。よろしいですか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTypeChange}>変更する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>プリセットを削除</AlertDialogTitle>
            <AlertDialogDescription>
              「{editName}」を削除しますか？この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteConfirm(false);
                handleDeletePreset();
              }}
              className="text-destructive"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      </div>
  );
}
