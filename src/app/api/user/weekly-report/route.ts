/**
 * GET /api/user/weekly-report
 * Trả về tóm tắt học tập 7 ngày gần nhất của user đang đăng nhập
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { levelProgressPct } from "@/lib/levels";
import { effectiveWeeklyXp } from "@/lib/weeklyXp";

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (getServerSession as any)(authOptions) as {
    user?: { email?: string };
    dbUser?: Record<string, unknown>;
  } | null;

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean() as Record<string, unknown> | null;
    if (!user) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });

    // XP tuần này — chỉ tính nếu còn trong tuần hiện tại (reset lười → tránh số tuần cũ).
    const weeklyXp   = effectiveWeeklyXp(user.weekly_xp, user.weekly_xp_reset, new Date());
    const totalXp    = (user.xp as number) ?? 0;
    const streak     = (user.streak_days as number) ?? 0;
    const level      = (user.level as string) ?? "beginner";
    const premium    = (user.premium as boolean) ?? false;

    // Tiến độ cấp — dùng nguồn chân lý chung @/lib/levels (khớp /api/user/progress).
    const levelProgress = levelProgressPct(totalXp, level);

    return NextResponse.json({
      weekly_xp:     weeklyXp,
      total_xp:      totalXp,
      streak_days:   streak,
      level,
      level_progress: levelProgress,
      premium,
    });
  } catch (e) {
    console.error("[GET /api/user/weekly-report]", e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
