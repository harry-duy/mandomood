/**
 * POST /api/stripe/webhook
 * Xử lý Stripe events:
 *  - checkout.session.completed → kích hoạt premium
 *  - customer.subscription.deleted → hủy premium
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: { type: string; data: { object: Record<string, unknown> } };

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET) as unknown as typeof event;
  } catch (err) {
    console.error("[Webhook] signature verify failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await connectDB();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata as Record<string, string> | null;
    const email = (session.customer_email as string | null) ?? meta?.user_email ?? "";
    const plan = (session.metadata as Record<string, string>)?.plan ?? "monthly";

    if (email) {
      const sessionId = (session.id as string | undefined) ?? "";
      const customerId = (session.customer as string | null) ?? null;

      // Idempotency: Stripe có thể gửi lại cùng 1 event → tránh cộng XP nhiều lần
      const existing = await User.findOne({ email }).select("last_checkout_session").lean() as { last_checkout_session?: string } | null;
      if (existing && sessionId && existing.last_checkout_session === sessionId) {
        console.log(`[Webhook] Bỏ qua event trùng cho ${email} (session ${sessionId})`);
        return NextResponse.json({ received: true, duplicate: true });
      }

      let premiumUntil: Date | null = null;
      if (plan === "monthly") {
        premiumUntil = new Date();
        premiumUntil.setMonth(premiumUntil.getMonth() + 1);
      } else if (plan === "yearly") {
        premiumUntil = new Date();
        premiumUntil.setFullYear(premiumUntil.getFullYear() + 1);
      }
      // lifetime: premiumUntil = null (no expiry)

      await User.findOneAndUpdate(
        { email },
        {
          $set: {
            premium: true,
            last_checkout_session: sessionId,
            ...(customerId ? { stripe_customer_id: customerId } : {}),
            ...(premiumUntil ? { premium_until: premiumUntil } : {}),
          },
          $inc: { xp: 500, weekly_xp: 500 }, // bonus XP on upgrade (chỉ chạy 1 lần nhờ idempotency)
        }
      );
      console.log(`[Webhook] Premium activated for ${email}, plan=${plan}`);
    }
  }

  // Gia hạn / đổi gói (kể cả thao tác từ Customer Portal) → đồng bộ premium_until.
  // current_period_end là mốc hết hạn chu kỳ hiện tại; status active/trialing = còn quyền.
  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object;
    const email = (sub.metadata as Record<string, string>)?.user_email;
    const customerId = (sub.customer as string | null) ?? null;
    const query = email ? { email } : (customerId ? { stripe_customer_id: customerId } : null);
    if (query) {
      const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;
      const active = sub.status === "active" || sub.status === "trialing";
      // cancel_at_period_end: user bấm hủy trong portal nhưng còn quyền đến hết chu kỳ
      // → vẫn premium=true, premium_until=cuối chu kỳ; sự kiện .deleted sẽ chốt hạ sau.
      const res = await User.findOneAndUpdate(
        query,
        {
          $set: {
            premium: active,
            ...(periodEnd ? { premium_until: new Date(periodEnd * 1000) } : {}),
          },
        }
      );
      console.log(`[Webhook] subscription.updated ${email ?? customerId}: status=${sub.status}, periodEnd=${periodEnd} (found=${!!res})`);
    } else {
      console.warn("[Webhook] subscription.updated: không xác định được user");
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const email = (sub.metadata as Record<string, string>)?.user_email;
    const customerId = (sub.customer as string | null) ?? null;
    // Tìm user theo metadata.user_email (đã gắn qua subscription_data), fallback theo customer id
    const query = email ? { email } : (customerId ? { stripe_customer_id: customerId } : null);
    if (query) {
      const res = await User.findOneAndUpdate(
        query,
        { $set: { premium: false, premium_until: new Date() } }
      );
      console.log(`[Webhook] Premium cancelled for ${email ?? customerId} (found=${!!res})`);
    } else {
      console.warn("[Webhook] subscription.deleted: không xác định được user");
    }
  }

  return NextResponse.json({ received: true });
}
