/**
 * POST /api/ai/word-hint
 * Tra ve goi y cho tu/cau duoc boi den - KHONG dich truc tiep
 * Body: { selectedText, context?, userGuess? }
 * - Neu co userGuess: cham diem guess
 * - Neu khong: tra ve hint de nguoi dung doan
 */

import { NextRequest, NextResponse } from "next/server";
import { getWordHint, checkGuess } from "@/lib/openai";

export async function POST(req: NextRequest) {
  let selectedText = "";
  let userGuess: string | undefined;

  try {
    const body = await req.json() as {
      selectedText: string;
      context?: string;
      userGuess?: string;
    };

    selectedText = body.selectedText;
    userGuess = body.userGuess;

    if (!selectedText?.trim()) {
      return NextResponse.json({ error: "Thieu selectedText" }, { status: 400 });
    }

    // Neu co guess: check xem dung khong
    if (userGuess !== undefined && userGuess.trim()) {
      const result = await checkGuess(selectedText, userGuess);
      return NextResponse.json({ success: true, mode: "check", ...result });
    }

    // Chua co guess: tra ve hint
    const hint = await getWordHint(selectedText, body.context);
    return NextResponse.json({ success: true, mode: "hint", ...hint });

  } catch (error) {
    console.error("[POST /api/ai/word-hint]", error);
    if (userGuess?.trim()) {
      return NextResponse.json({
        success: true,
        mode: "check",
        correct: false,
        score: 50,
        actual_meaning: "Chua cham duoc bang AI luc nay. Hay nhin lai ngu canh va thu doan bang mot cach dien dat khac.",
        feedback: "Chua xac nhan dung/sai bang AI, nhung cach hoc doan nghia tu ngu canh la dung huong.",
      });
    }

    return NextResponse.json({
      success: true,
      mode: "hint",
      hint: `Thu doan "${selectedText}" bang cach nhin vai tro cua no trong cau: no dang chi mot hanh dong, cam xuc, do vat hay y niem nao?`,
      category: "context",
      level: "hsk2",
      usage_note: "Day la goi y fallback theo ngu canh; khi Gemini key san sang, AI se goi y tu nhien va cham doan nghia chi tiet hon.",
    });
  }
}
