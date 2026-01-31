/**
 * Type definitions for Enhanced Onboarding Flow
 * These types are used throughout the onboarding implementation
 */

import { z } from "zod";

// ============================================================================
// Enumerations
// ============================================================================

export enum OnboardingScreen {
  Welcome = "welcome",
  Permissions = "permissions",
  DiscoverySource = "discovery",
  APIKeySetup = "api-key-setup",
  Completion = "completion",
}

export enum FeatureInterest {
  ContextualDictation = "contextual_dictation",
  NoteTaking = "note_taking",
  VoiceCommands = "voice_commands",
}

export enum DiscoverySource {
  SearchEngine = "search_engine",
  SocialMedia = "social_media",
  WordOfMouth = "word_of_mouth",
  Other = "other",
}

export interface OnboardingPreferences {
  featureInterests?: FeatureInterest[];
  discoverySource?: DiscoverySource;
  discoveryDetails?: string;
  lastVisitedScreen?: OnboardingScreen;
}

export interface OnboardingState {
  completedVersion: number;
  completedAt: string;
  lastVisitedScreen?: OnboardingScreen;
  skippedScreens?: OnboardingScreen[];
  featureInterests?: FeatureInterest[];
  discoverySource?: DiscoverySource;
}

// ============================================================================
// Feature Flags
// ============================================================================

export interface OnboardingFeatureFlags {
  skipWelcome: boolean;
  skipFeatures: boolean;
  skipDiscovery: boolean;
  skipModels: boolean;
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

export const FeatureInterestSchema = z.nativeEnum(FeatureInterest);

export const DiscoverySourceSchema = z.nativeEnum(DiscoverySource);

export const OnboardingScreenSchema = z.nativeEnum(OnboardingScreen);

export const OnboardingStateSchema = z.object({
  completedVersion: z.number().min(1),
  completedAt: z.string().datetime(),
  skippedScreens: z.array(OnboardingScreenSchema).optional(),
  featureInterests: z.array(FeatureInterestSchema).optional(),
  discoverySource: DiscoverySourceSchema.optional(),
});

export const OnboardingPreferencesSchema = z.object({
  featureInterests: z.array(FeatureInterestSchema).optional(),
  discoverySource: DiscoverySourceSchema.optional(),
  discoveryDetails: z.string().max(200).optional(),
  lastVisitedScreen: OnboardingScreenSchema.optional(),
});
