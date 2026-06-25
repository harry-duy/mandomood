/**
 * POST /api/ai/story
 * Generate cau chuyen bang AI.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateStory, type StoryLevel, type StoryMood } from "@/lib/openai";
import { connectDB } from "@/lib/mongodb";
import Lesson from "@/models/Lesson";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/ratelimit";
import { getPremiumStatus, consumeDailyQuota, refundDailyQuota } from "@/lib/premiumServer";
import { FREE_DAILY_STORY } from "@/lib/premium";
import { sanitizePromptInput } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip, 10)) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút." },
      { status: 429, headers: getRateLimitHeaders(ip) }
    );
  }
  // Premium/trial: không giới hạn. Free: FREE_DAILY_STORY truyện/ngày.
  const { email, source } = await getPremiumStatus();
  let consumedQuota = false;
  if (source === null) {
    if (email) {
      const quota = await consumeDailyQuota(email, "story", FREE_DAILY_STORY);
      if (!quota.allowed) {
        return NextResponse.json({
          error: `Bạn đã dùng hết ${FREE_DAILY_STORY} lượt tạo truyện miễn phí hôm nay. Nâng cấp Premium để tạo không giới hạn 👑`,
          code: "UPGRADE_REQUIRED",
        }, { status: 402 });
      }
      consumedQuota = true;
    } else if (!checkRateLimit(`story-day:${ip}`, FREE_DAILY_STORY, 24 * 3600 * 1000)) {
      return NextResponse.json({
        error: `Khách chưa đăng nhập được ${FREE_DAILY_STORY} truyện/ngày. Đăng nhập để nhận 30 ngày Premium miễn phí 🎁`,
        code: "LOGIN_REQUIRED",
      }, { status: 402 });
    }
  }
  try {
    const body = await req.json();
    const {
      level = "hsk2",
      mood = "healing",
      theme: rawTheme,
      save = false,
    } = body as {
      level: StoryLevel;
      mood: StoryMood;
      theme?: string;
      save?: boolean;
    };

    const validLevels = ["beginner", "hsk1", "hsk2", "hsk3", "hsk4", "hsk5"];
    const validMoods = ["romantic", "healing", "motivation", "sad", "friendship", "aesthetic", "funny"];

    if (!validLevels.includes(level) || !validMoods.includes(mood)) {
      return NextResponse.json({ error: "Level hoặc mood không hợp lệ" }, { status: 400 });
    }

    // Làm sạch theme (input người dùng) trước khi nhúng vào prompt AI:
    // cắt độ dài (chống tốn token) + gom xuống dòng (giảm prompt injection).
    const theme = sanitizePromptInput(rawTheme, 120) || undefined;

    const story = await generateStory(level, mood, theme);

    if (save) {
      await connectDB();
      await Lesson.create({
        title: story.title,
        content_type: "story",
        level,
        mood,
        chinese_text: story.chinese_text,
        pinyin: story.pinyin,
        translation: story.translation,
        vocabulary: story.vocabulary,
        grammar_notes: story.grammar_notes,
        cultural_note: story.cultural_note,
        is_published: true,
      });
    }

    return NextResponse.json({ story });
  } catch (error) {
    if (consumedQuota && email) await refundDailyQuota(email, "story");
    console.error("[POST /api/ai/story]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lỗi generate story" },
      { status: 500 }
    );
  }
}
