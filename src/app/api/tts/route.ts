/**
 * GET /api/tts?text=你好&lang=zh
 * Trả về audio MP3 từ ElevenLabs.
 * Nếu ELEVENLABS_API_KEY chưa set → 503 để client fallback về Web Speech API.
 *
 * Cache: in-memory Map (max 200 entries, LRU-lite)
 * Voice: multilingual v2 — phát âm tiếng Trung chuẩn
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
// Bella — multilingual v2, giọng nữ tự nhiên, hỗ trợ Chinese
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "EXAVITQu4vr4xnSDxMaL";
const ELEVENLABS_MODEL = "eleven_multilingual_v2";

// Simple in-memory cache (text → ArrayBuffer)
const cache = new Map<string, ArrayBuffer>();
const MAX_CACHE = 200;

function evictIfFull() {
  if (cache.size >= MAX_CACHE) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
}

export async function GET(req: NextRequest) {
  // TTS tốn phí (ElevenLabs) → giới hạn 30 req/phút mỗi IP chống lạm dụng
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`tts:${ip}`, 30)) {
    return NextResponse.json({ error: "Quá nhiều yêu cầu phát âm. Thử lại sau 1 phút." }, { status: 429 });
  }

  const text = req.nextUrl.searchParams.get("text")?.trim() ?? "";
  const voiceOverride = req.nextUrl.searchParams.get("voice")?.trim();
  const VOICE_ID_FINAL = voiceOverride ?? VOICE_ID;

  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: "ElevenLabs not configured" },
      { status: 503 }
    );
  }

  // Truncate dài quá (ElevenLabs limit ~500 chars free tier)
  const safeText = text.slice(0, 500);
  const cacheKey = `${VOICE_ID_FINAL}:${safeText}`;

  // Cache hit
  if (cache.has(cacheKey)) {
    const buf = cache.get(cacheKey)!;
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID_FINAL}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: safeText,
          model_id: ELEVENLABS_MODEL,
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("[TTS ElevenLabs error]", res.status, err);
      return NextResponse.json(
        { error: "ElevenLabs request failed" },
        { status: 502 }
      );
    }

    const audioBuffer = await res.arrayBuffer();
    evictIfFull();
    cache.set(cacheKey, audioBuffer);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("[TTS route]", error);
    return NextResponse.json({ error: "TTS server error" }, { status: 500 });
  }
}
