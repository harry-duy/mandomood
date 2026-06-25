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
  const raw = query.trim();
  const q = fold(raw);
  if (!q) return [];
  const qns = q.replace(/\s/g, ""); // query bỏ khoảng trắng (so pinyin)

  // Chấm điểm liên quan: khớp CHÍNH XÁC > tiền tố > chứa. Cao nhất trong các trường.
  const scored: { w: VocabHit; score: number }[] = [];
  for (const w of ALL_HSK) {
    const pin = fold(w.pinyin).replace(/\s/g, "");
    const mean = fold(w.meaning);
    const hv = w.hanViet ? fold(w.hanViet) : "";
    let score = 0;
    // Hanzi (so trực tiếp, không fold)
    if (w.hanzi === raw) score = Math.max(score, 100);
    else if (raw && w.hanzi.includes(raw)) score = Math.max(score, 60);
    // Pinyin
    if (pin === qns) score = Math.max(score, 95);
    else if (qns && pin.startsWith(qns)) score = Math.max(score, 70);
    else if (qns && pin.includes(qns)) score = Math.max(score, 30);
    // Âm Hán Việt
    if (hv && hv === q) score = Math.max(score, 90);
    else if (hv && hv.startsWith(q)) score = Math.max(score, 65);
    else if (hv && hv.includes(q)) score = Math.max(score, 25);
    // Nghĩa Việt (tách theo dấu phẩy/chấm phẩy/gạch để bắt nghĩa khớp trọn)
    if (mean === q) score = Math.max(score, 85);
    else if (mean.split(/[,;/]/).map((m) => m.trim()).includes(q)) score = Math.max(score, 55);
    else if (mean.includes(q)) score = Math.max(score, 20);

    if (score > 0) scored.push({ w, score });
  }
  // Điểm cao trước; hòa điểm → cấp HSK thấp trước (từ cơ bản ưu tiên).
  scored.sort((a, b) => b.score - a.score || a.w.level - b.w.level);
  return scored.slice(0, limit).map((x) => x.w);
}

/** Tìm đúng 1 từ theo hanzi (mọi cấp). Dùng cho fallback /character/[hanzi]. */
export function findHskWord(hanzi: string): { word: HSKWord; level: number } | null {
  for (const [lv, words] of Object.entries(HSK_DATA)) {
    const w = words.find((x) => x.hanzi === hanzi);
    if (w) return { word: w, level: Number(lv) };
  }
  return null;
}
