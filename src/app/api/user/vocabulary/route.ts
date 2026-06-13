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
import { sm2, nextReviewDate, masteryFromReps } from "@/lib/srs";

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
  const card_type: "word" | "sentence" = body.card_type === "sentence" ? "sentence" : "word";

  // Bắt buộc hanzi + meaning. pinyin để optional: khi lưu nhanh từ tooltip/câu
  // chuyện người học có thể chưa có pinyin — vẫn cho lưu để không cản trở thói quen học.
  if (!hanzi || !meaning) {
    return NextResponse.json({ error: "Thiếu dữ liệu: cần hanzi và meaning" }, { status: 400 });
  }
  // Chặn nội dung quá dài để tránh lạm dụng
  if (String(hanzi).length > 200) {
    return NextResponse.json({ error: "Nội dung quá dài (tối đa 200 ký tự)" }, { status: 400 });
  }

  try {
    const card = await Vocabulary.findOneAndUpdate(
      { user_id: session.user.email, hanzi },
      {
        $setOnInsert: {
          user_id: session.user.email, hanzi, pinyin: pinyin ?? "", meaning,
          example_sentence, example_pinyin, example_translation,
          source_lesson, card_type, created_at: new Date(),
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

  try {
    await connectDB();
    const { cardId, quality: rawQuality } = await req.json(); // quality: 0-5

    if (!cardId || typeof cardId !== "string" || !/^[0-9a-fA-F]{24}$/.test(cardId)) {
      return NextResponse.json({ error: "cardId không hợp lệ" }, { status: 400 });
    }

    // Validate quality: phải là số nguyên 0-5, nếu không SRS sẽ bị hỏng (NaN → Invalid Date)
    const q = Number(rawQuality);
    if (!Number.isFinite(q) || q < 0 || q > 5) {
      return NextResponse.json({ error: "quality phải là số từ 0 đến 5" }, { status: 400 });
    }
    const quality = Math.round(q);

    const card = await Vocabulary.findOne({ _id: cardId, user_id: session.user.email });
    if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

    const { easeFactor, interval, repetitions } = sm2(
      card.ease_factor, card.interval, card.repetitions, quality
    );

    const nextReview = nextReviewDate(interval);

    card.ease_factor = easeFactor;
    card.interval = interval;
    card.repetitions = repetitions;
    card.next_review = nextReview;
    card.last_reviewed = new Date();
    card.mastery = masteryFromReps(repetitions);

    await card.save();
    return NextResponse.json({ card, nextReview });
  } catch (e) {
    console.error("[PATCH /api/user/vocabulary]", e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
