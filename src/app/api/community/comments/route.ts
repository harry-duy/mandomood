/**
 * GET  /api/community/comments?post_id=xxx  → lấy comments của post
 * POST /api/community/comments               → đăng comment (cần đăng nhập)
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import { checkRateLimit } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("post_id");
  if (!postId) return NextResponse.json({ error: "Thiếu post_id" }, { status: 400 });

  try {
    await connectDB();
    const comments = await Comment.find({ post_id: postId })
      .sort({ created_at: 1 })
      .limit(50)
      .lean();
    return NextResponse.json({ comments });
  } catch (e) {
    console.error("[GET /api/community/comments]", e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (getServerSession as any)(authOptions) as {
    user?: { email?: string; name?: string; image?: string }
  } | null;

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });
  }

  if (!checkRateLimit(`comment:${session.user.email}`, 20)) {
    return NextResponse.json(
      { error: "Bạn bình luận quá nhanh. Vui lòng thử lại sau 1 phút." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json() as { post_id?: string; content?: string };
    if (!body.post_id || !body.content?.trim()) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    await connectDB();
    const comment = await Comment.create({
      post_id:      body.post_id,
      author_email: session.user.email,
      author_name:  session.user.name ?? "Ẩn danh",
      author_image: session.user.image,
      content:      body.content.trim().slice(0, 500),
    });

    // Tăng comment_count nguyên tử để badge hiển thị đúng số (trước đây field này chết).
    await Post.updateOne({ _id: body.post_id }, { $inc: { comment_count: 1 } });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/community/comments]", e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
