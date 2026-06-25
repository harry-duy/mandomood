/**
 * GET /api/admin/users — Thống kê người dùng đã đăng ký (chỉ ADMIN_EMAILS).
 *
 * Khác với /api/analytics (lưu lượng web ẩn danh), endpoint này tổng hợp từ
 * collection User: tổng số, premium/trial, đăng ký mới, hoạt động gần đây,
 * phân bố theo cấp độ & nguồn đăng nhập, top theo XP, và đăng ký theo ngày.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { buildUserFilter } from "@/lib/adminUserFilter";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "ngothanhduy04@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase());

export async function GET(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (getServerSession as any)(authOptions) as { user?: { email?: string } } | null;
  const email = (session?.user?.email ?? "").toLowerCase();
  if (!email || !ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const now = new Date();

    // Tìm kiếm/lọc user (q + tier + level) — trả riêng, không ảnh hưởng thống kê
    const sp = req.nextUrl.searchParams;
    const { query: filterQuery, active: filterActive } = buildUserFilter(
      { q: sp.get("q") ?? "", tier: sp.get("tier") ?? "", level: sp.get("level") ?? "" },
      now
    );
    let search: unknown[] | undefined;
    if (filterActive) {
      const found = await User.find(filterQuery)
        .select("name email xp streak_days level premium created_at last_active provider")
        .sort({ xp: -1 })
        .limit(50)
        .lean() as Record<string, unknown>[];
      search = found.map((u) => ({
        name: u.name ?? "—", email: u.email ?? "", xp: u.xp ?? 0,
        streak_days: u.streak_days ?? 0, level: u.level ?? "beginner",
        premium: !!u.premium, provider: u.provider ?? "email",
        created_at: u.created_at ?? null, last_active: u.last_active ?? null,
      }));
    }
    const d1 = new Date(now.getTime() - 1 * 86400000);
    const d7 = new Date(now.getTime() - 7 * 86400000);
    const d30 = new Date(now.getTime() - 30 * 86400000);

    const [
      total,
      premiumActive,
      trialActive,
      newToday,
      new7d,
      new30d,
      active7d,
      byLevelRaw,
      byProviderRaw,
      topUsersRaw,
      signupsRaw,
      aggXp,
    ] = await Promise.all([
      User.countDocuments({}),
      // Premium còn hạn: cờ premium=true HOẶC premium_until trong tương lai
      User.countDocuments({ $or: [{ premium: true }, { premium_until: { $gt: now } }] }),
      // Trial còn hạn và CHƯA premium
      User.countDocuments({ trial_until: { $gt: now }, premium: { $ne: true } }),
      User.countDocuments({ created_at: { $gte: d1 } }),
      User.countDocuments({ created_at: { $gte: d7 } }),
      User.countDocuments({ created_at: { $gte: d30 } }),
      User.countDocuments({ last_active: { $gte: d7 } }),
      User.aggregate([
        { $group: { _id: "$level", count: { $sum: 1 } } },
        { $project: { _id: 0, level: "$_id", count: 1 } },
      ]),
      User.aggregate([
        { $group: { _id: "$provider", count: { $sum: 1 } } },
        { $project: { _id: 0, provider: "$_id", count: 1 } },
      ]),
      User.find({})
        .select("name email xp streak_days level premium created_at")
        .sort({ xp: -1 })
        .limit(15)
        .lean(),
      User.aggregate([
        { $match: { created_at: { $gte: d30 } } },
        { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          count: { $sum: 1 },
        } },
        { $project: { _id: 0, day: "$_id", count: 1 } },
        { $sort: { day: 1 } },
      ]),
      User.aggregate([
        { $group: { _id: null, totalXp: { $sum: "$xp" }, avgXp: { $avg: "$xp" } } },
        { $project: { _id: 0, totalXp: 1, avgXp: 1 } },
      ]),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topUsers = (topUsersRaw as any[]).map((u) => ({
      name: u.name ?? "—",
      email: u.email ?? "",
      xp: u.xp ?? 0,
      streak_days: u.streak_days ?? 0,
      level: u.level ?? "beginner",
      premium: !!u.premium,
      created_at: u.created_at ?? null,
    }));

    return NextResponse.json({
      generatedAt: now.toISOString(),
      totals: {
        total,
        premiumActive,
        trialActive,
        free: Math.max(0, total - premiumActive),
        newToday,
        new7d,
        new30d,
        active7d,
        totalXp: Math.round((aggXp[0]?.totalXp as number) ?? 0),
        avgXp: Math.round((aggXp[0]?.avgXp as number) ?? 0),
      },
      byLevel: byLevelRaw,
      byProvider: byProviderRaw,
      topUsers,
      signupsByDay: signupsRaw,
      search,
    });
  } catch (e) {
    console.error("[GET /api/admin/users]", e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
