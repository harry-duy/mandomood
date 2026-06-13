/**
 * readingLibrary — thư viện đoạn đọc tùy biến do người học lưu lại,
 * chủ yếu là truyện AI tạo ở /generate. Lưu localStorage `mm_reading_custom`.
 * Trang /reading sẽ gộp các đoạn này vào danh sách đọc tích hợp.
 */

"use client";

import { readJSON, writeJSON } from "@/lib/utils";
import { recordPassageDeleted } from "@/lib/syncDeleted";

export interface CustomWord {
  hanzi: string;
  pinyin: string;
  meaning: string;
}

export interface CustomPassage {
  id: string;
  title: string;
  titleVi: string;
  level: string;
  mood: string;
  moodColor: string;
  words: CustomWord[];
  translation: string;
  culturalNote: string;
  custom?: true;
  /** Thời điểm lưu — dùng cho cloud sync (lưu lại sau khi xóa → sống lại). */
  savedAt?: string;
}

const KEY = "mm_reading_custom";
const MAX = 50;

export function getCustomPassages(): CustomPassage[] {
  return readJSON<CustomPassage[]>(KEY, []);
}

export function isPassageSaved(id: string): boolean {
  return getCustomPassages().some((p) => p.id === id);
}

/** Thêm đoạn đọc. Trả true nếu mới, false nếu đã có id này. */
export function addCustomPassage(p: CustomPassage): boolean {
  const list = getCustomPassages();
  if (list.some((x) => x.id === p.id)) return false;
  writeJSON(KEY, [{ ...p, custom: true as const, savedAt: new Date().toISOString() }, ...list].slice(0, MAX));
  return true;
}

export function removeCustomPassage(id: string): void {
  writeJSON(KEY, getCustomPassages().filter((p) => p.id !== id));
  // Tombstone để đoạn đọc không quay lại từ cloud sau khi sync
  recordPassageDeleted(id);
}
