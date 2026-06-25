/**
 * GET /api/leaderboard
 * Trả về top users theo XP tuần này / tổng / điểm thi
 * ?period=weekly | alltime | test  (default: weekly)
 *
 * weekly: `weekly_xp` reset KIỂU LƯỜI (chỉ reset khi user hoạt động sau thứ Hai)
 * → user nghỉ tuần này vẫn giữ số tuần trước. Nên CHỈ tính weekly_xp khi mốc
 * `weekly_xp_reset` còn ở tương lai (đồng bộ với @/lib/weeklyXp.effectiveWeeklyXp).
 */

import { NextRequest, NextResponse } from "next/server";
import type { SortOrder } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

interface RankedRow {
  rank: number;
  name: string;
  image: string | null;
  xp: number;
  weekly_xp: number;
  streak: number;
  level: string;
  test_best_pct: number;
  tests_taken: number;
}

function toRow(u: Record<string, unknown>, i: number, weeklyXp: number): RankedRow {
  return {
    rank: i + 1,
    name: (u.name as string) ?? "Ẩn danh",
    image: (u.image as string) ?? null,
    xp: (u.xp as number) ?? 0,
    weekly_xp: weeklyXp,
    streak: (u.streak as number) ?? 0,
    level: (u.level as string) ?? "beginner",
    test_best_pct: (u.test_best_pct as number) ?? 0,
    tests_taken: (u.tests_taken as number) ?? 0,
  };
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const period = req.nextUrl.searchParams.get("period") ?? "weekly";

    let ranked: RankedRow[];

    if (period === "weekly") {
      // Chỉ tính weekly_xp cho user còn TRONG tuần hiện tại (weekly_xp_reset > now);
      // user nghỉ tuần này (mốc reset đã qua / thiếu) → _weekly_eff = 0 → bị loại.
      const now = new Date();
      const rows = await User.aggregate([
        {
          $addFields: {
            _weekly_eff: {
              $cond: [{ $gt: ["$weekly_xp_reset", now] }, { $ifNull: ["$weekly_xp", 0] }, 0],
            },
          },
        },
        { $match: { _weekly_eff: { $gt: 0 } } },
        { $sort: { _weekly_eff: -1, xp: -1 } },
        { $limit: 50 },
        {
          $project: {
            name: 1, image: 1, xp: 1, streak: 1, level: 1,
            _weekly_eff: 1, test_best_pct: 1, tests_taken: 1,
          },
        },
      ]);
      ranked = (rows as Record<string, unknown>[]).map((u, i) =>
        toRow(u, i, (u._weekly_eff as number) ?? 0)
      );
    } else {
      const sortField: Record<string, SortOrder> =
        period === "test" ? { test_best_pct: -1 } : { xp: -1 };
      const filterQuery = period === "test" ? { tests_taken: { $gt: 0 } } : {};

      const users = await User.find(filterQuery)
        .select("name image xp streak level weekly_xp test_best_pct tests_taken")
        .sort(sortField)
        .limit(50)
        .lean();

      ranked = (users as Record<string, unknown>[]).map((u, i) =>
        toRow(u, i, (u.weekly_xp as number) ?? 0)
      );
    }

    return NextResponse.json({ period, users: ranked });
  } catch (error) {
    console.error("[GET /api/leaderboard]", error);
    return NextResponse.json({ error: "Lỗi leaderboard" }, { status: 500 });
  }
}
