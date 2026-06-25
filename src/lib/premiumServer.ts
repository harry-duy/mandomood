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

/** Map field quota → cột trên User doc. Thêm field mới chỉ cần khai báo ở đây. */
const QUOTA_COLS = {
  story: "ai_story_used",
  chat: "ai_chat_used",
  upload: "ai_upload_used",
} as const;
type QuotaField = keyof typeof QUOTA_COLS;
type QuotaCol = (typeof QUOTA_COLS)[QuotaField];

/**
 * Tiêu 1 lượt quota ngày của user free. Trả allowed=false khi đã hết.
 * Reset tự nhiên khi sang ngày mới (so chuỗi YYYY-MM-DD theo UTC).
 *
 * NGUYÊN TỬ (chống vượt quota khi gọi AI song song): mỗi bước là 1
 * `findOneAndUpdate` khoá document → điều kiện cap `[col] < max` được đánh giá
 * và tăng trong cùng một thao tác, nên N request đồng thời KHÔNG cùng đọc used=0
 * rồi vượt trần (trước đây read-modify-write rời rạc → lọt quota = rò rỉ chi phí).
 */
export async function consumeDailyQuota(
  email: string,
  field: QuotaField,
  max: number
): Promise<{ allowed: boolean; used: number; max: number }> {
  await connectDB();
  const today = new Date().toISOString().slice(0, 10);
  const col = QUOTA_COLS[field];
  const allCols = Object.values(QUOTA_COLS) as QuotaCol[];

  type Doc = Partial<Record<QuotaCol, number>> | null;

  // 1) Cùng ngày + còn dưới trần → tăng nguyên tử.
  let doc = (await User.findOneAndUpdate(
    { email, ai_quota_date: today, [col]: { $lt: max } },
    { $inc: { [col]: 1 } },
    { new: true }
  ).select(col).lean()) as Doc;
  if (doc) return { allowed: true, used: doc[col] ?? 1, max };

  // 2) Sang ngày mới (hoặc chưa từng đặt ngày) → reset hết cột + đặt cột này = 1.
  //    Khoá document khiến chỉ MỘT request reset; các request mới-ngày khác sẽ
  //    không còn khớp `$ne today` và rơi xuống bước 3.
  const reset: Record<string, number | string> = { ai_quota_date: today };
  for (const c of allCols) reset[c] = 0;
  reset[col] = 1;
  doc = (await User.findOneAndUpdate(
    { email, ai_quota_date: { $ne: today } },
    { $set: reset },
    { new: true }
  ).select(col).lean()) as Doc;
  if (doc) return { allowed: true, used: doc[col] ?? 1, max };

  // 3) Một request khác vừa reset sang hôm nay → thử lại nhánh tăng cùng ngày.
  doc = (await User.findOneAndUpdate(
    { email, ai_quota_date: today, [col]: { $lt: max } },
    { $inc: { [col]: 1 } },
    { new: true }
  ).select(col).lean()) as Doc;
  if (doc) return { allowed: true, used: doc[col] ?? 1, max };

  // 4) Hết trần hôm nay (hoặc user không tồn tại) → chặn.
  return { allowed: false, used: max, max };
}

/**
 * Hoàn 1 lượt quota — gọi khi tác vụ AI THẤT BẠI sau khi đã trừ, để user free
 * không mất lượt oan. Điều kiện đúng-ngày + cột > 0 đặt trong query nên nguyên
 * tử (không bao giờ làm âm). Nuốt lỗi để việc hoàn không che lỗi gốc.
 */
export async function refundDailyQuota(email: string, field: QuotaField): Promise<void> {
  try {
    await connectDB();
    const today = new Date().toISOString().slice(0, 10);
    const col = QUOTA_COLS[field];
    await User.updateOne(
      { email, ai_quota_date: today, [col]: { $gt: 0 } },
      { $inc: { [col]: -1 } }
    );
  } catch (e) {
    console.error("[refundDailyQuota]", e);
  }
}
