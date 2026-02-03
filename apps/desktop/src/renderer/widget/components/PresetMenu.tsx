import React from "react";
import { Check, Sparkles } from "lucide-react";
import { api } from "@/trpc/react";
import { PRESET_COLORS, type FormatPreset, type PresetColorId } from "@/types/formatter";

// Get the Tailwind class for a preset color
function getPresetColorClass(colorId: PresetColorId | undefined): string {
  const color = PRESET_COLORS.find((c) => c.id === colorId);
  return color?.class ?? "text-yellow-500";
}

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

interface PresetMenuProps {
  presets: FormatPreset[];
  activePresetId: string | null;
  onClose: () => void;
  position: { x: number; y: number };
}

export const PresetMenu: React.FC<PresetMenuProps> = ({
  presets,
  activePresetId,
  onClose,
  position,
}) => {
  const utils = api.useUtils();
  const { data: shortcuts } = api.settings.getShortcuts.useQuery();
  const setActivePresetMutation = api.settings.setActivePreset.useMutation({
    onSuccess: () => {
      utils.settings.getActivePreset.invalidate();
      onClose();
    },
  });

  const handleSelectPreset = (presetId: string) => {
    setActivePresetMutation.mutate({ presetId });
  };

  const presetShortcuts = [
    shortcuts?.selectPreset1,
    shortcuts?.selectPreset2,
    shortcuts?.selectPreset3,
    shortcuts?.selectPreset4,
    shortcuts?.selectPreset5,
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* Menu */}
      <div
        className="fixed z-50 min-w-[180px] rounded-lg bg-black/90 backdrop-blur-md border border-white/10 shadow-2xl py-1"
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -100%)",
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <div className="px-3 py-1.5 text-xs font-medium text-gray-400 flex items-center gap-1.5">
          <Sparkles className={`w-3 h-3 ${getPresetColorClass(activePresetId ? presets.find(p => p.id === activePresetId)?.color : undefined)}`} />
          プリセット
        </div>
        <div className="h-px bg-white/10 mx-1 my-1" />
        {presets.map((preset, index) => {
          const shortcutDisplay =
            index < 5 ? formatShortcut(presetShortcuts[index]) : null;

          return (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className="w-full px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 flex items-center justify-between gap-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                {activePresetId === preset.id ? (
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Sparkles className={`w-3.5 h-3.5 ${getPresetColorClass(preset.color)}`} />
                )}
                <span className="truncate max-w-[100px]">{preset.name}</span>
              </div>
              {shortcutDisplay && (
                <span className="text-xs text-gray-500">{shortcutDisplay}</span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};
