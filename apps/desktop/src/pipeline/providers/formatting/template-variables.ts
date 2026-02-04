import type { GetAccessibilityContextResult } from "@surasura/types";

/**
 * テンプレート変数の定義
 */
export const TEMPLATE_VARIABLES = {
  transcription: {
    name: "transcription",
    description: "音声認識結果",
  },
  clipboard: {
    name: "clipboard",
    description: "クリップボードの内容",
  },
  appName: {
    name: "appName",
    description: "フォーカス中のアプリ名",
  },
} as const;

export type TemplateVariableName = keyof typeof TEMPLATE_VARIABLES;

/**
 * 変数置換用のコンテキスト
 */
export interface TemplateContext {
  accessibilityContext?: GetAccessibilityContextResult | null;
  transcription?: string;
  clipboardText?: string;
}

/**
 * コンテキストから変数値を取得
 */
function getVariableValue(
  variableName: TemplateVariableName,
  context: TemplateContext
): string {
  // transcriptionは特別に処理（accessibilityContextに依存しない）
  if (variableName === "transcription") {
    return context.transcription ?? "";
  }

  // clipboardも特別に処理（accessibilityContextに依存しない）
  if (variableName === "clipboard") {
    return context.clipboardText ?? "";
  }

  const axContext = context.accessibilityContext?.context;
  if (!axContext) {
    return "";
  }

  switch (variableName) {
    case "appName":
      return axContext.application?.name ?? "";
    default:
      return "";
  }
}

/**
 * テンプレート文字列内の {{variableName}} を実際の値に置換する
 *
 * @param template - 変数を含むテンプレート文字列
 * @param context - 変数値を取得するためのコンテキスト
 * @returns 変数が置換された文字列
 */
export function replaceTemplateVariables(
  template: string,
  context: TemplateContext
): string {
  // {{variableName}} のパターンにマッチ
  const variablePattern = /\{\{(\w+)\}\}/g;

  return template.replace(variablePattern, (match, variableName: string) => {
    // サポートされている変数かチェック
    if (variableName in TEMPLATE_VARIABLES) {
      return getVariableValue(variableName as TemplateVariableName, context);
    }
    // サポートされていない変数はそのまま残す
    return match;
  });
}

/**
 * テンプレート文字列内で{{transcription}}変数が使用されているかチェック
 */
export function hasTranscriptionVariable(template: string): boolean {
  return template.includes("{{transcription}}");
}
