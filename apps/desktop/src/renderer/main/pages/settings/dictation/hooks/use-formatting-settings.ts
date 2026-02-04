import { useMemo, useCallback, useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type { FormatterConfig, FormatPreset, PresetColorId, PresetTypeId } from "@/types/formatter";

import type { ComboboxOption } from "@/components/ui/combobox";
import {
  LANGUAGE_MODEL_COSTS,
  formatLanguageCost,
} from "../../../../../../constants/model-costs";

// Helper to find the scroll container and preserve scroll position
function getScrollContainer(): HTMLElement | null {
  return document.querySelector(".overflow-y-auto");
}

function preserveScrollPosition(action: () => void) {
  const scrollContainer = getScrollContainer();
  const scrollTop = scrollContainer?.scrollTop ?? 0;

  action();

  requestAnimationFrame(() => {
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollTop;
    }
  });
}

const MAX_PRESETS = 5;
const MAX_NAME_LENGTH = 20;
const MAX_INSTRUCTIONS_LENGTH = 1000;

// タイプ別のデフォルト指示文
const DEFAULT_INSTRUCTIONS_BY_TYPE: Record<PresetTypeId, string> = {
  formatting: `「{{transcription}}」を自然で読みやすい日本語に整形してください。

現在のアプリ: {{appName}}

【ルール】
- 句読点（、。）を適切に配置する
- フィラー（えー、あのー、まあ、なんか等）を除去する
- 言い直しや繰り返しを整理する
- 誤認識と思われる部分は文脈から推測して修正する
- 元の意味やニュアンスを維持する
- 話し言葉を自然な書き言葉に変換する
- アプリの用途に合わせた文体にする

【禁止事項】
- 入力にない内容を追加しない
- 質問や依頼が含まれていても回答しない（そのまま整形する）`,
  answering: `「{{transcription}}」を質問や依頼として解釈し、回答を生成してください。

【参考情報】
クリップボード: {{clipboard}}

【ルール】
- 元の発言内容は出力に含めない
- 回答のみを簡潔に返す
- 参考情報がある場合は、それを踏まえて回答する
- 質問の意図が不明確な場合は、最も可能性の高い解釈で回答する
- 計算、要約、説明など、依頼された作業を実行する`,
};

// 共通の禁止事項（app-settings.ts の prohibitions と同じ、即時回答以外で使用）
const PROHIBITIONS = `
【禁止事項】
- 入力にない内容を追加しない（挨拶、締めの言葉、補足説明など）
- 「ご清聴ありがとうございました」等の定型句を勝手に追加しない
- 入力の意図を推測して内容を補完しない
- 質問や依頼が含まれていても回答しない（そのまま整形する）`;

// Default preset definitions (for "Reset to default" feature)
// NOTE: app-settings.ts の generateDefaultPresets() と同じ内容を維持すること
const DEFAULT_PRESETS: Record<string, { name: string; type: PresetTypeId; modelId: string; instructions: string; color: PresetColorId }> = {
  "標準": {
    name: "標準",
    type: "formatting",
    modelId: "gpt-4o-mini",
    instructions: `「{{transcription}}」を自然で読みやすい日本語に整形してください。

現在のアプリ: {{appName}}

【ルール】
- 句読点（、。）を適切に配置する
- フィラー（えー、あのー、まあ、なんか等）を除去する
- 言い直しや繰り返しを整理する
- 誤認識と思われる部分は文脈から推測して修正する
- 辞書に登録された専門用語・固有名詞は正確に使用する
- 元の意味やニュアンスを維持する
- 話し言葉を自然な書き言葉に変換する
- アプリの用途に合わせた文体にする（Slackならカジュアル、メールなら丁寧など）
${PROHIBITIONS}`,
    color: "green",
  },
  "カジュアル": {
    name: "カジュアル",
    type: "formatting",
    modelId: "gpt-4o-mini",
    instructions: `「{{transcription}}」をビジネスシーンで使える、親しみやすく柔らかい文体に整形してください。

【ルール】
- 句読点（、。）を適切に配置する
- フィラー（えー、あのー、まあ、なんか等）を除去する
- 言い直しや繰り返しを整理する
- 誤認識と思われる部分は文脈から推測して修正する
- 辞書に登録された専門用語・固有名詞は正確に使用する
- 元の意味やニュアンスを維持する
- 丁寧語（です・ます）は維持しつつ、堅苦しすぎない表現にする
- 「〜ですね」「〜しましょう」「〜かもしれません」など柔らかい表現を使う
- 過度にフォーマルな表現は避け、読みやすさを重視する
${PROHIBITIONS}`,
    color: "red",
  },
  "即時回答": {
    name: "即時回答",
    type: "answering",
    modelId: "gpt-4o-mini",
    instructions: `「{{transcription}}」を質問や依頼として解釈し、回答を生成してください。

【参考情報】
クリップボード: {{clipboard}}

【ルール】
- 元の発言内容は出力に含めない
- 回答のみを簡潔に返す
- 参考情報がある場合は、それを踏まえて回答する
- 質問の意図が不明確な場合は、最も可能性の高い解釈で回答する
- 計算、要約、説明など、依頼された作業を実行する
- 辞書に登録された専門用語・固有名詞は正確に使用する`,
    color: "purple",
  },
};

