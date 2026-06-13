/**
 * POST /api/stripe/portal — tạo Stripe Customer Portal session
 * (user tự quản lý gói: đổi thẻ, xem hóa đơn, hủy subscription).
 * Yêu cầu: đã đăng nhập + đã từng mua (có stripe_customer_id).
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

export async function POST() {
  if (!STRIPE_SECRET) {
    return NextResponse.json(
      { error: "Stripe chưa được cấu hình." },
      { status: 503 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (getServerSession as any)(authOptions) as { user?: { email?: string } } | null;
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    await connectDB();
    const u = await User.findOne({ email })
      .select("stripe_customer_id")
      .lean() as { stripe_customer_id?: string } | null;

    if (!u?.stripe_customer_id) {
      // Chưa từng thanh toán qua Stripe (vd: chỉ trial) → không có portal
      return NextResponse.json(
        { error: "Tài khoản chưa có thanh toán Stripe. Hãy nâng cấp ở trang Premium.", code: "NO_CUSTOMER" },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(STRIPE_SECRET);
    const portal = await stripe.billingPortal.sessions.create({
      customer: u.stripe_customer_id,
      return_url: `${appUrl}/profile`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    console.error("[POST /api/stripe/portal]", e);
    return NextResponse.json({ error: "Lỗi tạo phiên quản lý gói." }, { status: 500 });
  }
}
