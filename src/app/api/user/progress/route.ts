/**
 * POST /api/user/progress
 * Body: { xp, action: "complete_lesson" | "complete_quiz" | "view_quote" }
 *
 * Streak logic (xem @/lib/xpProgress — PURE, có unit test):
 *   same-day  -> keep streak (KHÔNG thưởng lại mốc)
 *   yesterday -> +1 streak
 *   older     -> reset to 1
 *
 * Weekly XP: auto-reset mỗi thứ Hai 00:00
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { levelFromXp } from "@/lib/levels";
import { applyDailyStreak } from "@/lib/xpProgress";

function getNextMonday(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await (getServerSession as any)(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const { xp: rawXp = 0, action = "complete_lesson" } = body as {
      xp: number;
      action: string;
    };

    // Chống gian lận: giới hạn XP tối đa theo từng loại hành động (server-side).
    const XP_CAP: Record<string, number> = {
      complete_lesson: 20,
      complete_quiz: 50,
      daily_challenge: 100,
      hsk_test: 100, // thi thử HSK — trần rõ ràng (tránh dính default 50 nếu QUIZ_SIZE tăng)
      view_quote: 5,
    };
    const cap = XP_CAP[action] ?? 50;
    const requested = Number(rawXp);
    const xp = Number.isFinite(requested) ? Math.min(Math.max(0, Math.floor(requested)), cap) : 0;

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
    }

    const now = new Date();
    const lastActive = user.last_active ?? new Date(0);

    // Streak + thưởng mốc qua helper PURE: thưởng CHỈ khi streak vừa tăng trong ngày
    // (tránh cộng lặp mỗi hành động cùng ngày → lạm phát XP).
    const { streak: newStreak, bonusXp: bonusXP } = applyDailyStreak(
      lastActive,
      now,
      user.streak_days ?? 0
    );

    const totalXP = xp + bonusXP;
    const newTotalXP = user.xp + totalXP;

    // Level up — nguồn chân lý chung @/lib/levels (cấp chỉ tăng vì XP chỉ tăng).
    const newLevel = levelFromXp(newTotalXP);

    // Weekly XP: reset nếu qua Monday
    const weeklyReset = user.weekly_xp_reset ?? new Date(0);
    const shouldResetWeekly = now >= weeklyReset;
    const newWeeklyXP = shouldResetWeekly ? totalXP : (user.weekly_xp ?? 0) + totalXP;

    const updateData: Record<string, unknown> = {
      $inc: { xp: totalXP },
      $set: {
        streak_days: newStreak,
        streak: newStreak,
        last_active: now,
        level: newLevel,
        weekly_xp: newWeeklyXP,
        ...(shouldResetWeekly ? { weekly_xp_reset: getNextMonday() } : {}),
      },
    };

    const updated = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      { new: true }
    ).lean() as Record<string, unknown> | null;

    return NextResponse.json({
      success: true,
      xp_earned: totalXP,
      bonus_xp: bonusXP,
      streak: newStreak,
      total_xp: newTotalXP,
      level: newLevel,
      level_up: newLevel !== user.level,
      streak_milestone: bonusXP > 0 ? newStreak : null,
      user: {
        xp: updated?.xp,
        streak_days: updated?.streak_days,
        level: updated?.level,
        weekly_xp: updated?.weekly_xp,
      },
    });
  } catch (error) {
    console.error("[POST /api/user/progress]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await (getServerSession as any)(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email })
      .select("xp weekly_xp streak_days streak level last_active premium")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[GET /api/user/progress]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
