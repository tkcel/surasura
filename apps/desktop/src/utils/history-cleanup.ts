/**
 * 履歴クリーンアップユーティリティ
 *
 * 仕様:
 * - 30日以上経過した履歴を自動削除
 * - 500件を超えた場合、古いものから自動削除
 * - 削除時は関連する音声ファイルも一緒に削除
 * - アプリ起動時に自動実行
 */

import { logger } from "../main/logger";
import { deleteAudioFile } from "./audio-file-cleanup";
import {
  deleteOldTranscriptions,
  deleteExcessTranscriptions,
  MAX_HISTORY_COUNT,
  MAX_HISTORY_AGE_MS,
  getTranscriptionsCount,
} from "../db/transcriptions";

export interface CleanupResult {
  deletedByAge: number;
  deletedByCount: number;
  totalDeleted: number;
  audioFilesDeleted: number;
  audioFilesFailed: number;
}

/**
 * 30日以上経過した履歴を削除
 * @returns 削除された件数と音声ファイル削除結果
 */
export async function cleanupHistoryByAge(): Promise<{
  deleted: number;
  audioFilesDeleted: number;
  audioFilesFailed: number;
}> {
  const cutoffDate = new Date(Date.now() - MAX_HISTORY_AGE_MS);

  logger.main.info("Starting history cleanup by age", {
    cutoffDate: cutoffDate.toISOString(),
    maxAgeDays: MAX_HISTORY_AGE_MS / (24 * 60 * 60 * 1000),
  });

  try {
    const deletedTranscriptions = await deleteOldTranscriptions(cutoffDate);

    let audioFilesDeleted = 0;
    let audioFilesFailed = 0;

    // 関連する音声ファイルを削除
    for (const transcription of deletedTranscriptions) {
      if (transcription.audioFile) {
        try {
          await deleteAudioFile(transcription.audioFile);
          audioFilesDeleted++;
        } catch (error) {
          audioFilesFailed++;
          logger.main.warn("Failed to delete audio file during history cleanup", {
            transcriptionId: transcription.id,
            audioFile: transcription.audioFile,
            error,
          });
        }
      }
    }

    if (deletedTranscriptions.length > 0) {
      logger.main.info("History cleanup by age completed", {
        deletedCount: deletedTranscriptions.length,
        audioFilesDeleted,
        audioFilesFailed,
      });
    }

    return {
      deleted: deletedTranscriptions.length,
      audioFilesDeleted,
      audioFilesFailed,
    };
  } catch (error) {
    logger.main.error("History cleanup by age failed", { error });
    throw error;
  }
}

/**
 * 500件を超えた分の古い履歴を削除
 * @returns 削除された件数と音声ファイル削除結果
 */
export async function cleanupHistoryByCount(): Promise<{
  deleted: number;
  audioFilesDeleted: number;
  audioFilesFailed: number;
}> {
  logger.main.info("Starting history cleanup by count", {
    maxCount: MAX_HISTORY_COUNT,
  });

  try {
    const deletedTranscriptions = await deleteExcessTranscriptions(MAX_HISTORY_COUNT);

    let audioFilesDeleted = 0;
    let audioFilesFailed = 0;

    // 関連する音声ファイルを削除
    for (const transcription of deletedTranscriptions) {
      if (transcription.audioFile) {
        try {
          await deleteAudioFile(transcription.audioFile);
          audioFilesDeleted++;
        } catch (error) {
          audioFilesFailed++;
          logger.main.warn("Failed to delete audio file during history cleanup", {
            transcriptionId: transcription.id,
            audioFile: transcription.audioFile,
            error,
          });
        }
      }
    }

    if (deletedTranscriptions.length > 0) {
      logger.main.info("History cleanup by count completed", {
        deletedCount: deletedTranscriptions.length,
        maxCount: MAX_HISTORY_COUNT,
        audioFilesDeleted,
        audioFilesFailed,
      });
    }

    return {
      deleted: deletedTranscriptions.length,
      audioFilesDeleted,
      audioFilesFailed,
    };
  } catch (error) {
    logger.main.error("History cleanup by count failed", { error });
    throw error;
  }
}

/**
 * 履歴のクリーンアップを実行
 * 1. 30日以上経過した履歴を削除
 * 2. 500件を超えた分を削除
 *
 * @returns クリーンアップ結果
 */
export async function runHistoryCleanup(): Promise<CleanupResult> {
  logger.main.info("Starting history cleanup");

  const currentCount = await getTranscriptionsCount();
  logger.main.info("Current history count", { count: currentCount });

  // Step 1: 30日以上経過した履歴を削除
  const ageResult = await cleanupHistoryByAge();

  // Step 2: 500件を超えた分を削除
  const countResult = await cleanupHistoryByCount();

  const result: CleanupResult = {
    deletedByAge: ageResult.deleted,
    deletedByCount: countResult.deleted,
    totalDeleted: ageResult.deleted + countResult.deleted,
    audioFilesDeleted: ageResult.audioFilesDeleted + countResult.audioFilesDeleted,
    audioFilesFailed: ageResult.audioFilesFailed + countResult.audioFilesFailed,
  };

  if (result.totalDeleted > 0) {
    logger.main.info("History cleanup completed", result);
  } else {
    logger.main.debug("History cleanup completed, no items deleted");
  }

  return result;
}
