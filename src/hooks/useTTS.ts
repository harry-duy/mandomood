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

import { useState, useCallback, useRef, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

// Giới hạn số blob audio cache để tránh rò rỉ bộ nhớ (mỗi object URL giữ 1 blob sống).
const MAX_TTS_CACHE = 50;

export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobCache = useRef<Map<string, string>>(new Map());
  const selectedVoice = useAppStore((s) => s.selectedVoice);

  // Thu hồi mọi blob URL khi unmount — tránh rò rỉ bộ nhớ (object URL giữ blob audio sống).
  useEffect(() => {
    const cache = blobCache.current;
    return () => {
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

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

    const utter = (voices: SpeechSynthesisVoice[]) => {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "zh-CN";
      u.rate = 0.85;
      u.pitch = 1;
      // Prefer a Mandarin voice if available (local first, then any zh)
      const zhVoice =
        voices.find((v) => v.lang.startsWith("zh") && v.localService) ??
        voices.find((v) => v.lang.startsWith("zh"));
      if (zhVoice) u.voice = zhVoice;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    };

    // Chrome loads voices asynchronously — getVoices() can be empty on first call.
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      utter(voices);
    } else {
      const onVoices = () => {
        window.speechSynthesis.onvoiceschanged = null;
        utter(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.onvoiceschanged = onVoices;
      // Safety fallback: speak anyway after a short wait if event never fires
      setTimeout(() => {
        if (window.speechSynthesis.onvoiceschanged === onVoices) {
          window.speechSynthesis.onvoiceschanged = null;
          utter(window.speechSynthesis.getVoices());
        }
      }, 250);
    }
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!text) return;
      stopCurrent();
      setSpeaking(true);

      // "web" voice → skip ElevenLabs, go straight to Web Speech
      if (selectedVoice === 'web') {
        speakWebSpeech(text);
        return;
      }

      // Try ElevenLabs first
      try {
        let blobUrl = blobCache.current.get(text);
        if (!blobUrl) {
          const voiceParam = selectedVoice && selectedVoice !== 'web' ? `&voice=${encodeURIComponent(selectedVoice)}` : '';
          const res = await fetch(
            `/api/tts?text=${encodeURIComponent(text)}${voiceParam}`
          );
          if (res.ok) {
            const blob = await res.blob();
            blobUrl = URL.createObjectURL(blob);
            blobCache.current.set(text, blobUrl);
            // Cache vượt ngưỡng → thu hồi URL cũ nhất rồi xoá (LRU đơn giản theo thứ tự chèn).
            if (blobCache.current.size > MAX_TTS_CACHE) {
              const oldest = blobCache.current.keys().next().value;
              const oldUrl = oldest ? blobCache.current.get(oldest) : undefined;
              if (oldest && oldUrl) { URL.revokeObjectURL(oldUrl); blobCache.current.delete(oldest); }
            }
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
    [stopCurrent, speakWebSpeech, selectedVoice]
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
      // Thu hồi blob URL sau khi phát xong/ lỗi — tránh rò rỉ bộ nhớ.
      const cleanup = () => URL.revokeObjectURL(url);
      audio.onended = cleanup;
      audio.onerror = cleanup;
      audio.play().catch(() => { cleanup(); webSpeechFallback(text); });
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
  const voices = window.speechSynthesis.getVoices();
  const zhVoice =
    voices.find((v) => v.lang.startsWith("zh") && v.localService) ??
    voices.find((v) => v.lang.startsWith("zh"));
  if (zhVoice) u.voice = zhVoice;
  window.speechSynthesis.speak(u);
}
