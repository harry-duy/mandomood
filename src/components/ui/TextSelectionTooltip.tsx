"use client";

/**
 * TextSelectionTooltip
 * Boi den bat ky chu Han nao -> goi y ngua canh de tu doan
 * KHONG dich thang - AI cho clue, nguoi dung doan, kiem tra
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Check, X, BellPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { invalidateDueCount } from "@/hooks/useDueCount";

interface TooltipPos { x: number; y: number }

interface HintData {
  hint: string;
  category: string;
  level: string;
  usage_note: string;
}

interface CheckData {
  correct: boolean;
  score: number;
  actual_meaning: string;
  feedback: string;
}

type Phase = "idle" | "loading_hint" | "hint" | "checking" | "result";

const LEVEL_COLOR: Record<string, string> = {
  beginner: "#8A8078",
  hsk1: "#7AB8D4",
  hsk2: "#8FAF8F",
  hsk3: "#D4AF37",
  hsk4: "#E8504A",
  hsk5: "#C9878A",
};

function hasChinese(text: string): boolean {
  return /\p{Script=Han}/u.test(text);
}

const TOOLTIP_W = 280;

export default function TextSelectionTooltip() {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<TooltipPos>({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [context, setContext] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [hint, setHint] = useState<HintData | null>(null);
  const [guess, setGuess] = useState("");
  const [checkResult, setCheckResult] = useState<CheckData | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const tooltipRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const close = useCallback(() => {
    setVisible(false);
    setPhase("idle");
    setHint(null);
    setGuess("");
    setCheckResult(null);
    setSaveState("idle");
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
  }, []);

  const handleSaveToDeck = useCallback(async (meaning: string) => {
    if (!selectedText || !meaning) return;
    setSaveState("saving");
    try {
      const res = await fetch("/api/user/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hanzi: selectedText,
          meaning,
          card_type: selectedText.length > 1 ? "sentence" : "word",
        }),
      });
      // 200 = đã thêm hoặc đã có sẵn trong bộ thẻ → coi như thành công
      if (res.ok) invalidateDueCount();
      setSaveState(res.ok ? "saved" : "idle");
    } catch {
      setSaveState("idle");
    }
  }, [selectedText]);

  const fetchHint = useCallback(async (text: string, ctx: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setPhase("loading_hint");
    try {
      const res = await fetch("/api/ai/word-hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedText: text, context: ctx }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json() as HintData;
      setHint(data);
      setPhase("hint");
    } catch (e) {
      if ((e as Error).name !== "AbortError") close();
    }
  }, [close]);

  const handleCheck = async () => {
    if (!guess.trim()) return;
    setPhase("checking");
    try {
      const res = await fetch("/api/ai/word-hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedText, userGuess: guess }),
      });
      const data = await res.json() as CheckData;
      setCheckResult(data);
      setPhase("result");
    } catch {
      setPhase("hint");
    }
  };

  useEffect(() => {
    const onMouseUp = (e: MouseEvent) => {
      if (tooltipRef.current?.contains(e.target as Node)) return;

      const sel = window.getSelection();
      const text = sel?.toString().trim() ?? "";

      if (!text || !hasChinese(text) || text.length > 60) {
        if (visible) close();
        return;
      }

      const range = sel?.getRangeAt(0);
      if (!range) return;

      // Use viewport coords (position: fixed doesn't need scrollY)
      const rect = range.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top; // top of selection in viewport

      // Clamp X so tooltip stays within viewport
      const clampedX = Math.max(TOOLTIP_W / 2 + 8, Math.min(cx, window.innerWidth - TOOLTIP_W / 2 - 8));

      const ctx = (range.commonAncestorContainer.textContent ?? "").slice(0, 200);

      setPos({ x: clampedX, y: cy });
      setSelectedText(text);
      setContext(ctx);
      setVisible(true);
      setPhase("idle");
      setHint(null);
      setGuess("");
      setCheckResult(null);
      setSaveState("idle");

      fetchHint(text, ctx);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [visible, close, fetchHint]);

  useEffect(() => {
    if (phase === "hint") setTimeout(() => inputRef.current?.focus(), 80);
  }, [phase]);

  if (!visible) return null;

  const scoreColor = checkResult
    ? checkResult.score >= 80 ? "#8FAF8F" : checkResult.score >= 50 ? "#D4AF37" : "#E8504A"
    : "#8A9DC9";

  // Place above selection; if too close to top, place below instead
  const TOOLTIP_H = 200; // approx
  const placeBelow = pos.y < TOOLTIP_H + 20;
  const translateY = placeBelow ? `calc(${pos.y}px + 8px)` : `calc(${pos.y}px - 100% - 8px)`;

  return (
    <div
      ref={tooltipRef}
      style={{
        position: "fixed",
        left: pos.x,
        top: 0,
        transform: `translateX(-50%) translateY(${placeBelow ? pos.y + 8 : pos.y - 8}px)`,
        zIndex: 9999,
      }}
    >
      <AnimatePresence>
        <motion.div
          key="tt"
          initial={{ opacity: 0, y: placeBelow ? -6 : 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.14 }}
          style={{
            width: TOOLTIP_W,
            background: "#0D0D0D",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16,
            boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
            padding: "12px 14px",
            transformOrigin: placeBelow ? "top center" : "bottom center",
          }}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[#3A3A3A] hover:text-[#8A8078]"
          >
            <X size={10} />
          </button>

          {/* Selected text */}
          <div className="flex items-center gap-2 mb-2.5 pr-5">
            <span className="text-xl font-noto text-[#F5F0EB] tracking-wider">{selectedText}</span>
            <Sparkles size={11} className="text-[#8A9DC9] shrink-0" />
          </div>

          {/* Loading */}
          {phase === "loading_hint" && (
            <div className="flex items-center gap-1.5 text-xs text-[#5A5450]">
              <Loader2 size={11} className="animate-spin" />
              AI đang gợi ý...
            </div>
          )}

          {/* Hint */}
          {(phase === "hint") && hint && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {hint.level && (
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                    style={{ color: LEVEL_COLOR[hint.level] ?? "#8A9DC9", background: `${LEVEL_COLOR[hint.level] ?? "#8A9DC9"}18` }}
                  >
                    {hint.level}
                  </span>
                )}
                {hint.category && (
                  <span className="text-[9px] text-[#3A3A3A] uppercase tracking-wider">{hint.category}</span>
                )}
              </div>
              <p className="text-xs text-[#C8C0B8] leading-relaxed italic">&ldquo;{hint.hint}&rdquo;</p>
              {hint.usage_note && (
                <p className="text-[10px] text-[#3A3A3A]">{hint.usage_note}</p>
              )}
              <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-[10px] text-[#5A5450] mb-1.5">Bạn nghĩ là gì?</p>
                <div className="flex gap-1.5">
                  <input
                    ref={inputRef}
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && guess.trim() && handleCheck()}
                    placeholder="Nhập dự đoán..." aria-label="Nhập dự đoán"
                    className="flex-1 bg-[#1A1A1A] rounded-xl px-2.5 py-1.5 text-xs text-[#F5F0EB] placeholder-[#3A3A3A] outline-none"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                  <button
                    onClick={handleCheck}
                    disabled={!guess.trim()}
                    className={cn(
                      "px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                      guess.trim() ? "bg-[#8A9DC9] text-[#0A0A0A]" : "bg-[#1A1A1A] text-[#3A3A3A] cursor-not-allowed"
                    )}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Checking */}
          {phase === "checking" && (
            <div className="flex items-center gap-1.5 text-xs text-[#5A5450]">
              <Loader2 size={11} className="animate-spin" /> Đang kiểm tra...
            </div>
          )}

          {/* Result */}
          {phase === "result" && checkResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: checkResult.correct ? "rgba(143,175,143,0.2)" : "rgba(232,80,74,0.15)" }}
                >
                  {checkResult.correct
                    ? <Check size={12} style={{ color: "#8FAF8F" }} />
                    : <X size={12} style={{ color: "#E8504A" }} />
                  }
                </div>
                <span className="text-xs font-semibold" style={{ color: scoreColor }}>
                  {checkResult.score}/100
                </span>
                <span className="text-xs text-[#5A5450]">{checkResult.feedback}</span>
              </div>
              <div
                className="rounded-xl px-3 py-2"
                style={{ background: "rgba(138,157,201,0.08)", border: "1px solid rgba(138,157,201,0.15)" }}
              >
                <p className="text-[10px] text-[#5A5450] mb-0.5">Nghĩa chính xác:</p>
                <p className="text-xs text-[#F5F0EB] font-medium">{checkResult.actual_meaning}</p>
              </div>
              <button
                onClick={() => handleSaveToDeck(checkResult.actual_meaning)}
                disabled={saveState !== "idle"}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-[11px] font-semibold transition-all"
                style={{
                  background: saveState === "saved" ? "rgba(143,175,143,0.18)" : "rgba(232,99,74,0.15)",
                  color: saveState === "saved" ? "#8FAF8F" : "#E8634A",
                  border: "1px solid rgba(232,99,74,0.25)",
                }}
              >
                {saveState === "saving" ? (
                  <><Loader2 size={11} className="animate-spin" /> Đang lưu...</>
                ) : saveState === "saved" ? (
                  <><Check size={11} /> Đã thêm vào bộ nhắc ôn</>
                ) : (
                  <><BellPlus size={11} /> Lưu &amp; nhắc ôn ngắt quãng</>
                )}
              </button>
              <button onClick={close} className="text-[10px] text-[#5A5450] hover:text-[#8A8078] transition-colors">
                Đóng
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Suppress unused var warning */}
      <span style={{ display: "none" }}>{translateY}</span>
    </div>
  );
}
