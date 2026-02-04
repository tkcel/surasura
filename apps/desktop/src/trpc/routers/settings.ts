import { observable } from "@trpc/server/observable";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { app, shell } from "electron";
import path from "node:path";
import { createRouter, procedure } from "../trpc";
import { dbPath, closeDatabase } from "../../db";
import { getDefaultShortcuts } from "../../db/app-settings";
import * as fs from "fs/promises";

// FormatPreset schema
const FormatPresetSchema = z.object({
  id: z.string(),
  name: z.string().max(20),
  modelId: z.enum(["gpt-4.1-nano", "gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1", "gpt-4o"]),
  instructions: z.string().max(2000),
  isDefault: z.boolean(),
  color: z.enum(["yellow", "blue", "green", "red", "purple", "orange"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// FormatterConfig schema
const FormatterConfigSchema = z.object({
  enabled: z.boolean(),
  modelId: z.string().optional(),
  fallbackModelId: z.string().optional(),
  presets: z.array(FormatPresetSchema).max(5).optional(),
  activePresetId: z.string().nullable().optional(),
});

// Create preset input schema
const CreateFormatPresetSchema = z.object({
  name: z.string().min(1).max(20),
  type: z.enum(["formatting", "answering"]).default("formatting"),
  modelId: z.enum(["gpt-4.1-nano", "gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1", "gpt-4o"]),
  instructions: z.string().max(2000),
  isDefault: z.boolean().default(false),
  color: z.enum(["yellow", "blue", "green", "red", "purple", "orange"]).default("yellow"),
});

// Update preset input schema
const UpdateFormatPresetSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(20).optional(),
  type: z.enum(["formatting", "answering"]).optional(),
  modelId: z.enum(["gpt-4.1-nano", "gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1", "gpt-4o"]).optional(),
  instructions: z.string().max(2000).optional(),
  isDefault: z.boolean().optional(),
  color: z.enum(["yellow", "blue", "green", "red", "purple", "orange"]).optional(),
});

// Shortcut schema (array of key names)
const SetShortcutSchema = z.object({
  type: z.enum([
    "pushToTalk",
    "toggleRecording",
    "pasteLastTranscription",
    "cancelRecording",
    "selectPreset1",
    "selectPreset2",
    "selectPreset3",
    "selectPreset4",
    "selectPreset5",
  ]),
  shortcut: z.array(z.string()),
});

// Model providers schemas
const OpenAIConfigSchema = z.object({
  apiKey: z.string(),
});

const ModelProvidersConfigSchema = z.object({
  openai: OpenAIConfigSchema.optional(),
});

const DictationSettingsSchema = z.object({
  selectedLanguage: z.string().min(1),
});

const AppPreferencesSchema = z.object({
  launchAtLogin: z.boolean().optional(),
  minimizeToTray: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
});

const UIThemeSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
});

