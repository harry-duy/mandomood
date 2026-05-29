import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
  const VAPID_PUBLIC  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const ADMIN_SECRET  = process.env.PUSH_ADMIN_SECRET;

  if (!VAPID_PRIVATE || !VAPID_PUBLIC) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 503 });
  }

  const body = await req.json() as {
    title?: string; body?: string; url?: string; secret?: string;
  };

  if (body.secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const users = await User.find({ push_subscription: { $exists: true } })
    .select("push_subscription email")
    .lean() as unknown as Array<{ push_subscription: unknown; email: string }>;

  const webpush = (await import("web-push")).default;
  webpush.setVapidDetails(
    "mailto:ngothanhduy04@gmail.com",
    VAPID_PUBLIC,
    VAPID_PRIVATE
  );

  const payload = JSON.stringify({
    title: body.title ?? "MandoMood",
    body:  body.body  ?? "Streak dang cho! Hoc 5 phut thoi",
    url:   body.url   ?? "/feed",
    tag:   "streak-reminder",
  });

  let sent = 0, failed = 0;
  for (const user of users) {
    try {
      await webpush.sendNotification(
        user.push_subscription as Parameters<typeof webpush.sendNotification>[0],
        payload
      );
      sent++;
    } catch {
      failed++;
      await User.updateOne({ email: user.email }, { $unset: { push_subscription: 1 } });
    }
  }
  return NextResponse.json({ sent, failed, total: users.length });
}
