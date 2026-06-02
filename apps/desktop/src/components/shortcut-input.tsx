import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface ShortcutInputProps {
  value?: string[];
  onChange: (value: string[]) => void;
  isRecordingShortcut?: boolean;
  onRecordingShortcutChange: (recording: boolean) => void;
  /** Disabled state. When provided, an enable/disable switch is rendered. */
  disabled?: boolean;
  onDisabledChange?: (disabled: boolean) => void;
}

const MODIFIER_KEYS = ["Cmd", "Win", "Ctrl", "Alt", "Shift", "Fn"];
const MAX_KEY_COMBINATION_LENGTH = 4;

type ValidationResult = {
  valid: boolean;
  shortcut?: string[];
  error?: string;
};

/**
 * Basic format validation only - business logic validation happens on backend
 */
function validateShortcutFormat(keys: string[]): ValidationResult {
  if (keys.length === 0) {
    return { valid: false, error: "キーが検出されませんでした" };
  }

  if (keys.length > MAX_KEY_COMBINATION_LENGTH) {
    return {
      valid: false,
      error: `キーが多すぎます（${MAX_KEY_COMBINATION_LENGTH}つ以下にしてください）`,
    };
  }

  const modifierKeys = keys.filter((key) => MODIFIER_KEYS.includes(key));
  const regularKeys = keys.filter((key) => !MODIFIER_KEYS.includes(key));

  // Return array format: modifiers first, then regular keys
  return {
    valid: true,
    shortcut: [...modifierKeys, ...regularKeys],
  };
}

function RecordingDisplay({
  activeKeys,
  onCancel,
}: {
  activeKeys: string[];
  onCancel: () => void;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-md ring-2 ring-primary"
      tabIndex={0}
    >
      {activeKeys.length > 0 ? (
        <div className="flex items-center gap-1">
          {activeKeys.map((key, index) => (
            <kbd
              key={index}
              className="px-1.5 py-0.5 text-xs bg-background rounded border"
            >
              {key}
            </kbd>
          ))}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Press keys...</span>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={onCancel}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

function ShortcutDisplay({
  value,
  onEdit,
  dimmed = false,
}: {
  value?: string[];
  onEdit: () => void;
  /** When true, the binding is shown muted/struck-through (disabled state). */
  dimmed?: boolean;
}) {
  // Format array as display string (e.g., ["Fn", "Space"] -> "Fn+Space")
  const displayValue = value?.length ? value.join("+") : undefined;

  return (
    <>
      {displayValue ? (
        <kbd
          onClick={onEdit}
          className={cn(
            "inline-flex items-center px-3 py-1 bg-muted hover:bg-muted/70 rounded-md text-sm font-mono cursor-pointer transition-colors",
            dimmed && "line-through opacity-50",
          )}
        >
          {displayValue}
        </kbd>
      ) : (
        <span className="text-sm text-muted-foreground">未設定</span>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={onEdit}
      >
        <Pencil className="h-3 w-3" />
      </Button>
    </>
  );
}

export function ShortcutInput({
  value,
  onChange,
  isRecordingShortcut = false,
  onRecordingShortcutChange,
  disabled = false,
  onDisabledChange,
}: ShortcutInputProps) {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const setRecordingStateMutation =
    api.settings.setShortcutRecordingState.useMutation();

  const handleStartRecording = () => {
    onRecordingShortcutChange(true);
    setRecordingStateMutation.mutate(true);
  };

  const handleCancelRecording = () => {
    onRecordingShortcutChange(false);
    setActiveKeys([]);
    setRecordingStateMutation.mutate(false);
  };

  // Subscribe to key events when recording
  // Note: activeKeys closure is fresh on each render because useSubscription
  // updates its callback reference, so previousKeys correctly captures the
  // previous state value when onData fires.
  api.settings.activeKeysUpdates.useSubscription(undefined, {
    enabled: isRecordingShortcut,
    onData: (keys: string[]) => {
      const previousKeys = activeKeys;
      setActiveKeys(keys);

      // When any key is released, validate the combination
      if (previousKeys.length > 0 && keys.length < previousKeys.length) {
        const result = validateShortcutFormat(previousKeys);

        if (result.valid && result.shortcut) {
          // Basic format is valid - let parent handle backend validation
          onChange(result.shortcut);
        } else {
          toast.error(result.error || "無効なキーの組み合わせです");
        }

        onRecordingShortcutChange(false);
        setRecordingStateMutation.mutate(false);
      }
    },
    onError: (error) => {
      console.error("Error subscribing to active keys", error);
    },
  });

  // Reset state when recording starts
  useEffect(() => {
    if (isRecordingShortcut) {
      setActiveKeys([]);
    }
  }, [isRecordingShortcut]);

  // Show the enable/disable switch only when the shortcut has a binding and a
  // handler is provided. An unset shortcut has nothing to disable.
  const showSwitch =
    !!onDisabledChange && !isRecordingShortcut && !!value?.length;

  return (
    <TooltipProvider>
      <div className="inline-flex items-center gap-3">
        <div className="inline-flex items-center gap-2">
          {isRecordingShortcut ? (
            <RecordingDisplay
              activeKeys={activeKeys}
              onCancel={handleCancelRecording}
            />
          ) : (
            <ShortcutDisplay
              value={value}
              onEdit={handleStartRecording}
              dimmed={disabled}
            />
          )}
        </div>
        {showSwitch && (
          <div className="flex items-center gap-1.5">
            <Switch
              checked={!disabled}
              onCheckedChange={(checked) => onDisabledChange?.(!checked)}
              aria-label={disabled ? "有効化" : "無効化"}
            />
            <span
              className={cn(
                "text-xs w-7 select-none",
                disabled ? "text-muted-foreground" : "text-emerald-600",
              )}
            >
              {disabled ? "無効" : "有効"}
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
