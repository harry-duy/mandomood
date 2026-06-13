/**
 * cloudSync — phía client: gom dữ liệu học từ localStorage, gửi /api/user/sync,
 * nhận bản merged ghi đè lại localStorage. Offline-first: thất bại thì thôi,
 * dữ liệu local không bị đụng.
 */

"use client";

import { readJSON, writeJSON } from "@/lib/utils";
import { stableHash, fitPayload, type SyncPayload } from "@/lib/mergeSync";
import { getTombstones, setTombstones } from "@/lib/syncDeleted";

const KEYS = {
  savedWords: "mm_saved_words",
  customDecks: "mm_custom_decks",
  storyHistory: "mm_story_history",
  customPassages: "mm_reading_custom",
  hskQuizBest: "mm_hsk_quiz_best",
  testHistory: "mm_test_history",
  badges: "mm_badges_earned",
} as const;

export const LAST_SYNC_KEY = "mm_last_sync";
const LAST_SYNC_HASH_KEY = "mm_last_sync_hash";

/** Gom toàn bộ dữ liệu học hiện có trên máy (kèm tombstone xóa). */
export function collectLocalData(): SyncPayload {
  return {
    savedWords: readJSON(KEYS.savedWords, []),
    customDecks: readJSON(KEYS.customDecks, []),
    storyHistory: readJSON(KEYS.storyHistory, []),
    customPassages: readJSON(KEYS.customPassages, []),
    hskQuizBest: readJSON(KEYS.hskQuizBest, {}),
    testResults: readJSON(KEYS.testHistory, []),
    badges: readJSON(KEYS.badges, []),
    deleted: getTombstones(),
  };
}

/** Ghi bản merged từ server đè lại localStorage (kèm tombstone đã hợp nhất). */
export function applyMergedData(merged: SyncPayload): void {
  writeJSON(KEYS.savedWords, merged.savedWords);
  writeJSON(KEYS.customDecks, merged.customDecks);
  writeJSON(KEYS.storyHistory, merged.storyHistory);
  writeJSON(KEYS.customPassages, merged.customPassages ?? []);
  writeJSON(KEYS.hskQuizBest, merged.hskQuizBest);
  writeJSON(KEYS.testHistory, merged.testResults);
  writeJSON(KEYS.badges, merged.badges);
  setTombstones(merged.deleted ?? { words: {}, decks: {}, cards: {}, stories: {}, passages: {} });
}

export interface SyncResult {
  ok: boolean;
  /** "unauthenticated" | "rate_limited" | "error" khi !ok */
  reason?: string;
  /** Thống kê sau merge để hiện toast */
  stats?: { words: number; decks: number; stories: number };
}

/** Đồng bộ 2 chiều: đẩy local lên → nhận merged về → ghi lại local. */
export async function syncNow(): Promise<SyncResult> {
  try {
    // fitPayload: nếu vượt ~200KB thì bỏ dần truyện/đoạn đọc cũ nhất
    // (tránh 413 từ API; tiến độ học — từ/deck/điểm — không bao giờ bị cắt)
    const res = await fetch("/api/user/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fitPayload(collectLocalData())),
    });
    if (res.status === 401) return { ok: false, reason: "unauthenticated" };
    if (res.status === 429) return { ok: false, reason: "rate_limited" };
    if (!res.ok) return { ok: false, reason: "error" };

    const json = (await res.json()) as { data?: SyncPayload };
    if (!json.data) return { ok: false, reason: "error" };

    applyMergedData(json.data);
    markSynced();
    return {
      ok: true,
      stats: {
        words: json.data.savedWords.length,
        decks: json.data.customDecks.length,
        stories: json.data.storyHistory.length,
      },
    };
  } catch {
    return { ok: false, reason: "error" }; // offline — local vẫn nguyên
  }
}

/** Lưu mốc sync: thời điểm + hash dữ liệu local hiện tại (sau khi apply merged). */
function markSynced(): void {
  writeJSON(LAST_SYNC_KEY, new Date().toISOString());
  writeJSON(LAST_SYNC_HASH_KEY, stableHash(collectLocalData()));
}

/**
 * Local có thay đổi CHƯA sync? (so hash dữ liệu hiện tại với hash lúc sync cuối).
 * Chưa từng sync → true (khuyến khích sync lần đầu).
 */
export function hasUnsyncedChanges(): boolean {
  const saved = readJSON<string | null>(LAST_SYNC_HASH_KEY, null);
  if (!saved) return true;
  return stableHash(collectLocalData()) !== saved;
}

/**
 * Khôi phục từ cloud (CHỈ KÉO VỀ, không đẩy local lên) — cho máy mới
 * hoặc khi muốn lấy lại đúng bản cloud. Ghi đè localStorage bằng bản cloud.
 */
export async function restoreFromCloud(): Promise<SyncResult> {
  try {
    const res = await fetch("/api/user/sync");
    if (res.status === 401) return { ok: false, reason: "unauthenticated" };
    if (!res.ok) return { ok: false, reason: "error" };

    const json = (await res.json()) as { data?: SyncPayload };
    if (!json.data) return { ok: false, reason: "error" };

    applyMergedData(json.data);
    markSynced();
    return {
      ok: true,
      stats: {
        words: json.data.savedWords.length,
        decks: json.data.customDecks.length,
        stories: json.data.storyHistory.length,
      },
    };
  } catch {
    return { ok: false, reason: "error" };
  }
}

/** Lần sync cuối (ISO) hoặc null. */
export function getLastSync(): string | null {
  return readJSON<string | null>(LAST_SYNC_KEY, null);
}

/**
 * Auto-sync 1 lần mỗi phiên (gọi khi biết user đã đăng nhập).
 * Dùng sessionStorage làm cờ để không spam mỗi lần điều hướng.
 */
export async function autoSyncOncePerSession(): Promise<void> {
  try {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("mm_synced_this_session")) return;
    sessionStorage.setItem("mm_synced_this_session", "1");
    await syncNow();
  } catch {
    /* bỏ qua — sync là best-effort */
  }
}
