export const FORMATTING_VARIABLES = {
  "{{transcription}}": {
    label: "音声認識結果",
    colorClass: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  "{{clipboard}}": {
    label: "クリップボード",
    colorClass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  "{{appName}}": {
    label: "アプリ名",
    colorClass: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
} as const;

export type FormattingVariableKey = keyof typeof FORMATTING_VARIABLES;

export const FORMATTING_VARIABLE_PATTERN = /(\{\{(?:transcription|clipboard|appName)\}\})/g;
