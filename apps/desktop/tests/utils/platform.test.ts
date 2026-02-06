import { describe, it, expect } from "vitest";
import {
  getPlatform,
  isWindows,
  isMacOS,
  isLinux,
  getNativeHelperName,
  getNativeHelperDir,
  getPlatformDisplayName,
} from "@utils/platform";

describe("プラットフォームユーティリティ", () => {
  // These tests verify actual behavior on the current platform (darwin in CI/dev)
  const currentPlatform = process.platform;

  describe("getPlatform", () => {
    it("process.platformを返す", () => {
      expect(getPlatform()).toBe(currentPlatform);
    });
  });

  describe("isWindows", () => {
    it("win32の場合のみtrueを返す", () => {
      expect(isWindows()).toBe(currentPlatform === "win32");
    });
  });

  describe("isMacOS", () => {
    it("darwinの場合のみtrueを返す", () => {
      expect(isMacOS()).toBe(currentPlatform === "darwin");
    });
  });

  describe("isLinux", () => {
    it("linuxの場合のみtrueを返す", () => {
      expect(isLinux()).toBe(currentPlatform === "linux");
    });
  });

  describe("getNativeHelperName", () => {
    it("macOSでSwiftHelperを返す", () => {
      if (currentPlatform === "darwin") {
        expect(getNativeHelperName()).toBe("SwiftHelper");
      }
    });

    it("WindowsでWindowsHelper.exeを返す", () => {
      if (currentPlatform === "win32") {
        expect(getNativeHelperName()).toBe("WindowsHelper.exe");
      }
    });
  });

  describe("getNativeHelperDir", () => {
    it("macOSでswift-helperを返す", () => {
      if (currentPlatform === "darwin") {
        expect(getNativeHelperDir()).toBe("swift-helper");
      }
    });

    it("Windowsでwindows-helperを返す", () => {
      if (currentPlatform === "win32") {
        expect(getNativeHelperDir()).toBe("windows-helper");
      }
    });
  });

  describe("getPlatformDisplayName", () => {
    it("darwinでmacOSを返す", () => {
      if (currentPlatform === "darwin") {
        expect(getPlatformDisplayName()).toBe("macOS");
      }
    });

    it("win32でWindowsを返す", () => {
      if (currentPlatform === "win32") {
        expect(getPlatformDisplayName()).toBe("Windows");
      }
    });

    it("linuxでLinuxを返す", () => {
      if (currentPlatform === "linux") {
        expect(getPlatformDisplayName()).toBe("Linux");
      }
    });
  });
});
