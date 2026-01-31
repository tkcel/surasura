import {
  TranscriptionProvider,
  TranscribeParams,
  TranscribeContext,
} from "../../core/pipeline-types";
import { logger } from "../../../main/logger";
import { SettingsService } from "../../../services/settings-service";
import OpenAI from "openai";

export class OpenAIWhisperProvider implements TranscriptionProvider {
  readonly name = "openai-whisper";

  // Frame aggregation state
  private frameBuffer: Float32Array[] = [];
  private frameBufferSpeechProbabilities: number[] = [];
  private currentSilenceFrameCount = 0;

  // Configuration
  private readonly FRAME_SIZE = 512; // 32ms at 16kHz
  private readonly MAX_SILENCE_DURATION_MS = 3000; // Max silence before transcribing
  private readonly SAMPLE_RATE = 16000;
  private readonly SPEECH_PROBABILITY_THRESHOLD = 0.2;
  private readonly IGNORE_FULLY_SILENT_CHUNKS = true;

  private settingsService: SettingsService;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  /**
   * Check if OpenAI API is configured
   */
  async isApiConfigured(): Promise<boolean> {
    const openaiConfig = await this.settingsService.getOpenAIConfig();
    return !!openaiConfig?.apiKey;
  }

  /**
   * Process an audio chunk - buffers and conditionally transcribes
   */
  async transcribe(params: TranscribeParams): Promise<string> {
    const { audioData, speechProbability = 1, context } = params;

    // Add frame to buffer with speech probability
    this.frameBuffer.push(audioData);
    this.frameBufferSpeechProbabilities.push(speechProbability);

    // Consider it speech if probability is above threshold
    const isSpeech = speechProbability > this.SPEECH_PROBABILITY_THRESHOLD;

    logger.transcription.debug(
      `Frame received - SpeechProb: ${speechProbability.toFixed(3)}, Buffer size: ${this.frameBuffer.length}, Silence count: ${this.currentSilenceFrameCount}`,
    );

    // Handle speech/silence logic
    if (isSpeech) {
      this.currentSilenceFrameCount = 0;
    } else {
      this.currentSilenceFrameCount++;
    }

    // Only transcribe if speech/silence patterns indicate we should
    if (!this.shouldTranscribe()) {
      return "";
    }

    return this.doTranscription(context);
  }

  /**
   * Flush any buffered audio and return transcription
   * Called at the end of a recording session
   */
  async flush(context: TranscribeContext): Promise<string> {
    if (this.frameBuffer.length === 0) {
      return "";
    }

    return this.doTranscription(context);
  }

  /**
   * Shared transcription logic - aggregates buffer, calls OpenAI Whisper API
   */
  private async doTranscription(context: TranscribeContext): Promise<string> {
    try {
      const isAllSilent = this.isAllSilent();

      // Aggregate buffered frames
      const aggregatedAudio = this.aggregateFrames();

      // Clear buffers immediately after aggregation
      this.reset();

      if (isAllSilent && this.IGNORE_FULLY_SILENT_CHUNKS) {
        logger.transcription.debug("Skipping transcription - all silent");
        return "";
      }

      logger.transcription.debug(
        `Starting OpenAI Whisper transcription of ${aggregatedAudio.length} samples (${((aggregatedAudio.length / this.SAMPLE_RATE) * 1000).toFixed(0)}ms)`,
      );

      // Get OpenAI API key
      const openaiConfig = await this.settingsService.getOpenAIConfig();
      if (!openaiConfig?.apiKey) {
        throw new Error("OpenAI API key is not configured");
      }

      // Convert Float32Array to WAV format
      const wavBuffer = this.float32ToWav(aggregatedAudio);

      // Create OpenAI client
      const openai = new OpenAI({
        apiKey: openaiConfig.apiKey,
      });

      // Create File object from WAV buffer
      const audioFile = new File([wavBuffer], "audio.wav", {
        type: "audio/wav",
      });

      // Call OpenAI Whisper API
      const response = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: context.language !== "auto" ? context.language : undefined,
        prompt: this.generateInitialPrompt(
          context.vocabulary,
          context.aggregatedTranscription,
        ),
      });

