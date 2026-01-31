import { EventEmitter } from "events";
import { systemPreferences } from "electron";
import { logger } from "../main/logger";
import type { SettingsService } from "./settings-service";
import type { AppSettingsData } from "../db/schema";
import {
  OnboardingScreen,
  FeatureInterest,
  type OnboardingState,
  type OnboardingPreferences,
  type OnboardingFeatureFlags,
} from "../types/onboarding";

/**
 * Database representation of onboarding state
 * Enums are stored as strings in SQLite
 */
type OnboardingStateDb = {
  completedVersion?: number;
  completedAt?: string;
  lastUpdated?: string;
  lastVisitedScreen?: string;
  skippedScreens?: string[];
  featureInterests?: string[];
};

export class OnboardingService extends EventEmitter {
  private static instance: OnboardingService | null = null;
  private settingsService: SettingsService;
  private currentState: Partial<OnboardingState> = {};
  private isOnboardingInProgress = false;

  constructor(settingsService: SettingsService) {
    super();
    this.settingsService = settingsService;
  }

  static getInstance(settingsService: SettingsService): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService(settingsService);
    }
    return OnboardingService.instance;
  }

  /**
   * Get the current onboarding state from the database
   */
  async getOnboardingState(): Promise<OnboardingState | null> {
    try {
      const settings = await this.settingsService.getAllSettings();
      if (!settings.onboarding) {
        return null;
      }

      // Validate lastVisitedScreen is a valid enum value
      let lastVisitedScreen: OnboardingScreen | undefined = undefined;
      if (settings.onboarding.lastVisitedScreen) {
        const screenValue = settings.onboarding.lastVisitedScreen;
        if (
          Object.values(OnboardingScreen).includes(
            screenValue as OnboardingScreen,
          )
        ) {
          lastVisitedScreen = screenValue as OnboardingScreen;
        } else {
          logger.main.warn(
            `Invalid lastVisitedScreen value in database: "${screenValue}". Resetting to undefined.`,
          );
        }
      }

      // Convert database types to OnboardingState types
      return {
        ...settings.onboarding,
        lastVisitedScreen,
        skippedScreens: settings.onboarding.skippedScreens as
          | OnboardingScreen[]
          | undefined,
        featureInterests: settings.onboarding.featureInterests as
          | FeatureInterest[]
          | undefined,
      } as OnboardingState;
    } catch (error) {
      logger.main.error("Failed to get onboarding state:", error);
      return null;
    }
  }

  /**
   * Save the onboarding state to the database
   */
  async saveOnboardingState(state: Partial<OnboardingState>): Promise<void> {
    try {
      const currentSettings = await this.settingsService.getAllSettings();

      // Convert OnboardingState types to database types (strings)
      const stateForDb: OnboardingStateDb = {
        ...currentSettings.onboarding,
      };

      // Ensure enums are stored as strings in the database
      if (state.skippedScreens !== undefined) {
        stateForDb.skippedScreens = state.skippedScreens.map(
          (s) => s as string,
        );
      }
      if (state.featureInterests !== undefined) {
        stateForDb.featureInterests = state.featureInterests.map(
          (f) => f as string,
        );
      }
      if (state.completedVersion !== undefined) {
        stateForDb.completedVersion = state.completedVersion;
      }
      if (state.completedAt !== undefined) {
        stateForDb.completedAt = state.completedAt;
      }
      if (state.lastVisitedScreen !== undefined) {
        // Convert enum to string for database storage
        // TypeScript enums have string values at runtime, so this cast is safe
        stateForDb.lastVisitedScreen = state.lastVisitedScreen as string;
      }

      await this.settingsService.updateSettings({
        onboarding: stateForDb as AppSettingsData["onboarding"],
      });

      this.currentState = state;
      logger.main.debug("Saved onboarding state:", stateForDb);
    } catch (error) {
      logger.main.error("Failed to save onboarding state:", error);
      throw error;
    }
  }

  /**
   * Save user preferences during onboarding
   * T030, T031 - Implements savePreferences with partial progress saving
   */
  async savePreferences(preferences: OnboardingPreferences): Promise<void> {
    try {
      const updates: Partial<OnboardingState> = {};

      if (preferences.lastVisitedScreen !== undefined) {
        updates.lastVisitedScreen = preferences.lastVisitedScreen;
      }

      if (preferences.featureInterests !== undefined) {
        updates.featureInterests = preferences.featureInterests;
      }

      // T032 - Save partial progress after each screen
      await this.savePartialProgress(updates);
      logger.main.debug("Saved onboarding preferences:", preferences);
    } catch (error) {
      logger.main.error("Failed to save preferences:", error);
      throw error;
    }
  }

  /**
   * Save partial onboarding progress
   * T032, T033 - Database read/write for partial state
   */
  async savePartialProgress(
    partialState: Partial<OnboardingState>,
  ): Promise<void> {
    try {
      // Read current state
      const currentState = await this.getOnboardingState();

      // Merge with partial update
      const mergedState = {
        ...currentState,
        ...partialState,
      };

      // Write back to database
      await this.saveOnboardingState(mergedState);

      logger.main.debug("Saved partial onboarding progress:", partialState);
    } catch (error) {
      logger.main.error("Failed to save partial progress:", error);
      throw error;
    }
  }

  /**
   * Complete the onboarding process
   */
  async completeOnboarding(finalState: OnboardingState): Promise<void> {
    try {
      // Ensure completedAt timestamp is set
      const completeState = {
        ...finalState,
        completedAt: finalState.completedAt || new Date().toISOString(),
      };

      await this.saveOnboardingState(completeState);

      logger.main.info("Onboarding completed successfully");
    } catch (error) {
      logger.main.error("Failed to complete onboarding:", error);
      throw error;
    }
  }

  /**
   * Check system permissions (can be called anytime)
   * Returns current microphone and accessibility permission status
   */
  checkSystemPermissions(): {
    microphone: boolean;
    accessibility: boolean;
  } {
    const microphone =
      systemPreferences.getMediaAccessStatus("microphone") === "granted";

    const accessibility =
      process.platform === "darwin"
        ? systemPreferences.isTrustedAccessibilityClient(false)
        : true; // Non-macOS platforms don't need accessibility permission

    return { microphone, accessibility };
  }

  /**
   * Check if onboarding is needed
   * Returns true if user needs to go through onboarding (first time or missing permissions)
   */
  async checkNeedsOnboarding(): Promise<{
    needed: boolean;
    reason: {
      forceOnboarding: boolean;
      notCompleted: boolean;
      missingPermissions: boolean;
    };
    missingPermissions: {
      microphone: boolean;
      accessibility: boolean;
    };
  }> {
    const forceOnboarding = process.env.FORCE_ONBOARDING === "true";
    const state = await this.getOnboardingState();
    logger.main.info("Onboarding state:", state);
    const hasCompleted = state?.completedVersion
      ? state.completedVersion >= 1
      : false;

    // Check actual system permissions
    const permissions = this.checkSystemPermissions();
    const hasMissingPermissions =
      !permissions.microphone || !permissions.accessibility;

    const needed = forceOnboarding || !hasCompleted || hasMissingPermissions;

    return {
      needed,
      reason: {
        forceOnboarding,
        notCompleted: !hasCompleted,
        missingPermissions: hasMissingPermissions,
      },
      missingPermissions: {
        microphone: !permissions.microphone,
        accessibility: !permissions.accessibility,
      },
    };
  }

  /**
   * Get feature flags for onboarding screens
   */
  getFeatureFlags(): OnboardingFeatureFlags {
    return {
      skipWelcome: process.env.ONBOARDING_SKIP_WELCOME === "true",
      skipFeatures: process.env.ONBOARDING_SKIP_FEATURES === "true",
      skipDiscovery: true, // Discovery source screen is removed
      skipModels: process.env.ONBOARDING_SKIP_MODELS === "true",
    };
  }

  /**
   * Get screens to skip based on feature flags
   */
  getSkippedScreens(): OnboardingScreen[] {
    const flags = this.getFeatureFlags();
    const skipped: OnboardingScreen[] = [];

    if (flags.skipWelcome) skipped.push("welcome" as OnboardingScreen);
    if (flags.skipFeatures) skipped.push("features" as OnboardingScreen);
    if (flags.skipDiscovery) skipped.push("discovery" as OnboardingScreen);
    if (flags.skipModels) skipped.push("api-key-setup" as OnboardingScreen);

    return skipped;
  }

  /**
   * Reset onboarding state (for testing)
   */
  async resetOnboarding(): Promise<void> {
    try {
      await this.settingsService.updateSettings({
        onboarding: undefined,
      });
      this.currentState = {};
      logger.main.info("Onboarding state reset");
    } catch (error) {
      logger.main.error("Failed to reset onboarding:", error);
      throw error;
    }
  }

  // ============================================
  // Flow methods (event-driven architecture)
  // ============================================

  /**
   * Check if onboarding is currently in progress
   */
  isInProgress(): boolean {
    return this.isOnboardingInProgress;
  }

  /**
   * Start the onboarding flow
   * Note: Window creation is handled by AppManager
   */
  async startOnboardingFlow(): Promise<void> {
    if (this.isOnboardingInProgress) {
      logger.main.warn("Onboarding already in progress");
      return;
    }

    this.isOnboardingInProgress = true;
    logger.main.info("Starting onboarding flow");
  }

  /**
   * Complete the onboarding flow
   * Emits "completed" event - AppManager handles window transitions
   */
  async completeOnboardingFlow(finalState: OnboardingState): Promise<void> {
    try {
      logger.main.info("Completing onboarding flow");

      // Save the final state
      await this.completeOnboarding(finalState);

      this.isOnboardingInProgress = false;

      // Emit event - AppManager listens and handles window transitions
      this.emit("completed");

      logger.main.info("Onboarding completed, emitted event");
    } catch (error) {
      logger.main.error("Error completing onboarding flow:", error);
      throw error;
    }
  }

  /**
   * Cancel the onboarding flow
   * Emits "cancelled" event - AppManager handles window close and app quit
   */
  async cancelOnboardingFlow(): Promise<void> {
    logger.main.info("Onboarding cancelled");

    this.isOnboardingInProgress = false;

    // Emit event - AppManager listens and handles window close + app quit
    this.emit("cancelled");

    logger.main.info("Onboarding cancelled, emitted event");
  }
}
