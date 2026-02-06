import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createTestDatabase, type TestDatabase } from "../../helpers/test-db";
import {
  seedDatabase,
  sampleTranscriptions,
} from "../../helpers/fixtures";
import { initializeTestServices } from "../../helpers/test-app";
import { setTestDatabase } from "../../setup";

// Mock deleteAudioFile to avoid filesystem access during tests
vi.mock("@utils/audio-file-cleanup", () => ({
  deleteAudioFile: vi.fn().mockResolvedValue(undefined),
}));

type TestServices = Awaited<ReturnType<typeof initializeTestServices>>;

describe("Transcriptions ルーター（拡張）", () => {
  let testDb: TestDatabase;
  let trpcCaller: TestServices["trpcCaller"];
  let cleanup: () => Promise<void>;

  afterEach(async () => {
    if (cleanup) {
      await cleanup();
    }
    if (testDb) {
      await testDb.close();
    }
  });

  describe("createTranscription", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "transcriptions-create-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("新しい文字起こしを作成する", async () => {
      const created = await trpcCaller.transcriptions.createTranscription({
        text: "Hello, world!",
        language: "en",
      });

      expect(created).toBeDefined();
      expect(created.text).toBe("Hello, world!");
      expect(created.id).toBeDefined();
    });

    it("すべてのオプションフィールド付きで文字起こしを作成する", async () => {
      const created = await trpcCaller.transcriptions.createTranscription({
        text: "Full transcription",
        language: "ja",
        audioFile: "/path/to/audio.wav",
      });

      expect(created).toBeDefined();
      expect(created.text).toBe("Full transcription");
      expect(created.language).toBe("ja");
    });

    it("作成後に取得できる", async () => {
      const created = await trpcCaller.transcriptions.createTranscription({
        text: "Retrievable text",
      });

      const retrieved = await trpcCaller.transcriptions.getTranscriptionById({
        id: created.id,
      });

      expect(retrieved).toBeDefined();
      expect(retrieved.text).toBe("Retrievable text");
    });
  });

  describe("updateTranscription", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "transcriptions-update-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "withTranscriptions");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("文字起こしのテキストを更新する", async () => {
      const transcriptions =
        await trpcCaller.transcriptions.getTranscriptions({
          limit: 1,
          offset: 0,
        });
      const id = transcriptions[0].id;

      const updated = await trpcCaller.transcriptions.updateTranscription({
        id,
        data: { text: "Updated text content" },
      });

      expect(updated).toBeDefined();
      expect(updated.text).toBe("Updated text content");
    });

    it("テキスト更新時に他のフィールドを保持する", async () => {
      const transcriptions =
        await trpcCaller.transcriptions.getTranscriptions({
          limit: 1,
          offset: 0,
        });
      const original = transcriptions[0];

      const updated = await trpcCaller.transcriptions.updateTranscription({
        id: original.id,
        data: { text: "Changed text" },
      });

      expect(updated.id).toBe(original.id);
      expect(updated.language).toBe(original.language);
    });
  });

  describe("deleteMany", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({
        name: "transcriptions-delete-many-test",
      });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "withTranscriptions");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("複数の文字起こしをIDで一括削除する", async () => {
      const transcriptions =
        await trpcCaller.transcriptions.getTranscriptions({
          limit: 10,
          offset: 0,
        });
      const idsToDelete = transcriptions.slice(0, 2).map((t: { id: number }) => t.id);

      const result = await trpcCaller.transcriptions.deleteMany({
        ids: idsToDelete,
      });

      expect(result.deleted).toBe(2);

      const remaining = await trpcCaller.transcriptions.getTranscriptions({
        limit: 10,
        offset: 0,
      });
      expect(remaining).toHaveLength(transcriptions.length - 2);
    });

    it("空のID配列に対してカウント0を返す", async () => {
      const result = await trpcCaller.transcriptions.deleteMany({ ids: [] });

      expect(result.deleted).toBe(0);
      expect(result.audioFilesDeleted).toBe(0);
    });
  });

  describe("deleteAll", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({
        name: "transcriptions-delete-all-test",
      });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "withTranscriptions");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("すべての文字起こしを削除する", async () => {
      const beforeCount =
        await trpcCaller.transcriptions.getTranscriptionsCount({});
      expect(beforeCount).toBeGreaterThan(0);

      const result = await trpcCaller.transcriptions.deleteAll();

      expect(result.deleted).toBe(sampleTranscriptions.length);

      const afterCount =
        await trpcCaller.transcriptions.getTranscriptionsCount({});
      expect(afterCount).toBe(0);
    });
  });

  describe("getHistoryLimits", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({
        name: "transcriptions-limits-test",
      });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("maxCountとして500を返す", async () => {
      const limits = await trpcCaller.transcriptions.getHistoryLimits();

      expect(limits.maxCount).toBe(500);
    });

    it("maxAgeDaysとして30を返す", async () => {
      const limits = await trpcCaller.transcriptions.getHistoryLimits();

      expect(limits.maxAgeDays).toBe(30);
    });
  });
});
