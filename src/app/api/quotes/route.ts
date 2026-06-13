/**
 * GET  /api/quotes         → Lấy danh sách quotes (có filter)
 * POST /api/quotes         → Tạo quote mới (admin)
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Quote from "@/models/Quote";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const mood = searchParams.get("mood");
    const level = searchParams.get("level");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const skip = (page - 1) * limit;

    // Build query filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (mood) filter.mood = mood;
    if (level) filter.level = level;

    const [quotes, total] = await Promise.all([
      Quote.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Quote.countDocuments(filter),
    ]);

    return NextResponse.json({
      quotes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/quotes]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Admin-only
  const adminSecret = req.headers.get("x-admin-secret");
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const body = await req.json();
    const quote = await Quote.create(body);
    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error("[POST /api/quotes]", error);
    return NextResponse.json({ error: "Lỗi tạo quote" }, { status: 500 });
  }
}
