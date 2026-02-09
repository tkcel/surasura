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
  getAllVocabularyForExport,
  bulkCreateVocabularyWords,
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

// RFC 4180 compliant CSV field escaper
function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

// RFC 4180 compliant CSV line parser
function parseCsvLines(csvText: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let fields: string[] = [];

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < csvText.length && csvText[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
      } else if (ch === "\r") {
        // skip CR
      } else if (ch === "\n") {
        fields.push(current);
        current = "";
        rows.push(fields);
        fields = [];
      } else {
        current += ch;
      }
    }
  }

  // Last field/row (if file doesn't end with newline)
  if (current !== "" || fields.length > 0) {
    fields.push(current);
    rows.push(fields);
  }

  return rows;
}

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

  // Export vocabulary to CSV file
  exportVocabulary: procedure.mutation(async () => {
    const data = await getAllVocabularyForExport();
    if (data.length === 0) {
      throw new Error("エクスポートするデータがありません");
    }

    // Build CSV with BOM for Excel Japanese support
    const header = "word,reading1,reading2,reading3";
    const lines = data.map((row) =>
      [
        escapeCsvField(row.word),
        escapeCsvField(row.reading1 || ""),
        escapeCsvField(row.reading2 || ""),
        escapeCsvField(row.reading3 || ""),
      ].join(","),
    );
    const csv = "\uFEFF" + header + "\n" + lines.join("\n") + "\n";

    const { dialog, BrowserWindow } = await import("electron");
    const focusedWindow = BrowserWindow.getFocusedWindow();
    const saveOptions = {
      defaultPath: `surasura-vocabulary-${new Date().toISOString().split("T")[0]}.csv`,
      filters: [{ name: "CSV Files", extensions: ["csv"] }],
    };
    const { filePath } = focusedWindow
      ? await dialog.showSaveDialog(focusedWindow, saveOptions)
      : await dialog.showSaveDialog(saveOptions);

    if (!filePath) {
      return { cancelled: true as const };
    }

    const fs = await import("node:fs/promises");
    await fs.writeFile(filePath, csv, "utf-8");
    return { cancelled: false as const, exported: data.length };
  }),

  // Import vocabulary from CSV file
  importVocabulary: procedure.mutation(async () => {
    const { dialog, BrowserWindow } = await import("electron");
    const focusedWindow = BrowserWindow.getFocusedWindow();
    const openOptions = {
      filters: [{ name: "CSV Files", extensions: ["csv"] }],
      properties: ["openFile" as const],
    };
    const { filePaths } = focusedWindow
      ? await dialog.showOpenDialog(focusedWindow, openOptions)
      : await dialog.showOpenDialog(openOptions);

    if (filePaths.length === 0) {
      return { cancelled: true as const };
    }

    const fs = await import("node:fs/promises");
    let content = await fs.readFile(filePaths[0], "utf-8");

    // Strip BOM if present
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }

    const rows = parseCsvLines(content.trim());
    if (rows.length === 0) {
      throw new Error("CSVファイルが空です");
    }

    // Validate header
    const headerRow = rows[0].map((h) => h.trim().toLowerCase());
    if (headerRow[0] !== "word") {
      throw new Error("CSVフォーマットが不正です。ヘッダー行に「word」が必要です");
    }

    const dataRows = rows.slice(1).filter((row) => row.some((cell) => cell.trim() !== ""));
    if (dataRows.length === 0) {
      throw new Error("インポートするデータがありません");
    }

    // Check current count and capacity
    const currentCount = await getVocabularyCount();
    if (currentCount >= MAX_VOCABULARY_COUNT) {
      throw new Error(
        `辞書の登録件数が上限（${MAX_VOCABULARY_COUNT}件）に達しています`,
      );
    }
    const remainingCapacity = MAX_VOCABULARY_COUNT - currentCount;

    // Parse entries
    const entries = dataRows
      .map((row) => ({
        word: row[0]?.trim() || "",
        reading1: row[1]?.trim() || undefined,
        reading2: row[2]?.trim() || undefined,
        reading3: row[3]?.trim() || undefined,
      }))
      .filter((entry) => entry.word !== "");

    if (entries.length === 0) {
      throw new Error("有効なデータがありません");
    }

    const result = await bulkCreateVocabularyWords(entries, remainingCapacity);

    const overLimit = Math.max(0, entries.length - result.created - result.skipped - result.errors.length);

    return {
      cancelled: false as const,
      created: result.created,
      skipped: result.skipped,
      errors: result.errors.length,
      overLimit,
    };
  }),

});
