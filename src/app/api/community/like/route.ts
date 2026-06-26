/**
 * POST /api/community/like
 * Body: { postId }
 * Toggle like/unlike — trả về { liked, like_count }
 *
 * Dùng toán tử nguyên tử $addToSet/$pull để chống double-like khi bấm nhanh
 * hoặc thao tác từ 2 thiết bị (trước đây read-modify-write không nguyên tử →
 * có thể nhân đôi email trong mảng likes + lệch like_count). like_count lấy
 * theo ĐỘ DÀI mảng likes làm nguồn chân lý nên không bao giờ trôi số.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await (getServerSession as any)(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    // Chặn spam toggle like/unlike (đồng bộ với comments/posts vốn đã có rate-limit).
    if (!checkRateLimit(`like:${session.user.email}`, 40)) {
      return NextResponse.json(
        { error: "Bạn thao tác quá nhanh. Thử lại sau 1 phút." },
        { status: 429 }
      );
    }

    const { postId } = await req.json() as { postId: string };
    if (!postId) return NextResponse.json({ error: "Thiếu postId" }, { status: 400 });

    await connectDB();
    const email = session.user.email as string;

    const current = await Post.findById(postId).select("likes").lean() as { likes?: string[] } | null;
    if (!current) return NextResponse.json({ error: "Không tìm thấy bài" }, { status: 404 });

    const alreadyLiked = (current.likes ?? []).includes(email);

    // $pull bỏ MỌI bản trùng; $addToSet không thêm trùng → mảng likes luôn sạch.
    const updated = await Post.findByIdAndUpdate(
      postId,
      alreadyLiked ? { $pull: { likes: email } } : { $addToSet: { likes: email } },
      { new: true }
    ).select("likes").lean() as { likes?: string[] } | null;

    const count = (updated?.likes ?? []).length;
    // Đồng bộ like_count = độ dài mảng (nguồn chân lý, tự chữa nếu từng lệch).
    await Post.updateOne({ _id: postId }, { $set: { like_count: count } });

    return NextResponse.json({ liked: !alreadyLiked, like_count: count });
  } catch (e) {
    console.error("[POST /api/community/like]", e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
