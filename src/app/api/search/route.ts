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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const type = searchParams.get("type") ?? "all"; // "quotes" | "lessons" | "all"
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 30);

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
    if (type === "all" || type === "quotes") {
      try {
        // Thử $text search trước (cần text index)
        results.quotes = await Quote.find(
          { $text: { $search: q } },
          { score: { $meta: "textScore" } }
        )
          .sort({ score: { $meta: "textScore" } })
          .limit(limit)
          .lean();
      } catch {
        // Fallback: regex search nếu chưa có text index
        results.quotes = await Quote.find({
          $or: [
            { chinese: regex },
            { pinyin: regex },
            { meaning: regex },
            { translation: regex },
            { tags: { $in: [regex] } },
          ],
        })
          .limit(limit)
          .lean();
      }
    }

    // ─── Search Lessons ───────────────────────────────────────────────────────
    if (type === "all" || type === "lessons") {
      try {
        results.lessons = await Lesson.find(
          { $text: { $search: q } },
          { score: { $meta: "textScore" } }
        )
          .sort({ score: { $meta: "textScore" } })
          .limit(limit)
          .lean();
      } catch {
        results.lessons = await Lesson.find({
          $or: [
            { title: regex },
            { description: regex },
          ],
        })
          .limit(limit)
          .lean();
      }
    }

    results.total = results.quotes.length + results.lessons.length;

    return NextResponse.json(results);
  } catch (error) {
    console.error("[GET /api/search]", error);
    return NextResponse.json({ error: "Lỗi tìm kiếm" }, { status: 500 });
  }
}
