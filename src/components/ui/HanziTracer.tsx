"use client";

/**
 * HanziTracer — Luyện viết trên màn hình (quiz mode của hanzi-writer)
 *
 * Người học tự tô/viết từng nét bằng chuột hoặc ngón tay; hanzi-writer chấm
 * đúng/sai theo thời gian thực. Khác với HanziWriterDisplay (chỉ xem animation),
 * component này dùng `.quiz()` để TƯƠNG TÁC.
 *
 * Dynamic import hanzi-writer (cần DOM) để tránh crash khi SSR.
 *
 * Usage: <HanziTracer hanzi="爱" size={220} onComplete={(s) => ...} />
 */

import { useEffect, useRef, useState } from "react";
import { playTTS } from "@/hooks/useTTS";
import { Volume2, RotateCcw, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface HanziTracerProps {
  hanzi: string;
  size?: number;
  onComplete?: (summary: { totalMistakes: number }) => void;
}

export default function HanziTracer({ hanzi, size = 220, onComplete }: HanziTracerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const writerRef = useRef<any>(null);

  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // ── Khởi tạo + bắt đầu quiz ──────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    const init = async () => {
      try {
        const HanziWriter = (await import("hanzi-writer")).default;
        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = "";
        setMistakes(0);
        setDone(false);

        // Outline phải tương phản với nền canvas theo theme:
        // dark → nền tối, outline trắng mờ; light → nền trắng, outline đen mờ.
        const isLight = document.documentElement.getAttribute("data-theme") === "light";
        const outlineColor = isLight ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.18)";

        const writer = HanziWriter.create(containerRef.current, hanzi, {
          width: size,
          height: size,
          padding: 12,
          showOutline: true,
          showCharacter: false,
          strokeColor: "#E8504A",
          outlineColor,
          drawingColor: "#E8504A",
          highlightColor: "#E8A838",
          showHintAfterMisses: 3,
        });
        writerRef.current = writer;
        setLoaded(true);

        writer.quiz({
          onMistake: () => setMistakes((m) => m + 1),
          onComplete: (summary: { totalMistakes: number }) => {
            setDone(true);
            onComplete?.(summary);
          },
        });
      } catch (err) {
        console.warn("[HanziTracer] Load error:", err);
        setLoadError(true);
        setLoaded(true);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hanzi]);

  // ── Làm lại từ đầu ────────────────────────────────────────────────────────────
  const restart = () => {
    if (!writerRef.current) return;
    setMistakes(0);
    setDone(false);
    writerRef.current.quiz({
      onMistake: () => setMistakes((m) => m + 1),
      onComplete: (summary: { totalMistakes: number }) => {
        setDone(true);
        onComplete?.(summary);
      },
    });
  };

  // ── Gợi ý: chiếu animation 1 lần rồi cho viết lại ────────────────────────────
  const showHint = () => {
    if (!writerRef.current) return;
    writerRef.current.animateCharacter({
      onComplete: () => restart(),
    });
  };

  const speak = () => {
    setIsPlaying(true);
    void playTTS(hanzi).then(() => setIsPlaying(false)).catch(() => setIsPlaying(false));
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative rounded-2xl border-2 overflow-hidden flex items-center justify-center"
        style={{ width: size, height: size, borderColor: done ? "#4ade80" : "var(--border)", background: "var(--bg-card)" }}
      >
        {/* 田字格 guide */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-2 bottom-2 w-px bg-white/10" style={{ transform: "translateX(-50%)" }} />
          <div className="absolute top-1/2 left-2 right-2 h-px bg-white/10" style={{ transform: "translateY(-50%)" }} />
        </div>

        <div ref={containerRef} />

        {loadError && (
          <span className="font-chinese text-7xl font-bold text-[#F5F0EB] z-10">{hanzi}</span>
        )}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111111]">
            <div className="w-6 h-6 border-2 border-[#E8504A]/30 border-t-[#E8504A] rounded-full animate-spin" />
          </div>
        )}
        {done && (
          <div className="absolute top-2 right-2 bg-green-500/90 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
            Hoàn thành ✓
          </div>
        )}
      </div>

      {/* Trạng thái */}
      <p className="text-xs text-[var(--text-muted)]">
        {loadError
          ? "Cần internet để tải dữ liệu nét"
          : done
          ? `Xong! Số nét sai: ${mistakes}`
          : `Viết theo thứ tự nét · sai: ${mistakes}`}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={showHint}
          disabled={!loaded || loadError}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#1A1A1A] text-[#8A8078] hover:text-white hover:bg-[#242424] border border-[rgba(255,255,255,0.08)] transition-all disabled:opacity-30"
        >
          <Eye size={12} /> Gợi ý
        </button>
        <button
          onClick={restart}
          disabled={!loaded || loadError}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#1A1A1A] text-[#8A8078] hover:text-white hover:bg-[#242424] border border-[rgba(255,255,255,0.08)] transition-all disabled:opacity-30"
        >
          <RotateCcw size={12} /> Làm lại
        </button>
        <button
          onClick={speak}
          disabled={isPlaying}
          className={cn(
            "w-8 h-8 rounded-xl border flex items-center justify-center transition-all",
            isPlaying
              ? "bg-[rgba(232,80,74,0.15)] border-[rgba(232,80,74,0.3)] text-[#E8504A]"
              : "bg-[#1A1A1A] border-[rgba(255,255,255,0.08)] text-[#5A5450] hover:text-white"
          )}
          aria-label="Phát âm"
        >
          <Volume2 size={12} className={cn(isPlaying && "animate-pulse")} />
        </button>
      </div>
    </div>
  );
}
