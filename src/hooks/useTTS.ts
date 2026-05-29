/**
 * useTTS — hook phát âm tiếng Trung
 *
 * Thứ tự ưu tiên:
 *  1. ElevenLabs qua /api/tts (nếu server có API key)
 *  2. Web Speech API với lang="zh-CN" (fallback universal)
 *
 * Usage:
 *   const { speak, speaking } = useTTS();
 *   <button onClick={() => speak("你好")}>🔊</button>
 */

"use client";

import { useState, useCallback, useRef } from "react";

export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Cache blob URLs in memory so we don't re-fetch same text
  const blobCache = useRef<Map<string, string>>(new Map());

  const stopCurrent = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const speakWebSpeech = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN";
    u.rate = 0.85;
    u.pitch = 1;
    // Prefer a Mandarin voice if available
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(
      (v) => v.lang.startsWith("zh") && v.localService
    );
    if (zhVoice) u.voice = zhVoice;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!text) return;
      stopCurrent();
      setSpeaking(true);

      // Try ElevenLabs first
      try {
        let blobUrl = blobCache.current.get(text);
        if (!blobUrl) {
          const res = await fetch(
            `/api/tts?text=${encodeURIComponent(text)}`
          );
          if (res.ok) {
            const blob = await res.blob();
            blobUrl = URL.createObjectURL(blob);
            blobCache.current.set(text, blobUrl);
          } else if (res.status === 503) {
            // ElevenLabs not configured — fallback silently
            throw new Error("no_elevenlabs");
          } else {
            throw new Error("tts_error");
          }
        }

        const audio = new Audio(blobUrl);
        audioRef.current = audio;
        audio.onended = () => setSpeaking(false);
        audio.onerror = () => {
          setSpeaking(false);
          speakWebSpeech(text);
        };
        await audio.play();
      } catch {
        // Fallback to Web Speech API
        speakWebSpeech(text);
      }
    },
    [stopCurrent, speakWebSpeech]
  );

  return { speak, speaking, stop: stopCurrent };
}

/** Lightweight fire-and-forget version (no state tracking) */
export async function playTTS(text: string): Promise<void> {
  if (!text) return;
  try {
    const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play().catch(() => webSpeechFallback(text));
      return;
    }
  } catch {
    // ignore
  }
  webSpeechFallback(text);
}

function webSpeechFallback(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-CN";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}
