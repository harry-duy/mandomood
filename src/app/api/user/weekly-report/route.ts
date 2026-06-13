/**
 * GET /api/user/weekly-report
 * Trả về tóm tắt học tập 7 ngày gần nhất của user đang đăng nhập
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

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

    // Tính XP tuần này (reset mỗi thứ 2)
    const weeklyXp   = (user.weekly_xp as number) ?? 0;
    const totalXp    = (user.xp as number) ?? 0;
    const streak     = (user.streak_days as number) ?? 0;
    const level      = (user.level as string) ?? "beginner";
    const premium    = (user.premium as boolean) ?? false;

    // Tính level progress
    const XP_PER_LEVEL: Record<string, number> = {
      beginner: 100, hsk1: 300, hsk2: 600, hsk3: 1200, hsk4: 2400, hsk5: 5000,
    };
    const nextLevelXp = XP_PER_LEVEL[level] ?? 100;
    const levelProgress = Math.min(100, Math.round((totalXp % nextLevelXp) / nextLevelXp * 100));

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
