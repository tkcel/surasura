import { eq } from "drizzle-orm";
import { db } from ".";
import { vocabulary } from "./schema";
import { logger } from "../main/logger";

/**
 * Migrate legacy vocabulary entries (isReplacement=true) to the new readings model.
 *
 * For each replacement entry:
 *   - Old model: word="すらすら", replacementWord="Surasura", isReplacement=true
 *   - New model: word="Surasura", reading1="すらすら"
 *
 * If a word entry with the same name as replacementWord already exists,
 * merge the reading into the existing entry.
 *
 * Idempotent: only processes entries where isReplacement=true.
 */
export async function migrateVocabularyToReadings(): Promise<void> {
  // Find all replacement entries
  const replacementEntries = await db
    .select()
    .from(vocabulary)
    .where(eq(vocabulary.isReplacement, true));

  if (replacementEntries.length === 0) {
    return;
  }

  logger.db.info(
    `Migrating ${replacementEntries.length} replacement entries to readings model`,
  );

  for (const entry of replacementEntries) {
    const oldWord = entry.word; // e.g. "すらすら"
    const newWord = entry.replacementWord; // e.g. "Surasura"

    if (!newWord) {
      // Invalid entry - clear the isReplacement flag
      await db
        .update(vocabulary)
        .set({ isReplacement: false, updatedAt: new Date() })
        .where(eq(vocabulary.id, entry.id));
      continue;
    }

    // Check if an entry with the new word already exists
    const existingEntries = await db
      .select()
      .from(vocabulary)
      .where(eq(vocabulary.word, newWord));

    const existing = existingEntries[0];

    if (existing) {
      // Merge: add oldWord as a reading to the existing entry
      const readingToAdd = oldWord;
      let updated = false;

      if (!existing.reading1) {
        await db
          .update(vocabulary)
          .set({ reading1: readingToAdd, updatedAt: new Date() })
          .where(eq(vocabulary.id, existing.id));
        updated = true;
      } else if (
        existing.reading1 !== readingToAdd &&
        !existing.reading2
      ) {
        await db
          .update(vocabulary)
          .set({ reading2: readingToAdd, updatedAt: new Date() })
          .where(eq(vocabulary.id, existing.id));
        updated = true;
      } else if (
        existing.reading1 !== readingToAdd &&
        existing.reading2 !== readingToAdd &&
        !existing.reading3
      ) {
        await db
          .update(vocabulary)
          .set({ reading3: readingToAdd, updatedAt: new Date() })
          .where(eq(vocabulary.id, existing.id));
        updated = true;
      }

      // Delete the old replacement entry
      await db.delete(vocabulary).where(eq(vocabulary.id, entry.id));

      logger.db.info(
        `Merged replacement "${oldWord}" → "${newWord}" into existing entry (reading added: ${updated})`,
      );
    } else {
      // Transform: rename the entry
      await db
        .update(vocabulary)
        .set({
          word: newWord,
          reading1: oldWord,
          replacementWord: null,
          isReplacement: false,
          updatedAt: new Date(),
        })
        .where(eq(vocabulary.id, entry.id));

      logger.db.info(
        `Converted replacement "${oldWord}" → "${newWord}" to readings model`,
      );
    }
  }

  logger.db.info("Vocabulary migration to readings model completed");
}
