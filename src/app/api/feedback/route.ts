/**
 * POST /api/feedback — gửi góp ý (không cần auth)
 * GET  /api/feedback — xem tất cả (cần session.user.is_admin)
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import { checkRateLimit } from "@/lib/ratelimit";
import { isAdminEmail } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`feedback:${ip}`, 5)) {
    return NextResponse.json(
      { error: "Bạn gửi góp ý quá nhanh. Vui lòng thử lại sau 1 phút." },
      { status: 429 }
    );
  }
  try {
    const body = await req.json() as { message?: string; type?: string; page?: string; user_email?: string; rating?: number };
    if (!body.message?.trim()) return NextResponse.json({ error: "Thiếu nội dung" }, { status: 400 });
    await connectDB();
    const fb = await Feedback.create({
      message:    body.message.slice(0, 2000),
      type:       body.type ?? "other",
      page:       body.page ?? "/",
      user_email: body.user_email,
      rating:     body.rating,
    });
    return NextResponse.json({ success: true, id: fb._id }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/feedback]", e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Kiểm tra session — chỉ admin email được phép
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (getServerSession as any)(authOptions) as { user?: { email?: string } } | null;
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const type = req.nextUrl.searchParams.get("type") ?? "";
    const filter = type ? { type } : {};
    const feedbacks = await Feedback.find(filter).sort({ created_at: -1 }).limit(200).lean();
    return NextResponse.json({ feedbacks });
  } catch (e) {
    console.error("[GET /api/feedback]", e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
