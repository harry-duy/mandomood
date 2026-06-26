/**
 * POST /api/ai/grade-answer
 * Cham diem cau tra loi cua nguoi dung, chi ra loi nho nhat
 * Body: { questionType, question, correctAnswer, userAnswer, context? }
 */

import { NextRequest, NextResponse } from "next/server";
import { gradeAnswer } from "@/lib/openai";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/ratelimit";
import { sanitizePromptInput } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip, 15)) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút." },
      { status: 429, headers: getRateLimitHeaders(ip, 15) }
    );
  }
  let correctAnswer = "";
  let userAnswer = "";

  try {
    const body = await req.json() as {
      questionType: string;
      question: string;
      correctAnswer: string;
      userAnswer: string;
      context?: string;
    };

    const { questionType, question, context } = body;
    correctAnswer = body.correctAnswer;
    userAnswer = body.userAnswer;

    if (!question || !correctAnswer || !userAnswer) {
      return NextResponse.json({ error: "Thiếu trường bắt buộc" }, { status: 400 });
    }

    if (userAnswer.trim().length === 0) {
      return NextResponse.json({ error: "Câu trả lời rỗng" }, { status: 400 });
    }

    // Kẹp độ dài input người dùng trước khi nhúng vào prompt AI (chặn token vô hạn
    // + giảm injection bằng cách gom xuống dòng). Khớp cách story/chat đã làm.
    const result = await gradeAnswer(
      sanitizePromptInput(questionType, 40),
      sanitizePromptInput(question, 600),
      sanitizePromptInput(correctAnswer, 600),
      sanitizePromptInput(userAnswer, 1000),
      context ? sanitizePromptInput(context, 600) : undefined
    );
    return NextResponse.json({ success: true, ...result });

  } catch (error) {
    console.error("[POST /api/ai/grade-answer]", error);
    const normalizedUser = userAnswer.trim().toLowerCase();
    const normalizedCorrect = correctAnswer.trim().toLowerCase();
    const exact = normalizedUser === normalizedCorrect;

    return NextResponse.json({
      success: true,
      score: exact ? 100 : 60,
      correct: exact,
      errors: exact
        ? []
        : [{
          type: "meaning",
          user_input: userAnswer,
          correct: correctAnswer,
          explanation: "AI chấm chi tiết đang tạm thời không khả dụng. Hãy so sánh câu trả lời với đáp án mẫu và thử lại sau.",
        }],
      feedback: "Da cham bang fallback vi AI provider dang tam thoi loi.",
      suggestion: "Kiem tra GEMINI_API_KEY/GEMINI_MODEL de nhan phan tich loi sai nho nhat nhu thanh dieu, chu Han, ngu phap.",
    });
  }
}
