/**
 * skillScores.ts — tính điểm 5 kỹ năng học tiếng Trung từ dữ liệu localStorage.
 *
 * Không có backend, không phụ thuộc hook — hàm thuần, dùng được cả client lẫn
 * các function khác mà không cần "use client".
 *
 * Kết quả: số nguyên 0–100 cho mỗi kỹ năng.
 */

import { readJSON } from "@/lib/utils";
import { getSavedWords } from "@/lib/savedWords";
import { getDecks } from "@/lib/customDecks";

export interface SkillScores {
  vocab: number;       // Từ vựng
  listening: number;   // Nghe
  speaking: number;    // Nói
  reading: number;     // Đọc
  writing: number;     // Viết
}

export interface SkillLabel {
  key: keyof SkillScores;
  label: string;
  emoji: string;
  color: string;
  hint: string; // Nguồn dữ liệu chính
}

export const SKILL_LABELS: SkillLabel[] = [
  { key: "vocab",     label: "Từ vựng",  emoji: "📚", color: "#E8634A", hint: "Quiz HSK + Sổ tay + Flashcard" },
  { key: "listening", label: "Nghe",     emoji: "🎧", color: "#F4A443", hint: "Thanh điệu + Karaoke + Shadowing" },
  { key: "speaking",  label: "Nói",      emoji: "🎙️", color: "#4ECDC4", hint: "Phát âm + Ghép câu + Shadowing" },
  { key: "reading",   label: "Đọc",      emoji: "📖", color: "#A78BFA", hint: "Bài đọc + Truyện AI + Luyện tập" },
  { key: "writing",   label: "Viết",     emoji: "✍️", color: "#34D399", hint: "Tạo truyện + Luyện viết tay" },
];

/**
 * Đếm số ngày có task của TYPE nhất định được check.
 * Task ID thường chứa từ khoá liên quan (vd: "tones", "karaoke").
 */
function countDaysWithTaskType(keywords: string[]): number {
  if (typeof localStorage === "undefined") return 0;
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) ?? "";
    if (!key.startsWith("mm_daily_plan_")) continue;
    const plan = readJSON<{ checked?: Record<string, boolean> }>(key, {});
    const checked = plan.checked ?? {};
    // Kiểm tra nếu có bất kỳ task ID nào chứa keyword được check = true
    const hasMatch = Object.entries(checked).some(([taskId, done]) =>
      done && keywords.some(kw => taskId.toLowerCase().includes(kw))
    );
    if (hasMatch) count++;
  }
  return count;
}

