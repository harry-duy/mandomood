/**
 * GET /api/leaderboard
 * Trả về top users theo XP tuần này / tổng
 * ?period=weekly | alltime (default: weekly)
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const period = req.nextUrl.searchParams.get("period") ?? "weekly";

    // Sort: weekly → weekly_xp, test → test_best_pct (chỉ lấy người đã từng thi), alltime → xp
    const sortField = period === "weekly" ? { weekly_xp: -1 } : period === "test" ? { test_best_pct: -1 } : { xp: -1 };
    const filterQuery = period === "test" ? { tests_taken: { $gt: 0 } } : {};

    const users = await User.find(filterQuery)
      .select("name image xp streak level weekly_xp test_best_pct tests_taken")
      .sort(sortField)
      .limit(50)
      .lean();

    const ranked = users.map((u, i) => ({
      rank: i + 1,
      name: (u.name as string) ?? "Ẩn danh",
      image: (u.image as string) ?? null,
      xp: (u.xp as number) ?? 0,
      weekly_xp: (u as Record<string, unknown>).weekly_xp as number ?? 0,
      streak: (u.streak as number) ?? 0,
      level: (u.level as string) ?? "beginner",
      test_best_pct: ((u as Record<string, unknown>).test_best_pct as number) ?? 0,
      tests_taken: ((u as Record<string, unknown>).tests_taken as number) ?? 0,
    }));

    return NextResponse.json({ period, users: ranked });
  } catch (error) {
    console.error("[GET /api/leaderboard]", error);
    return NextResponse.json({ error: "Lỗi leaderboard" }, { status: 500 });
  }
}
