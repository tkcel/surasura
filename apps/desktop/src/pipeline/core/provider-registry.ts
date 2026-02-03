/**
 * ProviderRegistry - Centralized management for transcription and formatting providers
 * Singleton pattern for registering, retrieving, and disposing providers
 */

import { TranscriptionProvider, FormattingProvider } from "./pipeline-types";
import { logger } from "../../main/logger";

export type ProviderType = "transcription" | "formatting";

interface ProviderEntry<T> {
  provider: T;
  isDefault: boolean;
}

/**
 * Registry for managing transcription and formatting providers
 */
export class ProviderRegistry {
  private static instance: ProviderRegistry | null = null;

  private transcriptionProviders = new Map<
    string,
    ProviderEntry<TranscriptionProvider>
  >();
  private formattingProviders = new Map<
    string,
    ProviderEntry<FormattingProvider>
  >();
  private defaultTranscriptionProviderId: string | null = null;
  private defaultFormattingProviderId: string | null = null;

  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  /**
   * Reset the singleton instance (for testing)
   */
  static resetInstance(): void {
    if (ProviderRegistry.instance) {
      ProviderRegistry.instance.dispose();
      ProviderRegistry.instance = null;
    }
  }

  /**
   * Register a transcription provider
   */
  registerTranscriptionProvider(
    id: string,
    provider: TranscriptionProvider,
    options: { isDefault?: boolean } = {}
  ): void {
    const { isDefault = false } = options;

    this.transcriptionProviders.set(id, { provider, isDefault });

    if (isDefault || !this.defaultTranscriptionProviderId) {
      this.defaultTranscriptionProviderId = id;
    }

    logger.pipeline.info("Registered transcription provider", {
      id,
      name: provider.name,
      isDefault,
    });
  }

  /**
   * Register a formatting provider
   */
  registerFormattingProvider(
    id: string,
    provider: FormattingProvider,
    options: { isDefault?: boolean } = {}
  ): void {
    const { isDefault = false } = options;

    this.formattingProviders.set(id, { provider, isDefault });

    if (isDefault || !this.defaultFormattingProviderId) {
      this.defaultFormattingProviderId = id;
    }

    logger.pipeline.info("Registered formatting provider", {
      id,
      name: provider.name,
      isDefault,
    });
  }

  /**
   * Get a transcription provider by ID
   */
  getTranscriptionProvider(id: string): TranscriptionProvider | null {
    const entry = this.transcriptionProviders.get(id);
    return entry?.provider ?? null;
  }

  /**
   * Get a formatting provider by ID
   */
  getFormattingProvider(id: string): FormattingProvider | null {
    const entry = this.formattingProviders.get(id);
    return entry?.provider ?? null;
  }

  /**
   * Get the default transcription provider
   */
  getDefaultTranscriptionProvider(): TranscriptionProvider | null {
    if (!this.defaultTranscriptionProviderId) {
      return null;
    }
    return this.getTranscriptionProvider(this.defaultTranscriptionProviderId);
  }

  /**
   * Get the default formatting provider
   */
  getDefaultFormattingProvider(): FormattingProvider | null {
    if (!this.defaultFormattingProviderId) {
      return null;
    }
    return this.getFormattingProvider(this.defaultFormattingProviderId);
  }

  /**
   * Set the default transcription provider
   */
  setDefaultTranscriptionProvider(id: string): void {
    if (!this.transcriptionProviders.has(id)) {
      throw new Error(`Transcription provider not found: ${id}`);
    }
    this.defaultTranscriptionProviderId = id;
    logger.pipeline.info("Set default transcription provider", { id });
  }

  /**
   * Set the default formatting provider
   */
  setDefaultFormattingProvider(id: string): void {
    if (!this.formattingProviders.has(id)) {
      throw new Error(`Formatting provider not found: ${id}`);
    }
    this.defaultFormattingProviderId = id;
    logger.pipeline.info("Set default formatting provider", { id });
  }

  /**
   * Unregister a transcription provider
   */
  unregisterTranscriptionProvider(id: string): void {
    this.transcriptionProviders.delete(id);

    if (this.defaultTranscriptionProviderId === id) {
      // Set new default if available
      const firstProvider = this.transcriptionProviders.keys().next();
      this.defaultTranscriptionProviderId = firstProvider.done
        ? null
        : firstProvider.value;
    }

    logger.pipeline.info("Unregistered transcription provider", { id });
  }

  /**
   * Unregister a formatting provider
   */
  unregisterFormattingProvider(id: string): void {
    this.formattingProviders.delete(id);

    if (this.defaultFormattingProviderId === id) {
      // Set new default if available
      const firstProvider = this.formattingProviders.keys().next();
      this.defaultFormattingProviderId = firstProvider.done
        ? null
        : firstProvider.value;
    }

    logger.pipeline.info("Unregistered formatting provider", { id });
  }

  /**
   * Get all registered transcription provider IDs
   */
  getTranscriptionProviderIds(): string[] {
    return Array.from(this.transcriptionProviders.keys());
  }

  /**
   * Get all registered formatting provider IDs
   */
  getFormattingProviderIds(): string[] {
    return Array.from(this.formattingProviders.keys());
  }

  /**
   * Check if a transcription provider is registered
   */
  hasTranscriptionProvider(id: string): boolean {
    return this.transcriptionProviders.has(id);
  }

  /**
   * Check if a formatting provider is registered
   */
  hasFormattingProvider(id: string): boolean {
    return this.formattingProviders.has(id);
  }

  /**
   * Dispose all providers and clear the registry
   */
  async dispose(): Promise<void> {
    // Dispose transcription providers if they have dispose methods
    for (const [id, entry] of this.transcriptionProviders) {
      const provider = entry.provider as TranscriptionProvider & {
        dispose?: () => Promise<void>;
      };
      if (typeof provider.dispose === "function") {
        try {
          await provider.dispose();
        } catch (error) {
          logger.pipeline.error("Failed to dispose transcription provider", {
            id,
            error,
          });
        }
      }
    }

    // Dispose formatting providers if they have dispose methods
    for (const [id, entry] of this.formattingProviders) {
      const provider = entry.provider as FormattingProvider & {
        dispose?: () => Promise<void>;
      };
      if (typeof provider.dispose === "function") {
        try {
          await provider.dispose();
        } catch (error) {
          logger.pipeline.error("Failed to dispose formatting provider", {
            id,
            error,
          });
        }
      }
    }

    this.transcriptionProviders.clear();
    this.formattingProviders.clear();
    this.defaultTranscriptionProviderId = null;
    this.defaultFormattingProviderId = null;

    logger.pipeline.info("ProviderRegistry disposed");
  }
}
