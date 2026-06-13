/**
 * savedWords — lưu từ vựng người học bấm "lưu" để ôn sau.
 *
 * Chiến lược 2 lớp (luôn hoạt động dù chưa đăng nhập):
 *  1. localStorage `mm_saved_words` — nguồn chính, không cần backend.
 *  2. Nếu đã đăng nhập → đẩy lên SRS server (/api/user/vocabulary) best-effort.
 * Nhờ vậy bấm vào từ trong truyện/đoạn đọc là lưu được ngay để học flashcard.
 */

"use client";

import { readJSON, writeJSON } from "@/lib/utils";
import { recordWordDeleted } from "@/lib/syncDeleted";

export interface SavedWord {
  hanzi: string;
  pinyin: string;
  meaning: string;
  example?: string;
  addedAt: string;
}

const KEY = "mm_saved_words";
const MAX = 500;

export function getSavedWords(): SavedWord[] {
  return readJSON<SavedWord[]>(KEY, []);
}

export function isWordSaved(hanzi: string): boolean {
  return getSavedWords().some((w) => w.hanzi === hanzi);
}

/** Xoá 1 từ khỏi sổ tay local theo hanzi (+ tombstone để xóa lan qua thiết bị khi sync). */
export function removeSavedWord(hanzi: string): void {
  writeJSON(KEY, getSavedWords().filter((w) => w.hanzi !== hanzi));
  recordWordDeleted(hanzi);
}

/** Lưu vào localStorage. Trả true nếu là từ mới, false nếu đã có. */
export function saveWordLocal(word: Omit<SavedWord, "addedAt">): boolean {
  if (!word.hanzi) return false;
  const list = getSavedWords();
  if (list.some((w) => w.hanzi === word.hanzi)) return false;
  writeJSON(KEY, [{ ...word, addedAt: new Date().toISOString() }, ...list].slice(0, MAX));
  return true;
}

/**
 * Lưu từ: local trước, rồi đồng bộ server nếu đăng nhập (bỏ qua mọi lỗi/401).
 * Trả "added" nếu là từ mới (local), "exists" nếu đã có sẵn.
 */
export async function saveWord(word: Omit<SavedWord, "addedAt">): Promise<"added" | "exists"> {
  const added = saveWordLocal(word);
  try {
    await fetch("/api/user/vocabulary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hanzi: word.hanzi,
        pinyin: word.pinyin,
        meaning: word.meaning,
        example_sentence: word.example,
      }),
    });
  } catch {
    /* chưa đăng nhập hoặc offline — đã lưu local là đủ */
  }
  return added ? "added" : "exists";
}
