/**
 * POST /api/ai/analyze-upload
 * Phan tich file hoac anh chua tieng Trung, tra ve curriculum + exercises
 * Supports: image/png, image/jpeg, image/webp, image/gif, text/plain
 * Max size: 10MB
 */

import { NextRequest, NextResponse } from "next/server";
import { analyzeImageContent, analyzeTextContent } from "@/lib/openai";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/ratelimit";
import { getPremiumStatus, consumeDailyQuota } from "@/lib/premiumServer";
import { FREE_DAILY_UPLOAD } from "@/lib/premium";

function buildFallbackLesson(text: string) {
  const source = text.trim() || "No readable text";
  const chineseMatches = Array.from(new Set(source.match(/\p{Script=Han}{1,4}/gu) ?? [])).slice(0, 8);
  const words = chineseMatches.length > 0 ? chineseMatches : ["学习", "中文", "句子"];

  return {
    detected_text: source.slice(0, 1200),
    level: "hsk2",
    summary: "AI dang tam thoi khong kha dung, nen MandoMood tao mot giao trinh fallback tu noi dung ban cung cap.",
    vocabulary: words.slice(0, 6).map((hanzi, index) => ({
      hanzi,
      pinyin: "Can AI bo sung",
      meaning: "Hay doan nghia tu ngu canh, sau do doi chieu lai khi AI hoat dong.",
      part_of_speech: index % 2 === 0 ? "danh tu" : "dong tu",
      example: source.includes(hanzi) ? source.slice(0, 80) : `${hanzi}。`,
      example_translation: "Ban hay thu dich cau nay sang tieng Viet.",
    })),
    exercises: [
      {
        id: "ex1",
        type: "translate_to_viet",
        question: `Dich sang tieng Viet: ${source.slice(0, 80)}`,
        answer: "Ban dich dua tren ngu canh chinh cua cau.",
        hint: "Chu y chu ngu, dong tu chinh va cam xuc cua cau.",
        context: source.slice(0, 200),
      },
      {
        id: "ex2",
        type: "fill_blank",
        question: `Dien tu phu hop vao cho trong: ${source.slice(0, 60).replace(words[0], "___")}`,
        answer: words[0],
        hint: "Tim tu da bi an trong cau goc.",
        context: source.slice(0, 200),
      },
      {
        id: "ex3",
        type: "pinyin",
        question: `Viet pinyin cho: ${words[0]}`,
        answer: "Can AI/chinh sua thu cong de doi chieu chinh xac.",
        hint: "Tap trung vao thanh dieu.",
        context: source.slice(0, 200),
      },
    ],
    cultural_notes: "Fallback mode: them GEMINI_API_KEY de AI tao giao trinh va loi sai chi tiet hon.",
  };
}

// Next.js 15 App Router: dung Request.formData()
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip, 5)) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút." },
      { status: 429, headers: getRateLimitHeaders(ip, 5) }
    );
  }

  // Premium/trial: không giới hạn. Free đã đăng nhập: FREE_DAILY_UPLOAD lượt quét/ngày
  // (Vision là endpoint AI tốn kém nhất → bảo vệ chi phí, vẫn rộng rãi). Khách: chỉ giới hạn IP ở trên.
  const { email, source } = await getPremiumStatus();
  if (email && source === null) {
    const quota = await consumeDailyQuota(email, "upload", FREE_DAILY_UPLOAD);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: `Bạn đã dùng hết ${FREE_DAILY_UPLOAD} lượt quét ảnh/tài liệu miễn phí hôm nay. Nâng cấp Premium để quét không giới hạn 👑` },
        { status: 429 }
      );
    }
  }

  let fallbackText = "";

  try {
    const contentType = req.headers.get("content-type") ?? "";

    // ── Multipart form-data (file upload) ──────────────────────────────────
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "Không tìm thấy file" }, { status: 400 });
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json({ error: "File qua lon (max 10MB)" }, { status: 400 });
      }

      const mime = file.type;
      const imageTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/jpg"];

      if (imageTypes.includes(mime)) {
        // Image: convert to base64, send to GPT-4o Vision
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        const result = await analyzeImageContent(base64, mime);
        return NextResponse.json({ success: true, ...result });

      } else if (mime === "text/plain" || file.name.endsWith(".txt")) {
        // Text file: read as string
        const text = await file.text();
        fallbackText = text;
        if (!text.trim()) {
          return NextResponse.json({ error: "File rong" }, { status: 400 });
        }
        const result = await analyzeTextContent(text);
        return NextResponse.json({ success: true, ...result });

      } else {
        return NextResponse.json(
          { error: "Chi ho tro: JPG, PNG, WEBP, GIF, TXT. PDF se co sau!" },
          { status: 400 }
        );
      }
    }

    // ── JSON body (paste text directly) ───────────────────────────────────
    if (contentType.includes("application/json")) {
      const body = await req.json() as { text?: string };
      fallbackText = body.text ?? "";
      if (!body.text?.trim()) {
        return NextResponse.json({ error: "Thiếu trường text" }, { status: 400 });
      }
      const result = await analyzeTextContent(body.text);
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: "Content-Type khong ho tro" }, { status: 400 });

  } catch (error) {
    console.error("[POST /api/ai/analyze-upload]", error);
    if (fallbackText.trim()) {
      return NextResponse.json({ success: true, fallback: true, ...buildFallbackLesson(fallbackText) });
    }

    return NextResponse.json({
      error: "AI hien chua phan tich duoc anh/file nay. Kiem tra GEMINI_API_KEY hoac dan van ban de dung fallback.",
    }, { status: 503 });
  }
}
