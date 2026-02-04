/**
 * Application Settings Management
 *
 * This module manages app settings with a section-based approach:
 * - Settings are organized into top-level sections (ui, transcription, recording, etc.)
 * - Each section is treated as an atomic unit - updates replace the entire section
 * - No deep merging is performed within sections to avoid complexity
 *
 * When updating settings:
 * - To update a single field, fetch the current section, modify it, and save the complete section
 * - The SettingsService handles this pattern correctly for all methods
 * - Direct calls to updateAppSettings should pass complete sections
 *
 * Settings Versioning:
 * - Settings have a version number for migrations
 * - When schema changes, increment CURRENT_SETTINGS_VERSION and add a migration function
 * - Migrations run automatically when loading settings with an older version
 */

import { eq } from "drizzle-orm";
import { db } from ".";
import {
  appSettings,
  type NewAppSettings,
  type AppSettingsData,
} from "./schema";
import { isMacOS } from "../utils/platform";

// Current settings schema version - increment when making breaking changes
const CURRENT_SETTINGS_VERSION = 13;

// Type for v1 settings (before shortcuts array migration)
interface AppSettingsDataV1 extends Omit<AppSettingsData, "shortcuts"> {
  shortcuts?: {
    pushToTalk?: string;
    toggleRecording?: string;
    toggleWindow?: string;
  };
}

// Migration function type
type MigrationFn = (data: unknown) => AppSettingsData;