export const settingsRouter = createRouter({
  // Get all settings
  getSettings: procedure.query(async ({ ctx }) => {
    try {
      const settingsService = ctx.serviceManager.getService("settingsService");
      if (!settingsService) {
        throw new Error("SettingsService not available");
      }
      return await settingsService.getAllSettings();
    } catch (error) {
      const logger = ctx.serviceManager.getLogger();
      if (logger) {
        logger.main.error("Error getting settings:", error);
      }
      return {};
    }
  }),

  // Update transcription settings
  updateTranscriptionSettings: procedure
    .input(
      z.object({
        language: z.string().optional(),
        autoTranscribe: z.boolean().optional(),
        confidenceThreshold: z.number().optional(),
        enablePunctuation: z.boolean().optional(),
        enableTimestamps: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const settingsService =
          ctx.serviceManager.getService("settingsService");
        if (!settingsService) {
          throw new Error("SettingsService not available");
        }

        const currentSettings =
          await settingsService.getTranscriptionSettings();

        // Merge with existing settings to provide all required fields
        const mergedSettings = {
          language: "en",
          autoTranscribe: true,
          confidenceThreshold: 0.5,
          enablePunctuation: true,
          enableTimestamps: false,
          ...currentSettings,
          ...input,
        };

        await settingsService.setTranscriptionSettings(mergedSettings);

        return true;
      } catch (error) {
        const logger = ctx.serviceManager.getLogger();
        if (logger) {
          logger.main.error("Error updating transcription settings:", error);
        }
        throw error;
      }
    }),

  // Get formatter configuration
  getFormatterConfig: procedure.query(async ({ ctx }) => {
    try {
      const settingsService = ctx.serviceManager.getService("settingsService");
      if (!settingsService) {
        throw new Error("SettingsService not available");
      }
      return await settingsService.getFormatterConfig();
    } catch (error) {
      const logger = ctx.serviceManager.getLogger();
      if (logger) {
        logger.transcription.error("Error getting formatter config:", error);
      }
      return null;
    }
  }),

  // Set formatter configuration
  setFormatterConfig: procedure
    .input(FormatterConfigSchema)
    .mutation(async ({ input, ctx }) => {
      const settingsService = ctx.serviceManager.getService("settingsService");
      await settingsService.setFormatterConfig(input);
      return true;
    }),

  // Create format preset
  createFormatPreset: procedure
    .input(CreateFormatPresetSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const settingsService =
          ctx.serviceManager.getService("settingsService");
        if (!settingsService) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "SettingsService not available",
          });
        }

        const preset = await settingsService.createFormatPreset(input);

        const logger = ctx.serviceManager.getLogger();
        logger?.main.info("Format preset created", { presetId: preset.id });

        return preset;
      } catch (error) {
        const logger = ctx.serviceManager.getLogger();
        logger?.main.error("Error creating format preset:", error);

        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        throw error;
      }
    }),

  // Update format preset
  updateFormatPreset: procedure
    .input(UpdateFormatPresetSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const settingsService =
          ctx.serviceManager.getService("settingsService");
        if (!settingsService) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "SettingsService not available",
          });
        }

        const { id, ...updates } = input;
        const preset = await settingsService.updateFormatPreset(id, updates);

        const logger = ctx.serviceManager.getLogger();
        logger?.main.info("Format preset updated", { presetId: preset.id });

        return preset;
      } catch (error) {
        const logger = ctx.serviceManager.getLogger();
        logger?.main.error("Error updating format preset:", error);

        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        throw error;
      }
    }),

  // Delete format preset
  deleteFormatPreset: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const settingsService =
          ctx.serviceManager.getService("settingsService");
        if (!settingsService) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "SettingsService not available",
          });
        }

        await settingsService.deleteFormatPreset(input.id);

        const logger = ctx.serviceManager.getLogger();
        logger?.main.info("Format preset deleted", { presetId: input.id });

        return { success: true };
      } catch (error) {
        const logger = ctx.serviceManager.getLogger();
        logger?.main.error("Error deleting format preset:", error);

        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        throw error;
      }
    }),

  // Reset all presets to default
  resetAllPresetsToDefault: procedure
    .mutation(async ({ ctx }) => {
      try {
        const settingsService =
          ctx.serviceManager.getService("settingsService");
        if (!settingsService) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "SettingsService not available",
          });
        }

        const presets = await settingsService.resetAllPresetsToDefault();

        const logger = ctx.serviceManager.getLogger();
        logger?.main.info("All format presets reset to default", {
          presetCount: presets.length,
        });

        return { success: true, presets };
      } catch (error) {
        const logger = ctx.serviceManager.getLogger();
        logger?.main.error("Error resetting format presets:", error);

        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }
        throw error;
      }
    }),

  // Set active preset
  setActivePreset: procedure
    .input(z.object({ presetId: z.string().nullable() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const settingsService =
          ctx.serviceManager.getService("settingsService");
        if (!settingsService) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "SettingsService not available",
          });
        }

        await settingsService.setActivePreset(input.presetId);

        const logger = ctx.serviceManager.getLogger();
        logger?.main.info("Active preset changed", {
          presetId: input.presetId,
        });

        return { success: true };
      } catch (error) {
        const logger = ctx.serviceManager.getLogger();
        logger?.main.error("Error setting active preset:", error);

        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        throw error;
      }
    }),

  // Get active preset
  getActivePreset: procedure.query(async ({ ctx }) => {
    try {
      const settingsService = ctx.serviceManager.getService("settingsService");
      if (!settingsService) {
        throw new Error("SettingsService not available");
      }
      return await settingsService.getActivePreset();
    } catch (error) {
      const logger = ctx.serviceManager.getLogger();
      logger?.main.error("Error getting active preset:", error);
      return null;
    }
  }),

  // Select preset by index (0-4)
  selectPresetByIndex: procedure
    .input(z.object({ index: z.number().min(0).max(4) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const settingsService =
          ctx.serviceManager.getService("settingsService");
        if (!settingsService) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "SettingsService not available",
          });
        }

        const preset = await settingsService.selectPresetByIndex(input.index);

        const logger = ctx.serviceManager.getLogger();
        if (preset) {
          logger?.main.info("Preset selected by index", {
            index: input.index,
            presetId: preset.id,
            presetName: preset.name,
          });
        } else {
          logger?.main.info("Preset selection by index skipped", {
            index: input.index,
            reason: "Index out of range or formatter disabled",
          });
        }

        return preset;
      } catch (error) {
        const logger = ctx.serviceManager.getLogger();
        logger?.main.error("Error selecting preset by index:", error);

        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        throw error;
      }
    }),
  // Get shortcuts configuration
  getShortcuts: procedure.query(async ({ ctx }) => {
    const settingsService = ctx.serviceManager.getService("settingsService");
    if (!settingsService) {
      throw new Error("SettingsService not available");
    }
    return await settingsService.getShortcuts();
  }),
  // Set individual shortcut
  setShortcut: procedure
    .input(SetShortcutSchema)
    .mutation(async ({ input, ctx }) => {
      const shortcutManager = ctx.serviceManager.getService("shortcutManager");
      if (!shortcutManager) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "ShortcutManager not available",
        });
      }

      const result = await shortcutManager.setShortcut(
        input.type,
        input.shortcut,
      );

      if (!result.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error || "Invalid shortcut",
        });
      }

      return { success: true, warning: result.warning };
    }),

  // Get default shortcuts for current platform
  getDefaultShortcuts: procedure.query(() => {
    return getDefaultShortcuts();
  }),

  // Reset all shortcuts to default
  resetShortcuts: procedure.mutation(async ({ ctx }) => {
    const shortcutManager = ctx.serviceManager.getService("shortcutManager");
    if (!shortcutManager) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "ShortcutManager not available",
      });
    }

    const defaults = getDefaultShortcuts();

    // Reset each shortcut type to default
    await shortcutManager.setShortcut("pushToTalk", defaults.pushToTalk);
    await shortcutManager.setShortcut(
      "toggleRecording",
      defaults.toggleRecording,
    );
    await shortcutManager.setShortcut(
      "cancelRecording",
      defaults.cancelRecording,
    );
    await shortcutManager.setShortcut("pasteLastTranscription", []);
    await shortcutManager.setShortcut("selectPreset1", defaults.selectPreset1);
    await shortcutManager.setShortcut("selectPreset2", defaults.selectPreset2);
    await shortcutManager.setShortcut("selectPreset3", defaults.selectPreset3);
    await shortcutManager.setShortcut("selectPreset4", defaults.selectPreset4);
    await shortcutManager.setShortcut("selectPreset5", defaults.selectPreset5);

    const logger = ctx.serviceManager.getLogger();
    logger?.main.info("Shortcuts reset to defaults");

    return { success: true };
  }),

  // Set shortcut recording state
  setShortcutRecordingState: procedure
    .input(z.boolean())
    .mutation(async ({ input, ctx }) => {
      try {
        const shortcutManager =
          ctx.serviceManager.getService("shortcutManager");
        if (!shortcutManager) {
          throw new Error("ShortcutManager not available");
        }

        shortcutManager.setIsRecordingShortcut(input);

        const logger = ctx.serviceManager.getLogger();
        if (logger) {
          logger.main.info("Shortcut recording state updated", {
            isRecording: input,
          });
        }

        return true;
      } catch (error) {
        const logger = ctx.serviceManager.getLogger();
        if (logger) {
          logger.main.error("Error setting shortcut recording state:", error);
        }
        throw error;
      }
    }),

  // Active keys subscription for shortcut recording
  activeKeysUpdates: procedure.subscription(({ ctx }) => {
    return observable<string[]>((emit) => {
      const shortcutManager = ctx.serviceManager.getService("shortcutManager");
      const logger = ctx.serviceManager.getLogger();

      if (!shortcutManager) {
        logger?.main.warn(
          "ShortcutManager not available for activeKeys subscription",
        );
        emit.next([]);
        return () => {};
      }

      // Emit initial state
      emit.next(shortcutManager.getActiveKeys());

      // Set up listener for changes
      const handleActiveKeysChanged = (keys: string[]) => {
        emit.next(keys);
      };

      shortcutManager.on("activeKeysChanged", handleActiveKeysChanged);

      // Cleanup function
      return () => {
        shortcutManager.off("activeKeysChanged", handleActiveKeysChanged);
      };
    });
  }),

  // Set preferred microphone
  setPreferredMicrophone: procedure
    .input(
      z.object({
        deviceName: z.string().nullable(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const settingsService =
          ctx.serviceManager.getService("settingsService");
        if (!settingsService) {
          throw new Error("SettingsService not available");
        }

        // Get current recording settings
        const currentSettings = await settingsService.getRecordingSettings();

        // Merge with new microphone preference
        const updatedSettings = {
          defaultFormat: "wav" as const,
          sampleRate: 16000 as const,
          autoStopSilence: false,
          silenceThreshold: 0.1,
          maxRecordingDuration: 300,
          ...currentSettings,
          preferredMicrophoneName: input.deviceName || undefined,
        };

        await settingsService.setRecordingSettings(updatedSettings);

        const logger = ctx.serviceManager.getLogger();
        if (logger) {
          logger.main.info("Preferred microphone updated:", input.deviceName);
        }

        return true;
      } catch (error) {
        const logger = ctx.serviceManager.getLogger();
        if (logger) {
          logger.main.error("Error setting preferred microphone:", error);
        }
        throw error;
      }
    }),

  // Get app version
  getAppVersion: procedure.query(() => {
    return app.getVersion();
  }),

  // Get dictation settings
  getDictationSettings: procedure.query(async ({ ctx }) => {
    try {
      const settingsService = ctx.serviceManager.getService("settingsService");
      if (!settingsService) {
        throw new Error("SettingsService not available");
      }

      const allSettings = await settingsService.getAllSettings();
      return (
        allSettings.dictation || {
          selectedLanguage: "ja",
        }
      );
    } catch (error) {
      const logger = ctx.serviceManager.getLogger();
      if (logger) {
        logger.main.error("Error getting dictation settings:", error);
      }
      return {
        selectedLanguage: "ja",
      };
    }
  }),

  // Set dictation settings
  setDictationSettings: procedure
    .input(DictationSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const settingsService =
          ctx.serviceManager.getService("settingsService");
        if (!settingsService) {
          throw new Error("SettingsService not available");
        }

        const dictationSettings = {
          selectedLanguage: input.selectedLanguage,
        };

        await settingsService.setDictationSettings(dictationSettings);

        const logger = ctx.serviceManager.getLogger();
        if (logger) {
          logger.main.info("Dictation settings updated:", dictationSettings);
        }

        return true;
      } catch (error) {
        const logger = ctx.serviceManager.getLogger();
        if (logger) {
          logger.main.error("Error setting dictation settings:", error);
        }
        throw error;
      }
    }),

  // Get model providers configuration
  getModelProvidersConfig: procedure.query(async ({ ctx }) => {
    try {
      const settingsService = ctx.serviceManager.getService("settingsService");
      if (!settingsService) {
        throw new Error("SettingsService not available");
      }
      return await settingsService.getModelProvidersConfig();
    } catch (error) {
      const logger = ctx.serviceManager.getLogger();
      if (logger) {
        logger.main.error("Error getting model providers config:", error);
      }
      return null;
    }
  }),

  // Set model providers configuration
  setModelProvidersConfig: procedure
    .input(ModelProvidersConfigSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const settingsService =
          ctx.serviceManager.getService("settingsService");
        if (!settingsService) {
          throw new Error("SettingsService not available");
        }
        await settingsService.setModelProvidersConfig(input);

        const logger = ctx.serviceManager.getLogger();
        if (logger) {
          logger.main.info("Model providers configuration updated");
        }

        return true;
      } catch (error) {
        const logger = ctx.serviceManager.getLogger();
        if (logger) {
          logger.main.error("Error setting model providers config:", error);
        }
        throw error;
      }
    }),

  // Set OpenAI configuration
  setOpenAIConfig: procedure
    .input(OpenAIConfigSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const settingsService =
          ctx.serviceManager.getService("settingsService");
        if (!settingsService) {
          throw new Error("SettingsService not available");
        }
        await settingsService.setOpenAIConfig(input);

        const logger = ctx.serviceManager.getLogger();
        if (logger) {
          logger.main.info("OpenAI configuration updated");
        }

        return true;
      } catch (error) {
        const logger = ctx.serviceManager.getLogger();
        if (logger) {
          logger.main.error("Error setting OpenAI config:", error);
        }
        throw error;
      }
    }),

  // Get OpenAI configuration
  getOpenAIConfig: procedure.query(async ({ ctx }) => {
    try {
      const settingsService = ctx.serviceManager.getService("settingsService");
      if (!settingsService) {
        throw new Error("SettingsService not available");
      }
      return await settingsService.getOpenAIConfig();
    } catch (error) {
      const logger = ctx.serviceManager.getLogger();
      if (logger) {
        logger.main.error("Error getting OpenAI config:", error);
      }
      return undefined;
    }
  }),

  // Get default speech model (Whisper)
  getDefaultSpeechModel: procedure.query(async ({ ctx }) => {
    try {
      const settingsService = ctx.serviceManager.getService("settingsService");
      if (!settingsService) {
        throw new Error("SettingsService not available");
      }
      return await settingsService.getDefaultSpeechModel();
    } catch (error) {
      const logger = ctx.serviceManager.getLogger();
      if (logger) {
        logger.main.error("Error getting default speech model:", error);
      }
      return undefined;
    }
  }),

  // Set default speech model (Whisper)
  setDefaultSpeechModel: procedure
    .input(z.object({ modelId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const settingsService =
          ctx.serviceManager.getService("settingsService");
        if (!settingsService) {
          throw new Error("SettingsService not available");
        }
        await settingsService.setDefaultSpeechModel(input.modelId);

        const logger = ctx.serviceManager.getLogger();
        if (logger) {
          logger.main.info("Default speech model updated", {
            modelId: input.modelId,
          });
        }

        return true;
      } catch (error) {
        const logger = ctx.serviceManager.getLogger();
        if (logger) {
          logger.main.error("Error setting default speech model:", error);
        }
        throw error;
      }
    }),

  // Validate OpenAI API connection
  validateOpenAIConnection: procedure
    .input(z.object({ apiKey: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await fetch("https://api.openai.com/v1/models", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${input.apiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            (errorData as { error?: { message?: string } })?.error?.message ||
            `HTTP ${response.status}: ${response.statusText}`;
          return {
            success: false as const,
            error: errorMessage,
          };
        }

        return { success: true as const };
      } catch (error) {
        return {
          success: false as const,
          error: error instanceof Error ? error.message : "Connection failed",
        };
      }
    }),

  // Get data path
  getDataPath: procedure.query(() => {
    return app.getPath("userData");
  }),

  // Get log file path
  getLogFilePath: procedure.query(() => {
    const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
    return isDev
      ? path.join(app.getPath("userData"), "logs", "surasura-dev.log")
      : path.join(app.getPath("logs"), "surasura.log");
  }),

  // Download log file via save dialog
  downloadLogFile: procedure.mutation(async () => {
    const { dialog, BrowserWindow } = await import("electron");
    const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
    const logPath = isDev
      ? path.join(app.getPath("userData"), "logs", "surasura-dev.log")
      : path.join(app.getPath("logs"), "surasura.log");

    const focusedWindow = BrowserWindow.getFocusedWindow();
    const saveOptions = {
      defaultPath: `surasura-logs-${new Date().toISOString().split("T")[0]}.log`,
      filters: [{ name: "Log Files", extensions: ["log", "txt"] }],
    };
    const { filePath } = focusedWindow
      ? await dialog.showSaveDialog(focusedWindow, saveOptions)
      : await dialog.showSaveDialog(saveOptions);

    if (filePath) {
      await fs.copyFile(logPath, filePath);
      return { success: true, path: filePath };
    }
    return { success: false };
  }),

  // Open a folder in the system file manager
  openFolder: procedure
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const logger = ctx.serviceManager.getLogger();
      logger?.main.info("Opening folder:", { path: input.path });

      // shell.openPath returns empty string on success, error message on failure
      const errorMessage = await shell.openPath(input.path);
      if (errorMessage) {
        logger?.main.error("Failed to open folder:", { error: errorMessage });
        return { success: false, error: errorMessage };
      }
      return { success: true };
    }),

  // Show a file in the system file manager (Finder/Explorer)
  showFileInFolder: procedure
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const logger = ctx.serviceManager.getLogger();
      logger?.main.info("Showing file in folder:", { path: input.path });

      // shell.showItemInFolder is synchronous and doesn't return errors
      shell.showItemInFolder(input.path);
      return { success: true };
    }),

  // Get audio folder path
  getAudioFolderPath: procedure.query(() => {
    return path.join(app.getPath("userData"), "audio");
  }),

  // Get app preferences (launch at login, minimize to tray, etc.)
  getPreferences: procedure.query(async ({ ctx }) => {
    const settingsService = ctx.serviceManager.getService("settingsService");
    if (!settingsService) {
      throw new Error("SettingsService not available");
    }
    return await settingsService.getPreferences();
  }),

  // Update app preferences
  updatePreferences: procedure
    .input(AppPreferencesSchema)
    .mutation(async ({ input, ctx }) => {
      const settingsService = ctx.serviceManager.getService("settingsService");
      if (!settingsService) {
        throw new Error("SettingsService not available");
      }

      await settingsService.setPreferences(input);
      // Window updates are handled via settings events in AppManager

      return true;
    }),

  // Update UI theme
  updateUITheme: procedure
    .input(UIThemeSchema)
    .mutation(async ({ input, ctx }) => {
      const settingsService = ctx.serviceManager.getService("settingsService");
      if (!settingsService) {
        throw new Error("SettingsService not available");
      }

      // Get current UI settings
      const currentUISettings = await settingsService.getUISettings();

      // Update with new theme
      await settingsService.setUISettings({
        ...currentUISettings,
        theme: input.theme,
      });
      // Window updates are handled via settings events in AppManager

      const logger = ctx.serviceManager.getLogger();
      if (logger) {
        logger.main.info("UI theme updated", { theme: input.theme });
      }

      return true;
    }),

  // Reset app - deletes all user data, then restarts
  resetApp: procedure.mutation(async ({ ctx }) => {
    try {
      const logger = ctx.serviceManager.getLogger();
      if (logger) {
        logger.main.info("Resetting app - deleting all user data");
      }

      // Close database connection before deleting
      await closeDatabase();

      // Add a small delay to ensure the connection is fully closed on Windows
      await new Promise((resolve) => setTimeout(resolve, 100));

      const userDataPath = app.getPath("userData");

      // Delete database files (main db + WAL/SHM files)
      const dbFile = path.join(userDataPath, "surasura.db");
      await fs.rm(dbFile, { force: true }).catch(() => {});
      await fs.rm(`${dbFile}-wal`, { force: true }).catch(() => {});
      await fs.rm(`${dbFile}-shm`, { force: true }).catch(() => {});

      // Delete audio directory
      const audioDir = path.join(userDataPath, "audio");
      await fs.rm(audioDir, { recursive: true, force: true }).catch(() => {});

      // Delete logs directory
      const logsDir = path.join(userDataPath, "logs");
      await fs.rm(logsDir, { recursive: true, force: true }).catch(() => {});

      // Delete system logs directory (production)
      const systemLogsDir = app.getPath("logs");
      await fs.rm(systemLogsDir, { recursive: true, force: true }).catch(() => {});

      // In development, also delete the local db file if it exists
      if (process.env.NODE_ENV === "development" || !app.isPackaged) {
        try {
          await fs.unlink(dbPath);
        } catch {
          // Ignore if file doesn't exist
        }
      }

      // Handle restart differently in development vs production
      if (process.env.NODE_ENV === "development" || !app.isPackaged) {
        //! restarting will not work properly in dev mode
        app.quit();
      } else {
        // Production mode: relaunch the app
        app.relaunch();
        app.quit();
      }

      return { success: true };
    } catch (error) {
      const logger = ctx.serviceManager.getLogger();
      if (logger) {
        logger.main.error("Error resetting app:", error);
      }
      throw new Error("Failed to reset app");
    }
  }),
});
// This comment prevents prettier from removing the trailing newline
