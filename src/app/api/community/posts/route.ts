/**
 * GET  /api/community/posts?sort=new|hot&mood=...&page=1
 * POST /api/community/posts  — đăng bài mới
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";
import { checkRateLimit } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const sort  = req.nextUrl.searchParams.get("sort") ?? "new";
    const mood  = req.nextUrl.searchParams.get("mood") ?? "";
    const page  = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1") || 1);
    const limit = 20;

    const filter: Record<string, unknown> = {};
    if (mood && mood !== "all") filter.mood = mood;

    const sortOpt: Record<string, 1 | -1> = sort === "hot"
      ? { like_count: -1, created_at: -1 }
      : { created_at: -1 };

    const posts = await Post.find(filter)
      .sort(sortOpt)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ posts, page });
  } catch (e) {
    console.error("[GET /api/community/posts]", e);
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

    if (!checkRateLimit(`post:${session.user.email}`, 10)) {
      return NextResponse.json(
        { error: "Bạn đăng bài quá nhanh. Vui lòng thử lại sau 1 phút." },
        { status: 429 }
      );
    }

    const body = await req.json() as {
      chinese_text: string;
      pinyin?: string;
      translation: string;
      mood?: string;
      level?: string;
      type?: "quote" | "story" | "question";
    };

    if (!body.chinese_text?.trim() || !body.translation?.trim()) {
      return NextResponse.json({ error: "Thiếu nội dung" }, { status: 400 });
    }

    // Giới hạn độ dài
    if (body.chinese_text.length > 500 || body.translation.length > 1000) {
      return NextResponse.json({ error: "Nội dung quá dài" }, { status: 400 });
    }

    await connectDB();
    const post = await Post.create({
      author_email: session.user.email,
      author_name:  session.user.name ?? "Ẩn danh",
      author_image: session.user.image ?? null,
      type:         body.type ?? "quote",
      chinese_text: body.chinese_text.trim(),
      pinyin:       body.pinyin?.trim() ?? "",
      translation:  body.translation.trim(),
      mood:         body.mood ?? "aesthetic",
      level:        body.level ?? "beginner",
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/community/posts]", e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