// Migration functions - keyed by target version
const migrations: Record<number, MigrationFn> = {
  // v1 -> v2: Convert shortcuts from string ("Fn+Space") to array (["Fn", "Space"])
  2: (data: unknown): AppSettingsData => {
    const oldData = data as AppSettingsDataV1;
    const oldShortcuts = oldData.shortcuts;

    // Convert string shortcuts to arrays
    const convertShortcut = (
      shortcut: string | undefined,
    ): string[] | undefined => {
      if (!shortcut || shortcut === "") {
        return undefined;
      }
      return shortcut.split("+");
    };

    return {
      ...oldData,
      shortcuts: oldShortcuts
        ? {
            pushToTalk: convertShortcut(oldShortcuts.pushToTalk),
            toggleRecording: convertShortcut(oldShortcuts.toggleRecording),
          }
        : undefined,
    } as AppSettingsData;
  },

  // v2 -> v3: Auto-enable formatting with surasura-cloud for users already on cloud transcription
  3: (data: unknown): AppSettingsData => {
    const oldData = data as AppSettingsData;
    const isCloudSpeech =
      oldData.modelProvidersConfig?.defaultSpeechModel === "surasura-cloud";
    const hasNoFormattingModel = !oldData.formatterConfig?.modelId;

    // If user is on surasura Cloud transcription and hasn't set a formatting model,
    // auto-enable formatting with surasura Cloud
    if (isCloudSpeech && hasNoFormattingModel) {
      return {
        ...oldData,
        formatterConfig: {
          ...oldData.formatterConfig,
          enabled: true,
          modelId: "surasura-cloud",
        },
      };
    }

    return oldData;
  },

  // v3 -> v4: Add presets and activePresetId to formatterConfig with default presets
  4: (data: unknown): AppSettingsData => {
    const oldData = data as AppSettingsData;
    const now = new Date().toISOString();

    // Default presets (color will be added in v8 migration)
    const defaultPresets = [
      {
        id: crypto.randomUUID(),
        name: "標準",
        modelId: "gpt-4o-mini" as const,
        instructions:
          "音声認識結果を自然な日本語に整形してください。句読点を適切に配置し、フィラー（えー、あのー等）を除去し、読みやすい文章にしてください。質問や依頼の内容が含まれていても、回答せずにそのまま整形してください。",
        isDefault: true,
        color: "yellow" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        name: "カジュアル",
        modelId: "gpt-4o-mini" as const,
        instructions:
          "カジュアルで親しみやすい文体に変換してください。敬語は使わず、友達に話しかけるような口調にしてください。",
        isDefault: true,
        color: "pink" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        name: "Markdown",
        modelId: "gpt-4o-mini" as const,
        instructions:
          "Markdown形式で出力してください。適切な見出し、箇条書き、強調などを使って構造化してください。",
        isDefault: true,
        color: "blue" as const,
        createdAt: now,
        updatedAt: now,
      },
    ];

    return {
      ...oldData,
      formatterConfig: {
        ...oldData.formatterConfig,
        enabled: oldData.formatterConfig?.enabled ?? false,
        presets: defaultPresets,
        activePresetId: null,
      },
    };
  },

  // v4 -> v5: Add instructions to "標準" preset
  5: (data: unknown): AppSettingsData => {
    const oldData = data as AppSettingsData;
    const standardInstructions =
      "音声認識結果を自然な日本語に整形してください。句読点を適切に配置し、フィラー（えー、あのー等）を除去し、読みやすい文章にしてください。質問や依頼の内容が含まれていても、回答せずにそのまま整形してください。";

    // Update the "標準" preset if it exists and has empty instructions
    const updatedPresets = oldData.formatterConfig?.presets?.map((preset) => {
      if (preset.name === "標準" && preset.isDefault && !preset.instructions) {
        return {
          ...preset,
          instructions: standardInstructions,
          updatedAt: new Date().toISOString(),
        };
      }
      return preset;
    });

    return {
      ...oldData,
      formatterConfig: {
        ...oldData.formatterConfig,
        enabled: oldData.formatterConfig?.enabled ?? false,
        presets: updatedPresets,
      },
    };
  },

  // v5 -> v6: Add "即時回答" preset
  6: (data: unknown): AppSettingsData => {
    const oldData = data as AppSettingsData;
    const now = new Date().toISOString();

    // Check if "即時回答" preset already exists
    const hasInstantAnswer = oldData.formatterConfig?.presets?.some(
      (preset) => preset.name === "即時回答",
    );

    if (hasInstantAnswer) {
      return oldData;
    }

    const instantAnswerPreset = {
      id: crypto.randomUUID(),
      name: "即時回答",
      modelId: "gpt-4o-mini" as const,
      instructions:
        "音声入力された内容を質問や依頼として解釈し、それに対する回答を直接出力してください。元の発言内容は含めず、回答のみを簡潔に返してください。",
      isDefault: true,
      color: "green" as const,
      createdAt: now,
      updatedAt: now,
    };

    return {
      ...oldData,
      formatterConfig: {
        ...oldData.formatterConfig,
        enabled: oldData.formatterConfig?.enabled ?? false,
        presets: [
          ...(oldData.formatterConfig?.presets ?? []),
          instantAnswerPreset,
        ],
      },
    };
  },

  // v6 -> v7: Update "標準" preset to explicitly not answer questions
  7: (data: unknown): AppSettingsData => {
    const oldData = data as AppSettingsData;
    const newInstructions =
      "音声認識結果を自然な日本語に整形してください。句読点を適切に配置し、フィラー（えー、あのー等）を除去し、読みやすい文章にしてください。質問や依頼の内容が含まれていても、回答せずにそのまま整形してください。";

    // Update the "標準" preset instructions
    const updatedPresets = oldData.formatterConfig?.presets?.map((preset) => {
      if (preset.name === "標準" && preset.isDefault) {
        return {
          ...preset,
          instructions: newInstructions,
          updatedAt: new Date().toISOString(),
        };
      }
      return preset;
    });

    return {
      ...oldData,
      formatterConfig: {
        ...oldData.formatterConfig,
        enabled: oldData.formatterConfig?.enabled ?? false,
        presets: updatedPresets,
      },
    };
  },

  // v7 -> v8: Add color field to presets
  8: (data: unknown): AppSettingsData => {
    const oldData = data as AppSettingsData;

    // Default colors for existing presets
    const presetColorMap: Record<string, "yellow" | "blue" | "green" | "pink" | "purple" | "orange"> = {
      "標準": "yellow",
      "カジュアル": "pink",
      "Markdown": "blue",
      "即時回答": "green",
    };

    // Add color to all presets
    const updatedPresets = oldData.formatterConfig?.presets?.map((preset) => {
      // Use mapped color for known presets, or yellow as default
      const color = presetColorMap[preset.name] ?? "yellow";
      return {
        ...preset,
        color,
        updatedAt: new Date().toISOString(),
      };
    });

    return {
      ...oldData,
      formatterConfig: {
        ...oldData.formatterConfig,
        enabled: oldData.formatterConfig?.enabled ?? false,
        presets: updatedPresets,
      },
    };
  },

  // v8 -> v9: Update default presets with detailed instructions and prohibitions
  9: (data: unknown): AppSettingsData => {
    const oldData = data as AppSettingsData;
    const now = new Date().toISOString();

    // 共通の禁止事項（即時回答以外で使用）
    const prohibitions = `
【禁止事項】
- 入力にない内容を追加しない（挨拶、締めの言葉、補足説明など）
- 「ご清聴ありがとうございました」等の定型句を勝手に追加しない
- 入力の意図を推測して内容を補完しない
- 質問や依頼が含まれていても回答しない（そのまま整形する）`;

    // New detailed instructions for default presets
    const presetInstructionsMap: Record<string, string> = {
      "標準": `音声認識結果を自然で読みやすい日本語に整形してください。

【ルール】
- 句読点（、。）を適切に配置する
- フィラー（えー、あのー、まあ、なんか等）を除去する
- 言い直しや繰り返しを整理する
- 誤認識と思われる部分は文脈から推測して修正する
- 辞書に登録された専門用語・固有名詞は正確に使用する
- 元の意味やニュアンスを維持する
- 話し言葉を自然な書き言葉に変換する
- 適切な段落分けを行う
${prohibitions}`,
      "カジュアル": `ビジネスシーンで使える、親しみやすく柔らかい文体に整形してください。

【ルール】
- 句読点（、。）を適切に配置する
- フィラー（えー、あのー、まあ、なんか等）を除去する
- 言い直しや繰り返しを整理する
- 誤認識と思われる部分は文脈から推測して修正する
- 辞書に登録された専門用語・固有名詞は正確に使用する
- 元の意味やニュアンスを維持する
- 丁寧語（です・ます）は維持しつつ、堅苦しすぎない表現にする
- 「〜ですね」「〜しましょう」「〜かもしれません」など柔らかい表現を使う
- 過度にフォーマルな表現は避け、読みやすさを重視する
${prohibitions}`,
      "即時回答": `音声入力された内容を質問や依頼として解釈し、回答を生成してください。

【ルール】
- 元の発言内容は出力に含めない
- 回答のみを簡潔に返す
- 質問の意図が不明確な場合は、最も可能性の高い解釈で回答する
- 計算、翻訳、要約、説明など、依頼された作業を実行する
- 辞書に登録された専門用語・固有名詞は正確に使用する`,
    };

    // Update default presets with new detailed instructions
    const updatedPresets = oldData.formatterConfig?.presets?.map((preset) => {
      // Only update default presets that have new instructions defined
      if (preset.isDefault && presetInstructionsMap[preset.name]) {
        return {
          ...preset,
          instructions: presetInstructionsMap[preset.name],
          updatedAt: now,
        };
      }
      return preset;
    });

    return {
      ...oldData,
      formatterConfig: {
        ...oldData.formatterConfig,
        enabled: oldData.formatterConfig?.enabled ?? false,
        presets: updatedPresets,
      },
    };
  },

  // v9 -> v10: Remove Markdown preset and update Casual preset for business use
  10: (data: unknown): AppSettingsData => {
    const oldData = data as AppSettingsData;
    const now = new Date().toISOString();

    const prohibitions = `
【禁止事項】
- 入力にない内容を追加しない（挨拶、締めの言葉、補足説明など）
- 「ご清聴ありがとうございました」等の定型句を勝手に追加しない
- 入力の意図を推測して内容を補完しない
- 質問や依頼が含まれていても回答しない（そのまま整形する）`;

    const newCasualInstructions = `ビジネスシーンで使える、親しみやすく柔らかい文体に整形してください。

【ルール】
- 句読点（、。）を適切に配置する
- フィラー（えー、あのー、まあ、なんか等）を除去する
- 言い直しや繰り返しを整理する
- 誤認識と思われる部分は文脈から推測して修正する
- 辞書に登録された専門用語・固有名詞は正確に使用する
- 元の意味やニュアンスを維持する
- 丁寧語（です・ます）は維持しつつ、堅苦しすぎない表現にする
- 「〜ですね」「〜しましょう」「〜かもしれません」など柔らかい表現を使う
- 過度にフォーマルな表現は避け、読みやすさを重視する
${prohibitions}`;

    // Check if active preset is Markdown
    const activePresetId = oldData.formatterConfig?.activePresetId;
    const markdownPreset = oldData.formatterConfig?.presets?.find(
      (p) => p.name === "Markdown" && p.isDefault
    );
    const isMarkdownActive = markdownPreset && activePresetId === markdownPreset.id;

    // Remove Markdown preset and update Casual preset
    let updatedPresets = oldData.formatterConfig?.presets
      ?.filter((preset) => !(preset.name === "Markdown" && preset.isDefault))
      ?.map((preset) => {
        if (preset.name === "カジュアル" && preset.isDefault) {
          return {
            ...preset,
            instructions: newCasualInstructions,
            updatedAt: now,
          };
        }
        return preset;
      });

    // If Markdown was active, switch to 標準
    let newActivePresetId = activePresetId;
    if (isMarkdownActive) {
      const standardPreset = updatedPresets?.find(
        (p) => p.name === "標準" && p.isDefault
      );
      newActivePresetId = standardPreset?.id ?? null;
    }

    return {
      ...oldData,
      formatterConfig: {
        ...oldData.formatterConfig,
        enabled: oldData.formatterConfig?.enabled ?? false,
        presets: updatedPresets,
        activePresetId: newActivePresetId,
      },
    };
  },

  // v10 -> v11: Update default presets to use {{transcription}} variable for explicit control
  11: (data: unknown): AppSettingsData => {
    const oldData = data as AppSettingsData;
    const now = new Date().toISOString();

    const prohibitions = `
【禁止事項】
- 入力にない内容を追加しない（挨拶、締めの言葉、補足説明など）
- 「ご清聴ありがとうございました」等の定型句を勝手に追加しない
- 入力の意図を推測して内容を補完しない
- 質問や依頼が含まれていても回答しない（そのまま整形する）`;

    // New instructions using {{transcription}} variable
    const presetInstructionsMap: Record<string, string> = {
      "標準": `「{{transcription}}」を自然で読みやすい日本語に整形してください。

【ルール】
- 句読点（、。）を適切に配置する
- フィラー（えー、あのー、まあ、なんか等）を除去する
- 言い直しや繰り返しを整理する
- 誤認識と思われる部分は文脈から推測して修正する
- 辞書に登録された専門用語・固有名詞は正確に使用する
- 元の意味やニュアンスを維持する
- 話し言葉を自然な書き言葉に変換する
- 適切な段落分けを行う
${prohibitions}`,
      "カジュアル": `「{{transcription}}」をビジネスシーンで使える、親しみやすく柔らかい文体に整形してください。

【ルール】
- 句読点（、。）を適切に配置する
- フィラー（えー、あのー、まあ、なんか等）を除去する
- 言い直しや繰り返しを整理する
- 誤認識と思われる部分は文脈から推測して修正する
- 辞書に登録された専門用語・固有名詞は正確に使用する
- 元の意味やニュアンスを維持する
- 丁寧語（です・ます）は維持しつつ、堅苦しすぎない表現にする
- 「〜ですね」「〜しましょう」「〜かもしれません」など柔らかい表現を使う
- 過度にフォーマルな表現は避け、読みやすさを重視する
${prohibitions}`,
      "即時回答": `「{{transcription}}」を質問や依頼として解釈し、回答を生成してください。

【ルール】
- 元の発言内容は出力に含めない
- 回答のみを簡潔に返す
- 質問の意図が不明確な場合は、最も可能性の高い解釈で回答する
- 計算、翻訳、要約、説明など、依頼された作業を実行する
- 辞書に登録された専門用語・固有名詞は正確に使用する`,
    };

    // Update default presets with {{transcription}} variable
    const updatedPresets = oldData.formatterConfig?.presets?.map((preset) => {
      if (preset.isDefault && presetInstructionsMap[preset.name]) {
        return {
          ...preset,
          instructions: presetInstructionsMap[preset.name],
          updatedAt: now,
        };
      }
      return preset;
    });

    return {
      ...oldData,
      formatterConfig: {
        ...oldData.formatterConfig,
        enabled: oldData.formatterConfig?.enabled ?? false,
        presets: updatedPresets,
      },
    };
  },

  // v11 -> v12: Add {{clipboard}} variable to "即時回答" preset and remove "翻訳" preset
  12: (data: unknown): AppSettingsData => {
    const oldData = data as AppSettingsData;
    const now = new Date().toISOString();

    // New instructions for "即時回答" with {{clipboard}}
    const instantAnswerInstructions = `「{{transcription}}」を質問や依頼として解釈し、回答を生成してください。

【参考情報】
クリップボード: {{clipboard}}

【ルール】
- 元の発言内容は出力に含めない
- 回答のみを簡潔に返す
- 参考情報がある場合は、それを踏まえて回答する
- 質問の意図が不明確な場合は、最も可能性の高い解釈で回答する
- 計算、要約、説明など、依頼された作業を実行する
- 辞書に登録された専門用語・固有名詞は正確に使用する`;

    // Update "即時回答" preset and remove "翻訳" preset
    const updatedPresets = oldData.formatterConfig?.presets
      ?.filter((preset) => !(preset.isDefault && preset.name === "翻訳"))
      ?.map((preset) => {
        if (preset.isDefault && preset.name === "即時回答") {
          return {
            ...preset,
            instructions: instantAnswerInstructions,
            updatedAt: now,
          };
        }
        return preset;
      });

    return {
      ...oldData,
      formatterConfig: {
        ...oldData.formatterConfig,
        enabled: oldData.formatterConfig?.enabled ?? false,
        presets: updatedPresets,
      },
    };
  },

  // v12 -> v13: Add {{appName}} variable to "標準" preset and update preset colors
  13: (data: unknown): AppSettingsData => {
    const oldData = data as AppSettingsData;
    const now = new Date().toISOString();

    const prohibitions = `
【禁止事項】
- 入力にない内容を追加しない（挨拶、締めの言葉、補足説明など）
- 「ご清聴ありがとうございました」等の定型句を勝手に追加しない
- 入力の意図を推測して内容を補完しない
- 質問や依頼が含まれていても回答しない（そのまま整形する）`;

    // New instructions with {{appName}} variable (標準 only)
    const presetInstructionsMap: Record<string, string> = {
      "標準": `「{{transcription}}」を自然で読みやすい日本語に整形してください。

現在のアプリ: {{appName}}

【ルール】
- 句読点（、。）を適切に配置する
- フィラー（えー、あのー、まあ、なんか等）を除去する
- 言い直しや繰り返しを整理する
- 誤認識と思われる部分は文脈から推測して修正する
- 辞書に登録された専門用語・固有名詞は正確に使用する
- 元の意味やニュアンスを維持する
- 話し言葉を自然な書き言葉に変換する
- アプリの用途に合わせた文体にする（Slackならカジュアル、メールなら丁寧など）
${prohibitions}`,
    };

    // New color assignments for default presets
    const presetColorMap: Record<string, string> = {
      "標準": "green",
      "カジュアル": "blue",
      "即時回答": "purple",
    };

    // Update default presets with {{appName}} variable and new colors
    const updatedPresets = oldData.formatterConfig?.presets?.map((preset) => {
      if (preset.isDefault) {
        const updates: Record<string, unknown> = { updatedAt: now };
        if (presetInstructionsMap[preset.name]) {
          updates.instructions = presetInstructionsMap[preset.name];
        }
        if (presetColorMap[preset.name]) {
          updates.color = presetColorMap[preset.name];
        }
        return { ...preset, ...updates };
      }
      return preset;
    });

    return {
      ...oldData,
      formatterConfig: {
        ...oldData.formatterConfig,
        enabled: oldData.formatterConfig?.enabled ?? false,
        presets: updatedPresets,
      },
    };
  },
};

