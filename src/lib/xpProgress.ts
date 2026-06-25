/**
 * xpProgress.ts — cập nhật STREAK theo ngày + thưởng XP mốc. PURE, không I/O, test được.
 *
 * Tách khỏi /api/user/progress để kiểm thử & tránh bug "cộng thưởng lặp":
 * thưởng mốc (7/30/100 ngày) CHỈ được cấp khi streak VỪA tăng trong hôm nay,
 * không cấp lại cho mỗi hành động phụ cùng ngày (trước đây mỗi quiz/lesson trong
 * ngày mốc đều +bonus → lạm phát XP, lệch bảng xếp hạng).
 */

export interface StreakUpdate {
  /** Streak mới sau hành động. */
  streak: number;
  /** True nếu streak THAY ĐỔI trong hôm nay (ngày mới: +1 hoặc reset về 1). */
  advanced: boolean;
  /** XP thưởng mốc (chỉ > 0 khi advanced && streak là mốc). */
  bonusXp: number;
}

/** Mốc streak → XP thưởng (thưởng đúng 1 lần khi đạt mốc). */
export const STREAK_MILESTONE_BONUS: Record<number, number> = {
  7: 50,
  30: 200,
  100: 500,
};

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isYesterday(date: Date, today: Date): boolean {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

/**
 * Tính streak mới + thưởng mốc từ lần hoạt động trước.
 * @param lastActive thời điểm hoạt động gần nhất (mặc định epoch nếu chưa có).
 * @param now thời điểm hiện tại.
 * @param prevStreak streak trước đó.
 */
export function applyDailyStreak(
  lastActive: Date,
  now: Date,
  prevStreak: number
): StreakUpdate {
  const prev = Number.isFinite(prevStreak) ? prevStreak : 0;

  let streak: number;
  let advanced: boolean;
  if (isSameDay(lastActive, now)) {
    streak = prev; // cùng ngày → giữ nguyên, KHÔNG đổi
    advanced = false;
  } else if (isYesterday(lastActive, now)) {
    streak = prev + 1; // ngày liền kề → nối chuỗi
    advanced = true;
  } else {
    streak = 1; // đứt chuỗi → bắt đầu lại
    advanced = true;
  }

  // Thưởng mốc CHỈ khi streak vừa tăng hôm nay → không cộng lặp trong ngày.
  const bonusXp = advanced ? STREAK_MILESTONE_BONUS[streak] ?? 0 : 0;
  return { streak, advanced, bonusXp };
}
