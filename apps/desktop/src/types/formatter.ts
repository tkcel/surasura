export interface FormatPreset {
  id: string;
  name: string; // 最大20文字
  modelId: "gpt-4o-mini" | "gpt-4o";
  instructions: string; // 最大2000文字
  isDefault: boolean;
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