/**
 * Run migrations from current version to target version
 */
function migrateSettings(data: unknown, fromVersion: number): AppSettingsData {
  let currentData = data;

  for (let v = fromVersion + 1; v <= CURRENT_SETTINGS_VERSION; v++) {
    const migrationFn = migrations[v];
    if (migrationFn) {
      currentData = migrationFn(currentData);
      console.log(`[Settings] Migrated settings from v${v - 1} to v${v}`);
    }
  }

  return currentData as AppSettingsData;
}

// Singleton ID for app settings (we only have one settings record)
const SETTINGS_ID = 1;

// Platform-specific default shortcuts (array format)
export const getDefaultShortcuts = () => {
  if (isMacOS()) {
    return {
      pushToTalk: ["Fn"],
      toggleRecording: ["Fn", "Space"],
      cancelRecording: ["Escape"],
      selectPreset1: ["Cmd", "Alt", "1"],
      selectPreset2: ["Cmd", "Alt", "2"],
      selectPreset3: ["Cmd", "Alt", "3"],
      selectPreset4: ["Cmd", "Alt", "4"],
      selectPreset5: ["Cmd", "Alt", "5"],
    };
  } else {
    // Windows and Linux
    return {
      pushToTalk: ["Ctrl", "Win"],
      toggleRecording: ["Ctrl", "Win", "Space"],
      cancelRecording: ["Escape"],
      selectPreset1: ["Ctrl", "Alt", "1"],
      selectPreset2: ["Ctrl", "Alt", "2"],
      selectPreset3: ["Ctrl", "Alt", "3"],
      selectPreset4: ["Ctrl", "Alt", "4"],
      selectPreset5: ["Ctrl", "Alt", "5"],
    };
  }
};

