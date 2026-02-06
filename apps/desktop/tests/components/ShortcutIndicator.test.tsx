// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import ShortcutIndicator from "@/components/ShortcutIndicator";

describe("ShortcutIndicator", () => {
  let shortcutCallback: (() => void) | null = null;

  beforeEach(() => {
    shortcutCallback = null;
    vi.useFakeTimers();

    // Mock window.electronAPI
    vi.stubGlobal("window", {
      ...window,
      electronAPI: {
        onGlobalShortcut: vi.fn((cb: () => void) => {
          shortcutCallback = cb;
        }),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("デフォルトテキスト'Alt+Space'で表示される", () => {
    render(<ShortcutIndicator />);
    expect(screen.getByText("Alt+Space")).toBeInTheDocument();
  });

  it("ショートカットが発火すると'Pressed!'を表示する", () => {
    render(<ShortcutIndicator />);

    act(() => {
      shortcutCallback?.();
    });

    expect(screen.getByText("Pressed!")).toBeInTheDocument();
  });

  it("500ms後に'Alt+Space'に戻る", () => {
    render(<ShortcutIndicator />);

    act(() => {
      shortcutCallback?.();
    });

    expect(screen.getByText("Pressed!")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText("Alt+Space")).toBeInTheDocument();
  });

  it("onGlobalShortcutコールバックを登録する", () => {
    render(<ShortcutIndicator />);
    expect(window.electronAPI.onGlobalShortcut).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it("electronAPIが未定義でもエラーにならない", () => {
    vi.stubGlobal("window", { ...window, electronAPI: undefined });

    // Should not throw
    expect(() => render(<ShortcutIndicator />)).not.toThrow();
    expect(screen.getByText("Alt+Space")).toBeInTheDocument();
  });
});
