import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Transcriptions table
export const transcriptions = sqliteTable("transcriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  language: text("language").default("en"),
  audioFile: text("audio_file"), // Path to the audio file
  confidence: real("confidence"), // AI confidence score (0-1)
  duration: integer("duration"), // Duration in seconds
  speechModel: text("speech_model"), // Model used for speech recognition
  formattingModel: text("formatting_model"), // Model used for formatting
  meta: text("meta", { mode: "json" }), // Additional metadata as JSON
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Vocabulary table
export const vocabulary = sqliteTable("vocabulary", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  word: text("word").notNull().unique(),
  replacementWord: text("replacement_word"),
  isReplacement: integer("is_replacement", { mode: "boolean" }).default(false),
  dateAdded: integer("date_added", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  usageCount: integer("usage_count").default(0), // How many times this word appeared in transcriptions
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// App settings table with typed JSON
export const appSettings = sqliteTable("app_settings", {
  id: integer("id").primaryKey(),
  data: text("data", { mode: "json" }).$type<AppSettingsData>().notNull(),
  version: integer("version").notNull().default(1), // For migrations
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Define the shape of our settings JSON
export interface AppSettingsData {
  formatterConfig?: {
    enabled: boolean;
    modelId?: string; // Formatting model selection (language model ID or "surasura-cloud")
    fallbackModelId?: string; // Last non-cloud formatting model for auto-restore
    presets?: Array<{
      id: string;
      name: string; // 最大20文字
      modelId: "gpt-4.1-nano" | "gpt-4o-mini" | "gpt-4.1-mini" | "gpt-4.1" | "gpt-4o";
      instructions: string; // 最大2000文字
      isDefault: boolean;
      color: "yellow" | "blue" | "green" | "pink" | "purple" | "orange"; // プリセットの色
      createdAt: string; // ISO 8601
      updatedAt: string;
    }>; // 最大5つ
    activePresetId?: string | null;
  };
  ui?: {
    theme: "light" | "dark" | "system";
  };
  transcription?: {
    language: string;
    autoTranscribe: boolean;
    confidenceThreshold: number;
    enablePunctuation: boolean;
    enableTimestamps: boolean;
  };
  recording?: {
    defaultFormat: "wav" | "mp3" | "flac";
    sampleRate: 16000 | 22050 | 44100 | 48000;
    autoStopSilence: boolean;
    silenceThreshold: number;
    maxRecordingDuration: number;
    preferredMicrophoneName?: string;
  };
  shortcuts?: {
    pushToTalk?: string[];
    toggleRecording?: string[];
    pasteLastTranscription?: string[];
    cancelRecording?: string[];
    selectPreset1?: string[];
    selectPreset2?: string[];
    selectPreset3?: string[];
    selectPreset4?: string[];
    selectPreset5?: string[];
  };

  modelProvidersConfig?: {
    openai?: {
      apiKey: string;
    };
    defaultSpeechModel?: string; // Model ID for default speech model (Whisper)
    defaultLanguageModel?: string; // Model ID for default language model
  };

  dictation?: {
    selectedLanguage: string; // Language code (e.g., "ja", "en")
  };
  preferences?: {
    launchAtLogin?: boolean;
    minimizeToTray?: boolean;
    soundEnabled?: boolean;
  };
  telemetry?: {
    enabled?: boolean;
  };
  onboarding?: {
    completedVersion: number;
    completedAt: string; // ISO 8601 timestamp
    lastVisitedScreen?: string; // Last screen user was on (for resume)
    skippedScreens?: string[]; // Screens skipped via feature flags
    featureInterests?: string[]; // Selected features (max 3)
    discoverySource?: string; // How user found surasura
    selectedModelType: "cloud" | "local"; // User's model choice
    modelRecommendation?: {
      suggested: "cloud" | "local"; // System recommendation
      reason: string; // Human-readable explanation
      followed: boolean; // Whether user followed recommendation
    };
  };
}

// Export types for TypeScript
export type Transcription = typeof transcriptions.$inferSelect;
export type NewTranscription = typeof transcriptions.$inferInsert;
export type Vocabulary = typeof vocabulary.$inferSelect;
export type NewVocabulary = typeof vocabulary.$inferInsert;
export type AppSettings = typeof appSettings.$inferSelect;
export type NewAppSettings = typeof appSettings.$inferInsert;
