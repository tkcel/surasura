import {
  eq,
  desc,
  asc,
  and,
  ilike,
  count,
  gte,
  lte,
  lt,
  sql,
  like,
  inArray,
} from "drizzle-orm";
import { db } from ".";
import {
  transcriptions,
  type Transcription,
  type NewTranscription,
} from "./schema";

// Create a new transcription
export async function createTranscription(
  data: Omit<NewTranscription, "id" | "createdAt" | "updatedAt">
) {
  const now = new Date();

  const newTranscription: NewTranscription = {
    ...data,
    timestamp: data.timestamp || now,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db
    .insert(transcriptions)
    .values(newTranscription)
    .returning();
  return result[0];
}

// Get all transcriptions with pagination and sorting
export async function getTranscriptions(
  options: {
    limit?: number;
    offset?: number;
    sortBy?: "timestamp" | "createdAt";
    sortOrder?: "asc" | "desc";
    search?: string;
  } = {}
) {
  const {
    limit = 50,
    offset = 0,
    sortBy = "timestamp",
    sortOrder = "desc",
    search,
  } = options;

  // Build query with conditional where clause
  const sortColumn =
    sortBy === "timestamp"
      ? transcriptions.timestamp
      : transcriptions.createdAt;
  const orderFn = sortOrder === "asc" ? asc : desc;

  if (search) {
    return await db
      .select()
      .from(transcriptions)
      .where(sql`${transcriptions.text} LIKE ${`%${search}%`} COLLATE NOCASE`)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);
  } else {
    return await db
      .select()
      .from(transcriptions)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);
  }
}

// Get transcription by ID
export async function getTranscriptionById(id: number) {
  const result = await db
    .select()
    .from(transcriptions)
    .where(eq(transcriptions.id, id));
  return result[0] || null;
}

// Update transcription
export async function updateTranscription(
  id: number,
  data: Partial<Omit<Transcription, "id" | "createdAt">>
) {
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  const result = await db
    .update(transcriptions)
    .set(updateData)
    .where(eq(transcriptions.id, id))
    .returning();

  return result[0] || null;
}

// Delete transcription
export async function deleteTranscription(id: number) {
  const result = await db
    .delete(transcriptions)
    .where(eq(transcriptions.id, id))
    .returning();

  return result[0] || null;
}

// Get transcriptions count
export async function getTranscriptionsCount(search?: string) {
  if (search) {
    const result = await db
      .select({ count: count() })
      .from(transcriptions)
      .where(sql`${transcriptions.text} LIKE ${`%${search}%`} COLLATE NOCASE`);
    return result[0]?.count || 0;
  } else {
    const result = await db.select({ count: count() }).from(transcriptions);
    return result[0]?.count || 0;
  }
}

// Get transcriptions by date range
export async function getTranscriptionsByDateRange(
  startDate: Date,
  endDate: Date
) {
  return await db
    .select()
    .from(transcriptions)
    .where(
      and(
        gte(transcriptions.timestamp, startDate),
        lte(transcriptions.timestamp, endDate)
      )
    )
    .orderBy(desc(transcriptions.timestamp));
}

// Get transcriptions by language
export async function getTranscriptionsByLanguage(language: string) {
  return await db
    .select()
    .from(transcriptions)
    .where(eq(transcriptions.language, language))
    .orderBy(desc(transcriptions.timestamp));
}

// Search transcriptions
export async function searchTranscriptions(searchTerm: string, limit = 20) {
  return await db
    .select()
    .from(transcriptions)
    .where(sql`${transcriptions.text} LIKE ${`%${searchTerm}%`} COLLATE NOCASE`)
    .orderBy(desc(transcriptions.timestamp))
    .limit(limit);
}

// ============================================
// History Cleanup Functions
// ============================================

/**
 * 履歴の最大保存件数
 * この件数を超えた場合、古いものから自動削除される
 */
export const MAX_HISTORY_COUNT = 500;

/**
 * 履歴の最大保存期間（ミリ秒）
 * 30日 = 30 * 24 * 60 * 60 * 1000 = 2592000000
 */
export const MAX_HISTORY_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * 指定した日付より古い履歴を取得（削除前の確認用）
 * @param olderThan 基準日時
 * @returns 古い履歴の配列（audioFileパスを含む）
 */
export async function getOldTranscriptions(olderThan: Date) {
  return await db
    .select({
      id: transcriptions.id,
      audioFile: transcriptions.audioFile,
    })
    .from(transcriptions)
    .where(lt(transcriptions.timestamp, olderThan))
    .orderBy(asc(transcriptions.timestamp));
}

/**
 * 指定した日付より古い履歴を削除
 * @param olderThan 基準日時
 * @returns 削除された履歴の配列（audioFileパスを含む）
 */
export async function deleteOldTranscriptions(olderThan: Date) {
  const result = await db
    .delete(transcriptions)
    .where(lt(transcriptions.timestamp, olderThan))
    .returning({
      id: transcriptions.id,
      audioFile: transcriptions.audioFile,
    });

  return result;
}

/**
 * 最大件数を超えた分の古い履歴を取得
 * @param maxCount 最大保存件数
 * @returns 超過分の履歴（audioFileパスを含む）
 */
export async function getExcessTranscriptions(maxCount: number) {
  // サブクエリで保持すべきIDを取得し、それ以外を返す
  const toKeep = await db
    .select({ id: transcriptions.id })
    .from(transcriptions)
    .orderBy(desc(transcriptions.timestamp))
    .limit(maxCount);

  const keepIds = toKeep.map((t) => t.id);

  if (keepIds.length === 0) {
    // 保持すべきものがない場合は全件返す
    return await db
      .select({
        id: transcriptions.id,
        audioFile: transcriptions.audioFile,
      })
      .from(transcriptions);
  }

  return await db
    .select({
      id: transcriptions.id,
      audioFile: transcriptions.audioFile,
    })
    .from(transcriptions)
    .where(
      sql`${transcriptions.id} NOT IN (${sql.join(
        keepIds.map((id) => sql`${id}`),
        sql`, `
      )})`
    );
}

/**
 * 最大件数を超えた分の古い履歴を削除
 * @param maxCount 最大保存件数
 * @returns 削除された履歴の配列（audioFileパスを含む）
 */
export async function deleteExcessTranscriptions(maxCount: number) {
  const excess = await getExcessTranscriptions(maxCount);

  if (excess.length === 0) {
    return [];
  }

  const excessIds = excess.map((t) => t.id);

  await db.delete(transcriptions).where(inArray(transcriptions.id, excessIds));

  return excess;
}

/**
 * 複数の履歴をIDで一括削除
 * @param ids 削除する履歴のID配列
 * @returns 削除された履歴の配列（audioFileパスを含む）
 */
export async function deleteTranscriptionsByIds(ids: number[]) {
  if (ids.length === 0) {
    return [];
  }

  const result = await db
    .delete(transcriptions)
    .where(inArray(transcriptions.id, ids))
    .returning({
      id: transcriptions.id,
      audioFile: transcriptions.audioFile,
    });

  return result;
}

/**
 * 全ての履歴を削除
 * @returns 削除された履歴の配列（audioFileパスを含む）
 */
export async function deleteAllTranscriptions() {
  const result = await db.delete(transcriptions).returning({
    id: transcriptions.id,
    audioFile: transcriptions.audioFile,
  });

  return result;
}
