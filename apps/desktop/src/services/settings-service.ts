import { app, safeStorage } from "electron";
import { EventEmitter } from "events";
import { FormatterConfig, FormatPreset } from "../types/formatter";
import {
  getSettingsSection,
  updateSettingsSection,
  getAppSettings,
  updateAppSettings,
  getDefaultShortcuts,
  generateDefaultPresets,
} from "../db/app-settings";
import type { AppSettingsData } from "../db/schema";

/**
 * Database-backed settings service with typed configuration
 */
export interface ShortcutsConfig {
  pushToTalk: string[];
  toggleRecording: string[];
  pasteLastTranscription: string[];
  cancelRecording: string[];
  selectPreset1: string[];
  selectPreset2: string[];
  selectPreset3: string[];
  selectPreset4: string[];
  selectPreset5: string[];
}

export interface AppPreferences {
  launchAtLogin: boolean;
  minimizeToTray: boolean;
  soundEnabled: boolean;
}

export class SettingsService extends EventEmitter {
  constructor() {
    super();
  }

  /**
   * Get formatter configuration
   */
  async getFormatterConfig(): Promise<FormatterConfig | null> {
    const formatterConfig = await getSettingsSection("formatterConfig");
    if (!formatterConfig) return null;

    // プリセットが消失している場合はデフォルトを復元
    if (!formatterConfig.presets || formatterConfig.presets.length === 0) {
      const defaultPresets = generateDefaultPresets();
      const recovered: FormatterConfig = {
        ...formatterConfig,
        presets: defaultPresets as FormatterConfig["presets"],
        activePresetId:
          formatterConfig.activePresetId ?? defaultPresets[0]?.id ?? null,
      };
      await updateSettingsSection("formatterConfig", recovered);
      return recovered;
    }

    return formatterConfig;
  }

  /**
   * Set formatter configuration
   */
  async setFormatterConfig(config: FormatterConfig): Promise<void> {
    // 有効化時にactivePresetIdが未設定なら最初のプリセットを自動選択
    if (config.enabled && !config.activePresetId && config.presets?.length) {
      config = { ...config, activePresetId: config.presets[0].id };
    }
    await updateSettingsSection("formatterConfig", config);
  }

  /**
   * Get all app settings
   */
  async getAllSettings(): Promise<AppSettingsData> {
    return await getAppSettings();
  }

  /**
   * Update multiple settings at once
   */
  async updateSettings(
    settings: Partial<AppSettingsData>,
  ): Promise<AppSettingsData> {
    return await updateAppSettings(settings);
  }

  /**
   * Get UI settings
   */
  async getUISettings(): Promise<AppSettingsData["ui"]> {
    return (
      (await getSettingsSection("ui")) ?? {
        theme: "system",
      }
    );
  }

  /**
   * Update UI settings
   */
  async setUISettings(uiSettings: AppSettingsData["ui"]): Promise<void> {
    await updateSettingsSection("ui", uiSettings);

    // Emit event if theme changed (AppManager will handle window updates)
    if (uiSettings?.theme !== undefined) {
      this.emit("theme-changed", { theme: uiSettings.theme });
    }
  }

  /**
   * Get transcription settings
   */
  async getTranscriptionSettings(): Promise<AppSettingsData["transcription"]> {
    return await getSettingsSection("transcription");
  }

  /**
   * Update transcription settings
   */
  async setTranscriptionSettings(
    transcriptionSettings: AppSettingsData["transcription"],
  ): Promise<void> {
    await updateSettingsSection("transcription", transcriptionSettings);
  }

  /**
   * Get recording settings
   */
  async getRecordingSettings(): Promise<AppSettingsData["recording"]> {
    return await getSettingsSection("recording");
  }

  /**
   * Update recording settings
   */
  async setRecordingSettings(
    recordingSettings: AppSettingsData["recording"],
  ): Promise<void> {
    await updateSettingsSection("recording", recordingSettings);
  }

  /**
   * Get dictation settings
   */
  async getDictationSettings(): Promise<AppSettingsData["dictation"]> {
    return await getSettingsSection("dictation");
  }

  /**
   * Update dictation settings
   */
  async setDictationSettings(
    dictationSettings: AppSettingsData["dictation"],
  ): Promise<void> {
    await updateSettingsSection("dictation", dictationSettings);
  }

