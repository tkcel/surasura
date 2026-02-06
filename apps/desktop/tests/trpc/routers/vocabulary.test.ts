import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createTestDatabase, type TestDatabase } from "../../helpers/test-db";
import {
  seedDatabase,
  sampleVocabulary,
} from "../../helpers/fixtures";
import { initializeTestServices } from "../../helpers/test-app";
import { setTestDatabase } from "../../setup";

type TestServices = Awaited<ReturnType<typeof initializeTestServices>>;

let dbCounter = 0;

describe("Vocabulary ルーター", () => {
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

  describe("getVocabulary", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: `vocab-test-${dbCounter++}` });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "withVocabulary");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("ページネーション付きで単語一覧を返す", async () => {
      const vocab = await trpcCaller.vocabulary.getVocabulary({
        limit: 10,
        offset: 0,
      });

      expect(vocab).toHaveLength(sampleVocabulary.length);
      expect(vocab[0]).toHaveProperty("id");
      expect(vocab[0]).toHaveProperty("word");
    });

    it("検索語で単語をフィルタリングする", async () => {
      const vocab = await trpcCaller.vocabulary.getVocabulary({
        search: "sura",
      });

      expect(vocab.length).toBeGreaterThan(0);
      vocab.forEach((item: { word: string }) => {
        expect(item.word.toLowerCase()).toContain("sura");
      });
    });
  });

  describe("getVocabularyCount", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: `vocab-test-${dbCounter++}` });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "withVocabulary");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("単語の総数を返す", async () => {
      const count = await trpcCaller.vocabulary.getVocabularyCount({});

      expect(count).toBe(sampleVocabulary.length);
    });
  });

  describe("getVocabularyStats", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: `vocab-test-${dbCounter++}` });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "withVocabulary");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("countとmaxCountを返す", async () => {
      const stats = await trpcCaller.vocabulary.getVocabularyStats();

      expect(stats).toHaveProperty("count");
      expect(stats).toHaveProperty("maxCount");
      expect(stats.count).toBe(sampleVocabulary.length);
      expect(stats.maxCount).toBe(500);
    });
  });

  describe("getVocabularyById", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: `vocab-test-${dbCounter++}` });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "withVocabulary");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("IDで単語を取得する", async () => {
      const vocab = await trpcCaller.vocabulary.getVocabulary({ limit: 1 });
      const item = await trpcCaller.vocabulary.getVocabularyById({
        id: vocab[0].id,
      });

      expect(item).toBeDefined();
      expect(item.id).toBe(vocab[0].id);
      expect(item.word).toBe(vocab[0].word);
    });
  });

  describe("getVocabularyByWord", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: `vocab-test-${dbCounter++}` });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "withVocabulary");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("単語テキストで単語を取得する", async () => {
      const item = await trpcCaller.vocabulary.getVocabularyByWord({
        word: "surasura",
      });

      expect(item).toBeDefined();
      expect(item.word).toBe("surasura");
    });
  });

  describe("searchVocabulary", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: `vocab-test-${dbCounter++}` });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "withVocabulary");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("検索語で単語を検索する", async () => {
      const results = await trpcCaller.vocabulary.searchVocabulary({
        searchTerm: "api",
        limit: 10,
      });

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("getMostUsedWords", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: `vocab-test-${dbCounter++}` });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "withVocabulary");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("使用回数順にソートされた頻出単語を返す", async () => {
      const results = await trpcCaller.vocabulary.getMostUsedWords({
        limit: 10,
      });

      expect(results.length).toBeGreaterThan(0);
      // Should be sorted by usage count descending
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].usageCount ?? 0).toBeGreaterThanOrEqual(
          results[i].usageCount ?? 0
        );
      }
    });
  });

  describe("createVocabularyWord", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: `vocab-test-${dbCounter++}` });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("新しい単語を作成する", async () => {
      const created = await trpcCaller.vocabulary.createVocabularyWord({
        word: "newword",
        isReplacement: false,
      });

      expect(created).toBeDefined();
      expect(created.word).toBe("newword");
      expect(created.id).toBeDefined();
    });

    it("isReplacementがtrueの場合replacementWordを必須とする", async () => {
      await expect(
        trpcCaller.vocabulary.createVocabularyWord({
          word: "testword",
          isReplacement: true,
        })
      ).rejects.toThrow();
    });

    it("wordとreplacementWordが同じ場合に拒否する", async () => {
      await expect(
        trpcCaller.vocabulary.createVocabularyWord({
          word: "same",
          isReplacement: true,
          replacementWord: "same",
        })
      ).rejects.toThrow();
    });
  });

  describe("updateVocabulary", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: `vocab-test-${dbCounter++}` });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "withVocabulary");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("単語を更新する", async () => {
      const vocab = await trpcCaller.vocabulary.getVocabulary({ limit: 1 });
      const updated = await trpcCaller.vocabulary.updateVocabulary({
        id: vocab[0].id,
        data: { word: "updatedword" },
      });

      expect(updated).toBeDefined();
      expect(updated.word).toBe("updatedword");
    });
  });

  describe("deleteVocabulary", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: `vocab-test-${dbCounter++}` });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "withVocabulary");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("単語を削除する", async () => {
      const vocab = await trpcCaller.vocabulary.getVocabulary({ limit: 10 });
      const initialCount = vocab.length;
      const idToDelete = vocab[0].id;

      await trpcCaller.vocabulary.deleteVocabulary({ id: idToDelete });

      const afterDelete = await trpcCaller.vocabulary.getVocabulary({
        limit: 10,
      });
      expect(afterDelete).toHaveLength(initialCount - 1);
      expect(afterDelete.find((v: { id: number }) => v.id === idToDelete)).toBeUndefined();
    });
  });

  describe("trackWordUsage", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: `vocab-test-${dbCounter++}` });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "withVocabulary");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("単語の使用回数をインクリメントする", async () => {
      const before = await trpcCaller.vocabulary.getVocabularyByWord({
        word: "surasura",
      });
      const originalCount = before.usageCount ?? 0;

      await trpcCaller.vocabulary.trackWordUsage({ word: "surasura" });

      const after = await trpcCaller.vocabulary.getVocabularyByWord({
        word: "surasura",
      });
      expect(after.usageCount).toBe(originalCount + 1);
    });
  });

  describe("空のデータベース", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: `vocab-test-${dbCounter++}` });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;
    });

    it("空のデータベースに対して空配列を返す", async () => {
      const vocab = await trpcCaller.vocabulary.getVocabulary({
        limit: 10,
        offset: 0,
      });

      expect(vocab).toHaveLength(0);
    });

    it("空のデータベースに対してカウント0を返す", async () => {
      const count = await trpcCaller.vocabulary.getVocabularyCount({});
      expect(count).toBe(0);
    });
  });
});
