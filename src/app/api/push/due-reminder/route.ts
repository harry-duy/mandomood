/**
 * /api/push/due-reminder
 *
 * Nhắc nhở ngắt quãng (spaced repetition reminder): quét tất cả người dùng có
 * thẻ từ/câu ĐẾN HẠN ÔN (next_review <= now) và còn đăng ký push → gửi 1 thông
 * báo nhắc ôn tập. Thiết kế để chạy bằng Vercel Cron (1 lần/ngày).
 *
 * Bảo mật: yêu cầu header `Authorization: Bearer <CRON_SECRET>` HOẶC query
 * `?secret=<CRON_SECRET>`. Vercel Cron tự gửi header Authorization nếu đặt
 * CRON_SECRET trong env.
 *
 * GET  — dùng cho Vercel Cron.
 * POST — tiện gọi thủ công khi test.
 */

import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Vocabulary from "@/models/Vocabulary";

export const dynamic = "force-dynamic";

interface PushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

async function handle(req: NextRequest) {
  const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
  const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const CRON_SECRET = process.env.CRON_SECRET;
  const CONTACT = process.env.NEXT_PUBLIC_APP_URL ?? "https://mandomood.vercel.app";

  // ── Xác thực ──
  const auth = req.headers.get("authorization") ?? "";
  const urlSecret = new URL(req.url).searchParams.get("secret") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : urlSecret;
  if (!CRON_SECRET || provided !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!VAPID_PRIVATE || !VAPID_PUBLIC) {
    return NextResponse.json({ error: "VAPID keys chưa cấu hình" }, { status: 503 });
  }

  webpush.setVapidDetails(`mailto:admin@${new URL(CONTACT).hostname}`, VAPID_PUBLIC, VAPID_PRIVATE);

  await connectDB();
  const now = new Date();

  // Đếm số thẻ đến hạn theo từng user (chỉ lấy user đến hạn).
  const dueAgg: { _id: string; count: number }[] = await Vocabulary.aggregate([
    { $match: { next_review: { $lte: now } } },
    { $group: { _id: "$user_id", count: { $sum: 1 } } },
  ]);

  const dueMap = new Map(dueAgg.map((d) => [d._id, d.count]));
  const emails = [...dueMap.keys()];

  const users = await User.find({
    email: { $in: emails },
    push_subscription: { $exists: true, $ne: null },
  })
    .select("email push_subscription")
    .lean();

  let sent = 0;
  let failed = 0;
  const staleEmails: string[] = [];

  await Promise.all(
    users.map(async (u) => {
      const sub = u.push_subscription as unknown as PushSubscription;
      if (!sub?.endpoint) return;
      const count = dueMap.get(u.email as string) ?? 0;
      const payload = JSON.stringify({
        title: "Đến giờ ôn rồi! 🌸",
        body:
          count === 1
            ? "Bạn có 1 từ/câu cần ôn hôm nay. Ôn nhanh 1 phút để nhớ lâu nhé!"
            : `Bạn có ${count} từ/câu đến hạn ôn. Dành 2 phút ôn lại để khắc sâu trí nhớ nhé!`,
        url: "/review",
      });
      try {
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (err) {
        failed++;
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) staleEmails.push(u.email as string);
      }
    })
  );

  // Dọn subscription chết
  if (staleEmails.length > 0) {
    await User.updateMany(
      { email: { $in: staleEmails } },
      { $unset: { push_subscription: "" } }
    );
  }

  // ── Nhắc TRIAL sắp hết (còn ≤3 ngày) — tăng chuyển đổi Premium ──
  const in3Days = new Date(now.getTime() + 3 * 24 * 3600 * 1000);
  const trialUsers = await User.find({
    premium: { $ne: true },
    trial_until: { $gt: now, $lte: in3Days },
    push_subscription: { $exists: true, $ne: null },
  })
    .select("email trial_until push_subscription")
    .lean();

  let trialSent = 0;
  await Promise.all(
    trialUsers.map(async (u) => {
      const sub = u.push_subscription as unknown as PushSubscription;
      if (!sub?.endpoint) return;
      const days = Math.max(1, Math.ceil(((u.trial_until as Date).getTime() - now.getTime()) / 86_400_000));
      const payload = JSON.stringify({
        title: "Premium dùng thử sắp hết ⏳",
        body: `Còn ${days} ngày dùng thử Premium. Nâng cấp để giữ truyện AI + AI Tutor không giới hạn nhé! 👑`,
        url: "/pricing",
      });
      try {
        await webpush.sendNotification(sub, payload);
        trialSent++;
      } catch (err) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) staleEmails.push(u.email as string);
      }
    })
  );

  // Dọn nốt subscription chết phát hiện ở vòng trial
  if (staleEmails.length > 0) {
    await User.updateMany(
      { email: { $in: staleEmails } },
      { $unset: { push_subscription: "" } }
    );
  }

  return NextResponse.json({
    success: true,
    dueUsers: dueAgg.length,
    subscribed: users.length,
    sent,
    failed,
    trialReminded: trialSent,
    cleaned: staleEmails.length,
  });
}

export async function GET(req: NextRequest) {
  return handle(req);
}
export async function POST(req: NextRequest) {
  return handle(req);
}
