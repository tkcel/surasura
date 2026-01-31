import { useMemo, useCallback } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type { FormatterConfig } from "@/types/formatter";

import type { ComboboxOption } from "@/components/ui/combobox";

interface UseFormattingSettingsReturn {
  // State
  formattingEnabled: boolean;
  selectedModelId: string;
  formattingOptions: ComboboxOption[];

  // Derived booleans
  disableFormattingToggle: boolean;
  hasFormattingOptions: boolean;
  showApiKeyRequired: boolean;

  // Handlers
  handleFormattingEnabledChange: (enabled: boolean) => void;
  handleFormattingModelChange: (modelId: string) => void;
}

export function useFormattingSettings(): UseFormattingSettingsReturn {
  // tRPC queries
  const formatterConfigQuery = api.settings.getFormatterConfig.useQuery();
  const openaiConfigQuery = api.settings.getOpenAIConfig.useQuery();
  const utils = api.useUtils();

  // Use query data directly
  const formatterConfig = formatterConfigQuery.data ?? null;
  const hasOpenAIKey = !!openaiConfigQuery.data?.apiKey;

  // Mutations with optimistic updates
  const setFormatterConfigMutation =
    api.settings.setFormatterConfig.useMutation({
      onMutate: async (newConfig) => {
        // Cancel outgoing refetches
        await utils.settings.getFormatterConfig.cancel();

        // Snapshot previous value
        const previousConfig = utils.settings.getFormatterConfig.getData();

        // Optimistically update
        utils.settings.getFormatterConfig.setData(undefined, newConfig);

        return { previousConfig };
      },
      onError: (error, _newConfig, context) => {
        // Rollback on error
        if (context?.previousConfig) {
          utils.settings.getFormatterConfig.setData(
            undefined,
            context.previousConfig,
          );
        }
        console.error("Failed to save formatting settings:", error.message);
        toast.error("Failed to save formatting settings. Please try again.");
      },
      onSettled: () => {
        // Refetch to ensure consistency
        utils.settings.getFormatterConfig.invalidate();
      },
    });

  // Derived values
  const hasFormattingOptions = hasOpenAIKey;
  const formattingEnabled = formatterConfig?.enabled ?? false;
  const disableFormattingToggle = !hasFormattingOptions;
  const showApiKeyRequired = !hasOpenAIKey;

  const formattingOptions = useMemo<ComboboxOption[]>(() => {
    if (!hasOpenAIKey) return [];

    return [
      {
        value: "gpt-4o-mini",
        label: "GPT-4o Mini (OpenAI)",
      },
      {
        value: "gpt-4o",
        label: "GPT-4o (OpenAI)",
      },
    ];
  }, [hasOpenAIKey]);

  const optionValues = useMemo(() => {
    return new Set(formattingOptions.map((option) => option.value));
  }, [formattingOptions]);

  const selectedModelId = useMemo(() => {
    const preferredModelId = formatterConfig?.modelId || "gpt-4o-mini";
    return optionValues.has(preferredModelId) ? preferredModelId : "";
  }, [formatterConfig?.modelId, optionValues]);

  // Handlers
  const handleFormattingEnabledChange = useCallback(
    (enabled: boolean) => {
      const nextConfig: FormatterConfig = {
        enabled,
        modelId: formatterConfig?.modelId,
        fallbackModelId: formatterConfig?.fallbackModelId,
      };
      setFormatterConfigMutation.mutate(nextConfig);
    },
    [formatterConfig, setFormatterConfigMutation],
  );

  const handleFormattingModelChange = useCallback(
    (modelId: string) => {
      if (!modelId) {
        return;
      }

      const currentModelId = formatterConfig?.modelId || "gpt-4o-mini";

      if (modelId === currentModelId) {
        return;
      }

      const nextConfig: FormatterConfig = {
        enabled: formatterConfig?.enabled ?? false,
        modelId,
        fallbackModelId: formatterConfig?.fallbackModelId,
      };

      setFormatterConfigMutation.mutate(nextConfig);
    },
    [formatterConfig, setFormatterConfigMutation],
  );

  return {
    // State
    formattingEnabled,
    selectedModelId,
    formattingOptions,

    // Derived booleans
    disableFormattingToggle,
    hasFormattingOptions,
    showApiKeyRequired,

    // Handlers
    handleFormattingEnabledChange,
    handleFormattingModelChange,
  };
}
