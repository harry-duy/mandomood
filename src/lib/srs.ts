/**
 * srs.ts — Thuật toán lặp lại ngắt quãng SM-2 (SuperMemo 2).
 *
 * Tách riêng khỏi route để tái dùng & kiểm thử (unit test). PURE, không I/O.
 *
 * quality: 0–5
 *   0–2 = quên / sai  → reset lịch
 *   3–5 = nhớ         → giãn khoảng ôn theo ease factor
 */

export interface SrsState {
  easeFactor: number;  // hệ số dễ (>= 1.3)
  interval: number;    // số ngày tới lần ôn kế tiếp
  repetitions: number; // số lần nhớ đúng liên tiếp
}

export function sm2(
  easeFactor: number,
  interval: number,
  repetitions: number,
  quality: number
): SrsState {
  // Trả lời sai → reset, hạ ease factor (sàn 1.3)
  if (quality < 3) {
    return { easeFactor: Math.max(1.3, easeFactor - 0.2), interval: 1, repetitions: 0 };
  }

  // Trả lời đúng → giãn khoảng
  let newInterval: number;
  if (repetitions === 0) newInterval = 1;
  else if (repetitions === 1) newInterval = 6;
  else newInterval = Math.round(interval * easeFactor);

  const newEF = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  return { easeFactor: newEF, interval: newInterval, repetitions: repetitions + 1 };
}

/** Tính ngày ôn kế tiếp từ thời điểm `from` (mặc định: bây giờ) + số ngày interval. */
export function nextReviewDate(interval: number, from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + interval);
  return d;
}

/** Mastery 0–5 suy ra từ số lần nhớ đúng (mỗi 2 lần đúng = +1 sao). */
export function masteryFromReps(repetitions: number): number {
  return Math.min(5, Math.floor(repetitions / 2));
}
