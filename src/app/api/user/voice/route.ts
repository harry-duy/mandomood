/**
 * POST /api/user/voice — lưu voice preference của user
 * Body: { voiceId: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await (getServerSession as any)(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    const { voiceId } = await req.json() as { voiceId: string };
    if (!voiceId) return NextResponse.json({ error: "Thiếu voiceId" }, { status: 400 });
    await connectDB();
    await User.findOneAndUpdate({ email: session.user.email }, { $set: { preferred_voice: voiceId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[POST /api/user/voice]", e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
