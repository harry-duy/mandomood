/**
 * GET  /api/user/saved-quotes  — Lay danh sach quotes da save
 * POST /api/user/saved-quotes  — Toggle save/unsave mot quote
 *   Body: { quoteId: string }
 *
 * Toggle dùng toán tử NGUYÊN TỬ ($addToSet/$pull) + chỉ đổi save_count khi
 * THỰC SỰ thay đổi (modifiedCount=1) → chống double-click nhân đôi quote trong
 * mảng + lệch save_count (giống fix ở /api/community/like). save_count khi giảm
 * được clamp ≥ 0 để không trôi âm khi dữ liệu lệch.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Quote from "@/models/Quote";
import mongoose from "mongoose";

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await (getServerSession as any)(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email })
      .populate("saved_quotes")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User khong ton tai" }, { status: 404 });
    }

    return NextResponse.json({
      saved_quotes: (user as Record<string, unknown>).saved_quotes ?? [],
      count: ((user as Record<string, unknown>).saved_quotes as unknown[])?.length ?? 0,
    });
  } catch (error) {
    console.error("[GET /api/user/saved-quotes]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await (getServerSession as any)(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { quoteId } = await req.json() as { quoteId: string };
    // Validate id → tránh `new ObjectId(badInput)` ném (trước đây thành 500 thay vì 400).
    if (!quoteId || !mongoose.Types.ObjectId.isValid(quoteId)) {
      return NextResponse.json({ error: "Thiếu hoặc sai quoteId" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email })
      .select("saved_quotes")
      .lean() as { saved_quotes?: mongoose.Types.ObjectId[] } | null;
    if (!user) {
      return NextResponse.json({ error: "User khong ton tai" }, { status: 404 });
    }

    const oid = new mongoose.Types.ObjectId(quoteId);
    const alreadySaved = (user.saved_quotes ?? []).some((id) => id.toString() === quoteId);

    if (alreadySaved) {
      // Unsave — $pull nguyên tử; chỉ giảm save_count khi THỰC SỰ gỡ.
      const res = await User.updateOne(
        { email: session.user.email },
        { $pull: { saved_quotes: oid } }
      );
      if (res.modifiedCount > 0) {
        // Pipeline update để clamp save_count ≥ 0 (không trôi âm).
        await Quote.findByIdAndUpdate(quoteId, [
          { $set: { save_count: { $max: [0, { $subtract: [{ $ifNull: ["$save_count", 0] }, 1] }] } } },
        ]);
      }
      return NextResponse.json({ saved: false, message: "Da bo luu" });
    } else {
      // Save — $addToSet nguyên tử (KHÔNG nhân đôi); chỉ tăng khi THỰC SỰ thêm.
      const res = await User.updateOne(
        { email: session.user.email },
        { $addToSet: { saved_quotes: oid } }
      );
      if (res.modifiedCount > 0) {
        await Quote.findByIdAndUpdate(quoteId, { $inc: { save_count: 1 } });
      }
      return NextResponse.json({ saved: true, message: "Da luu" });
    }
  } catch (error) {
    console.error("[POST /api/user/saved-quotes]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
