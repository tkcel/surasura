"use client";

import type { CSSProperties } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const noDragRegion = { WebkitAppRegion: "no-drag" } as CSSProperties;

// Format shortcut keys for display
function formatShortcut(keys: string[] | undefined): string | null {
  if (!keys || keys.length === 0) return null;

  return keys
    .map((key) => {
      switch (key) {
        case "Cmd":
          return "⌘";
        case "Alt":
          return "⌥";
        case "Ctrl":
          return "⌃";
        case "Shift":
          return "⇧";
        default:
          return key;
      }
    })
    .join("");
}

export function PresetSelector() {
  const { data: formatterConfig } = api.settings.getFormatterConfig.useQuery();
  const { data: activePreset } = api.settings.getActivePreset.useQuery();
  const { data: shortcuts } = api.settings.getShortcuts.useQuery();
  const utils = api.useUtils();

  const setActivePresetMutation = api.settings.setActivePreset.useMutation({
    onSuccess: () => {
      utils.settings.getActivePreset.invalidate();
    },
  });

  // Don't render if AI formatting is disabled
  if (!formatterConfig?.enabled) {
    return null;
  }

  const presets = formatterConfig.presets ?? [];

  // Don't render if no presets
  if (presets.length === 0) {
    return null;
  }

  const handleSelectPreset = (presetId: string) => {
    setActivePresetMutation.mutate({ presetId });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-sm font-normal"
          style={noDragRegion}
        >
          <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
          <span className="max-w-[120px] truncate">
            {activePreset?.name ?? "プリセット未選択"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {presets.map((preset, index) => {
          const presetShortcuts = [
            shortcuts?.selectPreset1,
            shortcuts?.selectPreset2,
            shortcuts?.selectPreset3,
            shortcuts?.selectPreset4,
            shortcuts?.selectPreset5,
          ];
          const shortcutDisplay =
            index < 5 ? formatShortcut(presetShortcuts[index]) : null;

          return (
            <DropdownMenuItem
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {activePreset?.id === preset.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="w-4" />
                )}
                <span className="truncate">{preset.name}</span>
              </div>
              {shortcutDisplay && (
                <DropdownMenuShortcut>{shortcutDisplay}</DropdownMenuShortcut>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
