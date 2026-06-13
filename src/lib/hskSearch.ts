/**
 * hskSearch — logic tra cứu kho từ HSK (thuần, không phụ thuộc UI → unit test được).
 * Dùng bởi: /search (section Từ vựng HSK), /character/[hanzi] (fallback lite).
 */

import { HSK_DATA, type HSKWord } from "@/lib/hsk-data";

export interface VocabHit extends HSKWord {
  level: number;
}

/** Kho phẳng: mọi từ kèm level. */
export const ALL_HSK: VocabHit[] = Object.entries(HSK_DATA).flatMap(([lv, words]) =>
  words.map((w) => ({ ...w, level: Number(lv) }))
);

/** Bo dau tieng Viet/pinyin (NFD) → go "nhan nai" van khop "nhẫn nại". */
export const fold = (s: string): string =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

/**
 * Tra từ theo hanzi / pinyin (bỏ dấu + bỏ khoảng trắng) / nghĩa Việt / âm Hán Việt.
 * Cả hai phía đều fold → gõ không dấu vẫn ra.
 */
export function searchHskVocab(query: string, limit = 8): VocabHit[] {
  const q = fold(query.trim());
  if (!q) return [];
  return ALL_HSK.filter(
    (w) =>
      w.hanzi.includes(query.trim()) ||
      fold(w.pinyin).replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
      fold(w.meaning).includes(q) ||
      (w.hanViet && fold(w.hanViet).includes(q))
  ).slice(0, limit);
}

/** Tìm đúng 1 từ theo hanzi (mọi cấp). Dùng cho fallback /character/[hanzi]. */
export function findHskWord(hanzi: string): { word: HSKWord; level: number } | null {
  for (const [lv, words] of Object.entries(HSK_DATA)) {
    const w = words.find((x) => x.hanzi === hanzi);
    if (w) return { word: w, level: Number(lv) };
  }
  return null;
}