  /**
   * Get shortcuts configuration
   * Defaults are handled by app-settings.ts during initialization/migration
   */
  async getShortcuts(): Promise<ShortcutsConfig> {
    const shortcuts = await getSettingsSection("shortcuts");
    const defaults = getDefaultShortcuts();

    return {
      pushToTalk: shortcuts?.pushToTalk ?? defaults.pushToTalk ?? [],
      toggleRecording:
        shortcuts?.toggleRecording ?? defaults.toggleRecording ?? [],
      pasteLastTranscription: shortcuts?.pasteLastTranscription ?? [
        "Alt",
        "Cmd",
        "V",
      ],
      cancelRecording: shortcuts?.cancelRecording ??
        defaults.cancelRecording ?? ["Escape"],
      selectPreset1: shortcuts?.selectPreset1 ?? defaults.selectPreset1 ?? [],
      selectPreset2: shortcuts?.selectPreset2 ?? defaults.selectPreset2 ?? [],
      selectPreset3: shortcuts?.selectPreset3 ?? defaults.selectPreset3 ?? [],
      selectPreset4: shortcuts?.selectPreset4 ?? defaults.selectPreset4 ?? [],
      selectPreset5: shortcuts?.selectPreset5 ?? defaults.selectPreset5 ?? [],
    };
  }

  /**
   * Update shortcuts configuration
   */
  async setShortcuts(shortcuts: ShortcutsConfig): Promise<void> {
    // Store empty arrays as undefined to clear shortcuts
    const dataToStore = {
      pushToTalk: shortcuts.pushToTalk?.length
        ? shortcuts.pushToTalk
        : undefined,
      toggleRecording: shortcuts.toggleRecording?.length
        ? shortcuts.toggleRecording
        : undefined,
      pasteLastTranscription: shortcuts.pasteLastTranscription?.length
        ? shortcuts.pasteLastTranscription
        : undefined,
      cancelRecording: shortcuts.cancelRecording?.length
        ? shortcuts.cancelRecording
        : undefined,
      selectPreset1: shortcuts.selectPreset1?.length
        ? shortcuts.selectPreset1
        : undefined,
      selectPreset2: shortcuts.selectPreset2?.length
        ? shortcuts.selectPreset2
        : undefined,
      selectPreset3: shortcuts.selectPreset3?.length
        ? shortcuts.selectPreset3
        : undefined,
      selectPreset4: shortcuts.selectPreset4?.length
        ? shortcuts.selectPreset4
        : undefined,
      selectPreset5: shortcuts.selectPreset5?.length
        ? shortcuts.selectPreset5
        : undefined,
    };
    await updateSettingsSection("shortcuts", dataToStore);
  }

  /**
   * Get model providers configuration
   */
  async getModelProvidersConfig(): Promise<
    AppSettingsData["modelProvidersConfig"]
  > {
    return await getSettingsSection("modelProvidersConfig");
  }

  /**
   * Update model providers configuration
   */
  async setModelProvidersConfig(
    config: AppSettingsData["modelProvidersConfig"],
  ): Promise<void> {
    await updateSettingsSection("modelProvidersConfig", config);
  }

  private static readonly ENCRYPTED_PREFIX = "enc:v1:";

  private encryptApiKey(plainText: string): string {
    if (!plainText || plainText.startsWith(SettingsService.ENCRYPTED_PREFIX)) {
      return plainText;
    }
    if (!safeStorage.isEncryptionAvailable()) {
      return plainText;
    }
    try {
      const encrypted = safeStorage.encryptString(plainText);
      return SettingsService.ENCRYPTED_PREFIX + encrypted.toString("base64");
    } catch (e) {
      console.error(
        "[SettingsService] Failed to encrypt API key, storing as plaintext",
        e,
      );
      return plainText;
    }
  }

  private decryptApiKey(stored: string): string {
    if (!stored || !stored.startsWith(SettingsService.ENCRYPTED_PREFIX)) {
      return stored;
    }
    try {
      const base64 = stored.slice(SettingsService.ENCRYPTED_PREFIX.length);
      const buffer = Buffer.from(base64, "base64");
      return safeStorage.decryptString(buffer);
    } catch (e) {
      console.error(
        "[SettingsService] Failed to decrypt API key, returning empty string. User will need to re-enter the key.",
        e,
      );
      return "";
    }
  }

  /**
   * Get OpenAI configuration
   */
  async getOpenAIConfig(): Promise<{ apiKey: string } | undefined> {
    const config = await this.getModelProvidersConfig();
    if (!config?.openai) return undefined;

    const storedKey = config.openai.apiKey;
    const decryptedKey = this.decryptApiKey(storedKey);

    // 復号失敗（暗号化済みの値があるのに復号結果が空）→ 破損値をクリア
    if (!decryptedKey && storedKey?.startsWith(SettingsService.ENCRYPTED_PREFIX)) {
      console.error(
        "[SettingsService] Clearing corrupted encrypted API key from DB",
      );
      await this.setModelProvidersConfig({
        ...config,
        openai: { ...config.openai, apiKey: "" },
      });
      return { ...config.openai, apiKey: "" };
    }

    return { ...config.openai, apiKey: decryptedKey };
  }

