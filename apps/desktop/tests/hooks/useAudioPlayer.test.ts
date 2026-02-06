// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

// Mock HTMLAudioElement
class MockAudioElement {
  src = "";
  paused = true;
  onended: (() => void) | null = null;

  play = vi.fn(function (this: MockAudioElement) {
    this.paused = false;
    return Promise.resolve();
  });

  pause = vi.fn(function (this: MockAudioElement) {
    this.paused = true;
  });
}

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = vi.fn(function () { return "blob:mock-url"; });
const mockRevokeObjectURL = vi.fn();

describe("useAudioPlayer", () => {
  let mockAudio: MockAudioElement;

  beforeEach(() => {
    mockAudio = new MockAudioElement();
    vi.stubGlobal("Audio", function MockAudio() { return mockAudio; });
    vi.stubGlobal("URL", {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });
    vi.stubGlobal("Blob", class MockBlob {
      constructor(public parts: unknown[], public options: unknown) {}
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("初期状態でisPlaying=false、currentPlayingId=nullである", () => {
    const { result } = renderHook(() => useAudioPlayer());
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentPlayingId).toBeNull();
  });

  it("音声を再生し状態を更新する", async () => {
    const { result } = renderHook(() => useAudioPlayer());
    const audioData = new ArrayBuffer(16);

    await act(async () => {
      result.current.play(audioData, 1);
    });

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockAudio.play).toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.currentPlayingId).toBe(1);
  });

  it("再生を一時停止する", async () => {
    const { result } = renderHook(() => useAudioPlayer());
    const audioData = new ArrayBuffer(16);

    await act(async () => {
      result.current.play(audioData, 1);
    });

    act(() => {
      result.current.pause();
    });

    expect(mockAudio.pause).toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(false);
  });

  it("再生を停止しBlob URLを解放する", async () => {
    const { result } = renderHook(() => useAudioPlayer());
    const audioData = new ArrayBuffer(16);

    await act(async () => {
      result.current.play(audioData, 1);
    });

    act(() => {
      result.current.stop();
    });

    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentPlayingId).toBeNull();
  });

  it("同じトラック再生中にtoggleで一時停止する", async () => {
    const { result } = renderHook(() => useAudioPlayer());
    const audioData = new ArrayBuffer(16);

    await act(async () => {
      result.current.play(audioData, 1);
    });

    act(() => {
      result.current.toggle(audioData, 1);
    });

    expect(mockAudio.pause).toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(false);
  });

  it("別のトラックをtoggleすると新しいトラックを再生する", async () => {
    const { result } = renderHook(() => useAudioPlayer());
    const audioData1 = new ArrayBuffer(16);
    const audioData2 = new ArrayBuffer(32);

    await act(async () => {
      result.current.play(audioData1, 1);
    });

    await act(async () => {
      result.current.toggle(audioData2, 2);
    });

    expect(result.current.currentPlayingId).toBe(2);
    expect(result.current.isPlaying).toBe(true);
  });

  it("音声の再生が終了するとisPlayingがfalseになる", async () => {
    const { result } = renderHook(() => useAudioPlayer());
    const audioData = new ArrayBuffer(16);

    await act(async () => {
      result.current.play(audioData, 1);
    });

    expect(result.current.isPlaying).toBe(true);

    // Simulate audio ended
    act(() => {
      mockAudio.onended?.();
    });

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentPlayingId).toBeNull();
  });

  it("アンマウント時にクリーンアップする", async () => {
    const { result, unmount } = renderHook(() => useAudioPlayer());
    const audioData = new ArrayBuffer(16);

    await act(async () => {
      result.current.play(audioData, 1);
    });

    unmount();

    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it("再生失敗時にエラーにならない", async () => {
    mockAudio.play = vi.fn(function () { return Promise.reject(new Error("playback failed")); });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useAudioPlayer());
    const audioData = new ArrayBuffer(16);

    await act(async () => {
      result.current.play(audioData, 1);
    });

    expect(result.current.isPlaying).toBe(false);
    consoleError.mockRestore();
  });
});
