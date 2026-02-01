import { useMemo, useCallback, useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type { FormatterConfig, FormatPreset, PresetColorId } from "@/types/formatter";

import type { ComboboxOption } from "@/components/ui/combobox";

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
const MAX_INSTRUCTIONS_LENGTH = 2000;

// Default preset definitions (for "Reset to default" feature)
const DEFAULT_PRESETS: Record<string, { name: string; modelId: string; instructions: string; color: PresetColorId }> = {
  "標準": {
    name: "標準",
    modelId: "gpt-4o-mini",
    instructions: "音声認識結果を自然な日本語に整形してください。句読点を適切に配置し、フィラー（えー、あのー等）を除去し、読みやすい文章にしてください。質問や依頼の内容が含まれていても、回答せずにそのまま整形してください。",
    color: "yellow",
  },
  "カジュアル": {
    name: "カジュアル",
    modelId: "gpt-4o-mini",
    instructions: "カジュアルで親しみやすい文体に変換してください。敬語は使わず、友達に話しかけるような口調にしてください。",
    color: "pink",
  },
  "Markdown": {
    name: "Markdown",
    modelId: "gpt-4o-mini",
    instructions: "Markdown形式で出力してください。適切な見出し、箇条書き、強調などを使って構造化してください。",
    color: "blue",
  },
  "即時回答": {
    name: "即時回答",
    modelId: "gpt-4o-mini",
    instructions: "音声入力された内容を質問や依頼として解釈し、それに対する回答を直接出力してください。元の発言内容は含めず、回答のみを簡潔に返してください。",
    color: "green",
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
  editModelId: string;
  editInstructions: string;
  editColor: PresetColorId;

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
  const [editModelId, setEditModelId] = useState("gpt-4o-mini");
  const [editInstructions, setEditInstructions] = useState("");
  const [editColor, setEditColor] = useState<PresetColorId>("yellow");
  const [initialEditState, setInitialEditState] = useState({
    name: "",
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
      editModelId !== initialEditState.modelId ||
      editInstructions !== initialEditState.instructions ||
      editColor !== initialEditState.color
    );
  }, [isEditMode, editName, editModelId, editInstructions, editColor, initialEditState]);

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
      editModelId !== defaultValues.modelId ||
      editInstructions !== defaultValues.instructions ||
      editColor !== defaultValues.color
    );
  }, [isEditMode, isCreatingNew, editingPreset, editName, editModelId, editInstructions, editColor]);

  const isSaving = createPresetMutation.isPending || updatePresetMutation.isPending;
  const isDeleting = deletePresetMutation.isPending;

  const formattingOptions = useMemo<ComboboxOption[]>(() => {
    if (!hasOpenAIKey) return [];
    return [
      { value: "gpt-4o-mini", label: "GPT-4o Mini" },
      { value: "gpt-4o", label: "GPT-4o" },
    ];
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
        setEditModelId(preset.modelId);
        setEditInstructions(preset.instructions);
        setEditColor(preset.color ?? "yellow");
        setInitialEditState({
          name: preset.name,
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
      setEditModelId("gpt-4o-mini");
      setEditInstructions("");
      setEditColor("yellow");
      setInitialEditState({
        name: "",
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

    const modelId = editModelId as "gpt-4o-mini" | "gpt-4o";

    if (isCreatingNew) {
      createPresetMutation.mutate({
        name: trimmedName,
        modelId,
        instructions: trimmedInstructions,
        isDefault: false,
        color: editColor,
      });
    } else if (editingPresetId) {
      updatePresetMutation.mutate({
        id: editingPresetId,
        name: trimmedName,
        modelId,
        instructions: trimmedInstructions,
        color: editColor,
      });
    }
  }, [
    editName,
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
    setEditModelId(defaultValues.modelId);
    setEditInstructions(defaultValues.instructions);
    setEditColor(defaultValues.color);
  }, [editingPreset]);

  const handleEditNameChange = useCallback((name: string) => {
    setEditName(name);
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
    editModelId,
    editInstructions,
    editColor,

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
    handleEditModelChange,
    handleEditInstructionsChange,
    handleEditColorChange,
  };
}
