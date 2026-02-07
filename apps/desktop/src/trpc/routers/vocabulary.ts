import { z } from "zod";
import { createRouter, procedure } from "../trpc";
import {
  getVocabulary,
  getVocabularyById,
  getVocabularyByWord,
  createVocabularyWord,
  updateVocabulary,
  deleteVocabulary,
  deleteVocabularyByIds,
  deleteAllVocabulary,
  getVocabularyCount,
  searchVocabulary,
  trackWordUsage,
  getMostUsedWords,
  MAX_VOCABULARY_COUNT,
} from "../../db/vocabulary";

// Input schemas
const GetVocabularySchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
  sortBy: z.enum(["word", "dateAdded", "usageCount"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
});

const CreateVocabularySchema = z
  .object({
    word: z.string().min(1),
    reading1: z.string().optional(),
    reading2: z.string().optional(),
    reading3: z.string().optional(),
    // Legacy fields - kept for backward compatibility
    isReplacement: z.boolean().optional(),
    replacementWord: z.string().optional(),
  })
  .refine(
    (data) => {
      // Readings must not equal the word
      const readings = [data.reading1, data.reading2, data.reading3].filter(
        (r): r is string => !!r,
      );
      return readings.every((r) => r !== data.word);
    },
    {
      message: "読み方は単語と異なる必要があります",
      path: ["reading1"],
    },
  )
  .refine(
    (data) => {
      // Readings must not have duplicates among themselves
      const readings = [data.reading1, data.reading2, data.reading3].filter(
        (r): r is string => !!r,
      );
      return new Set(readings).size === readings.length;
    },
    {
      message: "読み方パターンが重複しています",
      path: ["reading2"],
    },
  );

const UpdateVocabularySchema = z
  .object({
    word: z.string().min(1).optional(),
    reading1: z.string().nullable().optional(),
    reading2: z.string().nullable().optional(),
    reading3: z.string().nullable().optional(),
    // Legacy fields - kept for backward compatibility
    isReplacement: z.boolean().optional(),
    replacementWord: z.string().optional(),
  })
  .refine(
    (data) => {
      // If word is provided, readings must not equal it
      if (!data.word) return true;
      const readings = [data.reading1, data.reading2, data.reading3].filter(
        (r): r is string => !!r,
      );
      return readings.every((r) => r !== data.word);
    },
    {
      message: "読み方は単語と異なる必要があります",
      path: ["reading1"],
    },
  )
  .refine(
    (data) => {
      // Readings must not have duplicates among themselves
      const readings = [data.reading1, data.reading2, data.reading3].filter(
        (r): r is string => !!r,
      );
      return new Set(readings).size === readings.length;
    },
    {
      message: "読み方パターンが重複しています",
      path: ["reading2"],
    },
  );

export const vocabularyRouter = createRouter({
  // Get vocabulary list with pagination and filtering
  getVocabulary: procedure
    .input(GetVocabularySchema)
    .query(async ({ input }) => {
      return await getVocabulary(input);
    }),

  // Get vocabulary count
  getVocabularyCount: procedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ input }) => {
      return await getVocabularyCount(input.search);
    }),

  // Get vocabulary count with max limit
  getVocabularyStats: procedure.query(async () => {
    const count = await getVocabularyCount();
    return {
      count,
      maxCount: MAX_VOCABULARY_COUNT,
    };
  }),

  // Get vocabulary by ID
  getVocabularyById: procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getVocabularyById(input.id);
    }),

  // Get vocabulary by word
  getVocabularyByWord: procedure
    .input(z.object({ word: z.string() }))
    .query(async ({ input }) => {
      return await getVocabularyByWord(input.word);
    }),

  // Search vocabulary
  searchVocabulary: procedure
    .input(
      z.object({
        searchTerm: z.string(),
        limit: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      return await searchVocabulary(input.searchTerm, input.limit);
    }),

  // Get most used words
  getMostUsedWords: procedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      return await getMostUsedWords(input.limit);
    }),

  // Create vocabulary word
  createVocabularyWord: procedure
    .input(CreateVocabularySchema)
    .mutation(async ({ input }) => {
      const currentCount = await getVocabularyCount();
      if (currentCount >= MAX_VOCABULARY_COUNT) {
        throw new Error(
          `辞書の登録件数が上限（${MAX_VOCABULARY_COUNT}件）に達しています`,
        );
      }
      return await createVocabularyWord(input);
    }),

  // Update vocabulary word
  updateVocabulary: procedure
    .input(
      z.object({
        id: z.number(),
        data: UpdateVocabularySchema,
      }),
    )
    .mutation(async ({ input }) => {
      return await updateVocabulary(input.id, input.data);
    }),

  // Delete vocabulary word
  deleteVocabulary: procedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteVocabulary(input.id);
    }),

  // Delete multiple vocabulary words by IDs
  deleteMany: procedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      if (input.ids.length === 0) {
        return { deleted: 0 };
      }
      const deleted = await deleteVocabularyByIds(input.ids);
      return { deleted: deleted.length };
    }),

  // Delete all vocabulary words
  deleteAll: procedure.mutation(async () => {
    const deleted = await deleteAllVocabulary();
    return { deleted: deleted.length };
  }),

  // Track word usage
  trackWordUsage: procedure
    .input(z.object({ word: z.string() }))
    .mutation(async ({ input }) => {
      return await trackWordUsage(input.word);
    }),

});
