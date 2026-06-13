import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

interface PushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function POST(req: NextRequest) {
  const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
  const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const ADMIN_SECRET = process.env.PUSH_ADMIN_SECRET;
  const CONTACT = process.env.NEXT_PUBLIC_APP_URL ?? "https://mandomood.vercel.app";

  if (!VAPID_PRIVATE || !VAPID_PUBLIC) {
    return NextResponse.json(
      { error: "VAPID keys chưa được cấu hình. Thêm VAPID_PRIVATE_KEY và NEXT_PUBLIC_VAPID_PUBLIC_KEY vào env." },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as {
      title?: string;
      body?: string;
      url?: string;
      secret?: string;
      email?: string;
    };

    if (!ADMIN_SECRET || body.secret !== ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    webpush.setVapidDetails(`mailto:admin@${new URL(CONTACT).hostname}`, VAPID_PUBLIC, VAPID_PRIVATE);

    await connectDB();
    const query = body.email
      ? { email: body.email, push_subscription: { $exists: true, $ne: null } }
      : { push_subscription: { $exists: true, $ne: null } };
    const users = await User.find(query).select("email push_subscription").lean();

    if (users.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: "Không có người đăng ký nào." });
    }

    const payload = JSON.stringify({
      title: body.title ?? "MandoMood",
      body: body.body ?? "Hôm nay bạn đã học chưa? 📖",
      url: body.url ?? "/",
    });

    let sent = 0;
    let failed = 0;
    const staleEmails: string[] = [];

    await Promise.all(
      users.map(async (u) => {
        const sub = u.push_subscription as unknown as PushSubscription;
        if (!sub?.endpoint) return;
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

    if (staleEmails.length > 0) {
      await User.updateMany(
        { email: { $in: staleEmails } },
        { $unset: { push_subscription: "" } }
      );
    }

    return NextResponse.json({ success: true, sent, failed, cleaned: staleEmails.length });
  } catch (e) {
    console.error("[POST /api/push/send]", e);
    return NextResponse.json({ error: "Lỗi gửi thông báo" }, { status: 500 });
  }
}
