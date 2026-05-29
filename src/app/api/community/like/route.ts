/**
 * POST /api/community/like
 * Body: { postId }
 * Toggle like/unlike — trả về { liked, like_count }
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await (getServerSession as any)(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { postId } = await req.json() as { postId: string };
    if (!postId) return NextResponse.json({ error: "Thiếu postId" }, { status: 400 });

    await connectDB();
    const post = await Post.findById(postId);
    if (!post) return NextResponse.json({ error: "Không tìm thấy bài" }, { status: 404 });

    const email = session.user.email as string;
    const alreadyLiked = post.likes.includes(email);

    if (alreadyLiked) {
      post.likes = post.likes.filter((e: string) => e !== email);
      post.like_count = Math.max(0, post.like_count - 1);
    } else {
      post.likes.push(email);
      post.like_count += 1;
    }

    await post.save();
    return NextResponse.json({ liked: !alreadyLiked, like_count: post.like_count });
  } catch (e) {
    console.error("[POST /api/community/like]", e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
