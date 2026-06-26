/**
 * GET /api/search?q=love&type=quotes|lessons|all
 * MongoDB full-text search qua quotes + lessons
 *
 * Requires MongoDB text indexes on:
 *   - Quote: chinese, pinyin, meaning, translation
 *   - Lesson: title, description
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import Lesson from "@/models/Lesson";
import { parsePagination } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const type = searchParams.get("type") ?? "all"; // "quotes" | "lessons" | "all"
  // Dùng parsePagination (đã test) để kẹp limit: chặn limit=0 (Mongo trả TẤT CẢ),
  // NaN ("abc"→.limit(NaN)), âm, và quá lớn. Trước đây Math.min(parseInt,30) lọt hết.
  const { limit } = parsePagination(null, searchParams.get("limit"), { defaultLimit: 10, maxLimit: 30 });

  // Query rỗng → trả về empty
  if (!q || q.length < 1) {
    return NextResponse.json({ quotes: [], lessons: [], total: 0 });
  }

  try {
    await connectDB();

    // Build regex cho fallback search (khi chưa có text index)
    // Escape ký tự đặc biệt → chống ReDoS / regex injection từ input người dùng
    const safeQ = q.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safeQ, "i");

    const results: {
      quotes: unknown[];
      lessons: unknown[];
      total: number;
    } = { quotes: [], lessons: [], total: 0 };

    // ─── Search Quotes ────────────────────────────────────────────────────────
    // Dùng regex theo ĐÚNG field schema Quote (chinese_text/pinyin/translation/tags).
    // Trước đây thử $text trước nhưng model KHÔNG có text index → luôn ném lỗi rồi
    // rơi xuống fallback; mà fallback lại tìm field "chinese"/"meaning" KHÔNG TỒN TẠI
    // trên Quote → tìm tiếng Trung KHÔNG ra kết quả (lỗi tính năng cốt lõi). regex
    // cũng hợp tiếng Trung hơn $text (text index mặc định không tách từ Hán tốt).
    if (type === "all" || type === "quotes") {
      results.quotes = await Quote.find({
        $or: [
          { chinese_text: regex },
          { pinyin: regex },
          { translation: regex },
          { tags: { $in: [regex] } },
        ],
      })
        .limit(limit)
        .lean();
    }

    // ─── Search Lessons ───────────────────────────────────────────────────────
    // ĐÚNG field schema Lesson (title/chinese_text/translation/pinyin/tags). Trước
    // đây fallback chỉ tìm title + "description" (KHÔNG có trên Lesson) → bỏ sót nội
    // dung Hán/dịch/pinyin của bài học.
    if (type === "all" || type === "lessons") {
      results.lessons = await Lesson.find({
        $or: [
          { title: regex },
          { chinese_text: regex },
          { translation: regex },
          { pinyin: regex },
          { tags: { $in: [regex] } },
        ],
      })
        .limit(limit)
        .lean();
    }

    results.total = results.quotes.length + results.lessons.length;

    return NextResponse.json(results);
  } catch (error) {
    console.error("[GET /api/search]", error);
    return NextResponse.json({ error: "Lỗi tìm kiếm" }, { status: 500 });
  }
}
