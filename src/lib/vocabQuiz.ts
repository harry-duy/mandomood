/**
 * vocabQuiz — sinh câu hỏi trắc nghiệm THUẦN từ kho từ HSK (test được).
 * Dùng ở /test để trộn với ngân hàng câu cứng: mỗi lần thi luôn có câu mới
 * từ toàn bộ kho 580+ từ thay vì chỉ 15 câu soạn tay/cấp.
 */
import type { HSKWord } from "./hsk/types";
import { shuffle } from "./shuffle";

export interface GeneratedQuestion {
  id: string;
  type: "meaning" | "choose_char" | "pinyin";
  question: string;
  options: string[];
  correct: number; // index trong options
  explanation: string;
  level: string;
}

/**
 * Sinh tối đa `count` câu hỏi từ `words` (cần ≥ 4 từ có nghĩa khác nhau).
 * Xoay vòng 3 dạng: nghĩa của từ (meaning), chọn chữ theo nghĩa (choose_char),
 * và nghe pinyin chọn chữ (pinyin — luyện liên kết âm ↔ mặt chữ).
 * Đáp án nhiễu lấy cùng cấp → độ khó tự nhiên.
 */
export function generateVocabQuestions(
  words: HSKWord[],
  level: string,
  count: number
): GeneratedQuestion[] {
  // Khử trùng nghĩa/hanzi để đáp án không bao giờ lặp
  const seen = new Set<string>();
  const pool = words.filter((w) => {
    if (!w.hanzi || !w.meaning || seen.has(w.meaning)) return false;
    seen.add(w.meaning);
    return true;
  });
  if (pool.length < 4) return [];

  const targets = shuffle(pool).slice(0, Math.min(count, pool.length));

  const TYPES: GeneratedQuestion["type"][] = ["meaning", "choose_char", "pinyin"];

  return targets.map((target, i) => {
    // 3 đáp án nhiễu: từ khác cùng cấp, nghĩa khác nhau
    const distractors = shuffle(pool.filter((w) => w.hanzi !== target.hanzi)).slice(0, 3);
    const type = TYPES[i % TYPES.length];

    const explanation =
      `${target.hanzi} (${target.pinyin}) = ${target.meaning}` +
      (target.hanViet ? ` · Hán Việt: ${target.hanViet}` : "");

    if (type === "meaning") {
      const options = shuffle([target, ...distractors].map((w) => w.meaning));
      return {
        id: `gen_${level}_${target.hanzi}`,
        type,
        question: `Từ 「${target.hanzi}」 (${target.pinyin}) có nghĩa là gì?`,
        options,
        correct: options.indexOf(target.meaning),
        explanation,
        level,
      };
    }
    if (type === "pinyin") {
      const options = shuffle([target, ...distractors].map((w) => w.hanzi));
      return {
        id: `gen_${level}_${target.hanzi}`,
        type,
        question: `Từ nào đọc là "${target.pinyin}"?`,
        options,
        correct: options.indexOf(target.hanzi),
        explanation,
        level,
      };
    }
    const options = shuffle([target, ...distractors].map((w) => w.hanzi));
    return {
      id: `gen_${level}_${target.hanzi}`,
      type,
      question: `Từ nào có nghĩa là "${target.meaning}"?`,
      options,
      correct: options.indexOf(target.hanzi),
      explanation,
      level,
    };
  });
}
