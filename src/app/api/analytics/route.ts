/**
 * POST /api/analytics — nhận beacon pageview/event (công khai, rate-limited)
 * GET  /api/analytics — tổng hợp 30 ngày (chỉ ADMIN_EMAILS)
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isAdminEmail } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import { checkRateLimit } from "@/lib/ratelimit";

/** Các bước phễu chuyển đổi, theo thứ tự hành trình người dùng. */
const FUNNEL_STEPS = [
  "pageview",
  "onboarding_completed",
  "login_click",
  "story_generated",
  "share_card_download",
  "premium_checkout_click",
] as const;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  // 60 beacon/phút/IP — đủ cho người dùng thật, chặn spam
  if (!checkRateLimit(`analytics:${ip}`, 60)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  try {
    const body = await req.json() as {
      name?: string; path?: string; referrer?: string; anonId?: string;
      utm?: { source?: string; medium?: string; campaign?: string };
    };
    if (!body.name?.trim() || !body.path?.trim() || !body.anonId?.trim()) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await connectDB();
    await AnalyticsEvent.create({
      name:         body.name.slice(0, 60),
      path:         body.path.slice(0, 200),
      referrer:     body.referrer?.slice(0, 200),
      anon_id:      body.anonId.slice(0, 64),
      utm_source:   body.utm?.source?.slice(0, 100),
      utm_medium:   body.utm?.medium?.slice(0, 100),
      utm_campaign: body.utm?.campaign?.slice(0, 100),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/analytics]", e);
    // Trả 200 — analytics lỗi không được làm client lo lắng/retry
    return NextResponse.json({ ok: false });
  }
}

export async function GET(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (getServerSession as any)(authOptions) as { user?: { email?: string } } | null;
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const days = Math.min(Number(req.nextUrl.searchParams.get("days") ?? 30) || 30, 90);
    const since = new Date(Date.now() - days * 24 * 3600 * 1000);
    const match = { created_at: { $gte: since } };

    const [totals, byDay, topPages, bySource, topEvents, funnelRaw] = await Promise.all([
      AnalyticsEvent.aggregate([
        { $match: { ...match, name: "pageview" } },
        { $group: { _id: null, views: { $sum: 1 }, visitors: { $addToSet: "$anon_id" } } },
        { $project: { _id: 0, views: 1, visitors: { $size: "$visitors" } } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...match, name: "pageview" } },
        { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          views: { $sum: 1 },
          visitors: { $addToSet: "$anon_id" },
        } },
        { $project: { _id: 0, day: "$_id", views: 1, visitors: { $size: "$visitors" } } },
        { $sort: { day: 1 } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...match, name: "pageview" } },
        { $group: { _id: "$path", views: { $sum: 1 } } },
        { $sort: { views: -1 } }, { $limit: 10 },
        { $project: { _id: 0, path: "$_id", views: 1 } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...match, utm_source: { $nin: [null, ""] } } },
        { $group: { _id: "$utm_source", events: { $sum: 1 }, visitors: { $addToSet: "$anon_id" } } },
        { $sort: { events: -1 } }, { $limit: 10 },
        { $project: { _id: 0, source: "$_id", events: 1, visitors: { $size: "$visitors" } } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...match, name: { $ne: "pageview" } } },
        { $group: { _id: "$name", count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 10 },
        { $project: { _id: 0, name: "$_id", count: 1 } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...match, name: { $in: [...FUNNEL_STEPS] } } },
        { $group: { _id: "$name", visitors: { $addToSet: "$anon_id" } } },
        { $project: { _id: 0, name: "$_id", visitors: { $size: "$visitors" } } },
      ]),
    ]);

    // Phễu theo đúng thứ tự bước (bước không có dữ liệu → 0)
    const funnelMap = new Map((funnelRaw as { name: string; visitors: number }[]).map(f => [f.name, f.visitors]));
    const funnel = FUNNEL_STEPS.map(step => ({ step, visitors: funnelMap.get(step) ?? 0 }));

    return NextResponse.json({
      days,
      totals: totals[0] ?? { views: 0, visitors: 0 },
      byDay, topPages, bySource, topEvents, funnel,
    });
  } catch (e) {
    console.error("[GET /api/analytics]", e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
