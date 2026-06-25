/**
 * achievements.ts — Hệ thống HUY HIỆU (gamification) thuần, test được.
 *
 * Tính các huy hiệu đã đạt từ thống kê học tập (số truyện, streak ngày).
 * Không phụ thuộc React/backend → dùng được ở client hoặc server.
 */

export interface AchievementStats {
  storiesCreated?: number;
  streak?: number;
  /** Số lần thi /test đã hoàn thành. */
  testsTaken?: number;
  /** Điểm % cao nhất từng đạt trong /test (0-100). */
  bestTestPct?: number;
  /** Số từ vựng đã lưu vào Sổ tay (mm_saved_words). */
  wordsSaved?: number;
}

export interface Badge {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  /** Điều kiện đạt huy hiệu. */
  earned: (s: Required<AchievementStats>) => boolean;
  /** Tiến độ 0..1 để vẽ thanh progress (tùy chọn). */
  progress?: (s: Required<AchievementStats>) => number;
}

export const BADGES: Badge[] = [
  {
    id: "first-story", emoji: "🌱", title: "Khởi đầu",
    desc: "Tạo truyện đầu tiên",
    earned: (s) => s.storiesCreated >= 1,
    progress: (s) => Math.min(1, s.storiesCreated / 1),
  },
  {
    id: "storyteller-10", emoji: "📚", title: "Người kể chuyện",
    desc: "Tạo 10 truyện",
    earned: (s) => s.storiesCreated >= 10,
    progress: (s) => Math.min(1, s.storiesCreated / 10),
  },
  {
    id: "storyteller-50", emoji: "🏆", title: "Bậc thầy truyện",
    desc: "Tạo 50 truyện",
    earned: (s) => s.storiesCreated >= 50,
    progress: (s) => Math.min(1, s.storiesCreated / 50),
  },
  {
    id: "streak-3", emoji: "🔥", title: "Bén lửa",
    desc: "Chuỗi 3 ngày liên tiếp",
    earned: (s) => s.streak >= 3,
    progress: (s) => Math.min(1, s.streak / 3),
  },
  {
    id: "streak-7", emoji: "⚡", title: "Tuần lễ vàng",
    desc: "Chuỗi 7 ngày liên tiếp",
    earned: (s) => s.streak >= 7,
    progress: (s) => Math.min(1, s.streak / 7),
  },
  {
    id: "streak-30", emoji: "💎", title: "Kiên trì kim cương",
    desc: "Chuỗi 30 ngày liên tiếp",
    earned: (s) => s.streak >= 30,
    progress: (s) => Math.min(1, s.streak / 30),
  },
  {
    id: "test-10", emoji: "📝", title: "Chiến binh phòng thi",
    desc: "Hoàn thành 10 bài thi thử",
    earned: (s) => s.testsTaken >= 10,
    progress: (s) => Math.min(1, s.testsTaken / 10),
  },
  {
    id: "test-perfect", emoji: "💯", title: "Tuyệt đối",
    desc: "Đạt 100% trong một bài thi",
    earned: (s) => s.bestTestPct >= 100,
    progress: (s) => Math.min(1, s.bestTestPct / 100),
  },
  {
    id: "vocab-saver-30", emoji: "🔖", title: "Người sưu tầm từ",
    desc: "Lưu 30 từ vào Sổ tay",
    earned: (s) => s.wordsSaved >= 30,
    progress: (s) => Math.min(1, s.wordsSaved / 30),
  },
  {
    id: "vocab-saver-100", emoji: "📓", title: "Kho từ vựng",
    desc: "Lưu 100 từ vào Sổ tay",
    earned: (s) => s.wordsSaved >= 100,
    progress: (s) => Math.min(1, s.wordsSaved / 100),
  },
  {
    id: "vocab-saver-300", emoji: "🧠", title: "Từ điển sống",
    desc: "Lưu 300 từ vào Sổ tay",
    earned: (s) => s.wordsSaved >= 300,
    progress: (s) => Math.min(1, s.wordsSaved / 300),
  },
];

export interface BadgeState extends Badge {
  isEarned: boolean;
  pct: number;
}

/** Trả trạng thái mọi huy hiệu (đã đạt + tiến độ), đã sắp: đạt trước, gần đạt sau. */
export function evaluateBadges(stats: AchievementStats): BadgeState[] {
  const s = {
    storiesCreated: stats.storiesCreated ?? 0,
    streak: stats.streak ?? 0,
    testsTaken: stats.testsTaken ?? 0,
    bestTestPct: stats.bestTestPct ?? 0,
    wordsSaved: stats.wordsSaved ?? 0,
  };
  return BADGES.map((b) => ({
    ...b,
    isEarned: b.earned(s),
    pct: Math.round((b.progress ? b.progress(s) : (b.earned(s) ? 1 : 0)) * 100),
  })).sort((a, b) => {
    if (a.isEarned !== b.isEarned) return a.isEarned ? -1 : 1;
    return b.pct - a.pct;
  });
}

/** Đếm số huy hiệu đã đạt. */
export function countEarned(stats: AchievementStats): number {
  return evaluateBadges(stats).filter((b) => b.isEarned).length;
}

/** Key localStorage lưu danh sách id huy hiệu đã từng đạt. */
export const EARNED_KEY = "mm_badges_earned";

/** Danh sách id huy hiệu đang đạt theo stats. */
export function earnedIds(stats: AchievementStats): string[] {
  return evaluateBadges(stats).filter((b) => b.isEarned).map((b) => b.id);
}

/** Trả các Badge VỪA mở khóa (đang đạt nhưng chưa có trong prevIds). */
export function newlyUnlocked(stats: AchievementStats, prevIds: string[]): BadgeState[] {
  const prev = new Set(prevIds);
  return evaluateBadges(stats).filter((b) => b.isEarned && !prev.has(b.id));
}
