import { describe, it, expect, vi, beforeEach } from "vitest";

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

// Mock the DB transcriptions module
vi.mock("@db/transcriptions", () => ({
  deleteOldTranscriptions: vi.fn(),
  deleteExcessTranscriptions: vi.fn(),
  getTranscriptionsCount: vi.fn(),
  MAX_HISTORY_COUNT: 500,
  MAX_HISTORY_AGE_MS: 30 * 24 * 60 * 60 * 1000,
}));

// Mock the deleteAudioFile utility
vi.mock("@utils/audio-file-cleanup", () => ({
  deleteAudioFile: vi.fn(),
}));

import {
  cleanupHistoryByAge,
  cleanupHistoryByCount,
  runHistoryCleanup,
} from "@utils/history-cleanup";
import {
  deleteOldTranscriptions,
  deleteExcessTranscriptions,
  getTranscriptionsCount,
} from "@db/transcriptions";
import { deleteAudioFile } from "@utils/audio-file-cleanup";

describe("履歴クリーンアップ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("cleanupHistoryByAge", () => {
    it("正しいカットオフ日付でdeleteOldTranscriptionsを呼び出す", async () => {
      vi.mocked(deleteOldTranscriptions).mockResolvedValue([]);

      const beforeCall = Date.now();
      await cleanupHistoryByAge();
      const afterCall = Date.now();

      expect(deleteOldTranscriptions).toHaveBeenCalledOnce();
      const cutoffDate = vi.mocked(deleteOldTranscriptions).mock.calls[0][0] as Date;

      // The cutoff should be approximately 30 days ago
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const expectedMin = beforeCall - thirtyDaysMs;
      const expectedMax = afterCall - thirtyDaysMs;
      expect(cutoffDate.getTime()).toBeGreaterThanOrEqual(expectedMin);
      expect(cutoffDate.getTime()).toBeLessThanOrEqual(expectedMax);
    });

    it("関連する音声ファイルを削除する", async () => {
      vi.mocked(deleteOldTranscriptions).mockResolvedValue([
        { id: 1, audioFile: "/audio/file1.wav" },
        { id: 2, audioFile: "/audio/file2.wav" },
      ]);
      vi.mocked(deleteAudioFile).mockResolvedValue(undefined);

      const result = await cleanupHistoryByAge();

      expect(deleteAudioFile).toHaveBeenCalledTimes(2);
      expect(deleteAudioFile).toHaveBeenCalledWith("/audio/file1.wav");
      expect(deleteAudioFile).toHaveBeenCalledWith("/audio/file2.wav");
      expect(result.audioFilesDeleted).toBe(2);
      expect(result.deleted).toBe(2);
    });

    it("音声ファイル削除の失敗回数をカウントする", async () => {
      vi.mocked(deleteOldTranscriptions).mockResolvedValue([
        { id: 1, audioFile: "/audio/file1.wav" },
        { id: 2, audioFile: "/audio/file2.wav" },
      ]);
      vi.mocked(deleteAudioFile)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error("delete failed"));

      const result = await cleanupHistoryByAge();

      expect(result.audioFilesDeleted).toBe(1);
      expect(result.audioFilesFailed).toBe(1);
    });

    it("音声ファイルのない文字起こしをスキップする", async () => {
      vi.mocked(deleteOldTranscriptions).mockResolvedValue([
        { id: 1, audioFile: null },
        { id: 2, audioFile: "/audio/file2.wav" },
      ]);
      vi.mocked(deleteAudioFile).mockResolvedValue(undefined);

      const result = await cleanupHistoryByAge();

      expect(deleteAudioFile).toHaveBeenCalledTimes(1);
      expect(deleteAudioFile).toHaveBeenCalledWith("/audio/file2.wav");
      expect(result.audioFilesDeleted).toBe(1);
    });
  });

  describe("cleanupHistoryByCount", () => {
    it("MAX_HISTORY_COUNTを指定してdeleteExcessTranscriptionsを呼び出す", async () => {
      vi.mocked(deleteExcessTranscriptions).mockResolvedValue([]);

      await cleanupHistoryByCount();

      expect(deleteExcessTranscriptions).toHaveBeenCalledOnce();
      expect(deleteExcessTranscriptions).toHaveBeenCalledWith(500);
    });

    it("超過した文字起こしの関連音声ファイルを削除する", async () => {
      vi.mocked(deleteExcessTranscriptions).mockResolvedValue([
        { id: 10, audioFile: "/audio/excess1.wav" },
        { id: 11, audioFile: "/audio/excess2.wav" },
      ]);
      vi.mocked(deleteAudioFile).mockResolvedValue(undefined);

      const result = await cleanupHistoryByCount();

      expect(deleteAudioFile).toHaveBeenCalledTimes(2);
      expect(result.deleted).toBe(2);
      expect(result.audioFilesDeleted).toBe(2);
    });
  });

  describe("runHistoryCleanup", () => {
    it("期間と件数の両方のクリーンアップを実行する", async () => {
      vi.mocked(getTranscriptionsCount).mockResolvedValue(10);
      vi.mocked(deleteOldTranscriptions).mockResolvedValue([]);
      vi.mocked(deleteExcessTranscriptions).mockResolvedValue([]);

      const result = await runHistoryCleanup();

      expect(getTranscriptionsCount).toHaveBeenCalledOnce();
      expect(deleteOldTranscriptions).toHaveBeenCalledOnce();
      expect(deleteExcessTranscriptions).toHaveBeenCalledOnce();
      expect(result.totalDeleted).toBe(0);
    });

    it("統合されたCleanupResultを返す", async () => {
      vi.mocked(getTranscriptionsCount).mockResolvedValue(600);
      vi.mocked(deleteOldTranscriptions).mockResolvedValue([
        { id: 1, audioFile: "/audio/old1.wav" },
        { id: 2, audioFile: null },
      ]);
      vi.mocked(deleteExcessTranscriptions).mockResolvedValue([
        { id: 3, audioFile: "/audio/excess1.wav" },
      ]);
      vi.mocked(deleteAudioFile).mockResolvedValue(undefined);

      const result = await runHistoryCleanup();

      expect(result.deletedByAge).toBe(2);
      expect(result.deletedByCount).toBe(1);
      expect(result.totalDeleted).toBe(3);
      expect(result.audioFilesDeleted).toBe(2); // old1.wav + excess1.wav
      expect(result.audioFilesFailed).toBe(0);
    });

    it("両方のクリーンアップからの音声ファイル削除失敗を累積する", async () => {
      vi.mocked(getTranscriptionsCount).mockResolvedValue(600);
      vi.mocked(deleteOldTranscriptions).mockResolvedValue([
        { id: 1, audioFile: "/audio/old1.wav" },
      ]);
      vi.mocked(deleteExcessTranscriptions).mockResolvedValue([
        { id: 2, audioFile: "/audio/excess1.wav" },
      ]);
      vi.mocked(deleteAudioFile).mockRejectedValue(new Error("fail"));

      const result = await runHistoryCleanup();

      expect(result.audioFilesFailed).toBe(2);
      expect(result.audioFilesDeleted).toBe(0);
    });
  });
});
