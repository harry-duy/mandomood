/**
 * POST /api/ai/chat
 * Chat với AI Tutor persona
 */

import { NextRequest, NextResponse } from "next/server";
import { chatWithTutor, type TutorPersona, type StoryLevel } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      persona = "caring_friend",
      userLevel = "beginner",
    } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      persona: TutorPersona;
      userLevel: StoryLevel;
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages không được rỗng" }, { status: 400 });
    }

    const reply = await chatWithTutor(messages, persona, userLevel);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[POST /api/ai/chat]", error);
    return NextResponse.json({ error: "Lỗi chat AI" }, { status: 500 });
  }
}
