/**
 * syncDeleted — ghi nhận "đã xóa có chủ đích" (tombstone) ở localStorage
 * để lần sync sau việc xóa lan sang thiết bị khác (xem lib/mergeSync).
 * Tách file riêng để savedWords/customDecks import mà không kéo theo cloudSync.
 */

"use client";

import { readJSON, writeJSON } from "@/lib/utils";
import type { SyncTombstones } from "@/lib/mergeSync";

const KEY = "mm_sync_deleted";
const MAX_PER_MAP = 1000;

export function getTombstones(): SyncTombstones {
  const t = readJSON<Partial<SyncTombstones>>(KEY, {});
  return {
    words: t.words ?? {},
    decks: t.decks ?? {},
    cards: t.cards ?? {},
    stories: t.stories ?? {},
    passages: t.passages ?? {},
  };
}

export function setTombstones(t: SyncTombstones): void {
  writeJSON(KEY, t);
}

function prune(map: Record<string, string>): Record<string, string> {
  const entries = Object.entries(map);
  if (entries.length <= MAX_PER_MAP) return map;
  entries.sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime());
  return Object.fromEntries(entries.slice(0, MAX_PER_MAP));
}

/** Gọi khi user xóa 1 từ khỏi sổ tay. */
export function recordWordDeleted(hanzi: string): void {
  if (!hanzi) return;
  const t = getTombstones();
  t.words = prune({ ...t.words, [hanzi]: new Date().toISOString() });
  setTombstones(t);
}

/** Gọi khi user xóa 1 bộ thẻ. */
export function recordDeckDeleted(deckId: string): void {
  if (!deckId) return;
  const t = getTombstones();
  t.decks = prune({ ...t.decks, [deckId]: new Date().toISOString() });
  setTombstones(t);
}

/** Gọi khi user xóa 1 thẻ lẻ trong deck. */
export function recordCardDeleted(cardId: string): void {
  if (!cardId) return;
  const t = getTombstones();
  t.cards = prune({ ...t.cards, [cardId]: new Date().toISOString() });
  setTombstones(t);
}

/** Gọi khi user xóa 1 đoạn đọc tùy biến khỏi thư viện /reading. */
export function recordPassageDeleted(passageId: string): void {
  if (!passageId) return;
  const t = getTombstones();
  t.passages = prune({ ...t.passages, [passageId]: new Date().toISOString() });
  setTombstones(t);
}

/** Gọi khi user xóa truyện khỏi lịch sử (1 hoặc nhiều id — vd nút "xóa hết"). */
export function recordStoriesDeleted(storyIds: string[]): void {
  const ids = storyIds.filter(Boolean);
  if (ids.length === 0) return;
  const t = getTombstones();
  const now = new Date().toISOString();
  const add: Record<string, string> = {};
  for (const id of ids) add[id] = now;
  t.stories = prune({ ...t.stories, ...add });
  setTombstones(t);
}