  /**
   * Update OpenAI configuration
   */
  async setOpenAIConfig(config: { apiKey: string }): Promise<void> {
    const currentConfig = await this.getModelProvidersConfig();
    await this.setModelProvidersConfig({
      ...currentConfig,
      openai: {
        ...config,
        apiKey: this.encryptApiKey(config.apiKey),
      },
    });
    this.emit("api-key-changed");
  }

  /**
   * Get default speech model (Whisper)
   */
  async getDefaultSpeechModel(): Promise<string | undefined> {
    const config = await this.getModelProvidersConfig();
    return config?.defaultSpeechModel;
  }

  /**
   * Set default speech model (Whisper)
   */
  async setDefaultSpeechModel(modelId: string | undefined): Promise<void> {
    const currentConfig = await this.getModelProvidersConfig();
    await this.setModelProvidersConfig({
      ...currentConfig,
      defaultSpeechModel: modelId,
    });
  }

  /**
   * Get default language model
   */
  async getDefaultLanguageModel(): Promise<string | undefined> {
    const config = await this.getModelProvidersConfig();
    return config?.defaultLanguageModel;
  }

  /**
   * Set default language model
   */
  async setDefaultLanguageModel(modelId: string | undefined): Promise<void> {
    const currentConfig = await this.getModelProvidersConfig();
    await this.setModelProvidersConfig({
      ...currentConfig,
      defaultLanguageModel: modelId,
    });
  }

  /**
   * Get app preferences (launch at login, minimize to tray, etc.)
   */
  async getPreferences(): Promise<AppPreferences> {
    const preferences = await getSettingsSection("preferences");
    return {
      launchAtLogin: preferences?.launchAtLogin ?? true,
      minimizeToTray: preferences?.minimizeToTray ?? true,
      soundEnabled: preferences?.soundEnabled ?? true,
    };
  }

  /**
   * Set app preferences and handle side effects
   */
  async setPreferences(preferences: Partial<AppPreferences>): Promise<void> {
    const currentPreferences = await this.getPreferences();
    const newPreferences = { ...currentPreferences, ...preferences };

    // Save to database
    await updateSettingsSection("preferences", newPreferences);

    // Handle launch at login change
    if (
      preferences.launchAtLogin !== undefined &&
      preferences.launchAtLogin !== currentPreferences.launchAtLogin
    ) {
      this.syncAutoLaunch();
    }

    // Emit event for listeners
    this.emit("preferences-changed", {
      changes: preferences,
    });
  }

  /**
   * Sync the auto-launch setting with the OS
   * This ensures the OS setting matches our stored preference
   */
  syncAutoLaunch(): void {
    // Get the current preference asynchronously and apply it
    this.getPreferences().then((preferences) => {
      app.setLoginItemSettings({
        openAtLogin: preferences.launchAtLogin,
        openAsHidden: false,
      });
    });
  }

  /**
   * Get telemetry settings
   */
  async getTelemetrySettings(): Promise<AppSettingsData["telemetry"]> {
    const telemetry = await getSettingsSection("telemetry");
    return telemetry ?? { enabled: true }; // Default to enabled
  }

  /**
   * Update telemetry settings
   */
  async setTelemetrySettings(
    telemetrySettings: AppSettingsData["telemetry"],
  ): Promise<void> {
    await updateSettingsSection("telemetry", telemetrySettings);
  }

  // ==================== Format Preset Methods ====================

