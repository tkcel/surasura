import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createTestDatabase, type TestDatabase } from "../helpers/test-db";
import { setTestDatabase } from "../setup";
import { eq } from "drizzle-orm";
import * as schema from "@db/schema";

import { migrateVocabularyToReadings } from "@db/vocabulary-migration";
import { getVocabulary } from "@db/vocabulary";

let dbCounter = 0;

describe("DB: vocabulary-migration (migrateVocabularyToReadings)", () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = await createTestDatabase({
      name: `vocab-migration-test-${dbCounter++}`,
    });
    setTestDatabase(testDb.db);
  });

  afterEach(async () => {
    if (testDb) await testDb.close();
  });

  it("置換エントリを新モデルに変換する", async () => {
    // Insert a replacement entry: word="すらすら" → replacementWord="Surasura"
    await testDb.db.insert(schema.vocabulary).values({
      word: "すらすら",
      replacementWord: "Surasura",
      isReplacement: true,
    });

    await migrateVocabularyToReadings();

    const all = await getVocabulary({ limit: 100 });
    expect(all).toHaveLength(1);
    expect(all[0].word).toBe("Surasura");
    expect(all[0].reading1).toBe("すらすら");
    expect(all[0].isReplacement).toBe(false);
    expect(all[0].replacementWord).toBeNull();
  });

  it("重複wordの場合にreadingをマージする", async () => {
    // Insert existing entry
    await testDb.db.insert(schema.vocabulary).values({
      word: "Surasura",
      reading1: "スラスラ",
      isReplacement: false,
    });

    // Insert replacement entry that should merge
    await testDb.db.insert(schema.vocabulary).values({
      word: "すらすら",
      replacementWord: "Surasura",
      isReplacement: true,
    });

    await migrateVocabularyToReadings();

    const all = await getVocabulary({ limit: 100 });
    expect(all).toHaveLength(1);
    expect(all[0].word).toBe("Surasura");
    expect(all[0].reading1).toBe("スラスラ");
    expect(all[0].reading2).toBe("すらすら");
  });

  it("冪等性: 再実行しても結果が変わらない", async () => {
    await testDb.db.insert(schema.vocabulary).values({
      word: "テスト",
      replacementWord: "Test",
      isReplacement: true,
    });

    // First run
    await migrateVocabularyToReadings();

    const afterFirst = await getVocabulary({ limit: 100 });
    expect(afterFirst).toHaveLength(1);
    expect(afterFirst[0].word).toBe("Test");

    // Second run - should be no-op
    await migrateVocabularyToReadings();

    const afterSecond = await getVocabulary({ limit: 100 });
    expect(afterSecond).toHaveLength(1);
    expect(afterSecond[0].word).toBe("Test");
    expect(afterSecond[0].reading1).toBe("テスト");
  });

  it("replacementWordがない場合はisReplacementフラグをクリアする", async () => {
    await testDb.db.insert(schema.vocabulary).values({
      word: "broken",
      replacementWord: null,
      isReplacement: true,
    });

    await migrateVocabularyToReadings();

    const all = await getVocabulary({ limit: 100 });
    expect(all).toHaveLength(1);
    expect(all[0].word).toBe("broken");
    expect(all[0].isReplacement).toBe(false);
  });

  it("isReplacement=falseのエントリには影響しない", async () => {
    await testDb.db.insert(schema.vocabulary).values({
      word: "normal",
      reading1: "ノーマル",
      isReplacement: false,
    });

    await migrateVocabularyToReadings();

    const all = await getVocabulary({ limit: 100 });
    expect(all).toHaveLength(1);
    expect(all[0].word).toBe("normal");
    expect(all[0].reading1).toBe("ノーマル");
  });
});
