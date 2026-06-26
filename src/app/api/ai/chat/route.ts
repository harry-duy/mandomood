/**
 * POST /api/ai/chat
 * Chat với AI Tutor persona
 */

import { NextRequest, NextResponse } from "next/server";
import { chatWithTutor, type TutorPersona, type StoryLevel } from "@/lib/openai";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/ratelimit";
import { getPremiumStatus, consumeDailyQuota, refundDailyQuota } from "@/lib/premiumServer";
import { FREE_DAILY_CHAT } from "@/lib/premium";
import { sanitizeChatMessages, safeTutorPersona } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip, 20)) {
    return NextResponse.json(
      { error: "Quá nhiều tin nhắn. Vui lòng thử lại sau 1 phút." },
      { status: 429, headers: getRateLimitHeaders(ip, 20) }
    );
  }
  // Premium/trial: không giới hạn. Free: FREE_DAILY_CHAT tin/ngày.
  const { email, source } = await getPremiumStatus();
  let consumedQuota = false;
  if (source === null) {
    if (email) {
      const quota = await consumeDailyQuota(email, "chat", FREE_DAILY_CHAT);
      if (!quota.allowed) {
        return NextResponse.json({
          error: `Bạn đã dùng hết ${FREE_DAILY_CHAT} tin nhắn AI Tutor miễn phí hôm nay. Nâng cấp Premium để chat không giới hạn 👑`,
          code: "UPGRADE_REQUIRED",
        }, { status: 402 });
      }
      consumedQuota = true;
    } else if (!checkRateLimit(`chat-day:${ip}`, FREE_DAILY_CHAT, 24 * 3600 * 1000)) {
      return NextResponse.json({
        error: `Khách chưa đăng nhập được ${FREE_DAILY_CHAT} tin/ngày. Đăng nhập để nhận 30 ngày Premium miễn phí 🎁`,
        code: "LOGIN_REQUIRED",
      }, { status: 402 });
    }
  }
  try {
    const body = await req.json();
    const { userLevel = "beginner", scenario } = body as {
      userLevel: StoryLevel;
      scenario?: string;
    };

    // Làm sạch input không tin cậy: kẹp số lượng/độ dài tin (chặn chi phí token vô
    // hạn) + loại role lạ (chặn tiêm {role:"system"}); persona lạ → mặc định.
    const messages = sanitizeChatMessages((body as { messages?: unknown }).messages);
    if (messages.length === 0) {
      // Đã trừ quota trước try → hoàn lại nếu input không hợp lệ (không phạt oan free user).
      if (consumedQuota && email) await refundDailyQuota(email, "chat");
      return NextResponse.json({ error: "Messages không hợp lệ" }, { status: 400 });
    }
    const persona = safeTutorPersona((body as { persona?: unknown }).persona) as TutorPersona;

    const reply = await chatWithTutor(
      messages,
      persona,
      userLevel,
      typeof scenario === "string" ? scenario.slice(0, 200) : undefined
    );

    return NextResponse.json({ reply });
  } catch (error) {
    if (consumedQuota && email) await refundDailyQuota(email, "chat");
    console.error("[POST /api/ai/chat]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lỗi AI" },
      { status: 500 }
    );
  }
}
