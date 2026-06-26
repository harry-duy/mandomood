/**
 * GET /api/user/quota — trạng thái premium + lượt AI còn lại hôm nay.
 * Dùng cho QuotaBadge (hiện "còn N/3 lượt") và TrialReminderBanner.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { premiumSource, daysLeft, vnDateKey, FREE_DAILY_STORY, FREE_DAILY_CHAT, FREE_DAILY_UPLOAD } from "@/lib/premium";

export const dynamic = "force-dynamic";

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (getServerSession as any)(authOptions) as { user?: { email?: string } } | null;
  const email = session?.user?.email ?? null;

  const base = {
    loggedIn: false,
    source: null as "paid" | "trial" | null,
    trialDaysLeft: 0,
    story: { used: 0, max: FREE_DAILY_STORY },
    chat: { used: 0, max: FREE_DAILY_CHAT },
    upload: { used: 0, max: FREE_DAILY_UPLOAD },
  };
  if (!email) return NextResponse.json(base);

  try {
    await connectDB();
    const u = await User.findOne({ email })
      .select("premium premium_until trial_until ai_quota_date ai_story_used ai_chat_used ai_upload_used")
      .lean() as {
        premium?: boolean; premium_until?: Date; trial_until?: Date;
        ai_quota_date?: string; ai_story_used?: number; ai_chat_used?: number; ai_upload_used?: number;
      } | null;
    if (!u) return NextResponse.json({ ...base, loggedIn: true });

    const source = premiumSource(u);
    const today = vnDateKey();
    const sameDay = u.ai_quota_date === today;
    return NextResponse.json({
      loggedIn: true,
      source,
      trialDaysLeft: source === "trial" ? daysLeft(u.trial_until) : 0,
      premiumUntil: source === "paid" ? (u.premium_until?.toISOString?.() ?? null) : null,
      trialUntil: source === "trial" ? (u.trial_until?.toISOString?.() ?? null) : null,
      story: { used: sameDay ? (u.ai_story_used ?? 0) : 0, max: FREE_DAILY_STORY },
      chat: { used: sameDay ? (u.ai_chat_used ?? 0) : 0, max: FREE_DAILY_CHAT },
      upload: { used: sameDay ? (u.ai_upload_used ?? 0) : 0, max: FREE_DAILY_UPLOAD },
    });
  } catch (e) {
    console.error("[GET /api/user/quota]", e);
    return NextResponse.json({ ...base, loggedIn: true });
  }
}
