/**
 * GET  /api/lessons   → Feed lessons (có filter, pagination)
 * POST /api/lessons   → Tạo lesson mới
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Lesson from "@/models/Lesson";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const mood = searchParams.get("mood");
    const level = searchParams.get("level");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (mood) filter.mood = mood;
    if (level) filter.level = level;
    if (type) filter.content_type = type;

    const [lessons, total] = await Promise.all([
      Lesson.find(filter)
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Lesson.countDocuments(filter),
    ]);

    return NextResponse.json({
      lessons,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/lessons]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const lesson = await Lesson.create(body);
    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("[POST /api/lessons]", error);
    return NextResponse.json({ error: "Lỗi tạo lesson" }, { status: 500 });
  }
}
