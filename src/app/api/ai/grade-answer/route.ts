/**
 * POST /api/ai/grade-answer
 * Cham diem cau tra loi cua nguoi dung, chi ra loi nho nhat
 * Body: { questionType, question, correctAnswer, userAnswer, context? }
 */

import { NextRequest, NextResponse } from "next/server";
import { gradeAnswer } from "@/lib/openai";

export async function POST(req: NextRequest) {
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
      return NextResponse.json({ error: "Thieu truong bat buoc" }, { status: 400 });
    }

    if (userAnswer.trim().length === 0) {
      return NextResponse.json({ error: "Cau tra loi rong" }, { status: 400 });
    }

    const result = await gradeAnswer(questionType, question, correctAnswer, userAnswer, context);
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
          explanation: "AI cham chi tiet dang tam thoi khong kha dung. Hay so sanh cau tra loi voi dap an mau va thu lai sau.",
        }],
      feedback: "Da cham bang fallback vi AI provider dang tam thoi loi.",
      suggestion: "Kiem tra GEMINI_API_KEY/GEMINI_MODEL de nhan phan tich loi sai nho nhat nhu thanh dieu, chu Han, ngu phap.",
    });
  }
}
