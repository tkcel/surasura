import { describe, it, expect } from "vitest";
import {
  checkMaxKeysLength,
  checkDuplicateShortcut,
  checkReservedShortcut,
  checkAlphanumericOnly,
  checkDuplicateModifierPairs,
  checkSubsetConflict,
  validateShortcutComprehensive,
  checkDuplicateWithAllShortcuts,
} from "@utils/shortcut-validation";

describe("ショートカットバリデーション", () => {
  describe("checkMaxKeysLength", () => {
    it("空のキーで失敗する", () => {
      const result = checkMaxKeysLength([]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("キーが検出されませんでした");
    });

    it("1キーで成功する", () => {
      expect(checkMaxKeysLength(["A"]).valid).toBe(true);
    });

    it("4キー (最大) で成功する", () => {
      expect(
        checkMaxKeysLength(["Ctrl", "Shift", "Alt", "A"]).valid,
      ).toBe(true);
    });

    it("5キー (最大超過) で失敗する", () => {
      const result = checkMaxKeysLength(["Ctrl", "Shift", "Alt", "Fn", "A"]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("4");
    });
  });

  describe("checkDuplicateShortcut", () => {
    it("他のキーが空の場合成功する", () => {
      expect(checkDuplicateShortcut(["Alt", "Space"], []).valid).toBe(true);
    });

    it("キーが完全一致する場合失敗する", () => {
      const result = checkDuplicateShortcut(["Alt", "Space"], ["Alt", "Space"]);
      expect(result.valid).toBe(false);
    });

    it("キーが異なる順序で一致する場合失敗する", () => {
      const result = checkDuplicateShortcut(["Space", "Alt"], ["Alt", "Space"]);
      expect(result.valid).toBe(false);
    });

    it("大文字小文字を区別せずキーが一致する場合失敗する", () => {
      const result = checkDuplicateShortcut(["alt", "space"], ["Alt", "Space"]);
      expect(result.valid).toBe(false);
    });

    it("キーが異なる場合成功する", () => {
      expect(
        checkDuplicateShortcut(["Ctrl", "A"], ["Alt", "Space"]).valid,
      ).toBe(true);
    });
  });

  describe("checkDuplicateWithAllShortcuts", () => {
    it("競合がない場合成功する", () => {
      const result = checkDuplicateWithAllShortcuts(["Alt", "Space"], "pushToTalk", {
        toggleRecording: ["Ctrl", "R"],
      });
      expect(result.valid).toBe(true);
    });

    it("他のショートカットと競合する場合失敗する", () => {
      const result = checkDuplicateWithAllShortcuts(["Alt", "Space"], "pushToTalk", {
        toggleRecording: ["Alt", "Space"],
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("ハンズフリーモード");
    });

    it("自分自身との比較をスキップする", () => {
      const result = checkDuplicateWithAllShortcuts(["Alt", "Space"], "pushToTalk", {
        pushToTalk: ["Alt", "Space"],
      });
      expect(result.valid).toBe(true);
    });

    it("現在のキーが空の場合成功する", () => {
      expect(
        checkDuplicateWithAllShortcuts([], "pushToTalk", {
          toggleRecording: ["Alt", "Space"],
        }).valid,
      ).toBe(true);
    });
  });

  describe("checkReservedShortcut", () => {
    it("macOSでCmd+Cは失敗する", () => {
      const result = checkReservedShortcut(["Cmd", "C"], "darwin");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("システムショートカット");
    });

    it("WindowsでCtrl+Cは失敗する", () => {
      const result = checkReservedShortcut(["Ctrl", "C"], "win32");
      expect(result.valid).toBe(false);
    });

    it("macOSで予約されていないショートカットは成功する", () => {
      expect(
        checkReservedShortcut(["Alt", "Space"], "darwin").valid,
      ).toBe(true);
    });

    it("キーの順序に関係なく失敗する", () => {
      const result = checkReservedShortcut(["V", "Cmd"], "darwin");
      expect(result.valid).toBe(false);
    });
  });

  describe("checkAlphanumericOnly", () => {
    it("修飾キーが含まれている場合成功する", () => {
      expect(checkAlphanumericOnly(["Ctrl", "A"]).valid).toBe(true);
    });

    it("特殊キーが含まれている場合成功する", () => {
      expect(checkAlphanumericOnly(["F1"]).valid).toBe(true);
      expect(checkAlphanumericOnly(["Space"]).valid).toBe(true);
    });

    it("英数字キーのみの場合失敗する", () => {
      const result = checkAlphanumericOnly(["A", "B"]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("修飾キー");
    });

    it("単一の文字キーで失敗する", () => {
      expect(checkAlphanumericOnly(["A"]).valid).toBe(false);
    });
  });

  describe("checkDuplicateModifierPairs", () => {
    it("macOSでは常に成功する", () => {
      expect(
        checkDuplicateModifierPairs(["LShift", "RShift"], "darwin").valid,
      ).toBe(true);
    });

    it("WindowsでLShift + RShiftは失敗する", () => {
      const result = checkDuplicateModifierPairs(["LShift", "RShift"], "win32");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Shift");
    });

    it("WindowsでLCtrl + RCtrlは失敗する", () => {
      const result = checkDuplicateModifierPairs(["LCtrl", "RCtrl"], "win32");
      expect(result.valid).toBe(false);
    });

    it("Windowsで異なる種類の修飾キーは成功する", () => {
      expect(
        checkDuplicateModifierPairs(["LShift", "LCtrl"], "win32").valid,
      ).toBe(true);
    });
  });

  describe("checkSubsetConflict", () => {
    it("toggleRecordingタイプでのみ警告する", () => {
      const result = checkSubsetConflict(["Alt"], ["Alt", "Space"], "pushToTalk");
      expect(result.valid).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    it("toggleRecordingのキーがPTTキーのサブセットの場合警告する", () => {
      const result = checkSubsetConflict(
        ["Alt"],
        ["Alt", "Space"],
        "toggleRecording",
      );
      expect(result.valid).toBe(true);
      expect(result.warning).toContain("Push to Talk");
    });

    it("キーの長さが同じ場合は警告しない (サブセットではない)", () => {
      const result = checkSubsetConflict(
        ["Alt", "Space"],
        ["Alt", "Space"],
        "toggleRecording",
      );
      expect(result.warning).toBeUndefined();
    });

    it("他のキーが空の場合成功する", () => {
      const result = checkSubsetConflict(["Alt"], [], "toggleRecording");
      expect(result.valid).toBe(true);
      expect(result.warning).toBeUndefined();
    });
  });

  describe("validateShortcutComprehensive", () => {
    it("有効なショートカットでvalidを返す", () => {
      const result = validateShortcutComprehensive({
        currentShortcut: ["Alt", "Space"],
        otherShortcut: ["Ctrl", "R"],
        shortcutType: "pushToTalk",
        platform: "darwin",
      });
      expect(result.valid).toBe(true);
    });

    it("空のショートカットで失敗する", () => {
      const result = validateShortcutComprehensive({
        currentShortcut: [],
        otherShortcut: [],
        shortcutType: "pushToTalk",
        platform: "darwin",
      });
      expect(result.valid).toBe(false);
    });

    it("予約済みショートカットで失敗する", () => {
      const result = validateShortcutComprehensive({
        currentShortcut: ["Cmd", "C"],
        otherShortcut: [],
        shortcutType: "pushToTalk",
        platform: "darwin",
      });
      expect(result.valid).toBe(false);
    });

    it("英数字のみのショートカットで失敗する", () => {
      const result = validateShortcutComprehensive({
        currentShortcut: ["A", "B"],
        otherShortcut: [],
        shortcutType: "pushToTalk",
        platform: "darwin",
      });
      expect(result.valid).toBe(false);
    });

    it("サブセット競合で警告を返す", () => {
      const result = validateShortcutComprehensive({
        currentShortcut: ["Alt"],
        otherShortcut: ["Alt", "Space"],
        shortcutType: "toggleRecording",
        platform: "darwin",
      });
      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
    });

    it("Windowsで重複修飾キーペアは失敗する", () => {
      const result = validateShortcutComprehensive({
        currentShortcut: ["LShift", "RShift"],
        otherShortcut: [],
        shortcutType: "pushToTalk",
        platform: "win32",
      });
      expect(result.valid).toBe(false);
    });
  });
});