/** Tính điểm từng kỹ năng — trả về 0–100. */
export function computeSkillScores(): SkillScores {
  if (typeof localStorage === "undefined") {
    return { vocab: 0, listening: 0, speaking: 0, reading: 0, writing: 0 };
  }

  // ─── Từ vựng ─────────────────────────────────────────────────────────────
  // Nguồn: mm_hsk_quiz_best + từ đã lưu + flashcard decks
  const hskBest = readJSON<Record<string, number>>("mm_hsk_quiz_best", {});
  const hskValues = Object.values(hskBest).filter((v) => v > 0);
  const hskAvg = hskValues.length > 0
    ? hskValues.reduce((a, b) => a + b, 0) / hskValues.length
    : 0;
  // Càng quiz nhiều cấp → thêm điểm phủ rộng (tối đa 25)
  const hskCoverage = Math.min(25, (hskValues.length / 6) * 25);
  const savedCount = getSavedWords().length;
  // Mỗi từ lưu = ~1.5 điểm, tối đa 15
  const savedBonus = Math.min(15, savedCount * 1.5);
  // Có flashcard deck = +8
  const deckBonus = getDecks().length > 0 ? 8 : 0;
  const vocab = Math.min(100, Math.round(hskAvg * 0.52 + hskCoverage + savedBonus + deckBonus));

  // ─── Nghe ────────────────────────────────────────────────────────────────
  // Nguồn: mm_tones_best + karaoke/shadowing/dictation trong daily-plan + video đã xem
  const tonesBest = readJSON<number>("mm_tones_best", 0);
  const listenDays = countDaysWithTaskType(["karaoke", "tones", "shadowing", "dictation", "nghe", "listen"]);
  const videosWatched = readJSON<string[]>("mm_video_watched", []).length;
  // tones_best đóng góp 55%, activity days tối đa 30, videos tối đa 15
  const listening = Math.min(100, Math.round(tonesBest * 0.55 + Math.min(30, listenDays * 6) + Math.min(15, videosWatched * 3)));

  // ─── Nói ─────────────────────────────────────────────────────────────────
  // Nguồn: mm_practice_best + pronunciation/shadowing days
  const practiceBest = readJSON<number>("mm_practice_best", 0);
  const speakDays = countDaysWithTaskType(["pronunciation", "shadowing", "karaoke", "phát âm", "nói", "speak"]);
  // practice_best đóng góp 50%, activity days tối đa 50
  const speaking = Math.min(100, Math.round(practiceBest * 0.5 + Math.min(50, speakDays * 8)));

  // ─── Đọc ─────────────────────────────────────────────────────────────────
  // Nguồn: mm_reading_index (số bài đọc đã đến) + mm_story_history (đọc truyện)
  const readingIndex = readJSON<number>("mm_reading_index", 0);
  // Mỗi bài đọc tiến thêm 1 → +6 điểm, tối đa 40
  const readingProgress = Math.min(40, readingIndex * 6);
  const storyHistory = readJSON<{ id: string; createdAt: string }[]>("mm_story_history", []);
  // Mỗi truyện đã tương tác → +4 điểm đọc, tối đa 45
  const readingFromStories = Math.min(45, storyHistory.length * 4);
  // mm_practice_best cũng là chỉ số đọc hiểu gián tiếp
  const readingFromPractice = Math.round(practiceBest * 0.15);
  const reading = Math.min(100, Math.round(readingProgress + readingFromStories + readingFromPractice));

  // ─── Viết ────────────────────────────────────────────────────────────────
  // Nguồn: mm_story_history + daily-plan viết + mm_viet_tay_chars (vẽ tay)
  const storyCount = storyHistory.length;
  // Tạo truyện → 5 điểm/truyện, tối đa 50
  const writeFromStories = Math.min(50, storyCount * 5);
  const writeDays = countDaysWithTaskType(["luyen-viet", "viet-tay", "viết", "write", "handwrit"]);
  // Mỗi ngày luyện viết = +8 điểm, tối đa 35
  const writeFromPractice = Math.min(35, writeDays * 8);
  // Ký tự đã vẽ tay nhận dạng (mm_viet_tay_chars) → 3 điểm/ký tự, tối đa 15
  const vietTayChars = readJSON<string[]>("mm_viet_tay_chars", []).length;
  const writeFromVietTay = Math.min(15, vietTayChars * 3);
  const writing = Math.min(100, Math.round(writeFromStories + writeFromPractice + writeFromVietTay));

  return { vocab, listening, speaking, reading, writing };
}

/** Tổng điểm trung bình 5 kỹ năng (0–100). */
export function overallScore(scores: SkillScores): number {
  const vals = Object.values(scores);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

/** Trả về skill label yếu nhất (điểm thấp nhất). */
export function weakestSkill(scores: SkillScores): SkillLabel {
  return SKILL_LABELS.reduce((prev, cur) =>
    scores[cur.key] < scores[prev.key] ? cur : prev
  );
}

/** Trả về skill label mạnh nhất. */
export function strongestSkill(scores: SkillScores): SkillLabel {
  return SKILL_LABELS.reduce((prev, cur) =>
    scores[cur.key] > scores[prev.key] ? cur : prev
  );
}

/** Mô tả trình độ tổng quát dựa trên điểm tổng hợp. */
export function levelFromScore(overall: number): string {
  if (overall >= 85) return "Nâng cao";
  if (overall >= 65) return "Trung cấp";
  if (overall >= 40) return "Cơ bản";
  if (overall >= 15) return "Mới bắt đầu";
  return "Chưa có dữ liệu";
}
