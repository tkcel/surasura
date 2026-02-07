/**
 * Simple context management for the pipeline - no over-engineering
 * Based on ARCHITECTURE.md specifications
 */

export interface DictionaryEntry {
  word: string;
  readings: string[];
}

export interface PipelineContext {
  sessionId: string;
  sharedData: SharedPipelineData;
  metadata: Map<string, any>;
}

import { GetAccessibilityContextResult } from "@surasura/types";

export interface SharedPipelineData {
  vocabulary: string[]; // Custom vocab
  replacements: Map<string, string>; // Custom replacements
  dictionaryEntries: DictionaryEntry[]; // Unified dictionary entries
  userPreferences: {
    language?: string; // Optional - undefined means auto-detect
    formattingStyle: "formal" | "casual" | "technical";
  };
  audioMetadata: {
    source: "microphone" | "file" | "stream";
    duration?: number;
  };
  accessibilityContext: GetAccessibilityContextResult | null;
}

/**
 * Create a default context for pipeline execution
 */
export function createDefaultContext(sessionId: string): PipelineContext {
  return {
    sessionId,
    sharedData: {
      vocabulary: [],
      replacements: new Map(),
      dictionaryEntries: [],
      userPreferences: {
        language: "ja",
        formattingStyle: "formal",
      },
      audioMetadata: {
        source: "microphone",
      },
      accessibilityContext: null, // Will be populated async by TranscriptionService
    },
    metadata: new Map(),
  };
}
