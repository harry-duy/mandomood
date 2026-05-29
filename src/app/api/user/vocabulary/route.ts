/**
 * /api/user/vocabulary
 * GET  — lấy danh sách vocab của user (filter: due | all)
 * POST — thêm 1 card mới (hoặc update nếu đã có)
 * PATCH — cập nhật SRS sau khi review (SM-2 algorithm)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import Vocabulary from "@/models/Vocabulary";

// SM-2 Spaced Repetition
function sm2(
  easeFactor: number,
  interval: number,
  repetitions: number,
  quality: number // 0-5 (0-2 = fail, 3-5 = pass)
): { easeFactor: number; interval: number; repetitions: number } {
  if (quality < 3) {
    // Failed — reset
    return { easeFactor: Math.max(1.3, easeFactor - 0.2), interval: 1, repetitions: 0 };
  }
  // Passed
  let newInterval: number;
  if (repetitions === 0) newInterval = 1;
  else if (repetitions === 1) newInterval = 6;
  else newInterval = Math.round(interval * easeFactor);

  const newEF = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  return { easeFactor: newEF, interval: newInterval, repetitions: repetitions + 1 };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") ?? "due"; // "due" | "all"

  const query: Record<string, unknown> = { user_id: session.user.email };
  if (filter === "due") {
    query.next_review = { $lte: new Date() };
  }

  const cards = await Vocabulary.find(query).sort({ next_review: 1 }).limit(50);
  return NextResponse.json({ cards, total: cards.length });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const { hanzi, pinyin, meaning, example_sentence, example_pinyin, example_translation, source_lesson } = body;

  if (!hanzi || !pinyin || !meaning) {
    return NextResponse.json({ error: "hanzi, pinyin, meaning required" }, { status: 400 });
  }

  try {
    const card = await Vocabulary.findOneAndUpdate(
      { user_id: session.user.email, hanzi },
      {
        $setOnInsert: {
          user_id: session.user.email, hanzi, pinyin, meaning,
          example_sentence, example_pinyin, example_translation,
          source_lesson, created_at: new Date(),
        },
      },
      { upsert: true, new: true }
    );
    return NextResponse.json({ card, added: true });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json({ message: "Already in deck" }, { status: 200 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { cardId, quality } = await req.json(); // quality: 0-5

  const card = await Vocabulary.findOne({ _id: cardId, user_id: session.user.email });
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  const { easeFactor, interval, repetitions } = sm2(
    card.ease_factor, card.interval, card.repetitions, quality
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  card.ease_factor = easeFactor;
  card.interval = interval;
  card.repetitions = repetitions;
  card.next_review = nextReview;
  card.last_reviewed = new Date();
  card.mastery = Math.min(5, Math.floor(repetitions / 2));

  await card.save();
  return NextResponse.json({ card, nextReview });
}