  /**
   * Create a new format preset (max 5 presets allowed)
   */
  async createFormatPreset(
    preset: Omit<FormatPreset, "id" | "createdAt" | "updatedAt">,
  ): Promise<FormatPreset> {
    const config = await this.getFormatterConfig();
    const presets = config?.presets ?? [];

    if (presets.length >= 5) {
      throw new Error("Maximum number of presets (5) reached");
    }

    if (preset.name.length > 20) {
      throw new Error("Preset name must be 20 characters or less");
    }

    if (preset.instructions.length > 1000) {
      throw new Error("Instructions must be 1000 characters or less");
    }

    const now = new Date().toISOString();
    const newPreset: FormatPreset = {
      ...preset,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const updatedPresets = [...presets, newPreset];
    await this.setFormatterConfig({
      ...config,
      enabled: config?.enabled ?? false,
      presets: updatedPresets,
    });

    // Emit event for cross-window sync
    this.emit("presets-updated");

    return newPreset;
  }

  /**
   * Update an existing format preset
   */
  async updateFormatPreset(
    id: string,
    updates: Partial<Omit<FormatPreset, "id" | "createdAt" | "updatedAt">>,
  ): Promise<FormatPreset> {
    const config = await this.getFormatterConfig();
    const presets = config?.presets ?? [];

    const presetIndex = presets.findIndex((p) => p.id === id);
    if (presetIndex === -1) {
      throw new Error("Preset not found");
    }

    if (updates.name !== undefined && updates.name.length > 20) {
      throw new Error("Preset name must be 20 characters or less");
    }

    if (
      updates.instructions !== undefined &&
      updates.instructions.length > 1000
    ) {
      throw new Error("Instructions must be 1000 characters or less");
    }

    const updatedPreset: FormatPreset = {
      ...presets[presetIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedPresets = [...presets];
    updatedPresets[presetIndex] = updatedPreset;

    await this.setFormatterConfig({
      ...config,
      enabled: config?.enabled ?? false,
      presets: updatedPresets,
    });

    // Emit event for cross-window sync
    this.emit("presets-updated");

    // If the updated preset is the active one, also emit active-preset-changed
    if (config?.activePresetId === id) {
      this.emit("active-preset-changed", {
        presetId: id,
        presetName: updatedPreset.name,
      });
    }

    return updatedPreset;
  }

  /**
   * Delete a format preset
   */
  async deleteFormatPreset(id: string): Promise<void> {
    const config = await this.getFormatterConfig();
    const presets = config?.presets ?? [];

    const updatedPresets = presets.filter((p) => p.id !== id);

    // If the deleted preset was active, clear activePresetId
    const activePresetId =
      config?.activePresetId === id ? null : config?.activePresetId;

    await this.setFormatterConfig({
      ...config,
      enabled: config?.enabled ?? false,
      presets: updatedPresets,
      activePresetId,
    });

    // Emit event for cross-window sync
    this.emit("presets-updated");
  }

  /**
   * Reset all presets to default
   */
  async resetAllPresetsToDefault(): Promise<FormatPreset[]> {
    const config = await this.getFormatterConfig();
    const defaultPresets = generateDefaultPresets();

    await this.setFormatterConfig({
      ...config,
      enabled: config?.enabled ?? false,
      presets: defaultPresets,
      activePresetId: defaultPresets[0]?.id ?? null,
    });

    // Emit event for cross-window sync
    this.emit("presets-updated");

    return defaultPresets as FormatPreset[];
  }

  /**
   * Set the active preset
   */
  async setActivePreset(presetId: string | null): Promise<void> {
    const config = await this.getFormatterConfig();
    const presets = config?.presets ?? [];

    // If setting a preset, verify it exists
    if (presetId !== null) {
      const exists = presets.some((p) => p.id === presetId);
      if (!exists) {
        throw new Error("Preset not found");
      }
    }

    await this.setFormatterConfig({
      ...config,
      enabled: config?.enabled ?? false,
      activePresetId: presetId,
    });

    // Emit event for cross-window synchronization
    const selectedPreset = presetId
      ? presets.find((p) => p.id === presetId)
      : null;
    this.emit("active-preset-changed", {
      presetId,
      presetName: selectedPreset?.name ?? null,
    });
  }

  /**
   * Get the currently active preset
   */
  async getActivePreset(): Promise<FormatPreset | null> {
    const config = await this.getFormatterConfig();
    if (!config?.activePresetId) {
      return null;
    }

    const presets = config.presets ?? [];
    return presets.find((p) => p.id === config.activePresetId) ?? null;
  }

  /**
   * Select a preset by index (0-4)
   * Returns the selected preset, or null if index is out of range or formatter is disabled
   */
  async selectPresetByIndex(index: number): Promise<FormatPreset | null> {
    const config = await this.getFormatterConfig();

    // Return null if formatter is disabled
    if (!config?.enabled) {
      return null;
    }

    const presets = config.presets ?? [];

    // Return null if index is out of range
    if (index < 0 || index >= presets.length) {
      return null;
    }

    const preset = presets[index];
    await this.setActivePreset(preset.id);

    return preset;
  }

  // ==================== Pipeline Settings Methods ====================

  /**
   * Pipeline settings for provider selection and configuration
   */
  async getPipelineSettings(): Promise<{
    transcriptionProviderId?: string;
    formattingProviderId?: string;
  } | null> {
    // Future: Read from database settings
    // For now, return null to use defaults (openai-whisper)
    return null;
  }
}
