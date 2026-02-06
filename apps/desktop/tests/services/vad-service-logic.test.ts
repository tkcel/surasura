import { describe, it, expect, vi, beforeEach } from "vitest";
import { VADService } from "@services/vad-service";

describe("VADServiceの音声検出ロジック", () => {
  let service: VADService;
  let applySpeechDetectionLogic: (probability: number) => boolean;

  beforeEach(() => {
    service = new VADService();
    // Access private method for unit testing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applySpeechDetectionLogic = (service as any).applySpeechDetectionLogic.bind(
      service,
    );
    // Reset internal state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service as any).speechFrameCount = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service as any).silenceFrameCount = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service as any).isSpeaking = false;
  });

  describe("音声フレームカウント", () => {
    it("初期状態では発話中でない", () => {
      expect(service.getIsSpeaking()).toBe(false);
    });

    it("1音声フレームでは発話開始しない", () => {
      applySpeechDetectionLogic(0.5); // above threshold 0.1
      expect(service.getIsSpeaking()).toBe(false);
    });

    it("2音声フレームでは発話開始しない", () => {
      applySpeechDetectionLogic(0.5);
      applySpeechDetectionLogic(0.5);
      expect(service.getIsSpeaking()).toBe(false);
    });

    it("連続3音声フレーム後に発話開始する", () => {
      applySpeechDetectionLogic(0.5);
      applySpeechDetectionLogic(0.5);
      applySpeechDetectionLogic(0.5);
      expect(service.getIsSpeaking()).toBe(true);
    });
  });

  describe("無音検出とリデンプション", () => {
    function startSpeaking() {
      // Need 3 speech frames to start speaking
      applySpeechDetectionLogic(0.5);
      applySpeechDetectionLogic(0.5);
      applySpeechDetectionLogic(0.5);
    }

    it("REDEMPTION_FRAMES未満の無音フレームでは発話を停止しない", () => {
      startSpeaking();
      // 7 silence frames (REDEMPTION_FRAMES = 8)
      for (let i = 0; i < 7; i++) {
        applySpeechDetectionLogic(0.0);
      }
      expect(service.getIsSpeaking()).toBe(true);
    });

    it("REDEMPTION_FRAMESの無音フレーム後に発話を停止する", () => {
      startSpeaking();
      // 8 silence frames (= REDEMPTION_FRAMES)
      for (let i = 0; i < 8; i++) {
        applySpeechDetectionLogic(0.0);
      }
      expect(service.getIsSpeaking()).toBe(false);
    });
  });

  describe("閾値の境界", () => {
    it("閾値ちょうど (0.1) の確率を無音として扱う", () => {
      // probability > 0.1 is speech, so exactly 0.1 is not speech
      applySpeechDetectionLogic(0.1);
      applySpeechDetectionLogic(0.1);
      applySpeechDetectionLogic(0.1);
      expect(service.getIsSpeaking()).toBe(false);
    });

    it("閾値をわずかに超える確率を音声として扱う", () => {
      applySpeechDetectionLogic(0.11);
      applySpeechDetectionLogic(0.11);
      applySpeechDetectionLogic(0.11);
      expect(service.getIsSpeaking()).toBe(true);
    });
  });

  describe("イベント発火", () => {
    it("発話開始時にvoice-detectedをtrueで発火する", () => {
      const listener = vi.fn();
      service.on("voice-detected", listener);

      applySpeechDetectionLogic(0.5);
      applySpeechDetectionLogic(0.5);
      expect(listener).not.toHaveBeenCalled();

      applySpeechDetectionLogic(0.5);
      expect(listener).toHaveBeenCalledWith(true);
    });

    it("発話終了時にvoice-detectedをfalseで発火する", () => {
      const listener = vi.fn();
      service.on("voice-detected", listener);

      // Start speaking
      applySpeechDetectionLogic(0.5);
      applySpeechDetectionLogic(0.5);
      applySpeechDetectionLogic(0.5);

      listener.mockClear();

      // Stop speaking after redemption frames
      for (let i = 0; i < 8; i++) {
        applySpeechDetectionLogic(0.0);
      }
      expect(listener).toHaveBeenCalledWith(false);
    });
  });

  describe("リセット", () => {
    it("すべての状態をリセットする", () => {
      // Start speaking
      applySpeechDetectionLogic(0.5);
      applySpeechDetectionLogic(0.5);
      applySpeechDetectionLogic(0.5);
      expect(service.getIsSpeaking()).toBe(true);

      service.reset();
      expect(service.getIsSpeaking()).toBe(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((service as any).speechFrameCount).toBe(0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((service as any).silenceFrameCount).toBe(0);
    });
  });
});
