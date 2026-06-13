"use client";

/**
 * /luyen-viet/online — Luyện viết chữ Hán TƯƠNG TÁC trên màn hình.
 *
 * Người học chọn/nhập chữ → tự tô từng nét (chuột/cảm ứng), hanzi-writer chấm
 * đúng/sai realtime. Có điều hướng chữ trước/sau và đếm tiến độ.
 * Bổ trợ cho /luyen-viet (bản in 田字格). Toàn bộ client-side.
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Eraser, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import HanziTracer from "@/components/ui/HanziTracer";
import { useProgress } from "@/hooks/useProgress";

const PRESETS: { id: string; label: string; chars: string }[] = [
  { id: "heart", label: "❤️ Tình yêu", chars: "爱心情念惜暖" },
  { id: "fate", label: "🌙 Duyên phận", chars: "缘梦望盼归" },
  { id: "pain", label: "💧 Nỗi đau", chars: "泪别痛散孤哭" },
  { id: "peace", label: "🍃 Bình yên", chars: "静思寂真悟" },
  { id: "strength", label: "🔥 Sức mạnh", chars: "忍勇笑懂陪美福" },
  { id: "hsk1", label: "📘 HSK1 cơ bản", chars: "我你好是不人大小多" },
];

export default function LuyenVietOnlinePage() {
  const { awardXP } = useProgress();
  const [input, setInput] = useState("爱心情念惜暖");
  const [idx, setIdx] = useState(0);
  const [doneSet, setDoneSet] = useState<Set<number>>(new Set());

  const chars = useMemo(() => {
    const list = Array.from(input).filter((c) => /[㐀-鿿]/.test(c));
    return Array.from(new Set(list)); // dedupe, giữ thứ tự
  }, [input]);

  const current = chars[idx];

  const setList = (s: string) => {
    setInput(s);
    setIdx(0);
    setDoneSet(new Set());
  };

  const go = (delta: number) => {
    if (chars.length === 0) return;
    setIdx((i) => (i + delta + chars.length) % chars.length);
  };

  return (
    <div className="min-h-screen pb-28 px-4 pt-6 max-w-2xl mx-auto">
      <Link
        href="/luyen-viet"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-white mb-4"
      >
        <ArrowLeft size={16} /> Bảng in 田字格
      </Link>

      <h1 className="text-2xl font-bold mb-1">Luyện viết online</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Tự tô từng nét bằng chuột hoặc ngón tay — được chấm đúng/sai ngay. Bấm “Gợi ý” nếu quên thứ tự nét.
      </p>

      {/* Preset */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setList(p.chars)}
            className="px-3 py-1.5 rounded-full text-xs bg-surface border border-[rgba(255,255,255,0.08)] hover:border-mm-red hover:text-white text-[var(--text-muted)] transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="relative mb-6">
        <textarea
          value={input}
          onChange={(e) => setList(e.target.value)}
          rows={2}
          placeholder="Nhập chữ Hán cần luyện…"
          className="w-full bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl px-4 py-3 text-2xl leading-relaxed outline-none focus:border-mm-red transition-colors resize-none"
          style={{ fontFamily: "'Noto Serif SC', serif" }}
        />
        {input && (
          <button
            onClick={() => setList("")}
            className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-white"
            aria-label="Xóa"
          >
            <Eraser size={18} />
          </button>
        )}
      </div>

      {chars.length === 0 ? (
        <p className="text-sm text-mm-red">Hãy nhập ít nhất một chữ Hán để bắt đầu.</p>
      ) : (
        <div className="flex flex-col items-center">
          {/* Tiến độ */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => go(-1)}
              className="w-9 h-9 rounded-full bg-surface border border-[rgba(255,255,255,0.08)] flex items-center justify-center hover:border-mm-red transition-colors"
              aria-label="Chữ trước"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-[var(--text-muted)] tabular-nums">
              {idx + 1} / {chars.length} · đã xong {doneSet.size}
            </span>
            <button
              onClick={() => go(1)}
              className="w-9 h-9 rounded-full bg-surface border border-[rgba(255,255,255,0.08)] flex items-center justify-center hover:border-mm-red transition-colors"
              aria-label="Chữ sau"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Tracer */}
          <HanziTracer
            key={current}
            hanzi={current}
            size={240}
            onComplete={() => {
              if (!doneSet.has(idx)) awardXP(10, "Luyen viet");
              setDoneSet((prev) => new Set(prev).add(idx));
              // tự chuyển sang chữ tiếp theo sau 1.2s nếu còn
              if (chars.length > 1) {
                setTimeout(() => setIdx((i) => (i + 1) % chars.length), 1200);
              }
            }}
          />

          {/* Dải chữ */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {chars.map((c, i) => (
              <button
                key={`${c}-${i}`}
                onClick={() => setIdx(i)}
                className={cn(
                  "w-10 h-10 rounded-xl text-xl border transition-colors relative",
                  i === idx
                    ? "bg-mm-red border-mm-red text-white"
                    : doneSet.has(i)
                    ? "bg-green-500/15 border-green-500/40 text-green-400"
                    : "bg-surface border-[rgba(255,255,255,0.08)] hover:border-mm-red"
                )}
                style={{ fontFamily: "'Noto Serif SC', serif" }}
              >
                {c}
              </button>
            ))}
          </div>

          <Link
            href="/luyen-viet"
            className="mt-8 inline-flex items-center gap-2 text-sm text-mm-red hover:underline"
          >
            <Printer size={15} /> Muốn in ra giấy? Mở bảng 田字格
          </Link>
        </div>
      )}
    </div>
  );
}
