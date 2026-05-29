/**
 * GET /api/quotes/daily
 * Lấy quote của ngày hôm nay
 *
 * Logic: Kiểm tra DB có quote daily cho ngày hôm nay chưa.
 * Nếu chưa → random 1 quote từ DB và đánh dấu là daily.
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Quote from "@/models/Quote";

export async function GET() {
  try {
    await connectDB();

    // Lấy ngày hôm nay (không tính giờ)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Tìm quote đã được set làm daily hôm nay
    let dailyQuote = await Quote.findOne({
      is_daily: true,
      daily_date: { $gte: today, $lt: tomorrow },
    }).lean();

    // Nếu chưa có → random 1 quote và set làm daily
    if (!dailyQuote) {
      const count = await Quote.countDocuments();

      if (count === 0) {
        // Fallback quote khi DB chưa có data
        return NextResponse.json({
          _id: "fallback",
          chinese_text: "每天一个故事，一段情感",
          pinyin: "Měi tiān yīgè gùshì, yī duàn qínggǎn",
          translation: "Mỗi ngày một câu chuyện, một cảm xúc",
          mood: "healing",
          level: "hsk2",
          cultural_note: "MandoMood đang chuẩn bị nội dung cho bạn...",
          view_count: 0,
          save_count: 0,
          is_daily: true,
          daily_date: today,
        });
      }

      // Random skip để lấy document ngẫu nhiên
      const random = Math.floor(Math.random() * count);
      const randomQuote = await Quote.findOne().skip(random);

      if (randomQuote) {
        randomQuote.is_daily = true;
        randomQuote.daily_date = today;
        await randomQuote.save();
        dailyQuote = randomQuote.toObject();
      }
    }

    // Tăng view count
    const quoteDoc = dailyQuote as Record<string, unknown> | null;
    await Quote.findByIdAndUpdate(quoteDoc?._id, { $inc: { view_count: 1 } });

    return NextResponse.json(dailyQuote);
  } catch (error) {
    console.error("[GET /api/quotes/daily]", error);
    return NextResponse.json(
      { error: "Lỗi server, thử lại sau" },
      { status: 500 }
    );
  }
}