      const text = response.text || "";

      logger.transcription.debug(
        `OpenAI Whisper transcription completed, length: ${text.length}`,
      );

      return text;
    } catch (error) {
      logger.transcription.error("OpenAI Whisper transcription failed:", error);
      throw new Error(`OpenAI Whisper transcription failed: ${error}`);
    }
  }

  /**
   * Clear internal buffers without transcribing
   */
  reset(): void {
    this.frameBuffer = [];
    this.frameBufferSpeechProbabilities = [];
    this.currentSilenceFrameCount = 0;
  }

  private shouldTranscribe(): boolean {
    const bufferDurationMs =
      ((this.frameBuffer.length * this.FRAME_SIZE) / this.SAMPLE_RATE) * 1000;
    const silenceDurationMs =
      ((this.currentSilenceFrameCount * this.FRAME_SIZE) / this.SAMPLE_RATE) *
      1000;

    // If we have speech and then significant silence, transcribe
    if (
      this.frameBuffer.length > 0 &&
      silenceDurationMs > this.MAX_SILENCE_DURATION_MS
    ) {
      logger.transcription.debug(
        `Transcribing due to ${silenceDurationMs}ms of silence`,
      );
      return true;
    }

    // If buffer is too large (e.g., 30 seconds), transcribe anyway
    if (bufferDurationMs > 30000) {
      logger.transcription.debug(
        `Transcribing due to buffer size: ${bufferDurationMs}ms`,
      );
      return true;
    }

    logger.transcription.debug("Not transcribing", {
      bufferDurationMs,
      silenceDurationMs,
      frameBufferLength: this.frameBuffer.length,
      silenceFrameCount: this.currentSilenceFrameCount,
    });

    return false;
  }

  private aggregateFrames(): Float32Array {
    const totalLength = this.frameBuffer.reduce(
      (sum, frame) => sum + frame.length,
      0,
    );
    const aggregated = new Float32Array(totalLength);

    let offset = 0;
    for (const frame of this.frameBuffer) {
      aggregated.set(frame, offset);
      offset += frame.length;
    }

    return aggregated;
  }

  private isAllSilent(): boolean {
    const bufferDurationMs =
      ((this.frameBuffer.length * this.FRAME_SIZE) / this.SAMPLE_RATE) * 1000;
    const silenceDurationMs =
      ((this.currentSilenceFrameCount * this.FRAME_SIZE) / this.SAMPLE_RATE) *
      1000;

    return bufferDurationMs === silenceDurationMs;
  }

  /**
   * Convert Float32Array audio data to WAV format
   */
  private float32ToWav(samples: Float32Array): ArrayBuffer {
    const numChannels = 1;
    const sampleRate = this.SAMPLE_RATE;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = samples.length * bytesPerSample;
    const bufferSize = 44 + dataSize;

    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    // WAV header
    this.writeString(view, 0, "RIFF");
    view.setUint32(4, bufferSize - 8, true);
    this.writeString(view, 8, "WAVE");
    this.writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // audio format (PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    this.writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }

    return buffer;
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  private generateInitialPrompt(
    vocabulary?: string[],
    aggregatedTranscription?: string,
  ): string {
    const promptParts: string[] = [];

    if (vocabulary && vocabulary.length > 0) {
      promptParts.push(vocabulary.join(", "));
    }

    if (aggregatedTranscription) {
      promptParts.push(aggregatedTranscription);
    }

    const prompt = promptParts.join(" ");
    logger.transcription.debug(`Generated initial prompt: "${prompt}"`);

    return prompt;
  }

  async dispose(): Promise<void> {
    this.reset();
    logger.transcription.info("OpenAI Whisper provider disposed");
  }
}