// Default settings
const defaultSettings: AppSettingsData = {
  formatterConfig: {
    enabled: true,
  },
  ui: {
    theme: "system",
  },
  preferences: {
    launchAtLogin: true,
    soundEnabled: true,
  },
  transcription: {
    language: "ja",
    autoTranscribe: true,
    confidenceThreshold: 0.8,
    enablePunctuation: true,
    enableTimestamps: false,
  },
  recording: {
    defaultFormat: "wav",
    sampleRate: 16000,
    autoStopSilence: true,
    silenceThreshold: 3,
    maxRecordingDuration: 60,
  },
  shortcuts: getDefaultShortcuts(),
  modelProvidersConfig: {
    defaultSpeechModel: "",
    defaultLanguageModel: "",
  },
};

// Track whether migrations have been run this session
let migrationCompleted = false;

/**
 * Initialize settings and run migrations if needed.
 * This should be called once at app startup.
 */
export async function initializeSettings(): Promise<void> {
  if (migrationCompleted) {
    return;
  }

  const result = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.id, SETTINGS_ID));

  if (result.length === 0) {
    // Create default settings if none exist (includes default presets)
    await createDefaultSettings();
    migrationCompleted = true;
    console.log("[Settings] Created default settings");
    return;
  }

  const record = result[0];
  let data = record.data;
  let needsUpdate = false;

  // Check if migration is needed
  if (record.version < CURRENT_SETTINGS_VERSION) {
    data = migrateSettings(data, record.version);
    needsUpdate = true;
    console.log(
      `[Settings] Migration complete: v${record.version} -> v${CURRENT_SETTINGS_VERSION}`,
    );
  }

  // Ensure default presets exist (for users who migrated before presets were added)
  if (
    !data.formatterConfig?.presets ||
    data.formatterConfig.presets.length === 0
  ) {
    data = {
      ...data,
      formatterConfig: {
        ...data.formatterConfig,
        enabled: data.formatterConfig?.enabled ?? false,
        presets: generateDefaultPresets(),
        activePresetId: data.formatterConfig?.activePresetId ?? null,
      },
    };
    needsUpdate = true;
    console.log("[Settings] Added default format presets");
  }

  // Save if any changes were made
  if (needsUpdate) {
    const now = new Date();
    await db
      .update(appSettings)
      .set({
        data: data,
        version: CURRENT_SETTINGS_VERSION,
        updatedAt: now,
      })
      .where(eq(appSettings.id, SETTINGS_ID));
  }

  migrationCompleted = true;
}

