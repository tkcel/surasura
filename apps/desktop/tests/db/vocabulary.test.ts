import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createTestDatabase, type TestDatabase } from "../helpers/test-db";
import { seedDatabase, sampleVocabulary } from "../helpers/fixtures";
import { setTestDatabase } from "../setup";

import {
  createVocabularyWord,
  getVocabulary,
  getVocabularyById,
  getVocabularyByWord,
  updateVocabulary,
  deleteVocabulary,
  getVocabularyCount,
  trackWordUsage,
  getMostUsedWords,
  searchVocabulary,
  MAX_VOCABULARY_COUNT,
} from "@db/vocabulary";

let dbCounter = 0;

describe("DB: 単語帳", () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = await createTestDatabase({
      name: `db-vocabulary-test-${dbCounter++}`,
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
    it("MAX_VOCABULARY_COUNTが500に設定されている", () => {
      expect(MAX_VOCABULARY_COUNT).toBe(500);
    });
  });

  // ============================================
  // CRUD Operations
  // ============================================

  describe("createVocabularyWord", () => {
    it("新しい単語を作成して返す", async () => {
      const result = await createVocabularyWord({
        word: "hello",
        isReplacement: false,
        replacementWord: null,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.word).toBe("hello");
      expect(result.isReplacement).toBe(false);
      expect(result.replacementWord).toBeNull();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("置換単語を作成する", async () => {
      const result = await createVocabularyWord({
        word: "teh",
        isReplacement: true,
        replacementWord: "the",
      });

      expect(result.word).toBe("teh");
      expect(result.isReplacement).toBe(true);
      expect(result.replacementWord).toBe("the");
    });

    it("未指定の場合にdateAddedが自動設定される", async () => {
      const before = Date.now();
      const result = await createVocabularyWord({
        word: "autodate",
        isReplacement: false,
        replacementWord: null,
      });
      const after = Date.now();

      expect(result.dateAdded).toBeInstanceOf(Date);
      // Allow 1 second tolerance for timestamp precision
      expect(result.dateAdded.getTime()).toBeGreaterThanOrEqual(before - 1000);
      expect(result.dateAdded.getTime()).toBeLessThanOrEqual(after + 1000);
    });
  });

  describe("getVocabulary", () => {
    beforeEach(async () => {
      await seedDatabase(testDb, "withVocabulary");
    });

    it("全ての単語を返す", async () => {
      const results = await getVocabulary({ limit: 50, offset: 0 });

      expect(results).toHaveLength(sampleVocabulary.length);
      expect(results[0]).toHaveProperty("id");
      expect(results[0]).toHaveProperty("word");
    });

    it("limitパラメータに従う", async () => {
      const results = await getVocabulary({ limit: 1, offset: 0 });

      expect(results).toHaveLength(1);
    });

    it("offsetパラメータに従う", async () => {
      const all = await getVocabulary({ limit: 50, offset: 0 });
      const offset = await getVocabulary({ limit: 50, offset: 1 });

      expect(offset).toHaveLength(all.length - 1);
      expect(offset[0].id).not.toBe(all[0].id);
    });

    it("検索語でフィルタリングできる", async () => {
      // sampleVocabulary has "API" - the search uses LIKE which is case-sensitive in SQLite
      const results = await getVocabulary({ search: "API" });

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("getVocabularyById", () => {
    beforeEach(async () => {
      await seedDatabase(testDb, "withVocabulary");
    });

    it("IDで単語を取得できる", async () => {
      const all = await getVocabulary({ limit: 1 });
      const result = await getVocabularyById(all[0].id);

      expect(result).toBeDefined();
      expect(result!.id).toBe(all[0].id);
      expect(result!.word).toBe(all[0].word);
    });

    it("存在しないIDの場合にnullを返す", async () => {
      const result = await getVocabularyById(99999);

      expect(result).toBeNull();
    });
  });

  describe("getVocabularyByWord", () => {
    beforeEach(async () => {
      await seedDatabase(testDb, "withVocabulary");
    });

    it("単語で検索できる（toLowerCaseによる大文字小文字無視）", async () => {
      // sampleVocabulary has "teh" - getVocabularyByWord uses word.toLowerCase()
      const result = await getVocabularyByWord("teh");

      expect(result).toBeDefined();
      expect(result!.word).toBe("teh");
    });

    it("存在しない単語の場合にnullを返す", async () => {
      const result = await getVocabularyByWord("nonexistentword");

      expect(result).toBeNull();
    });
  });

  describe("updateVocabulary", () => {
    beforeEach(async () => {
      await seedDatabase(testDb, "withVocabulary");
    });

    it("単語を更新して更新後のレコードを返す", async () => {
      const all = await getVocabulary({ limit: 1 });
      const id = all[0].id;

      const updated = await updateVocabulary(id, { word: "updatedword" });

      expect(updated).toBeDefined();
      expect(updated!.id).toBe(id);
      expect(updated!.word).toBe("updatedword");
      expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(
        all[0].updatedAt.getTime(),
      );
    });

    it("存在しないIDの更新時にnullを返す", async () => {
      const result = await updateVocabulary(99999, { word: "nope" });

      expect(result).toBeNull();
    });
  });

  describe("deleteVocabulary", () => {
    beforeEach(async () => {
      await seedDatabase(testDb, "withVocabulary");
    });

    it("単語を削除して削除されたレコードを返す", async () => {
      const all = await getVocabulary({ limit: 50 });
      const id = all[0].id;

      const deleted = await deleteVocabulary(id);

      expect(deleted).toBeDefined();
      expect(deleted!.id).toBe(id);

      const afterDelete = await getVocabulary({ limit: 50 });
      expect(afterDelete).toHaveLength(all.length - 1);
    });

    it("存在しないIDの削除時にnullを返す", async () => {
      const result = await deleteVocabulary(99999);

      expect(result).toBeNull();
    });
  });

  // ============================================
  // Count
  // ============================================

  describe("getVocabularyCount", () => {
    it("空のデータベースで0を返す", async () => {
      const count = await getVocabularyCount();

      expect(count).toBe(0);
    });

    it("シード後に合計件数を返す", async () => {
      await seedDatabase(testDb, "withVocabulary");
      const count = await getVocabularyCount();

      expect(count).toBe(sampleVocabulary.length);
    });

    it("検索によるフィルタ済み件数を返す", async () => {
      await seedDatabase(testDb, "withVocabulary");
      const count = await getVocabularyCount("API");

      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(sampleVocabulary.length);
    });

    it("検索結果が0件の場合に0を返す", async () => {
      await seedDatabase(testDb, "withVocabulary");
      const count = await getVocabularyCount("nonexistentquerystring");

      expect(count).toBe(0);
    });
  });

  // ============================================
  // Usage Tracking
  // ============================================

  describe("trackWordUsage", () => {
    beforeEach(async () => {
      await seedDatabase(testDb, "withVocabulary");
    });

    it("使用回数をアトミックにインクリメントする", async () => {
      // "surasura" starts with usageCount 5
      const before = await getVocabularyByWord("surasura");
      expect(before).toBeDefined();
      const beforeCount = before!.usageCount ?? 0;

      const result = await trackWordUsage("surasura");

      expect(result).toBeDefined();
      expect(result!.usageCount).toBe(beforeCount + 1);
    });

    it("存在しない単語の場合にnullを返す", async () => {
      const result = await trackWordUsage("nonexistentword");

      expect(result).toBeNull();
    });
  });

  describe("getMostUsedWords", () => {
    beforeEach(async () => {
      await seedDatabase(testDb, "withVocabulary");
    });

    it("usageCountが0より大きい単語を使用回数の降順で返す", async () => {
      const results = await getMostUsedWords(10);

      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => {
        expect(r.usageCount).toBeGreaterThan(0);
      });

      // Verify descending order
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].usageCount!).toBeGreaterThanOrEqual(
          results[i].usageCount!,
        );
      }
    });

    it("limitパラメータに従う", async () => {
      const results = await getMostUsedWords(1);

      expect(results).toHaveLength(1);
    });
  });

  // ============================================
  // Search
  // ============================================

  describe("searchVocabulary", () => {
    beforeEach(async () => {
      await seedDatabase(testDb, "withVocabulary");
    });

    it("検索語に一致する単語を見つける", async () => {
      const results = await searchVocabulary("sura");

      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => {
        expect(r.word.toLowerCase()).toContain("sura");
      });
    });

    it("一致なしの場合に空配列を返す", async () => {
      const results = await searchVocabulary("nonexistentquerystring");

      expect(results).toHaveLength(0);
    });

    it("limitパラメータに従う", async () => {
      const results = await searchVocabulary("a", 1);

      expect(results.length).toBeLessThanOrEqual(1);
    });
  });
});