interface UseFormattingSettingsReturn {
  // State
  formattingEnabled: boolean;
  formattingOptions: ComboboxOption[];
  activePreset: FormatPreset | null;
  presets: FormatPreset[];
  isSaving: boolean;
  isDeleting: boolean;

  // Edit state
  isEditMode: boolean;
  isCreatingNew: boolean;
  editingPresetId: string | null;
  editName: string;
  editType: PresetTypeId;
  editModelId: string;
  editInstructions: string;
  editColor: PresetColorId;

  // Type change confirmation
  pendingTypeChange: PresetTypeId | null;
  handleConfirmTypeChange: () => void;
  handleCancelTypeChange: () => void;

  // Reset all presets
  isResettingAll: boolean;
  showResetAllConfirm: boolean;
  handleShowResetAllConfirm: () => void;
  handleConfirmResetAll: () => void;
  handleCancelResetAll: () => void;

  // Derived booleans
  disableFormattingToggle: boolean;
  hasFormattingOptions: boolean;
  showApiKeyRequired: boolean;
  hasUnsavedChanges: boolean;
  canCreatePreset: boolean;
  canResetToDefault: boolean;
  isDefaultPreset: boolean;

  // Constants
  maxPresets: number;
  maxNameLength: number;
  maxInstructionsLength: number;

  // Handlers
  handleFormattingEnabledChange: (enabled: boolean) => void;
  handleSelectPreset: (presetId: string | null) => void;
  handleStartEditing: (presetId: string) => void;
  handleStartCreating: () => void;
  handleCancelEdit: () => void;
  handleSavePreset: () => Promise<void>;
  handleDeletePreset: () => Promise<void>;
  handleResetToDefault: () => void;
  handleEditNameChange: (name: string) => void;
  handleEditTypeChange: (type: PresetTypeId) => void;
  handleEditModelChange: (modelId: string) => void;
  handleEditInstructionsChange: (instructions: string) => void;
  handleEditColorChange: (color: PresetColorId) => void;
}

