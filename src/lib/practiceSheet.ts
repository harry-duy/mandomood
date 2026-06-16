/**
 * practiceSheet.ts — Logic thuần cho trang luyện viết IN ĐƯỢC (/practice-sheet).
 *
 * Tách khỏi component để tái dùng & unit-test. PURE, không I/O / không React.
 */

export interface PracticeChar {
  char: string;   // 1 chữ Hán đơn
  pinyin: string; // pinyin của TỪ gốc chứa chữ này
  meaning: string;// nghĩa của TỪ gốc
}

interface WordLike {
  hanzi: string;
  pinyin: string;
  meaning: string;
}

/** Ký tự có phải chữ Hán (CJK Unified Ideographs) không — loại dấu câu/khoảng trắng. */
export function isHanzi(ch: string): boolean {
  const cp = ch.codePointAt(0);
  if (cp === undefined) return false;
  return (
    (cp >= 0x4e00 && cp <= 0x9fff) || // CJK Unified Ideographs
    (cp >= 0x3400 && cp <= 0x4dbf)    // Extension A
  );
}

/**
 * Tách danh sách từ HSK thành các CHỮ ĐƠN duy nhất để luyện viết.
 * - 你好 → 你, 好
 * - Loại trùng (chỉ giữ lần xuất hiện đầu, kèm pinyin/nghĩa của từ đó).
 * - Bỏ ký tự không phải chữ Hán (dấu câu, latin, số).
 */
export function uniqueCharsFromWords(words: WordLike[]): PracticeChar[] {
  const seen = new Set<string>();
  const out: PracticeChar[] = [];
  for (const w of words) {
    if (!w || typeof w.hanzi !== "string") continue;
    for (const c of Array.from(w.hanzi)) {
      if (!isHanzi(c) || seen.has(c)) continue;
      seen.add(c);
      out.push({ char: c, pinyin: w.pinyin ?? "", meaning: w.meaning ?? "" });
    }
  }
  return out;
}

/** Chuẩn hoá tham số ?level= về số nguyên 1..6 (mặc định 1). */
export function clampLevel(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 1;
  return Math.min(6, Math.max(1, Math.floor(n)));
}
