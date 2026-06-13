/**
 * GET  /api/user/saved-quotes  — Lay danh sach quotes da save
 * POST /api/user/saved-quotes  — Toggle save/unsave mot quote
 *   Body: { quoteId: string }
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
    if (!quoteId) {
      return NextResponse.json({ error: "Thiếu quoteId" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User khong ton tai" }, { status: 404 });
    }

    const oid = new mongoose.Types.ObjectId(quoteId);
    const alreadySaved = user.saved_quotes.some(
      (id: mongoose.Types.ObjectId) => id.toString() === quoteId
    );

    if (alreadySaved) {
      // Unsave
      user.saved_quotes = user.saved_quotes.filter(
        (id: mongoose.Types.ObjectId) => id.toString() !== quoteId
      );
      await user.save();
      // Giam save_count tren Quote
      await Quote.findByIdAndUpdate(quoteId, { $inc: { save_count: -1 } });
      return NextResponse.json({ saved: false, message: "Da bo luu" });
    } else {
      // Save
      user.saved_quotes.push(oid);
      await user.save();
      // Tang save_count tren Quote
      await Quote.findByIdAndUpdate(quoteId, { $inc: { save_count: 1 } });
      return NextResponse.json({ saved: true, message: "Da luu" });
    }
  } catch (error) {
    console.error("[POST /api/user/saved-quotes]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
