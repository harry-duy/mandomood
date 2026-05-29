/**
 * GET /api/lessons/[id]  → Lấy 1 lesson theo MongoDB ObjectId hoặc slug
 * PATCH /api/lessons/[id] → Update fields
 *
 * Fallback: nếu không tìm thấy → client dùng DEMO_LESSONS
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Lesson from "@/models/Lesson";
import mongoose from "mongoose";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();

    let lesson = null;

    // Thử tìm theo ObjectId trước
    if (mongoose.Types.ObjectId.isValid(id)) {
      lesson = await Lesson.findByIdAndUpdate(
        id,
        { $inc: { view_count: 1 } },
        { new: true }
      ).lean();
    }

    // Fallback: tìm theo slug field nếu có
    if (!lesson) {
      lesson = await Lesson.findOneAndUpdate(
        { slug: id },
        { $inc: { view_count: 1 } },
        { new: true }
      ).lean();
    }

    if (!lesson) {
      // 404 → client sẽ dùng DEMO_LESSONS
      return NextResponse.json({ error: "Không tìm thấy bài học" }, { status: 404 });
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("[GET /api/lessons/[id]]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    await connectDB();

    const updated = await Lesson.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/lessons/[id]]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