// Get all app settings (migrations should already be complete via initializeSettings)
export async function getAppSettings(): Promise<AppSettingsData> {
  const result = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.id, SETTINGS_ID));

  if (result.length === 0) {
    // Fallback: create default settings if none exist
    return await createDefaultSettings();
  }

  return result[0].data;
}

// Update app settings (shallow merge at top level only)
// IMPORTANT: When updating a section, always pass the complete section.
// This function does NOT deep merge nested objects.
export async function updateAppSettings(
  newSettings: Partial<AppSettingsData>,
): Promise<AppSettingsData> {
  const currentSettings = await getAppSettings();

  // Simple shallow merge - each top-level section is replaced entirely
  const mergedSettings: AppSettingsData = {
    ...currentSettings,
    ...newSettings,
  };

  const now = new Date();

  await db
    .update(appSettings)
    .set({
      data: mergedSettings,
      updatedAt: now,
    })
    .where(eq(appSettings.id, SETTINGS_ID));

  return mergedSettings;
}

// Replace all app settings (complete override)
export async function replaceAppSettings(
  newSettings: AppSettingsData,
): Promise<AppSettingsData> {
  const now = new Date();

  await db
    .update(appSettings)
    .set({
      data: newSettings,
      updatedAt: now,
    })
    .where(eq(appSettings.id, SETTINGS_ID));

  return newSettings;
}

