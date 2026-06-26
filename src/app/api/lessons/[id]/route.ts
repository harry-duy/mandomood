/**
 * GET /api/lessons/[id]  → Lấy 1 lesson theo MongoDB ObjectId hoặc slug
 * PATCH /api/lessons/[id] → Update fields (CHỈ admin, chỉ field nội dung cho phép)
 *
 * Fallback: nếu không tìm thấy → client dùng DEMO_LESSONS
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isAdminEmail } from "@/lib/adminAuth";
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

// Chỉ field NỘI DUNG được phép sửa — chống mass-assignment (view_count/save_count/
// is_ai_generated/_id… không thể bị ghi đè từ body client).
const EDITABLE_FIELDS = [
  "title", "content_type", "level", "mood", "chinese_text", "pinyin",
  "translation", "grammar_notes", "cultural_note", "tags", "audio_url", "image_url",
] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // BẮT BUỘC admin: trước đây route này KHÔNG auth + `$set: body` → bất kỳ ai cũng
    // sửa/ghi đè/ẩn mọi bài học công khai (mass-assignment + phá hoại nội dung).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await (getServerSession as any)(authOptions) as { user?: { email?: string } } | null;
    if (!isAdminEmail(session?.user?.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const update: Record<string, unknown> = {};
    for (const k of EDITABLE_FIELDS) {
      if (body[k] !== undefined) update[k] = body[k];
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Không có trường hợp lệ để cập nhật" }, { status: 400 });
    }

    await connectDB();

    const updated = await Lesson.findByIdAndUpdate(
      id,
      { $set: update },
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
