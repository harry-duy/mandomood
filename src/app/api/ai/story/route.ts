/**
 * POST /api/ai/story
 * Generate cau chuyen bang AI.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateStory, type StoryLevel, type StoryMood } from "@/lib/openai";
import { connectDB } from "@/lib/mongodb";
import Lesson from "@/models/Lesson";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      level = "hsk2",
      mood = "healing",
      theme,
      save = false, // Có lưu vào DB không
    } = body as {
      level: StoryLevel;
      mood: StoryMood;
      theme?: string;
      save?: boolean;
    };

    // Validate input
    const validLevels = ["beginner", "hsk1", "hsk2", "hsk3", "hsk4", "hsk5"];
    const validMoods = ["romantic", "healing", "motivation", "sad", "friendship", "aesthetic", "funny"];

    if (!validLevels.includes(level) || !validMoods.includes(mood)) {
      return NextResponse.json(
        { error: "Level hoặc mood không hợp lệ" },
        { status: 400 }
      );
    }

    // Generate story tu AI provider
    const story = await generateStory(level, mood, theme);

    // Lưu vào DB nếu được yêu cầu
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
        is_ai_generated: true,
        tags: [level, mood, "ai-generated"],
      });
    }

    return NextResponse.json({ success: true, story });
  } catch (error) {
    console.error("[POST /api/ai/story]", error);
    return NextResponse.json(
      { error: "Loi generate story. Kiem tra GEMINI_API_KEY" },
      { status: 500 }
    );
  }
}
