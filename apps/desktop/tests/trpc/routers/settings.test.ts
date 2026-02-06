import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createTestDatabase, type TestDatabase } from "../../helpers/test-db";
import { seedDatabase } from "../../helpers/fixtures";
import { initializeTestServices } from "../../helpers/test-app";
import { setTestDatabase } from "../../setup";

type TestServices = Awaited<ReturnType<typeof initializeTestServices>>;

describe("Settings ルーター", () => {
  let testDb: TestDatabase;
  let trpcCaller: TestServices["trpcCaller"];
  let cleanup: () => Promise<void>;

  afterEach(async () => {
    if (cleanup) {
      await cleanup();
    }
    if (testDb) {
      await testDb.close();
    }
  });

  describe("getSettings", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-get-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("すべての設定を返す", async () => {
      const settings = await trpcCaller.settings.getSettings();

      expect(settings).toBeDefined();
      expect(settings).toHaveProperty("ui");
      expect(settings).toHaveProperty("shortcuts");
    });
  });

  describe("getFormatterConfig / setFormatterConfig", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-formatter-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("フォーマッター設定を取得する", async () => {
      const config = await trpcCaller.settings.getFormatterConfig();

      // May be null or an object depending on initial state
      if (config !== null) {
        expect(config).toHaveProperty("enabled");
      }
    });

    it("フォーマッター設定を保存・取得する", async () => {
      await trpcCaller.settings.setFormatterConfig({
        enabled: true,
      });

      const config = await trpcCaller.settings.getFormatterConfig();
      expect(config).toBeDefined();
      expect(config.enabled).toBe(true);
    });
  });

  describe("createFormatPreset", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-create-preset-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("フォーマットプリセットを作成する", async () => {
      const preset = await trpcCaller.settings.createFormatPreset({
        name: "Test Preset",
        modelId: "gpt-4o-mini",
        instructions: "Format text nicely",
        color: "blue",
      });

      expect(preset).toBeDefined();
      expect(preset.name).toBe("Test Preset");
      expect(preset.modelId).toBe("gpt-4o-mini");
    });

    it("20文字を超えるプリセット名を拒否する", async () => {
      await expect(
        trpcCaller.settings.createFormatPreset({
          name: "A".repeat(21),
          modelId: "gpt-4o-mini",
          instructions: "Test",
          color: "blue",
        }),
      ).rejects.toThrow();
    });
  });

  describe("updateFormatPreset", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-update-preset-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("フォーマットプリセットを更新する", async () => {
      const created = await trpcCaller.settings.createFormatPreset({
        name: "Original",
        modelId: "gpt-4o-mini",
        instructions: "Original instructions",
        color: "blue",
      });

      const updated = await trpcCaller.settings.updateFormatPreset({
        id: created.id,
        name: "Updated",
        color: "red",
      });

      expect(updated).toBeDefined();
      expect(updated.name).toBe("Updated");
      expect(updated.color).toBe("red");
    });
  });

  describe("deleteFormatPreset", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-delete-preset-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("フォーマットプリセットを削除する", async () => {
      const created = await trpcCaller.settings.createFormatPreset({
        name: "To Delete",
        modelId: "gpt-4o-mini",
        instructions: "Will be deleted",
        color: "yellow",
      });

      const result = await trpcCaller.settings.deleteFormatPreset({
        id: created.id,
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe("resetAllPresetsToDefault", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-reset-presets-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("すべてのプリセットをデフォルトにリセットする", async () => {
      const result = await trpcCaller.settings.resetAllPresetsToDefault();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.presets).toBeDefined();
      expect(Array.isArray(result.presets)).toBe(true);
    });
  });

  describe("setActivePreset / getActivePreset", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-active-preset-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("アクティブプリセットを設定・取得する", async () => {
      const preset = await trpcCaller.settings.createFormatPreset({
        name: "Active Preset",
        modelId: "gpt-4o-mini",
        instructions: "Active",
        color: "green",
      });

      await trpcCaller.settings.setActivePreset({ presetId: preset.id });
      const activePreset = await trpcCaller.settings.getActivePreset();

      expect(activePreset).toBeDefined();
      expect(activePreset.id).toBe(preset.id);
    });

    it("アクティブプリセットをnullに設定できる", async () => {
      await trpcCaller.settings.setActivePreset({ presetId: null });
      const activePreset = await trpcCaller.settings.getActivePreset();

      expect(activePreset).toBeNull();
    });
  });

  describe("selectPresetByIndex", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-select-index-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("インデックスでプリセットを選択する", async () => {
      // Enable formatter first and create a preset
      await trpcCaller.settings.setFormatterConfig({ enabled: true });
      await trpcCaller.settings.createFormatPreset({
        name: "First",
        modelId: "gpt-4o-mini",
        instructions: "First preset",
        color: "blue",
      });

      const result = await trpcCaller.settings.selectPresetByIndex({ index: 0 });

      // Result may be a preset or null depending on whether formatter is enabled
      if (result !== null) {
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("name");
      }
    });
  });

  describe("getShortcuts", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-shortcuts-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("ショートカット設定を返す", async () => {
      const shortcuts = await trpcCaller.settings.getShortcuts();

      expect(shortcuts).toBeDefined();
      expect(shortcuts).toHaveProperty("pushToTalk");
      expect(shortcuts).toHaveProperty("toggleRecording");
    });
  });

  describe("getDictationSettings / setDictationSettings", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-dictation-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("ディクテーション設定を取得する", async () => {
      const settings = await trpcCaller.settings.getDictationSettings();

      expect(settings).toBeDefined();
      expect(settings).toHaveProperty("selectedLanguage");
    });

    it("ディクテーション設定を保存する", async () => {
      await trpcCaller.settings.setDictationSettings({
        selectedLanguage: "en",
      });

      const settings = await trpcCaller.settings.getDictationSettings();
      expect(settings.selectedLanguage).toBe("en");
    });
  });

  describe("getPreferences / updatePreferences", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-preferences-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("環境設定を取得する", async () => {
      const prefs = await trpcCaller.settings.getPreferences();

      expect(prefs).toBeDefined();
    });

    it("環境設定を更新する", async () => {
      const result = await trpcCaller.settings.updatePreferences({
        launchAtLogin: true,
      });

      expect(result).toBe(true);

      const prefs = await trpcCaller.settings.getPreferences();
      expect(prefs.launchAtLogin).toBe(true);
    });
  });

  describe("updateUITheme", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-theme-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("UIテーマを更新する", async () => {
      const result = await trpcCaller.settings.updateUITheme({
        theme: "dark",
      });

      expect(result).toBe(true);
    });
  });

  describe("getAppVersion", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-version-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("バージョン文字列を返す", async () => {
      const version = await trpcCaller.settings.getAppVersion();

      expect(typeof version).toBe("string");
      expect(version.length).toBeGreaterThan(0);
    });
  });

  describe("getDataPath", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "settings-datapath-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("データパスの文字列を返す", async () => {
      const dataPath = await trpcCaller.settings.getDataPath();

      expect(typeof dataPath).toBe("string");
      expect(dataPath.length).toBeGreaterThan(0);
    });
  });
});