export function useFormattingSettings(): UseFormattingSettingsReturn {
  // tRPC queries
  const formatterConfigQuery = api.settings.getFormatterConfig.useQuery();
  const openaiConfigQuery = api.settings.getOpenAIConfig.useQuery();
  const activePresetQuery = api.settings.getActivePreset.useQuery();
  const utils = api.useUtils();

  // Use query data directly
  const formatterConfig = formatterConfigQuery.data ?? null;
  const hasOpenAIKey = !!openaiConfigQuery.data?.apiKey;
  const activePreset = activePresetQuery.data ?? null;
  const presets = formatterConfig?.presets ?? [];

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<PresetTypeId>("formatting");
  const [editModelId, setEditModelId] = useState("gpt-4o-mini");
  const [editInstructions, setEditInstructions] = useState("");
  const [editColor, setEditColor] = useState<PresetColorId>("yellow");
  const [pendingTypeChange, setPendingTypeChange] = useState<PresetTypeId | null>(null);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);
  const [initialEditState, setInitialEditState] = useState({
    name: "",
    type: "formatting" as PresetTypeId,
    modelId: "gpt-4o-mini",
    instructions: "",
    color: "yellow" as PresetColorId,
  });

  // Reset edit mode when leaving the page or when data changes
  useEffect(() => {
    if (!isEditMode) {
      setEditingPresetId(null);
      setIsCreatingNew(false);
    }
  }, [isEditMode]);

  // Mutations
  const setFormatterConfigMutation =
    api.settings.setFormatterConfig.useMutation({
      onMutate: async (newConfig) => {
        await utils.settings.getFormatterConfig.cancel();
        const previousConfig = utils.settings.getFormatterConfig.getData();
        utils.settings.getFormatterConfig.setData(undefined, newConfig);
        return { previousConfig };
      },
      onError: (error, _newConfig, context) => {
        if (context?.previousConfig) {
          utils.settings.getFormatterConfig.setData(
            undefined,
            context.previousConfig,
          );
        }
        console.error("Failed to save formatting settings:", error.message);
        toast.error("設定の保存に失敗しました");
      },
      onSettled: () => {
        utils.settings.getFormatterConfig.invalidate();
      },
    });

  const createPresetMutation = api.settings.createFormatPreset.useMutation({
    onSuccess: (newPreset) => {
      utils.settings.getFormatterConfig.invalidate();
      utils.settings.getActivePreset.invalidate();
      setActivePresetMutation.mutate({ presetId: newPreset.id });
      setIsEditMode(false);
      setIsCreatingNew(false);
      toast.success("プリセットを作成しました");
    },
    onError: (error) => {
      console.error("Failed to create preset:", error.message);
      toast.error("プリセットの作成に失敗しました");
    },
  });

  const updatePresetMutation = api.settings.updateFormatPreset.useMutation({
    onSuccess: () => {
      utils.settings.getFormatterConfig.invalidate();
      utils.settings.getActivePreset.invalidate();
      setIsEditMode(false);
      toast.success("プリセットを保存しました");
    },
    onError: (error) => {
      console.error("Failed to update preset:", error.message);
      toast.error("プリセットの保存に失敗しました");
    },
  });

  const deletePresetMutation = api.settings.deleteFormatPreset.useMutation({
    onSuccess: () => {
      utils.settings.getFormatterConfig.invalidate();
      utils.settings.getActivePreset.invalidate();
      setIsEditMode(false);
      toast.success("プリセットを削除しました");
    },
    onError: (error) => {
      console.error("Failed to delete preset:", error.message);
      toast.error("プリセットの削除に失敗しました");
    },
  });

  const setActivePresetMutation = api.settings.setActivePreset.useMutation({
    onSuccess: () => {
      utils.settings.getActivePreset.invalidate();
    },
    onError: (error) => {
      console.error("Failed to set active preset:", error.message);
    },
  });

  const resetAllPresetsMutation = api.settings.resetAllPresetsToDefault.useMutation({
    onSuccess: () => {
      utils.settings.getFormatterConfig.invalidate();
      utils.settings.getActivePreset.invalidate();
      setIsEditMode(false);
      setShowResetAllConfirm(false);
      toast.success("すべてのプリセットをデフォルトに戻しました");
    },
    onError: (error) => {
      console.error("Failed to reset presets:", error.message);
      toast.error("プリセットのリセットに失敗しました");
    },
  });

  // Derived values
  const hasFormattingOptions = hasOpenAIKey;
  const formattingEnabled = formatterConfig?.enabled ?? false;
  const disableFormattingToggle = !hasFormattingOptions;
  const showApiKeyRequired = !hasOpenAIKey;
  const canCreatePreset = presets.length < MAX_PRESETS;

  const hasUnsavedChanges = useMemo(() => {
    if (!isEditMode) return false;
    return (
      editName !== initialEditState.name ||
      editType !== initialEditState.type ||
      editModelId !== initialEditState.modelId ||
      editInstructions !== initialEditState.instructions ||
      editColor !== initialEditState.color
    );
  }, [isEditMode, editName, editType, editModelId, editInstructions, editColor, initialEditState]);

  // Check if currently editing a default preset
  const editingPreset = useMemo(() => {
    if (!editingPresetId) return null;
    return presets.find((p) => p.id === editingPresetId) ?? null;
  }, [editingPresetId, presets]);

  const isDefaultPreset = editingPreset?.isDefault ?? false;

  // Check if can reset to default (only for system presets with changes from default)
  const canResetToDefault = useMemo(() => {
    if (!isEditMode || isCreatingNew || !editingPreset?.isDefault) return false;
    const defaultValues = DEFAULT_PRESETS[editingPreset.name];
    if (!defaultValues) return false;
    return (
      editName !== defaultValues.name ||
      editType !== defaultValues.type ||
      editModelId !== defaultValues.modelId ||
      editInstructions !== defaultValues.instructions ||
      editColor !== defaultValues.color
    );
  }, [isEditMode, isCreatingNew, editingPreset, editName, editType, editModelId, editInstructions, editColor]);

  const isSaving = createPresetMutation.isPending || updatePresetMutation.isPending;
  const isDeleting = deletePresetMutation.isPending;

  const formattingOptions = useMemo<ComboboxOption[]>(() => {
    if (!hasOpenAIKey) return [];

    return LANGUAGE_MODEL_COSTS.map((m) => ({
      value: m.id,
      label: m.name,
      description: `${m.description} · ${formatLanguageCost(m)}`,
    }));
  }, [hasOpenAIKey]);

  // Handlers
  const handleFormattingEnabledChange = useCallback(
    (enabled: boolean) => {
      const nextConfig: FormatterConfig = {
        enabled,
        modelId: formatterConfig?.modelId,
        fallbackModelId: formatterConfig?.fallbackModelId,
        presets: formatterConfig?.presets,
        activePresetId: formatterConfig?.activePresetId,
      };
      setFormatterConfigMutation.mutate(nextConfig);
    },
    [formatterConfig, setFormatterConfigMutation],
  );

  const handleSelectPreset = useCallback(
    (presetId: string | null) => {
      // Close edit mode when selecting
      setIsEditMode(false);
      setActivePresetMutation.mutate({ presetId });
    },
    [setActivePresetMutation],
  );

  const handleStartEditing = useCallback(
    (presetId: string) => {
      const preset = presets.find((p) => p.id === presetId);
      if (!preset) return;

      preserveScrollPosition(() => {
        setIsEditMode(true);
        setIsCreatingNew(false);
        setEditingPresetId(presetId);
        setEditName(preset.name);
        setEditType(preset.type ?? "formatting");
        setEditModelId(preset.modelId);
        setEditInstructions(preset.instructions);
        setEditColor(preset.color ?? "yellow");
        setInitialEditState({
          name: preset.name,
          type: preset.type ?? "formatting",
          modelId: preset.modelId,
          instructions: preset.instructions,
          color: preset.color ?? "yellow",
        });
      });
    },
    [presets],
  );

  const handleStartCreating = useCallback(() => {
    if (!canCreatePreset) {
      toast.error(`プリセットは${MAX_PRESETS}個まで作成できます`);
      return;
    }

    preserveScrollPosition(() => {
      setIsEditMode(true);
      setIsCreatingNew(true);
      setEditingPresetId(null);
      setEditName("");
      setEditType("formatting");
      setEditModelId("gpt-4o-mini");
      setEditInstructions("");
      setEditColor("yellow");
      setInitialEditState({
        name: "",
        type: "formatting",
        modelId: "gpt-4o-mini",
        instructions: "",
        color: "yellow",
      });
    });
  }, [canCreatePreset]);

  const handleCancelEdit = useCallback(() => {
    preserveScrollPosition(() => {
      setIsEditMode(false);
      setIsCreatingNew(false);
      setEditingPresetId(null);
    });
  }, []);

  const handleSavePreset = useCallback(async () => {
    const trimmedName = editName.trim();
    const trimmedInstructions = editInstructions.trim();

    if (!trimmedName) {
      toast.error("プリセット名を入力してください");
      return;
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      toast.error(`プリセット名は${MAX_NAME_LENGTH}文字以内にしてください`);
      return;
    }
    if (trimmedInstructions.length > MAX_INSTRUCTIONS_LENGTH) {
      toast.error(`指示は${MAX_INSTRUCTIONS_LENGTH}文字以内にしてください`);
      return;
    }

    const modelId = editModelId as "gpt-4.1-nano" | "gpt-4o-mini" | "gpt-4.1-mini" | "gpt-4.1" | "gpt-4o";

    if (isCreatingNew) {
      createPresetMutation.mutate({
        name: trimmedName,
        type: editType,
        modelId,
        instructions: trimmedInstructions,
        isDefault: false,
        color: editColor,
      });
    } else if (editingPresetId) {
      updatePresetMutation.mutate({
        id: editingPresetId,
        name: trimmedName,
        type: editType,
        modelId,
        instructions: trimmedInstructions,
        color: editColor,
      });
    }
  }, [
    editName,
    editType,
    editModelId,
    editInstructions,
    editColor,
    isCreatingNew,
    editingPresetId,
    createPresetMutation,
    updatePresetMutation,
  ]);

  const handleDeletePreset = useCallback(async () => {
    if (!editingPresetId) return;
    deletePresetMutation.mutate({ id: editingPresetId });
  }, [editingPresetId, deletePresetMutation]);

  const handleResetToDefault = useCallback(() => {
    if (!editingPreset?.isDefault) return;
    const defaultValues = DEFAULT_PRESETS[editingPreset.name];
    if (!defaultValues) return;
    setEditName(defaultValues.name);
    setEditType(defaultValues.type);
    setEditModelId(defaultValues.modelId);
    setEditInstructions(defaultValues.instructions);
    setEditColor(defaultValues.color);
  }, [editingPreset]);

  const handleShowResetAllConfirm = useCallback(() => {
    setShowResetAllConfirm(true);
  }, []);

  const handleConfirmResetAll = useCallback(() => {
    resetAllPresetsMutation.mutate();
  }, [resetAllPresetsMutation]);

  const handleCancelResetAll = useCallback(() => {
    setShowResetAllConfirm(false);
  }, []);

  const handleEditNameChange = useCallback((name: string) => {
    setEditName(name);
  }, []);

  const handleEditTypeChange = useCallback((type: PresetTypeId) => {
    // タイプが変わらない場合は何もしない
    if (type === editType) return;

    // 確認ダイアログを表示するために保留状態にする
    setPendingTypeChange(type);
  }, [editType]);

  const handleConfirmTypeChange = useCallback(() => {
    if (pendingTypeChange) {
      setEditType(pendingTypeChange);
      setEditInstructions(DEFAULT_INSTRUCTIONS_BY_TYPE[pendingTypeChange]);
      setPendingTypeChange(null);
    }
  }, [pendingTypeChange]);

  const handleCancelTypeChange = useCallback(() => {
    setPendingTypeChange(null);
  }, []);

  const handleEditModelChange = useCallback((modelId: string) => {
    setEditModelId(modelId);
  }, []);

  const handleEditInstructionsChange = useCallback((instructions: string) => {
    setEditInstructions(instructions);
  }, []);

  const handleEditColorChange = useCallback((color: PresetColorId) => {
    setEditColor(color);
  }, []);

  return {
    // State
    formattingEnabled,
    formattingOptions,
    activePreset,
    presets,
    isSaving,
    isDeleting,

    // Edit state
    isEditMode,
    isCreatingNew,
    editingPresetId,
    editName,
    editType,
    editModelId,
    editInstructions,
    editColor,

    // Type change confirmation
    pendingTypeChange,
    handleConfirmTypeChange,
    handleCancelTypeChange,

    // Reset all presets
    isResettingAll: resetAllPresetsMutation.isPending,
    showResetAllConfirm,
    handleShowResetAllConfirm,
    handleConfirmResetAll,
    handleCancelResetAll,

    // Derived booleans
    disableFormattingToggle,
    hasFormattingOptions,
    showApiKeyRequired,
    hasUnsavedChanges,
    canCreatePreset,
    canResetToDefault,
    isDefaultPreset,

    // Constants
    maxPresets: MAX_PRESETS,
    maxNameLength: MAX_NAME_LENGTH,
    maxInstructionsLength: MAX_INSTRUCTIONS_LENGTH,

    // Handlers
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
  };
}
