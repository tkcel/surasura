import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { InstructionsDisplay } from "./InstructionsDisplay";

export interface InstructionsEditorHandle {
  insertVariable: (variable: string) => void;
}

interface InstructionsEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  isEditing: boolean;
  onEditingChange: (isEditing: boolean) => void;
}

export const InstructionsEditor = forwardRef<
  InstructionsEditorHandle,
  InstructionsEditorProps
>(function InstructionsEditor(
  { value, onChange, maxLength, isEditing, onEditingChange },
  ref
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingInsertRef = useRef<string | null>(null);
  const valueRef = useRef(value);

  // valueをrefに同期（useImperativeHandleで最新値を参照するため）
  valueRef.current = value;

  // isEditingがtrueになった時だけフォーカスとカーソル位置を設定
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();

      if (pendingInsertRef.current) {
        const variable = pendingInsertRef.current;
        pendingInsertRef.current = null;

        const currentValue = valueRef.current;
        const newValue = currentValue + variable;
        onChange(newValue);

        requestAnimationFrame(() => {
          if (textarea) {
            const newPosition = newValue.length;
            textarea.setSelectionRange(newPosition, newPosition);
          }
        });
      } else {
        // 編集モードに入った時、カーソルを末尾に配置
        const length = textarea.value.length;
        textarea.setSelectionRange(length, length);
      }
    }
    // isEditingの変化時のみ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  useImperativeHandle(ref, () => ({
    insertVariable: (variable: string) => {
      if (isEditing && textareaRef.current) {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentValue = valueRef.current;
        const newValue =
          currentValue.slice(0, start) + variable + currentValue.slice(end);
        onChange(newValue);

        requestAnimationFrame(() => {
          textarea.focus();
          const newPosition = start + variable.length;
          textarea.setSelectionRange(newPosition, newPosition);
        });
      } else {
        pendingInsertRef.current = variable;
        onEditingChange(true);
      }
    },
  }));

  const handleBlur = () => {
    onEditingChange(false);
  };

  const sharedStyles = "min-h-[300px] text-sm ring-offset-background";

  if (isEditing) {
    return (
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="例: 文末は「です・ます」調に統一してください。専門用語は英語のまま残してください。"
        className={`${sharedStyles} resize-y`}
        maxLength={maxLength}
      />
    );
  }

  return (
    <InstructionsDisplay
      value={value}
      onClick={() => onEditingChange(true)}
      className={sharedStyles}
    />
  );
});
