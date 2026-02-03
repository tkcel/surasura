/**
 * Model cost definitions for display in UI
 */

export interface SpeechModelCost {
  id: string;
  name: string;
  provider: "openai";
  costPerHour: number; // USD per hour
  speed: "fast" | "medium" | "slow";
  accuracy: "high" | "very-high";
  description?: string;
}

export interface LanguageModelCost {
  id: string;
  name: string;
  provider: "openai";
  inputCostPer1M: number; // USD per 1M input tokens
  outputCostPer1M: number; // USD per 1M output tokens
  speed: "fast" | "medium" | "slow";
  quality: "standard" | "high";
  description: string; // Short description for UI display
}

/**
 * Speech recognition model costs (per hour of audio)
 * Sorted by cost (cheapest first)
 */
export const SPEECH_MODEL_COSTS: SpeechModelCost[] = [
  {
    id: "gpt-4o-mini-transcribe",
    name: "GPT-4o Mini Transcribe",
    provider: "openai",
    costPerHour: 0.18, // $0.003/min
    speed: "fast",
    accuracy: "high",
    description: "高速・低コスト",
  },
  {
    id: "whisper-1",
    name: "Whisper",
    provider: "openai",
    costPerHour: 0.36, // $0.006/min
    speed: "medium",
    accuracy: "high",
    description: "標準モデル",
  },
  {
    id: "gpt-4o-transcribe",
    name: "GPT-4o Transcribe",
    provider: "openai",
    costPerHour: 0.36, // $0.006/min
    speed: "medium",
    accuracy: "very-high",
    description: "高精度・文脈理解",
  },
];

/**
 * Language model costs (for formatting)
 * Sorted by cost (cheapest first)
 */
export const LANGUAGE_MODEL_COSTS: LanguageModelCost[] = [
  // GPT-4.1 series (newest, April 2025)
  {
    id: "gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    provider: "openai",
    inputCostPer1M: 0.1,
    outputCostPer1M: 0.4,
    speed: "fast",
    quality: "standard",
    description: "最安・軽量タスク向け",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    speed: "fast",
    quality: "standard",
    description: "低コスト・バランス型",
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "openai",
    inputCostPer1M: 0.4,
    outputCostPer1M: 1.6,
    speed: "fast",
    quality: "standard",
    description: "高速・長文対応",
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    inputCostPer1M: 2.0,
    outputCostPer1M: 8.0,
    speed: "medium",
    quality: "high",
    description: "高品質・コーディング向け",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    inputCostPer1M: 2.5,
    outputCostPer1M: 10.0,
    speed: "medium",
    quality: "high",
    description: "高品質・マルチモーダル",
  },
];

/**
 * Format speech model cost for display
 */
export function formatSpeechCost(cost: SpeechModelCost): string {
  return `$${cost.costPerHour.toFixed(2)}/時間`;
}

/**
 * Format language model cost for display (simple)
 */
export function formatLanguageCost(cost: LanguageModelCost): string {
  return `$${cost.inputCostPer1M}/1Mトークン`;
}

/**
 * Get speech model by ID
 */
export function getSpeechModelCost(
  modelId: string,
): SpeechModelCost | undefined {
  return SPEECH_MODEL_COSTS.find((m) => m.id === modelId);
}

/**
 * Get language model by ID
 */
export function getLanguageModelCost(
  modelId: string,
): LanguageModelCost | undefined {
  return LANGUAGE_MODEL_COSTS.find((m) => m.id === modelId);
}

/**
 * Get speech models by provider
 */
export function getSpeechModelsByProvider(
  provider: "openai",
): SpeechModelCost[] {
  return SPEECH_MODEL_COSTS.filter((m) => m.provider === provider);
}

/**
 * Get language models by provider
 */
export function getLanguageModelsByProvider(
  provider: "openai",
): LanguageModelCost[] {
  return LANGUAGE_MODEL_COSTS.filter((m) => m.provider === provider);
}

/**
 * Get speed label in Japanese
 */
export function getSpeedLabel(speed: "fast" | "medium" | "slow"): string {
  switch (speed) {
    case "fast":
      return "高速";
    case "medium":
      return "標準";
    case "slow":
      return "低速";
  }
}

/**
 * Get accuracy/quality label in Japanese
 */
export function getQualityLabel(
  quality: "standard" | "high" | "very-high",
): string {
  switch (quality) {
    case "standard":
      return "標準";
    case "high":
      return "高精度";
    case "very-high":
      return "最高精度";
  }
}
