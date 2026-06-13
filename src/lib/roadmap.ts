/**
 * roadmap.ts — Logic THUẦN xây lộ trình gợi ý cá nhân hóa (test được, không phụ thuộc React).
 *
 * Đầu vào: mục tiêu (goal), trình độ (level), số truyện đã tạo, streak ngày.
 * Đầu ra: tối đa 3 gợi ý đã ưu tiên theo ngữ cảnh:
 *   - Người mới (beginner/hsk1): chèn ưu tiên nền tảng (bộ thủ / phát âm).
 *   - Người chưa tạo truyện nào: nhắc thử tính năng lõi "tạo truyện".
 *   - Streak ≥ 3: thêm gợi ý thử thách để giữ đà.
 */

export type Suggestion = { href: string; emoji: string; title: string; reason: string };

export const GOAL_PLANS: Record<string, Suggestion[]> = {
  travel: [
    { href: "/shadowing", emoji: "🗣️", title: "Luyện nói câu giao tiếp", reason: "Đi du lịch cần phản xạ nói — shadowing là nhanh nhất." },
    { href: "/reading", emoji: "📖", title: "Đọc tình huống đời sống", reason: "Làm quen biển báo, hội thoại quán xá." },
    { href: "/dictionary", emoji: "🔎", title: "Tra từ thực dụng", reason: "Bỏ túi từ vựng hỏi đường, mua sắm." },
  ],
  drama: [
    { href: "/video", emoji: "📺", title: "Học qua C-drama & bài hát", reason: "Bạn mê phim Hoa ngữ — học ngay từ thứ mình thích." },
    { href: "/generate", emoji: "✨", title: "Tạo truyện theo mood", reason: "Đắm vào câu chuyện cảm xúc để nhớ lâu." },
    { href: "/shadowing", emoji: "🎤", title: "Nhái thoại nhân vật", reason: "Bắt chước giọng diễn viên cho tự nhiên." },
  ],
  business: [
    { href: "/ai-tutor", emoji: "💼", title: "Chat với mentor CEO", reason: "Luyện tiếng Trung công việc, trang trọng." },
    { href: "/hsk", emoji: "🎯", title: "Lộ trình HSK bài bản", reason: "Mục tiêu công việc cần chứng chỉ rõ ràng." },
    { href: "/test", emoji: "📝", title: "Kiểm tra trình độ", reason: "Đo năng lực để biết đang ở đâu." },
  ],
  culture: [
    { href: "/chiet-tu", emoji: "🧩", title: "Chiết tự Hán tự", reason: "Hiểu gốc rễ chữ Hán — chiều sâu văn hóa." },
    { href: "/reading", emoji: "📜", title: "Đọc truyện & thơ", reason: "Cảm nhận thành ngữ, điển tích." },
    { href: "/radicals", emoji: "🏯", title: "214 bộ thủ", reason: "Nền tảng để đọc hiểu chữ Hán." },
  ],
  fun: [
    { href: "/generate", emoji: "✨", title: "Tạo truyện theo tâm trạng", reason: "Học mà chơi — câu chuyện riêng cho bạn." },
    { href: "/flashcards", emoji: "🃏", title: "Flashcard nhẹ nhàng", reason: "Ôn từ kiểu lướt, không áp lực." },
    { href: "/feed", emoji: "🌙", title: "Lướt câu nói hay", reason: "Mỗi ngày vài câu đẹp, thấm dần." },
  ],
};

const FOUNDATION: Suggestion = {
  href: "/radicals", emoji: "🧱", title: "Học 214 bộ thủ nền tảng",
  reason: "Mới bắt đầu nên nắm bộ thủ trước — đọc chữ Hán dễ hơn hẳn.",
};
const PRONUNCIATION: Suggestion = {
  href: "/pronunciation", emoji: "🎵", title: "Luyện thanh điệu & pinyin",
  reason: "Phát âm chuẩn từ đầu giúp tránh sai lệch khó sửa về sau.",
};
const FIRST_STORY: Suggestion = {
  href: "/generate", emoji: "✨", title: "Tạo truyện đầu tiên của bạn",
  reason: "Trái tim của MandoMood — học qua câu chuyện do AI viết riêng cho bạn.",
};
const KEEP_STREAK: Suggestion = {
  href: "/challenge", emoji: "🔥", title: "Thử thách hằng ngày",
  reason: "Bạn đang có chuỗi đẹp — làm thử thách hôm nay để giữ lửa!",
};

export interface RoadmapCtx {
  goal?: string;
  level?: string;
  storiesCreated?: number;
  streak?: number;
}

/** Trả tối đa `limit` gợi ý, không trùng href, đã ưu tiên theo ngữ cảnh. */
export function buildRoadmap(ctx: RoadmapCtx, limit = 3): Suggestion[] {
  const goal = ctx.goal ?? "fun";
  const level = ctx.level ?? "beginner";
  const base = GOAL_PLANS[goal] ?? GOAL_PLANS.fun;

  const head: Suggestion[] = [];
  const isBeginner = level === "beginner" || level === "hsk1";

  if (isBeginner) head.push(FOUNDATION, PRONUNCIATION);
  if ((ctx.storiesCreated ?? 0) === 0) head.push(FIRST_STORY);
  if ((ctx.streak ?? 0) >= 3) head.push(KEEP_STREAK);

  // Gộp head (ưu tiên) + base, khử trùng theo href, cắt theo limit.
  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const s of [...head, ...base]) {
    if (seen.has(s.href)) continue;
    seen.add(s.href);
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}
