/**
 * premiumServer — helper SERVER-ONLY cho API routes:
 * - getPremiumStatus(): đọc session + DB → user là "paid" / "trial" / free.
 * - consumeDailyQuota(): đếm lượt AI mỗi ngày cho user FREE, lưu trên User doc
 *   (bền qua serverless cold-start, khác in-memory ratelimit).
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { premiumSource, type PremiumSource } from "@/lib/premium";

export interface PremiumStatus {
  email: string | null; // null = chưa đăng nhập
  source: PremiumSource; // "paid" | "trial" | null(free)
}

export async function getPremiumStatus(): Promise<PremiumStatus> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (getServerSession as any)(authOptions) as { user?: { email?: string } } | null;
  const email = session?.user?.email ?? null;
  if (!email) return { email: null, source: null };
  try {
    await connectDB();
    const u = await User.findOne({ email })
      .select("premium premium_until trial_until")
      .lean() as { premium?: boolean; premium_until?: Date; trial_until?: Date } | null;
    if (!u) return { email, source: null };
    return { email, source: premiumSource(u) };
  } catch (e) {
    console.error("[getPremiumStatus]", e);
    // DB lỗi → coi như free (an toàn chi phí AI), KHÔNG chặn request vì lỗi hệ thống
    return { email, source: null };
  }
}

/**
 * Tiêu 1 lượt quota ngày của user free. Trả về allowed=false khi đã hết.
 * Reset tự nhiên khi sang ngày mới (so chuỗi YYYY-MM-DD, múi giờ UTC).
 */
export async function consumeDailyQuota(
  email: string,
  field: "story" | "chat",
  max: number
): Promise<{ allowed: boolean; used: number; max: number }> {
  await connectDB();
  const today = new Date().toISOString().slice(0, 10);
  const col = field === "story" ? "ai_story_used" : "ai_chat_used";
  const other = field === "story" ? "ai_chat_used" : "ai_story_used";

  const u = await User.findOne({ email })
    .select("ai_quota_date ai_story_used ai_chat_used")
    .lean() as { ai_quota_date?: string; ai_story_used?: number; ai_chat_used?: number } | null;

  const sameDay = u?.ai_quota_date === today;
  const used = sameDay ? (u?.[col as "ai_story_used" | "ai_chat_used"] ?? 0) : 0;
  if (used >= max) return { allowed: false, used, max };

  await User.updateOne(
    { email },
    sameDay
      ? { $inc: { [col]: 1 } }
      : { $set: { ai_quota_date: today, [other]: 0, [col]: 1 } }
  );
  return { allowed: true, used: used + 1, max };
}
