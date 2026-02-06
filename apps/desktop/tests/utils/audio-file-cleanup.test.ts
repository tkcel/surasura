import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "node:fs";
import { app } from "electron";
import path from "node:path";

// Mock the logger module
vi.mock("../../src/main/logger", () => ({
  logger: {
    main: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    },
  },
}));

// Mock fs module
vi.mock("node:fs", () => {
  const mockPromises = {
    readdir: vi.fn(),
    stat: vi.fn(),
    unlink: vi.fn(),
  };
  return {
    default: {
      existsSync: vi.fn(),
      promises: mockPromises,
    },
    existsSync: vi.fn(),
    promises: mockPromises,
  };
});

describe("音声ファイルクリーンアップ", () => {
  const mockUserDataPath = "/mock/userData";
  const mockAudioDir = path.join(mockUserDataPath, "audio");

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up app.getPath mock
    vi.mocked(app.getPath).mockReturnValue(mockUserDataPath);
  });

  describe("cleanupAudioFiles", () => {
    it("存在しないディレクトリを処理する", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      // Re-import to get fresh module with mocks
      const { cleanupAudioFiles } = await import(
        "@utils/audio-file-cleanup"
      );

      await cleanupAudioFiles();

      // Should not try to read directory
      expect(fs.promises.readdir).not.toHaveBeenCalled();
    });

    it("maxAgeより古いファイルを削除する", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const now = Date.now();
      const eightDaysMs = 8 * 24 * 60 * 60 * 1000;

      vi.mocked(fs.promises.readdir).mockResolvedValue([
        "audio-old.wav",
        "audio-new.wav",
      ]);
      vi.mocked(fs.promises.stat).mockImplementation((filePath: string) => {
        if (filePath.includes("old")) {
          return Promise.resolve({
            size: 1024,
            mtime: new Date(now - eightDaysMs), // 8 days old
          });
        }
        return Promise.resolve({
          size: 1024,
          mtime: new Date(now - 1000), // 1 second old
        });
      });
      vi.mocked(fs.promises.unlink).mockResolvedValue(undefined);

      const { cleanupAudioFiles } = await import(
        "@utils/audio-file-cleanup"
      );

      await cleanupAudioFiles({ maxAgeMs: 7 * 24 * 60 * 60 * 1000 });

      // Should delete old file
      expect(fs.promises.unlink).toHaveBeenCalledWith(
        path.join(mockAudioDir, "audio-old.wav"),
      );
    });

    it("合計サイズがmaxSizeを超えた場合にファイルを削除する", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const now = Date.now();

      vi.mocked(fs.promises.readdir).mockResolvedValue([
        "audio-large1.wav",
        "audio-large2.wav",
      ]);
      vi.mocked(fs.promises.stat).mockImplementation(() => {
        return Promise.resolve({
          size: 300 * 1024 * 1024, // 300MB each
          mtime: new Date(now - 1000),
        });
      });
      vi.mocked(fs.promises.unlink).mockResolvedValue(undefined);

      const { cleanupAudioFiles } = await import(
        "@utils/audio-file-cleanup"
      );

      await cleanupAudioFiles({ maxSizeBytes: 500 * 1024 * 1024 });

      // At least one file should be deleted when total exceeds 500MB
      expect(fs.promises.unlink).toHaveBeenCalled();
    });

    it("audio-*ファイルのみを処理する", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const now = Date.now();
      const eightDaysMs = 8 * 24 * 60 * 60 * 1000;

      vi.mocked(fs.promises.readdir).mockResolvedValue([
        "audio-test.wav",
        "other-file.txt",
        "config.json",
      ]);
      vi.mocked(fs.promises.stat).mockImplementation(() => {
        return Promise.resolve({
          size: 1024,
          mtime: new Date(now - eightDaysMs), // All old
        });
      });
      vi.mocked(fs.promises.unlink).mockResolvedValue(undefined);

      const { cleanupAudioFiles } = await import(
        "@utils/audio-file-cleanup"
      );

      await cleanupAudioFiles({ maxAgeMs: 7 * 24 * 60 * 60 * 1000 });

      // Should only delete audio-* files, not other files
      if (vi.mocked(fs.promises.unlink).mock.calls.length > 0) {
        vi.mocked(fs.promises.unlink).mock.calls.forEach((call) => {
          expect(path.basename(call[0])).toMatch(/^audio-/);
        });
      }
    });
  });

  describe("deleteAudioFile", () => {
    it("audioディレクトリ内のファイルを削除する", async () => {
      vi.mocked(fs.promises.unlink).mockResolvedValue(undefined);

      const { deleteAudioFile } = await import(
        "@utils/audio-file-cleanup"
      );

      const filePath = path.join(mockAudioDir, "audio-test.wav");
      await deleteAudioFile(filePath);

      expect(fs.promises.unlink).toHaveBeenCalledWith(filePath);
    });

    it("audioディレクトリ外のファイルに対してエラーを投げる", async () => {
      const { deleteAudioFile } = await import(
        "@utils/audio-file-cleanup"
      );

      const outsidePath = "/some/other/directory/file.wav";

      await expect(deleteAudioFile(outsidePath)).rejects.toThrow(
        "File is not in the audio directory",
      );
    });

    it("ENOENTエラーを無視する", async () => {
      const enoentError = new Error("File not found") as NodeJS.ErrnoException;
      enoentError.code = "ENOENT";
      vi.mocked(fs.promises.unlink).mockRejectedValue(enoentError);

      const { deleteAudioFile } = await import(
        "@utils/audio-file-cleanup"
      );

      const filePath = path.join(mockAudioDir, "audio-missing.wav");

      // Should not throw for ENOENT
      await expect(deleteAudioFile(filePath)).resolves.toBeUndefined();
    });

    it("ENOENT以外のエラーを再スローする", async () => {
      const permError = new Error("Permission denied") as NodeJS.ErrnoException;
      permError.code = "EACCES";
      vi.mocked(fs.promises.unlink).mockRejectedValue(permError);

      const { deleteAudioFile } = await import(
        "@utils/audio-file-cleanup"
      );

      const filePath = path.join(mockAudioDir, "audio-locked.wav");

      await expect(deleteAudioFile(filePath)).rejects.toThrow(
        "Permission denied",
      );
    });
  });
});
