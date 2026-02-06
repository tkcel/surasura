import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createTestDatabase, type TestDatabase } from "../helpers/test-db";
import { seedDatabase } from "../helpers/fixtures";
import { initializeTestServices } from "../helpers/test-app";
import { setTestDatabase } from "../setup";
import type { SettingsService } from "@services/settings-service";
import type { ServiceManager } from "@main/managers/service-manager";
import type { FormatterConfig } from "../../src/types/formatter";

describe("SettingsService", () => {
  let testDb: TestDatabase;
  let serviceManager: ServiceManager;
  let cleanup: () => Promise<void>;
  let settingsService: SettingsService;

  afterEach(async () => {
    if (cleanup) {
      await cleanup();
    }
    if (testDb) {
      await testDb.close();
    }
  });

  // ==================== Formatter Config ====================
  describe("getFormatterConfig / setFormatterConfig", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-formatter-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      settingsService = serviceManager.getSettingsService()!;
    });

    it("初期化後にフォーマッタ設定を返す", async () => {
      const config = await settingsService.getFormatterConfig();
      expect(config).toBeDefined();
      expect(config).toHaveProperty("enabled");
    });

    it("フォーマッタ設定を保存して取得できる", async () => {
      const config = await settingsService.getFormatterConfig();
      const newConfig: FormatterConfig = {
        ...config!,
        enabled: true,
      };
      await settingsService.setFormatterConfig(newConfig);
      const updated = await settingsService.getFormatterConfig();
      expect(updated).toBeDefined();
      expect(updated!.enabled).toBe(true);
    });

    it("activePresetIdなしで有効化した場合に最初のプリセットを自動選択する", async () => {
      const config = await settingsService.getFormatterConfig();
      // Set enabled=true with no activePresetId to trigger auto-select
      await settingsService.setFormatterConfig({
        ...config!,
        enabled: true,
        activePresetId: undefined,
      });

      const updatedConfig = await settingsService.getFormatterConfig();
      expect(updatedConfig!.activePresetId).toBeDefined();
    });
  });

  // ==================== Shortcuts ====================
  describe("getShortcuts / setShortcuts", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-shortcuts-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      settingsService = serviceManager.getSettingsService()!;
    });

    it("デフォルトのショートカットを返す", async () => {
      const shortcuts = await settingsService.getShortcuts();
      expect(shortcuts).toBeDefined();
      expect(shortcuts).toHaveProperty("pushToTalk");
      expect(shortcuts).toHaveProperty("toggleRecording");
      expect(shortcuts).toHaveProperty("cancelRecording");
    });

    it("カスタムショートカットを保存して取得できる", async () => {
      const customShortcuts = {
        pushToTalk: ["Ctrl", "Space"],
        toggleRecording: ["Ctrl", "R"],
        pasteLastTranscription: ["Alt", "Cmd", "V"],
        cancelRecording: ["Escape"],
        selectPreset1: [],
        selectPreset2: [],
        selectPreset3: [],
        selectPreset4: [],
        selectPreset5: [],
      };
      await settingsService.setShortcuts(customShortcuts);
      const shortcuts = await settingsService.getShortcuts();
      expect(shortcuts.pushToTalk).toEqual(["Ctrl", "Space"]);
      expect(shortcuts.toggleRecording).toEqual(["Ctrl", "R"]);
    });

    it("空配列を設定するとショートカットがクリアされる", async () => {
      const customShortcuts = {
        pushToTalk: [],
        toggleRecording: [],
        pasteLastTranscription: [],
        cancelRecording: [],
        selectPreset1: [],
        selectPreset2: [],
        selectPreset3: [],
        selectPreset4: [],
        selectPreset5: [],
      };
      await settingsService.setShortcuts(customShortcuts);
      const shortcuts = await settingsService.getShortcuts();
      // Clearing should fall back to defaults
      expect(shortcuts).toBeDefined();
    });
  });

  // ==================== Preferences ====================
  describe("getPreferences / setPreferences", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-preferences-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      settingsService = serviceManager.getSettingsService()!;
    });

    it("デフォルト値を返す: launchAtLogin=true, minimizeToTray=true, soundEnabled=true", async () => {
      // Reset preferences to check defaults
      await settingsService.updateSettings({ preferences: undefined });
      const prefs = await settingsService.getPreferences();
      expect(prefs.launchAtLogin).toBe(true);
      expect(prefs.minimizeToTray).toBe(true);
      expect(prefs.soundEnabled).toBe(true);
    });

    it("環境設定を保存して取得できる", async () => {
      await settingsService.setPreferences({
        launchAtLogin: false,
        soundEnabled: false,
      });
      const prefs = await settingsService.getPreferences();
      expect(prefs.launchAtLogin).toBe(false);
      expect(prefs.soundEnabled).toBe(false);
      expect(prefs.minimizeToTray).toBe(true);
    });

    it("preferences-changedイベントを発火する", async () => {
      const listener = vi.fn();
      settingsService.on("preferences-changed", listener);

      await settingsService.setPreferences({ soundEnabled: false });

      expect(listener).toHaveBeenCalledWith({
        changes: { soundEnabled: false },
      });

      settingsService.removeListener("preferences-changed", listener);
    });
  });

  // ==================== Dictation Settings ====================
  describe("getDictationSettings / setDictationSettings", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-dictation-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      settingsService = serviceManager.getSettingsService()!;
    });

    it("ディクテーション設定を保存して取得できる", async () => {
      await settingsService.setDictationSettings({ selectedLanguage: "en" });
      const settings = await settingsService.getDictationSettings();
      expect(settings).toBeDefined();
      expect(settings!.selectedLanguage).toBe("en");
    });
  });

  // ==================== UI Settings ====================
  describe("getUISettings / setUISettings", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-ui-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      settingsService = serviceManager.getSettingsService()!;
    });

    it("デフォルトのUI設定を返す", async () => {
      const uiSettings = await settingsService.getUISettings();
      expect(uiSettings).toBeDefined();
      expect(uiSettings!.theme).toBe("system");
    });

    it("UI設定を保存して取得できる", async () => {
      await settingsService.setUISettings({ theme: "dark" });
      const uiSettings = await settingsService.getUISettings();
      expect(uiSettings!.theme).toBe("dark");
    });

    it("テーマ更新時にtheme-changedイベントを発火する", async () => {
      const listener = vi.fn();
      settingsService.on("theme-changed", listener);

      await settingsService.setUISettings({ theme: "dark" });

      expect(listener).toHaveBeenCalledWith({ theme: "dark" });

      settingsService.removeListener("theme-changed", listener);
    });
  });

  // ==================== OpenAI Config ====================
  describe("getOpenAIConfig / setOpenAIConfig", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-openai-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      settingsService = serviceManager.getSettingsService()!;
    });

    it("OpenAI設定を暗号化フローで保存して取得できる", async () => {
      await settingsService.setOpenAIConfig({ apiKey: "sk-test-key-123" });
      const config = await settingsService.getOpenAIConfig();
      expect(config).toBeDefined();
      // The key should be decrypted back to the original value via the safeStorage mock
      expect(config!.apiKey).toBe("sk-test-key-123");
    });

    it("api-key-changedイベントを発火する", async () => {
      const listener = vi.fn();
      settingsService.on("api-key-changed", listener);

      await settingsService.setOpenAIConfig({ apiKey: "sk-new-key" });

      expect(listener).toHaveBeenCalled();

      settingsService.removeListener("api-key-changed", listener);
    });
  });

  // ==================== Default Speech Model ====================
  describe("getDefaultSpeechModel / setDefaultSpeechModel", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-speech-model-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      settingsService = serviceManager.getSettingsService()!;
    });

    it("デフォルトの音声モデルを保存して取得できる", async () => {
      await settingsService.setDefaultSpeechModel("openai-whisper:whisper-1");
      const model = await settingsService.getDefaultSpeechModel();
      expect(model).toBe("openai-whisper:whisper-1");
    });

    it("デフォルトの音声モデルをクリアできる", async () => {
      await settingsService.setDefaultSpeechModel("openai-whisper:whisper-1");
      await settingsService.setDefaultSpeechModel(undefined);
      const model = await settingsService.getDefaultSpeechModel();
      expect(model).toBeUndefined();
    });
  });

  // ==================== Default Language Model ====================
  describe("getDefaultLanguageModel / setDefaultLanguageModel", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({
        name: "settings-language-model-test",
      });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      settingsService = serviceManager.getSettingsService()!;
    });

    it("デフォルトの言語モデルを保存して取得できる", async () => {
      await settingsService.setDefaultLanguageModel("gpt-4o-mini");
      const model = await settingsService.getDefaultLanguageModel();
      expect(model).toBe("gpt-4o-mini");
    });

    it("デフォルトの言語モデルをクリアできる", async () => {
      await settingsService.setDefaultLanguageModel("gpt-4o-mini");
      await settingsService.setDefaultLanguageModel(undefined);
      const model = await settingsService.getDefaultLanguageModel();
      expect(model).toBeUndefined();
    });
  });

  // ==================== Format Presets ====================
  describe("createFormatPreset", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-create-preset-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      settingsService = serviceManager.getSettingsService()!;
    });

    it("新しいプリセットを作成してIDとタイムスタンプ付きで返す", async () => {
      const config = await settingsService.getFormatterConfig();
      const existingCount = config!.presets?.length ?? 0;
      expect(existingCount).toBeLessThan(5);

      const preset = await settingsService.createFormatPreset({
        name: "MyPreset",
        type: "formatting",
        modelId: "gpt-4o-mini",
        instructions: "Test instructions for preset",
        isDefault: false,
        color: "blue",
      });

      expect(preset.id).toBeDefined();
      expect(preset.name).toBe("MyPreset");
      expect(preset.createdAt).toBeDefined();
      expect(preset.updatedAt).toBeDefined();
    });

    it("プリセットが5件に達した場合にエラーをスローする", async () => {
      // Get current presets (defaults are recovered by getFormatterConfig)
      const config = await settingsService.getFormatterConfig();
      const existingCount = config!.presets?.length ?? 0;

      // Add presets until we reach 5
      const toAdd = 5 - existingCount;
      for (let i = 0; i < toAdd; i++) {
        await settingsService.createFormatPreset({
          name: `Extra${i}`,
          type: "formatting",
          modelId: "gpt-4o-mini",
          instructions: "Instructions",
          isDefault: false,
          color: "yellow",
        });
      }

      // Now the 6th should fail
      await expect(
        settingsService.createFormatPreset({
          name: "TooMany",
          type: "formatting",
          modelId: "gpt-4o-mini",
          instructions: "Instructions",
          isDefault: false,
          color: "yellow",
        }),
      ).rejects.toThrow("Maximum number of presets (5) reached");
    });

    it("名前が20文字を超える場合にエラーをスローする", async () => {
      await expect(
        settingsService.createFormatPreset({
          name: "A".repeat(21),
          type: "formatting",
          modelId: "gpt-4o-mini",
          instructions: "Instructions",
          isDefault: false,
          color: "yellow",
        }),
      ).rejects.toThrow("Preset name must be 20 characters or less");
    });

    it("指示文が1000文字を超える場合にエラーをスローする", async () => {
      await expect(
        settingsService.createFormatPreset({
          name: "Test",
          type: "formatting",
          modelId: "gpt-4o-mini",
          instructions: "A".repeat(1001),
          isDefault: false,
          color: "yellow",
        }),
      ).rejects.toThrow("Instructions must be 1000 characters or less");
    });
  });

  // ==================== Update Format Preset ====================
  describe("updateFormatPreset", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-update-preset-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      settingsService = serviceManager.getSettingsService()!;
    });

    it("既存のプリセットを更新する", async () => {
      // Use existing default presets
      const config = await settingsService.getFormatterConfig();
      const firstPreset = config!.presets![0];

      const updated = await settingsService.updateFormatPreset(firstPreset.id, {
        name: "Updated",
      });

      expect(updated.name).toBe("Updated");
      expect(updated.id).toBe(firstPreset.id);
    });

    it("presets-updatedイベントを発火する", async () => {
      const config = await settingsService.getFormatterConfig();
      const firstPreset = config!.presets![0];

      const listener = vi.fn();
      settingsService.on("presets-updated", listener);

      await settingsService.updateFormatPreset(firstPreset.id, {
        name: "NewName",
      });

      expect(listener).toHaveBeenCalled();

      settingsService.removeListener("presets-updated", listener);
    });

    it("アクティブなプリセットの更新時にactive-preset-changedイベントを発火する", async () => {
      const config = await settingsService.getFormatterConfig();
      const firstPreset = config!.presets![0];

      // Set this preset as active
      await settingsService.setActivePreset(firstPreset.id);

      const listener = vi.fn();
      settingsService.on("active-preset-changed", listener);

      await settingsService.updateFormatPreset(firstPreset.id, {
        name: "StillActive",
      });

      expect(listener).toHaveBeenCalledWith({
        presetId: firstPreset.id,
        presetName: "StillActive",
      });

      settingsService.removeListener("active-preset-changed", listener);
    });
  });

  // ==================== Delete Format Preset ====================
  describe("deleteFormatPreset", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-delete-preset-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      settingsService = serviceManager.getSettingsService()!;
    });

    it("プリセットを削除する", async () => {
      const config = await settingsService.getFormatterConfig();
      const presetToDelete = config!.presets![0];
      const initialCount = config!.presets!.length;

      await settingsService.deleteFormatPreset(presetToDelete.id);

      const updated = await settingsService.getFormatterConfig();
      const found = updated!.presets!.find((p) => p.id === presetToDelete.id);
      expect(found).toBeUndefined();
      expect(updated!.presets!.length).toBe(initialCount - 1);
    });

    it("削除されたプリセットがアクティブだった場合にactivePresetIdをクリアする", async () => {
      const config = await settingsService.getFormatterConfig();
      const presets = config!.presets!;
      expect(presets.length).toBeGreaterThanOrEqual(2);

      // Set a specific preset as active
      const targetPreset = presets[1];
      await settingsService.setActivePreset(targetPreset.id);

      // Verify it is active
      const active = await settingsService.getActivePreset();
      expect(active!.id).toBe(targetPreset.id);

      // Delete the active preset
      await settingsService.deleteFormatPreset(targetPreset.id);

      // The activePresetId should be cleared
      const updatedConfig = await settingsService.getFormatterConfig();
      expect(updatedConfig!.activePresetId).toBeNull();
    });
  });

  // ==================== Active Preset ====================
  describe("setActivePreset / getActivePreset", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({
        name: "settings-active-preset-test",
      });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      settingsService = serviceManager.getSettingsService()!;
    });

    it("アクティブなプリセットを設定して取得できる", async () => {
      const config = await settingsService.getFormatterConfig();
      const preset = config!.presets![0];

      await settingsService.setActivePreset(preset.id);
      const active = await settingsService.getActivePreset();
      expect(active).toBeDefined();
      expect(active!.id).toBe(preset.id);
    });

    it("activePresetIdがクリアされた場合にnullを返す", async () => {
      // Clear activePresetId by setting it to null
      await settingsService.setActivePreset(null);

      const active = await settingsService.getActivePreset();
      expect(active).toBeNull();
    });

    it("存在しないプリセットをアクティブに設定するとエラーをスローする", async () => {
      await expect(
        settingsService.setActivePreset("non-existent-id"),
      ).rejects.toThrow("Preset not found");
    });
  });

  // ==================== selectPresetByIndex ====================
  describe("selectPresetByIndex", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({
        name: "settings-select-by-index-test",
      });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      settingsService = serviceManager.getSettingsService()!;
    });

    it("フォーマッタが無効の場合にnullを返す", async () => {
      const config = await settingsService.getFormatterConfig();
      await settingsService.setFormatterConfig({
        ...config!,
        enabled: false,
      });

      const result = await settingsService.selectPresetByIndex(0);
      expect(result).toBeNull();
    });

    it("インデックスが範囲外の場合にnullを返す", async () => {
      const config = await settingsService.getFormatterConfig();
      await settingsService.setFormatterConfig({
        ...config!,
        enabled: true,
      });

      // Use an index beyond the number of presets
      const presetsCount = config!.presets?.length ?? 0;
      const result = await settingsService.selectPresetByIndex(presetsCount + 10);
      expect(result).toBeNull();
    });

    it("フォーマッタが有効な場合にインデックスでプリセットを選択する", async () => {
      const config = await settingsService.getFormatterConfig();
      await settingsService.setFormatterConfig({
        ...config!,
        enabled: true,
      });

      const expectedPreset = config!.presets![0];
      const result = await settingsService.selectPresetByIndex(0);
      expect(result).toBeDefined();
      expect(result!.id).toBe(expectedPreset.id);
      expect(result!.name).toBe(expectedPreset.name);
    });
  });
});
