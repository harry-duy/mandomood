import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await (getServerSession as any)(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    const { subscription } = await req.json() as {
      subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
    };
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "Thiếu subscription" }, { status: 400 });
    }
    await connectDB();
    await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: { push_subscription: subscription } }
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[POST /api/push/subscribe]", e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}


/** Gỡ subscription khỏi DB khi user TẮT thông báo (gọi từ usePushNotification.unsubscribe).
 *  Giúp dừng gửi push NGAY, không phải chờ 1 lần gửi lỗi (404/410) mới dọn. */
export async function DELETE() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await (getServerSession as any)(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    await connectDB();
    await User.updateOne(
      { email: session.user.email },
      { $unset: { push_subscription: "" } }
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/push/subscribe]", e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
