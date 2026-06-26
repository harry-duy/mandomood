/**
 * POST /api/stripe/checkout
 * Tạo Stripe Checkout Session → redirect URL
 * Body: { priceId, plan: "monthly" | "yearly" | "lifetime" }
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { normalizePlan } from "@/lib/premium";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

/**
 * Giá ↔ gói CHỐT phía server. KHÔNG tin priceId từ client: price IDs là
 * NEXT_PUBLIC (ai cũng biết cả 3) → trước đây client gửi plan="yearly" kèm
 * priceId của gói THÁNG → trả tiền 1 tháng nhưng webhook cấp nguyên 1 NĂM
 * (entitlement tính theo metadata.plan). Bind giá theo plan để bịt lỗ hổng.
 */
const PRICE_BY_PLAN: Record<string, string | undefined> = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
  yearly: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID,
  lifetime: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID,
};

export async function POST(req: NextRequest) {
  if (!STRIPE_SECRET) {
    return NextResponse.json(
      { error: "Stripe chưa được cấu hình. Thêm STRIPE_SECRET_KEY vào .env.local" },
      { status: 503 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (getServerSession as any)(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const body = await req.json() as { priceId?: string; plan?: string };

  // Chỉ chấp nhận gói hợp lệ; lấy priceId TỪ SERVER (bỏ qua priceId client gửi).
  const plan = normalizePlan(body.plan);
  if (!plan) {
    return NextResponse.json({ error: "Gói không hợp lệ" }, { status: 400 });
  }
  const priceId = PRICE_BY_PLAN[plan];
  if (!priceId) {
    return NextResponse.json(
      { error: "Gói chưa được cấu hình giá phía server." },
      { status: 503 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(STRIPE_SECRET);

    const isLifetime = plan === "lifetime";

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: isLifetime ? "payment" : "subscription",
      customer_email: session.user.email as string,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        user_email: session.user.email as string,
        plan,
      },
      // Gắn metadata vào subscription để webhook hủy gói tìm được user
      ...(isLifetime ? {} : {
        subscription_data: {
          metadata: { user_email: session.user.email as string, plan },
        },
      }),
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    console.error("[Stripe checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
