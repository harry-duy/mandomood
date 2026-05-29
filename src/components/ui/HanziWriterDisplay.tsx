"use client";

/**
 * HanziWriterDisplay — Stroke order animation dùng hanzi-writer
 * Dynamic import để tránh SSR crash (hanzi-writer cần browser DOM)
 *
 * Usage:
 *   <HanziWriterDisplay hanzi="爱" toneColor="#E8504A" />
 */

import { useEffect, useRef, useState } from "react";
import { playTTS } from "@/hooks/useTTS";
import { Volume2, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface HanziWriterDisplayProps {
  hanzi: string;
  toneColor?: string;
  size?: number;
}

export default function HanziWriterDisplay({
  hanzi,
  toneColor = "#E8504A",
  size = 128,
}: HanziWriterDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const writerRef = useRef<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ── Init hanzi-writer sau khi mount ──────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    const initWriter = async () => {
      try {
        // Dynamic import — chỉ load ở client
        const HanziWriter = (await import("hanzi-writer")).default;

        if (cancelled || !containerRef.current) return;

        // Clear previous writer nếu hanzi thay đổi
        containerRef.current.innerHTML = "";

        writerRef.current = HanziWriter.create(containerRef.current, hanzi, {
          width: size,
          height: size,
          padding: 10,
          showOutline: true,
          strokeColor: "#F5F0EB",
          outlineColor: "rgba(255,255,255,0.12)",
          drawingColor: toneColor,
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 200,
          strokeFadeDuration: 400,
          // Hiện hướng dẫn grid
          showHintAfterMisses: false,
        });

        setLoaded(true);
      } catch (err) {
        console.warn("[HanziWriter] Load error:", err);
        setLoadError(true);
        setLoaded(true);
      }
    };

    initWriter();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hanzi]);

  // ── Animate strokes ───────────────────────────────────────────────────────────
  const animateStrokes = () => {
    if (!writerRef.current || isAnimating) return;
    setIsAnimating(true);

    writerRef.current.animateCharacter({
      onComplete: () => setIsAnimating(false),
    });
  };

  // ── Reset về dạng tĩnh ────────────────────────────────────────────────────────
  const resetCharacter = () => {
    if (!writerRef.current) return;
    writerRef.current.showCharacter();
    setIsAnimating(false);
  };

  // ── Phát âm — ElevenLabs với Web Speech fallback ─────────────────────────────
  const speak = () => {
    setIsPlaying(true);
    void playTTS(hanzi).then(() => setIsPlaying(false)).catch(() => setIsPlaying(false));
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Writer canvas container */}
      <div
        className={cn(
          "relative rounded-2xl border-2 overflow-hidden",
          "flex items-center justify-center",
          "transition-all duration-300"
        )}
        style={{
          width: size,
          height: size,
          borderColor: "rgba(255,255,255,0.1)",
          background: "#111111",
        }}
      >
        {/* Grid lines (practice sheet style) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Vertical center line */}
          <div className="absolute left-1/2 top-2 bottom-2 w-px bg-white/10" style={{ transform: "translateX(-50%)" }} />
          {/* Horizontal center line */}
          <div className="absolute top-1/2 left-2 right-2 h-px bg-white/10" style={{ transform: "translateY(-50%)" }} />
          {/* Diagonal lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="0" x2="100%" y2="100%" stroke="white" strokeWidth="1" />
            <line x1="100%" y1="0" x2="0" y2="100%" stroke="white" strokeWidth="1" />
          </svg>
        </div>

        {/* hanzi-writer renders here */}
        <div ref={containerRef} />

        {/* Fallback nếu lỗi load */}
        {loadError && (
          <span className="font-chinese text-7xl font-bold text-[#F5F0EB] z-10">
            {hanzi}
          </span>
        )}

        {/* Loading state */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111111]">
            <div className="w-6 h-6 border-2 border-[#E8504A]/30 border-t-[#E8504A] rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Animate button */}
        <button
          onClick={animateStrokes}
          disabled={!loaded || isAnimating || loadError}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
            isAnimating
              ? "bg-[rgba(232,80,74,0.15)] text-[#E8504A] cursor-wait"
              : loaded && !loadError
              ? "bg-[#1A1A1A] text-[#8A8078] hover:text-white hover:bg-[#242424] border border-[rgba(255,255,255,0.08)]"
              : "bg-[#1A1A1A] text-[#3A3A3A] cursor-not-allowed border border-[rgba(255,255,255,0.04)]"
          )}
        >
          <Play size={11} className={cn(isAnimating && "animate-pulse")} />
          {isAnimating ? "Đang vẽ..." : "Stroke order"}
        </button>

        {/* Reset button */}
        <button
          onClick={resetCharacter}
          disabled={!loaded || loadError}
          className="w-7 h-7 rounded-xl bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#5A5450] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Reset"
        >
          <RotateCcw size={11} />
        </button>

        {/* Audio button */}
        <button
          onClick={speak}
          disabled={isPlaying}
          className={cn(
            "w-7 h-7 rounded-xl border flex items-center justify-center transition-all",
            isPlaying
              ? "bg-[rgba(232,80,74,0.15)] border-[rgba(232,80,74,0.3)] text-[#E8504A]"
              : "bg-[#1A1A1A] border-[rgba(255,255,255,0.08)] text-[#5A5450] hover:text-white"
          )}
          aria-label="Phát âm"
        >
          <Volume2 size={11} className={cn(isPlaying && "animate-pulse")} />
        </button>
      </div>

      {loadError && (
        <p className="text-[9px] text-[#5A5450] text-center max-w-[120px]">
          Stroke animation cần kết nối internet
        </p>
      )}
    </div>
  );
}
