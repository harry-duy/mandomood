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
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET) as typeof event;
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
            ...(premiumUntil ? { premium_until: premiumUntil } : {}),
          },
          $inc: { xp: 500, weekly_xp: 500 }, // bonus XP on upgrade
        }
      );
      console.log(`[Webhook] Premium activated for ${email}, plan=${plan}`);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const email = (sub.metadata as Record<string, string>)?.user_email;
    if (email) {
      await User.findOneAndUpdate(
        { email },
        { $set: { premium: false, premium_until: new Date() } }
      );
      console.log(`[Webhook] Premium cancelled for ${email}`);
    }
  }

  return NextResponse.json({ received: true });
}
