import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createTestDatabase, type TestDatabase } from "../helpers/test-db";
import { seedDatabase, sampleTranscriptions } from "../helpers/fixtures";
import { setTestDatabase } from "../setup";

import {
  createTranscription,
  getTranscriptions,
  getTranscriptionById,
  updateTranscription,
  deleteTranscription,
  getTranscriptionsCount,
  getTranscriptionsByDateRange,
  getTranscriptionsByLanguage,
  searchTranscriptions,
  getOldTranscriptions,
  deleteOldTranscriptions,
  deleteExcessTranscriptions,
  deleteTranscriptionsByIds,
  deleteAllTranscriptions,
  MAX_HISTORY_COUNT,
  MAX_HISTORY_AGE_MS,
} from "@db/transcriptions";

let dbCounter = 0;

describe("DB: 文字起こし", () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = await createTestDatabase({
      name: `db-transcriptions-test-${dbCounter++}`,
    });
    setTestDatabase(testDb.db);
  });

  afterEach(async () => {
    if (testDb) await testDb.close();
  });

  // ============================================
  // Constants
  // ============================================

  describe("定数", () => {
    it("MAX_HISTORY_COUNTが500に設定されている", () => {
      expect(MAX_HISTORY_COUNT).toBe(500);
    });

    it("MAX_HISTORY_AGE_MSが30日分のミリ秒に設定されている", () => {
      expect(MAX_HISTORY_AGE_MS).toBe(30 * 24 * 60 * 60 * 1000);
    });
  });

  // ============================================
  // CRUD Operations
  // ============================================

  describe("createTranscription", () => {
    it("新しい文字起こしを作成して返す", async () => {
      const data = {
        text: "Hello, world!",
        language: "en",
        confidence: 0.95,
        duration: 5,
        speechModel: "openai-whisper-1",
        formattingModel: null,
      };

      const result = await createTranscription(data);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.text).toBe("Hello, world!");
      expect(result.language).toBe("en");
      expect(result.confidence).toBe(0.95);
      expect(result.duration).toBe(5);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("未指定の場合にtimestampが自動設定される", async () => {
      const before = Date.now();
      const result = await createTranscription({
        text: "Auto timestamp test",
        language: "en",
        speechModel: "openai-whisper-1",
        formattingModel: null,
      });
      const after = Date.now();

      expect(result.timestamp).toBeInstanceOf(Date);
      // Allow 1 second tolerance for timestamp precision
      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(before - 1000);
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(after + 1000);
    });
  });

  describe("getTranscriptions", () => {
    beforeEach(async () => {
      await seedDatabase(testDb, "withTranscriptions");
    });

    it("全ての文字起こしを返す", async () => {
      const results = await getTranscriptions({ limit: 50, offset: 0 });

      expect(results).toHaveLength(sampleTranscriptions.length);
      expect(results[0]).toHaveProperty("id");
      expect(results[0]).toHaveProperty("text");
      expect(results[0]).toHaveProperty("language");
    });

    it("limitパラメータに従う", async () => {
      const results = await getTranscriptions({ limit: 1, offset: 0 });

      expect(results).toHaveLength(1);
    });

    it("offsetパラメータに従う", async () => {
      const all = await getTranscriptions({ limit: 50, offset: 0 });
      const offset = await getTranscriptions({ limit: 50, offset: 1 });

      expect(offset).toHaveLength(all.length - 1);
      expect(offset[0].id).not.toBe(all[0].id);
    });

    it("デフォルトでtimestampの降順にソートされる", async () => {
      const results = await getTranscriptions({});

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].timestamp.getTime()).toBeGreaterThanOrEqual(
          results[i].timestamp.getTime(),
        );
      }
    });

    it("検索語でフィルタリングできる", async () => {
      const results = await getTranscriptions({ search: "test" });

      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => {
        expect(r.text.toLowerCase()).toContain("test");
      });
    });
  });

  describe("getTranscriptionById", () => {
    beforeEach(async () => {
      await seedDatabase(testDb, "withTranscriptions");
    });

    it("IDで文字起こしを取得できる", async () => {
      const all = await getTranscriptions({ limit: 1 });
      const result = await getTranscriptionById(all[0].id);

      expect(result).toBeDefined();
      expect(result!.id).toBe(all[0].id);
      expect(result!.text).toBe(all[0].text);
    });

    it("存在しないIDの場合にnullを返す", async () => {
      const result = await getTranscriptionById(99999);

      expect(result).toBeNull();
    });
  });

  describe("updateTranscription", () => {
    beforeEach(async () => {
      await seedDatabase(testDb, "withTranscriptions");
    });

    it("文字起こしを更新して更新後のレコードを返す", async () => {
      const all = await getTranscriptions({ limit: 1 });
      const id = all[0].id;

      const updated = await updateTranscription(id, { text: "Updated text" });

      expect(updated).toBeDefined();
      expect(updated!.id).toBe(id);
      expect(updated!.text).toBe("Updated text");
      expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(
        all[0].updatedAt.getTime(),
      );
    });

    it("存在しないIDの更新時にnullを返す", async () => {
      const result = await updateTranscription(99999, {
        text: "No such record",
      });

      expect(result).toBeNull();
    });
  });

  describe("deleteTranscription", () => {
    beforeEach(async () => {
      await seedDatabase(testDb, "withTranscriptions");
    });

    it("文字起こしを削除して削除されたレコードを返す", async () => {
      const all = await getTranscriptions({ limit: 50 });
      const id = all[0].id;

      const deleted = await deleteTranscription(id);

      expect(deleted).toBeDefined();
      expect(deleted!.id).toBe(id);

      const afterDelete = await getTranscriptions({ limit: 50 });
      expect(afterDelete).toHaveLength(all.length - 1);
    });

    it("存在しないIDの削除時にnullを返す", async () => {
      const result = await deleteTranscription(99999);

      expect(result).toBeNull();
    });
  });

  // ============================================
  // Count
  // ============================================

  describe("getTranscriptionsCount", () => {
    it("空のデータベースで0を返す", async () => {
      const count = await getTranscriptionsCount();

      expect(count).toBe(0);
    });

    it("シード後に合計件数を返す", async () => {
      await seedDatabase(testDb, "withTranscriptions");
      const count = await getTranscriptionsCount();

      expect(count).toBe(sampleTranscriptions.length);
    });

    it("検索によるフィルタ済み件数を返す", async () => {
      await seedDatabase(testDb, "withTranscriptions");
      const count = await getTranscriptionsCount("test");

      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(sampleTranscriptions.length);
    });

    it("検索結果が0件の場合に0を返す", async () => {
      await seedDatabase(testDb, "withTranscriptions");
      const count = await getTranscriptionsCount("nonexistentquerystring");

      expect(count).toBe(0);
    });
  });

  // ============================================
  // Search
  // ============================================

  describe("searchTranscriptions", () => {
    beforeEach(async () => {
      await seedDatabase(testDb, "withTranscriptions");
    });

    it("検索語に一致する文字起こしを見つける", async () => {
      const results = await searchTranscriptions("test");

      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => {
        expect(r.text.toLowerCase()).toContain("test");
      });
    });

    it("一致なしの場合に空配列を返す", async () => {
      const results = await searchTranscriptions("nonexistentquerystring");

      expect(results).toHaveLength(0);
    });

    it("limitパラメータに従う", async () => {
      const results = await searchTranscriptions("test", 1);

      expect(results.length).toBeLessThanOrEqual(1);
    });
  });

  // ============================================
  // Date Range
  // ============================================

  describe("getTranscriptionsByDateRange", () => {
    it("日付範囲内の文字起こしを返す", async () => {
      const now = new Date();
      const past = new Date(now.getTime() - 1000 * 60 * 60); // 1 hour ago
      const future = new Date(now.getTime() + 1000 * 60 * 60); // 1 hour from now

      await createTranscription({
        text: "Within range",
        language: "en",
        speechModel: "openai-whisper-1",
        formattingModel: null,
      });

      const results = await getTranscriptionsByDateRange(past, future);

      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => {
        expect(r.timestamp.getTime()).toBeGreaterThanOrEqual(past.getTime());
        expect(r.timestamp.getTime()).toBeLessThanOrEqual(future.getTime());
      });
    });

    it("範囲内に文字起こしがない場合に空配列を返す", async () => {
      await seedDatabase(testDb, "withTranscriptions");

      const farFuture = new Date("2099-01-01");
      const farFarFuture = new Date("2099-12-31");

      const results = await getTranscriptionsByDateRange(
        farFuture,
        farFarFuture,
      );

      expect(results).toHaveLength(0);
    });
  });

  // ============================================
  // Language Filter
  // ============================================

  describe("getTranscriptionsByLanguage", () => {
    beforeEach(async () => {
      await seedDatabase(testDb, "withTranscriptions");
    });

    it("指定した言語の文字起こしを返す", async () => {
      const results = await getTranscriptionsByLanguage("en");

      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => {
        expect(r.language).toBe("en");
      });
    });

    it("文字起こしがない言語の場合に空配列を返す", async () => {
      const results = await getTranscriptionsByLanguage("xx");

      expect(results).toHaveLength(0);
    });
  });

  // ============================================
  // History Cleanup Functions
  // ============================================

  describe("getOldTranscriptions", () => {
    it("指定日時より古い文字起こしを返す", async () => {
      await seedDatabase(testDb, "withTranscriptions");

      // All seeded transcriptions should have a recent timestamp
      const future = new Date(Date.now() + 1000 * 60 * 60);
      const results = await getOldTranscriptions(future);

      expect(results.length).toBe(sampleTranscriptions.length);
      results.forEach((r) => {
        expect(r).toHaveProperty("id");
        expect(r).toHaveProperty("audioFile");
      });
    });

    it("十分に古い文字起こしがない場合に空配列を返す", async () => {
      await seedDatabase(testDb, "withTranscriptions");

      const past = new Date("2000-01-01");
      const results = await getOldTranscriptions(past);

      expect(results).toHaveLength(0);
    });
  });

  describe("deleteOldTranscriptions", () => {
    it("指定日時より古い文字起こしを削除する", async () => {
      await seedDatabase(testDb, "withTranscriptions");

      const future = new Date(Date.now() + 1000 * 60 * 60);
      const deleted = await deleteOldTranscriptions(future);

      expect(deleted.length).toBe(sampleTranscriptions.length);
      deleted.forEach((d) => {
        expect(d).toHaveProperty("id");
        expect(d).toHaveProperty("audioFile");
      });

      const remaining = await getTranscriptionsCount();
      expect(remaining).toBe(0);
    });

    it("削除対象がない場合に空配列を返す", async () => {
      await seedDatabase(testDb, "withTranscriptions");

      const past = new Date("2000-01-01");
      const deleted = await deleteOldTranscriptions(past);

      expect(deleted).toHaveLength(0);

      const remaining = await getTranscriptionsCount();
      expect(remaining).toBe(sampleTranscriptions.length);
    });
  });

  describe("deleteExcessTranscriptions", () => {
    it("maxCountを超える文字起こしを削除する", async () => {
      await seedDatabase(testDb, "withTranscriptions");

      const deleted = await deleteExcessTranscriptions(1);

      expect(deleted.length).toBe(sampleTranscriptions.length - 1);
      deleted.forEach((d) => {
        expect(d).toHaveProperty("id");
        expect(d).toHaveProperty("audioFile");
      });

      const remaining = await getTranscriptionsCount();
      expect(remaining).toBe(1);
    });

    it("件数が上限以内の場合に空配列を返す", async () => {
      await seedDatabase(testDb, "withTranscriptions");

      const deleted = await deleteExcessTranscriptions(100);

      expect(deleted).toHaveLength(0);

      const remaining = await getTranscriptionsCount();
      expect(remaining).toBe(sampleTranscriptions.length);
    });
  });

  describe("deleteTranscriptionsByIds", () => {
    it("複数のIDで文字起こしを一括削除する", async () => {
      await seedDatabase(testDb, "withTranscriptions");

      const all = await getTranscriptions({ limit: 50 });
      const idsToDelete = [all[0].id, all[1].id];

      const deleted = await deleteTranscriptionsByIds(idsToDelete);

      expect(deleted).toHaveLength(2);
      deleted.forEach((d) => {
        expect(idsToDelete).toContain(d.id);
      });

      const remaining = await getTranscriptionsCount();
      expect(remaining).toBe(sampleTranscriptions.length - 2);
    });

    it("空のID配列の場合に空配列を返す", async () => {
      const deleted = await deleteTranscriptionsByIds([]);

      expect(deleted).toHaveLength(0);
    });

    it("存在しないIDを正常に処理する", async () => {
      const deleted = await deleteTranscriptionsByIds([99998, 99999]);

      expect(deleted).toHaveLength(0);
    });
  });

  describe("deleteAllTranscriptions", () => {
    it("全ての文字起こしを削除して返す", async () => {
      await seedDatabase(testDb, "withTranscriptions");

      const deleted = await deleteAllTranscriptions();

      expect(deleted).toHaveLength(sampleTranscriptions.length);
      deleted.forEach((d) => {
        expect(d).toHaveProperty("id");
        expect(d).toHaveProperty("audioFile");
      });

      const remaining = await getTranscriptionsCount();
      expect(remaining).toBe(0);
    });

    it("データベースが既に空の場合に空配列を返す", async () => {
      const deleted = await deleteAllTranscriptions();

      expect(deleted).toHaveLength(0);
    });
  });
});
