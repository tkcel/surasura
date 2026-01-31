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
const CURRENT_SETTINGS_VERSION = 6;

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

    // Default presets
    const defaultPresets = [
      {
        id: crypto.randomUUID(),
        name: "標準",
        modelId: "gpt-4o-mini" as const,
        instructions: "音声認識結果を自然な日本語に整形してください。句読点を適切に配置し、フィラー（えー、あのー等）を除去し、読みやすい文章にしてください。",
        isDefault: true,
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
    const standardInstructions = "音声認識結果を自然な日本語に整形してください。句読点を適切に配置し、フィラー（えー、あのー等）を除去し、読みやすい文章にしてください。";

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
      (preset) => preset.name === "即時回答"
    );

    if (hasInstantAnswer) {
      return oldData;
    }

    const instantAnswerPreset = {
      id: crypto.randomUUID(),
      name: "即時回答",
      modelId: "gpt-4o-mini" as const,
      instructions: "音声入力された内容を質問や依頼として解釈し、それに対する回答を直接出力してください。元の発言内容は含めず、回答のみを簡潔に返してください。",
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    };

    return {
      ...oldData,
      formatterConfig: {
        ...oldData.formatterConfig,
        enabled: oldData.formatterConfig?.enabled ?? false,
        presets: [...(oldData.formatterConfig?.presets ?? []), instantAnswerPreset],
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
const getDefaultShortcuts = () => {
  if (isMacOS()) {
    return {
      pushToTalk: ["Fn"],
      toggleRecording: ["Fn", "Space"],
      cancelRecording: ["Escape"],
    };
  } else {
    // Windows and Linux
    return {
      pushToTalk: ["Ctrl", "Win"],
      toggleRecording: ["Ctrl", "Win", "Space"],
      cancelRecording: ["Escape"],
    };
  }
};

// Default settings
const defaultSettings: AppSettingsData = {
  formatterConfig: {
    enabled: false,
  },
  ui: {
    theme: "system",
  },
  preferences: {
    launchAtLogin: true,
    showWidgetWhileInactive: true,
    showInDock: true,
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

// Get all app settings (with automatic migration if needed)
export async function getAppSettings(): Promise<AppSettingsData> {
  const result = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.id, SETTINGS_ID));

  if (result.length === 0) {
    // Create default settings if none exist (includes default presets)
    return await createDefaultSettings();
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
  if (!data.formatterConfig?.presets || data.formatterConfig.presets.length === 0) {
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

  return data;
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
  // Generate settings with default presets
  const settingsWithPresets: AppSettingsData = {
    ...defaultSettings,
    formatterConfig: {
      ...defaultSettings.formatterConfig,
      enabled: defaultSettings.formatterConfig?.enabled ?? false,
      presets: generateDefaultPresets(),
      activePresetId: null,
    },
  };
  return await replaceAppSettings(settingsWithPresets);
}

// Generate default format presets
function generateDefaultPresets() {
  const now = new Date().toISOString();
  return [
    {
      id: crypto.randomUUID(),
      name: "標準",
      modelId: "gpt-4o-mini" as const,
      instructions: "音声認識結果を自然な日本語に整形してください。句読点を適切に配置し、フィラー（えー、あのー等）を除去し、読みやすい文章にしてください。",
      isDefault: true,
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
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: "即時回答",
      modelId: "gpt-4o-mini" as const,
      instructions:
        "音声入力された内容を質問や依頼として解釈し、それに対する回答を直接出力してください。元の発言内容は含めず、回答のみを簡潔に返してください。",
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

// Create default settings (internal helper)
async function createDefaultSettings(): Promise<AppSettingsData> {
  const now = new Date();

  // Generate settings with default presets
  const settingsWithPresets: AppSettingsData = {
    ...defaultSettings,
    formatterConfig: {
      ...defaultSettings.formatterConfig,
      enabled: defaultSettings.formatterConfig?.enabled ?? false,
      presets: generateDefaultPresets(),
      activePresetId: null,
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
