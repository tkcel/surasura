// 使用可能な色（Tailwindクラス名と表示名）
export const PRESET_COLORS = [
  { id: "yellow", label: "イエロー", class: "text-yellow-500" },
  { id: "blue", label: "ブルー", class: "text-blue-500" },
  { id: "green", label: "グリーン", class: "text-green-500" },
  { id: "red", label: "レッド", class: "text-red-500" },
  { id: "purple", label: "パープル", class: "text-purple-500" },
  { id: "orange", label: "オレンジ", class: "text-orange-500" },
] as const;

export type PresetColorId = (typeof PRESET_COLORS)[number]["id"];

// プリセットのタイプ
export const PRESET_TYPES = [
  { id: "formatting", label: "整形", description: "話し言葉を整えて出力します。質問形式でも回答しません。" },
  { id: "answering", label: "回答", description: "質問や依頼として解釈し、AIが回答を生成します。" },
] as const;

export type PresetTypeId = (typeof PRESET_TYPES)[number]["id"];

// サポートされるモデルID
export type FormatterModelId =
  | "gpt-4.1-nano"
  | "gpt-4o-mini"
  | "gpt-4.1-mini"
  | "gpt-4.1"
  | "gpt-4o";

export interface FormatPreset {
  id: string;
  name: string; // 最大20文字
  type?: PresetTypeId; // プリセットのタイプ（整形 or 回答）- 未設定の場合は "formatting" として扱う
  modelId: FormatterModelId;
  instructions: string; // 最大1000文字
  isDefault: boolean;
  color: PresetColorId; // プリセットの色
  createdAt: string; // ISO 8601
  updatedAt: string;
}

export interface FormatterConfig {
  enabled: boolean;
  modelId?: string;
  fallbackModelId?: string;
  presets?: FormatPreset[]; // 最大5つ
  activePresetId?: string | null;
}
