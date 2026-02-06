// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAudioDevices } from "@/hooks/useAudioDevices";

function createMockDevice(
  deviceId: string,
  label: string,
  kind: MediaDeviceKind = "audioinput",
): MediaDeviceInfo {
  return {
    deviceId,
    label,
    kind,
    groupId: "group-1",
    toJSON: () => ({}),
  };
}

describe("useAudioDevices", () => {
  let mockEnumerateDevices: ReturnType<typeof vi.fn>;
  let mockGetUserMedia: ReturnType<typeof vi.fn>;
  let mockAddEventListener: ReturnType<typeof vi.fn>;
  let mockRemoveEventListener: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockEnumerateDevices = vi.fn().mockResolvedValue([]);
    mockGetUserMedia = vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    });
    mockAddEventListener = vi.fn();
    mockRemoveEventListener = vi.fn();

    vi.stubGlobal("navigator", {
      mediaDevices: {
        enumerateDevices: mockEnumerateDevices,
        getUserMedia: mockGetUserMedia,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("システムデフォルトが最初のデバイスとして返される", async () => {
    mockEnumerateDevices.mockResolvedValue([
      createMockDevice("mic-1", "Built-in Microphone"),
    ]);

    const { result } = renderHook(() => useAudioDevices());

    await waitFor(() => {
      expect(result.current.devices.length).toBeGreaterThan(0);
    });

    expect(result.current.devices[0].deviceId).toBe("default");
    expect(result.current.devices[0].isDefault).toBe(true);
  });

  it("仮想デバイスを除外する", async () => {
    mockEnumerateDevices.mockResolvedValue([
      createMockDevice("mic-1", "Built-in Microphone"),
      createMockDevice("mic-2", "Microsoft Teams Audio"),
      createMockDevice("mic-3", "Zoom Virtual Microphone"),
      createMockDevice("mic-4", "Discord Virtual Audio"),
    ]);

    const { result } = renderHook(() => useAudioDevices());

    await waitFor(() => {
      expect(result.current.devices.length).toBeGreaterThan(0);
    });

    // Only system default + built-in mic (virtual ones filtered out)
    expect(result.current.devices).toHaveLength(2);
    expect(result.current.devices[1].label).toBe("Built-in Microphone");
  });

  it("デバイス一覧からdefaultエントリを除外する", async () => {
    mockEnumerateDevices.mockResolvedValue([
      createMockDevice("default", "Default - Built-in Microphone"),
      createMockDevice("mic-1", "Built-in Microphone"),
    ]);

    const { result } = renderHook(() => useAudioDevices());

    await waitFor(() => {
      expect(result.current.devices.length).toBeGreaterThan(0);
    });

    // System default (our custom) + built-in mic
    expect(result.current.devices).toHaveLength(2);
    expect(result.current.devices[0].deviceId).toBe("default");
    expect(result.current.devices[1].deviceId).toBe("mic-1");
  });

  it("ラベルからデフォルトデバイス名を抽出する", async () => {
    mockEnumerateDevices.mockResolvedValue([
      createMockDevice("default", "Default - MacBook Pro Microphone"),
      createMockDevice("mic-1", "MacBook Pro Microphone"),
    ]);

    const { result } = renderHook(() => useAudioDevices());

    await waitFor(() => {
      expect(result.current.defaultDeviceName).toBe("MacBook Pro Microphone");
    });

    expect(result.current.devices[0].label).toContain("MacBook Pro Microphone");
  });

  it("deviceIdに基づいてデバイスを重複排除する", async () => {
    mockEnumerateDevices.mockResolvedValue([
      createMockDevice("mic-1", "Built-in Microphone"),
      createMockDevice("mic-1", "Built-in Microphone"),
    ]);

    const { result } = renderHook(() => useAudioDevices());

    await waitFor(() => {
      expect(result.current.devices.length).toBeGreaterThan(0);
    });

    // System default + one mic (deduplicated)
    expect(result.current.devices).toHaveLength(2);
  });

  it("devicechangeイベントリスナーを登録する", async () => {
    renderHook(() => useAudioDevices());

    await waitFor(() => {
      expect(mockAddEventListener).toHaveBeenCalledWith(
        "devicechange",
        expect.any(Function),
      );
    });
  });

  it("アンマウント時にdevicechangeリスナーを解除する", async () => {
    const { unmount } = renderHook(() => useAudioDevices());

    await waitFor(() => {
      expect(mockAddEventListener).toHaveBeenCalled();
    });

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      "devicechange",
      expect.any(Function),
    );
  });

  it("getUserMedia失敗時にエラーにならない", async () => {
    mockGetUserMedia.mockRejectedValue(new Error("Permission denied"));
    mockEnumerateDevices.mockResolvedValue([
      createMockDevice("mic-1", "Built-in Microphone"),
    ]);

    const { result } = renderHook(() => useAudioDevices());

    await waitFor(() => {
      expect(result.current.devices.length).toBeGreaterThan(0);
    });

    // Should still work even if getUserMedia fails
    expect(result.current.devices).toHaveLength(2);
  });
});
