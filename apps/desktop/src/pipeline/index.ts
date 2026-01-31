/**
 * Pipeline module exports
 */

// Core types
export type {
  TranscriptionProvider,
  FormattingProvider,
  PipelineResult,
  PipelineConfig,
  StreamingPipelineContext,
  StreamingSession,
} from "./core/pipeline-types";

// Context management
export { createDefaultContext } from "./core/context";
export type { PipelineContext, SharedPipelineData } from "./core/context";

// Main service
export { TranscriptionService } from "../services/transcription-service";

// Providers (if needed externally)
export { OpenAIWhisperProvider } from "./providers/transcription/openai-whisper-provider";
export { OpenAIFormatter } from "./providers/formatting/openai-formatter";
