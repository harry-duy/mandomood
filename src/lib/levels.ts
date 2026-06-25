/**
 * levels.ts — ngưỡng XP & cấp độ DUY NHẤT cho toàn app (server + client).
 *
 * Trước đây mỗi route tự khai bảng XP riêng (progress vs weekly-report) → lệch
 * nhau, % tiến độ sai. File này là nguồn chân lý duy nhất, có unit test.
 */

/** Ngưỡng XP TÍCH LŨY để ĐẠT mỗi cấp (tăng dần nghiêm ngặt). */
export const LEVELS: { key: string; threshold: number }[] = [
  { key: "beginner", threshold: 0 },
  { key: "hsk1", threshold: 100 },
  { key: "hsk2", threshold: 300 },
  { key: "hsk3", threshold: 700 },
  { key: "hsk4", threshold: 1500 },
  { key: "hsk5", threshold: 3000 },
  { key: "hsk6", threshold: 6000 },
];

/** Cấp cao nhất đạt được với tổng XP cho trước. */
export function levelFromXp(totalXp: number): string {
  let key = LEVELS[0].key;
  for (const lvl of LEVELS) if (totalXp >= lvl.threshold) key = lvl.key;
  return key;
}

/**
 * % tiến độ (0–100) trong DẢI cấp hiện tại, dựa trên `level` và tổng XP.
 * Cấp cao nhất (hsk6) → luôn 100. Cấp không xác định → coi như beginner.
 */
export function levelProgressPct(totalXp: number, level: string): number {
  const found = LEVELS.findIndex((l) => l.key === level);
  const idx = found >= 0 ? found : 0;
  const cur = LEVELS[idx].threshold;
  const next = LEVELS[idx + 1];
  if (!next) return 100;
  return Math.min(100, Math.max(0, Math.round(((totalXp - cur) / (next.threshold - cur)) * 100)));
}