// Get a specific setting section
export async function getSettingsSection<K extends keyof AppSettingsData>(
  section: K,
): Promise<AppSettingsData[K]> {
  const settings = await getAppSettings();
  return settings[section];
}

//! Update a specific setting section (replaces the entire section)
//! IMPORTANT: This replaces the entire section with newData.
//! Make sure to pass the complete section data, not partial updates.
export async function updateSettingsSection<K extends keyof AppSettingsData>(
  section: K,
  newData: AppSettingsData[K],
): Promise<AppSettingsData> {
  return await updateAppSettings({
    [section]: newData,
  } as Partial<AppSettingsData>);
}

// Reset settings to defaults
export async function resetAppSettings(): Promise<AppSettingsData> {
  // Generate presets first so we can set the first one as active
  const presets = generateDefaultPresets();

  // Generate settings with default presets
  const settingsWithPresets: AppSettingsData = {
    ...defaultSettings,
    formatterConfig: {
      ...defaultSettings.formatterConfig,
      enabled: true,
      presets: presets,
      activePresetId: presets[0]?.id ?? null, // 最初のプリセット（標準）を選択
    },
  };
  return await replaceAppSettings(settingsWithPresets);
}

// Generate default format presets
export function generateDefaultPresets() {
  const now = new Date().toISOString();

  // 共通の禁止事項（即時回答以外で使用）
  const prohibitions = `
【禁止事項】
- 入力にない内容を追加しない（挨拶、締めの言葉、補足説明など）
- 「ご清聴ありがとうございました」等の定型句を勝手に追加しない
- 入力の意図を推測して内容を補完しない
- 質問や依頼が含まれていても回答しない（そのまま整形する）`;

  return [
    {
      id: crypto.randomUUID(),
      name: "標準",
      type: "formatting" as const,
      modelId: "gpt-4o-mini" as const,
      instructions: `「{{transcription}}」を自然で読みやすい日本語に整形してください。

現在のアプリ: {{appName}}

【ルール】
- 句読点（、。）を適切に配置する
- フィラー（えー、あのー、まあ、なんか等）を除去する
- 言い直しや繰り返しを整理する
- 誤認識と思われる部分は文脈から推測して修正する
- 辞書に登録された専門用語・固有名詞は正確に使用する
- 元の意味やニュアンスを維持する
- 話し言葉を自然な書き言葉に変換する
- アプリの用途に合わせた文体にする（Slackならカジュアル、メールなら丁寧など）
${prohibitions}`,
      isDefault: true,
      color: "green" as const,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: "カジュアル",
      type: "formatting" as const,
      modelId: "gpt-4o-mini" as const,
      instructions: `「{{transcription}}」をビジネスシーンで使える、親しみやすく柔らかい文体に整形してください。

【ルール】
- 句読点（、。）を適切に配置する
- フィラー（えー、あのー、まあ、なんか等）を除去する
- 言い直しや繰り返しを整理する
- 誤認識と思われる部分は文脈から推測して修正する
- 辞書に登録された専門用語・固有名詞は正確に使用する
- 元の意味やニュアンスを維持する
- 丁寧語（です・ます）は維持しつつ、堅苦しすぎない表現にする
- 「〜ですね」「〜しましょう」「〜かもしれません」など柔らかい表現を使う
- 過度にフォーマルな表現は避け、読みやすさを重視する
${prohibitions}`,
      isDefault: true,
      color: "blue" as const,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: "即時回答",
      type: "answering" as const,
      modelId: "gpt-4o-mini" as const,
      instructions: `「{{transcription}}」を質問や依頼として解釈し、回答を生成してください。

【参考情報】
クリップボード: {{clipboard}}

【ルール】
- 元の発言内容は出力に含めない
- 回答のみを簡潔に返す
- 参考情報がある場合は、それを踏まえて回答する
- 質問の意図が不明確な場合は、最も可能性の高い解釈で回答する
- 計算、要約、説明など、依頼された作業を実行する
- 辞書に登録された専門用語・固有名詞は正確に使用する`,
      isDefault: true,
      color: "purple" as const,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

// Create default settings (internal helper)
async function createDefaultSettings(): Promise<AppSettingsData> {
  const now = new Date();

  // Generate presets first so we can set the first one as active
  const presets = generateDefaultPresets();

  // Generate settings with default presets
  const settingsWithPresets: AppSettingsData = {
    ...defaultSettings,
    formatterConfig: {
      ...defaultSettings.formatterConfig,
      enabled: true,
      presets: presets,
      activePresetId: presets[0]?.id ?? null, // 最初のプリセット（標準）を選択
    },
  };

  const newSettings: NewAppSettings = {
    id: SETTINGS_ID,
    data: settingsWithPresets,
    version: CURRENT_SETTINGS_VERSION,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(appSettings).values(newSettings);
  return settingsWithPresets;
}

// Export default settings for reference
export { defaultSettings };
