import type { TestDatabase } from "./test-db";
import * as schema from "@db/schema";
import type {
  NewTranscription,
  NewVocabulary,
  AppSettingsData,
} from "@db/schema";

/**
 * Default app settings for testing
 */
export const defaultAppSettings: AppSettingsData = {
  formatterConfig: {
    modelId: "gpt-4o-mini",
    enabled: false,
  },
  ui: {
    theme: "system",
  },
  transcription: {
    language: "en",
    autoTranscribe: true,
    confidenceThreshold: 0.7,
    enablePunctuation: true,
    enableTimestamps: false,
  },
  recording: {
    defaultFormat: "wav",
    sampleRate: 16000,
    autoStopSilence: true,
    silenceThreshold: -45,
    maxRecordingDuration: 600,
  },
  shortcuts: {
    pushToTalk: ["CommandOrControl", "Shift", "Space"],
    toggleRecording: ["CommandOrControl", "Shift", "R"],
  },
  modelProvidersConfig: {
    defaultSpeechModel: "openai-whisper:whisper-1",
  },
  dictation: {
    selectedLanguage: "ja",
  },
  preferences: {
    launchAtLogin: false,
    minimizeToTray: true,
  },
};

/**
 * Sample transcriptions for testing
 */
export const sampleTranscriptions: NewTranscription[] = [
  {
    text: "This is a test transcription",
    language: "en",
    confidence: 0.95,
    duration: 5,
    speechModel: "openai-whisper-1",
    formattingModel: null,
  },
  {
    text: "Another test transcription with more content",
    language: "en",
    confidence: 0.88,
    duration: 8,
    speechModel: "openai-whisper-1",
    formattingModel: "gpt-4o-mini",
  },
  {
    text: "A third transcription for comprehensive testing",
    language: "en",
    confidence: 0.92,
    duration: 6,
    speechModel: "openai-whisper-1",
    formattingModel: null,
  },
];

/**
 * Sample vocabulary items for testing
 */
export const sampleVocabulary: NewVocabulary[] = [
  {
    word: "surasura",
    replacementWord: null,
    isReplacement: false,
    usageCount: 5,
  },
  {
    word: "API",
    replacementWord: null,
    isReplacement: false,
    usageCount: 3,
  },
  {
    word: "teh",
    replacementWord: "the",
    isReplacement: true,
    usageCount: 2,
  },
];


/**
 * Fixture presets
 */
export const fixtures = {
  /**
   * Empty database with only default settings
   */
  empty: async (testDb: TestDatabase) => {
    // Clear existing settings first
    await testDb.db.delete(schema.appSettings);
    // Insert default settings
    await testDb.db.insert(schema.appSettings).values({
      id: 1,
      data: defaultAppSettings,
      version: 17,
    });
  },

  /**
   * Database with existing transcriptions
   */
  withTranscriptions: async (testDb: TestDatabase) => {
    await fixtures.empty(testDb);
    await testDb.db.insert(schema.transcriptions).values(sampleTranscriptions);
  },

  /**
   * Database with vocabulary items
   */
  withVocabulary: async (testDb: TestDatabase) => {
    await fixtures.empty(testDb);
    await testDb.db.insert(schema.vocabulary).values(sampleVocabulary);
  },

  /**
   * Full database with all types of data
   */
  full: async (testDb: TestDatabase) => {
    await fixtures.empty(testDb);
    await testDb.db.insert(schema.transcriptions).values(sampleTranscriptions);
    await testDb.db.insert(schema.vocabulary).values(sampleVocabulary);
  },

  /**
   * Database with custom settings
   */
  withCustomSettings: async (
    testDb: TestDatabase,
    settings: Partial<AppSettingsData>,
  ) => {
    // Clear existing settings first
    await testDb.db.delete(schema.appSettings);
    // Insert custom settings
    await testDb.db.insert(schema.appSettings).values({
      id: 1,
      data: { ...defaultAppSettings, ...settings },
      version: 17,
    });
  },

  /**
   * Database with authenticated user
   */
  withAuth: async (testDb: TestDatabase) => {
    await fixtures.withCustomSettings(testDb, {});
  },
};

/**
 * Helper to seed specific data
 */
export async function seedDatabase(
  testDb: TestDatabase,
  fixture:
    | Exclude<keyof typeof fixtures, "withCustomSettings">
    | ((testDb: TestDatabase) => Promise<void>),
): Promise<void> {
  if (typeof fixture === "function") {
    await fixture(testDb);
  } else {
    await fixtures[fixture](testDb);
  }
}
