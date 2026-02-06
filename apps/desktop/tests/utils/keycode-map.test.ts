import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We need to mock the platform module before importing keycode-map
// since keycodeToKey is evaluated at module load time

describe("keycode-map", () => {
  describe("macOSプラットフォーム (darwinでのデフォルト)", () => {
    let getKeyFromKeycode: typeof import("@utils/keycode-map").getKeyFromKeycode;
    let matchesShortcutKey: typeof import("@utils/keycode-map").matchesShortcutKey;
    let getKeyNameFromPayload: typeof import("@utils/keycode-map").getKeyNameFromPayload;

    beforeEach(async () => {
      vi.resetModules();
      vi.doMock("@utils/platform", () => ({
        isWindows: () => false,
        isMacOS: () => true,
        isLinux: () => false,
        getPlatform: () => "darwin" as const,
      }));
      const mod = await import("@utils/keycode-map");
      getKeyFromKeycode = mod.getKeyFromKeycode;
      matchesShortcutKey = mod.matchesShortcutKey;
      getKeyNameFromPayload = mod.getKeyNameFromPayload;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe("getKeyFromKeycode", () => {
      it("macOSキーコード0でAを返す", () => {
        expect(getKeyFromKeycode(0)).toBe("A");
      });

      it("macOSキーコード49でSpaceを返す", () => {
        expect(getKeyFromKeycode(49)).toBe("Space");
      });

      it("macOSキーコード122でF1を返す", () => {
        expect(getKeyFromKeycode(122)).toBe("F1");
      });

      it("不明なキーコードでundefinedを返す", () => {
        expect(getKeyFromKeycode(9999)).toBeUndefined();
      });

      it("macOSキーコード29で0を返す", () => {
        expect(getKeyFromKeycode(29)).toBe("0");
      });
    });

    describe("matchesShortcutKey", () => {
      it("キーコードが指定されたキー名に対応する場合trueを返す", () => {
        expect(matchesShortcutKey(49, "Space")).toBe(true);
      });

      it("大文字小文字を区別せずにマッチする", () => {
        expect(matchesShortcutKey(0, "a")).toBe(true);
        expect(matchesShortcutKey(0, "A")).toBe(true);
      });

      it("キーコードが一致しない場合falseを返す", () => {
        expect(matchesShortcutKey(0, "B")).toBe(false);
      });

      it("undefinedのキーコードでfalseを返す", () => {
        expect(matchesShortcutKey(undefined, "A")).toBe(false);
      });

      it("不明なキーコードでfalseを返す", () => {
        expect(matchesShortcutKey(9999, "A")).toBe(false);
      });
    });

    describe("getKeyNameFromPayload", () => {
      it("keyCodeよりkeyプロパティを優先する", () => {
        expect(getKeyNameFromPayload({ key: "Enter", keyCode: 49 })).toBe(
          "Enter",
        );
      });

      it("keyが未指定の場合keyCodeにフォールバックする", () => {
        expect(getKeyNameFromPayload({ keyCode: 49 })).toBe("Space");
      });

      it("keyもkeyCodeも存在しない場合undefinedを返す", () => {
        expect(getKeyNameFromPayload({})).toBeUndefined();
      });
    });
  });

  describe("Windowsプラットフォーム", () => {
    let getKeyFromKeycode: typeof import("@utils/keycode-map").getKeyFromKeycode;
    let getKeyNameFromPayload: typeof import("@utils/keycode-map").getKeyNameFromPayload;

    beforeEach(async () => {
      vi.resetModules();
      vi.doMock("@utils/platform", () => ({
        isWindows: () => true,
        isMacOS: () => false,
        isLinux: () => false,
        getPlatform: () => "win32" as const,
      }));
      const mod = await import("@utils/keycode-map");
      getKeyFromKeycode = mod.getKeyFromKeycode;
      getKeyNameFromPayload = mod.getKeyNameFromPayload;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Windows VK 0x41でAを返す", () => {
      expect(getKeyFromKeycode(0x41)).toBe("A");
    });

    it("Windows VK 0x20でSpaceを返す", () => {
      expect(getKeyFromKeycode(0x20)).toBe("Space");
    });

    it("Windows VK 0xA0でLShiftを返す", () => {
      expect(getKeyFromKeycode(0xa0)).toBe("LShift");
    });

    it("getKeyNameFromPayloadでLShiftをShiftに正規化する", () => {
      expect(getKeyNameFromPayload({ keyCode: 0xa0 })).toBe("Shift");
    });

    it("getKeyNameFromPayloadでLAltをAltに正規化する", () => {
      expect(getKeyNameFromPayload({ keyCode: 0xa4 })).toBe("Alt");
    });

    it("getKeyNameFromPayloadでLCtrlをCtrlに正規化する", () => {
      expect(getKeyNameFromPayload({ keyCode: 0xa2 })).toBe("Ctrl");
    });
  });
});
