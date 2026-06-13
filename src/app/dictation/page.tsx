/**
 * /dictation — Luyện chính tả (nghe → gõ lại)
 * 2 cấp độ: TỪ (gõ hanzi hoặc pinyin) và CÂU (nghe cả câu ví dụ, gõ lại hanzi).
 * Chấm ngay, cộng XP cuối phiên.
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { playTTS } from "@/hooks/useTTS";
import { useProgress } from "@/hooks/useProgress";
import { HSK_DATA, type HSKWord } from "@/lib/hsk-data";
import { shuffle } from "@/lib/shuffle";
import { normalizePinyin, normalizeHanzi, normalizeSentenceHanzi } from "@/lib/text";

const SESSION_SIZE = 10; // mặc định — user chọn 5/10/20 ở màn setup
const XP_PER_WORD = 3;
const XP_PER_SENTENCE = 5;

type Mode = "hanzi" | "pinyin";
type Unit = "word" | "sentence";
type Phase = "setup" | "playing" | "done";

export default function DictationPage() {
  const { awardXP } = useProgress();

  const [phase, setPhase] = useState<Phase>("setup");
  const [level, setLevel] = useState(1);
  const [sessionSize, setSessionSize] = useState(SESSION_SIZE); // 5 / 10 / 20 — chọn ở setup
  const [unit, setUnit] = useState<Unit>("word");
  const [mode, setMode] = useState<Mode>("hanzi");
  const [words, setWords] = useState<HSKWord[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = words[idx];
  const isSentence = unit === "sentence";
  /** Van ban can nghe/go: tu hoac ca cau vi du. */
  const target = current ? (isSentence ? current.example ?? current.hanzi : current.hanzi) : "";
  const xpPer = isSentence ? XP_PER_SENTENCE : XP_PER_WORD;

  const start = useCallback(() => {
    let pool = HSK_DATA[level] ?? [];
    if (unit === "sentence") pool = pool.filter((w) => w.example);
    // Câu dài hơn từ → mỗi phiên ít hơn (~60% số lượng đã chọn, tối thiểu 3)
    const size = unit === "sentence" ? Math.max(3, Math.round(sessionSize * 0.6)) : sessionSize;
    if (pool.length === 0) {
      toast.error("Cấp độ này chưa có câu ví dụ — thử cấp khác nhé");
      return;
    }
    setWords(shuffle(pool).slice(0, size));
    setIdx(0);
    setAnswer("");
    setResult(null);
    setCorrectCount(0);
    setPhase("playing");
  }, [level, unit, sessionSize]);

  // Tự phát âm khi sang câu/từ mới
  useEffect(() => {
    if (phase === "playing" && target) {
      const t = setTimeout(() => playTTS(target).catch(() => null), 350);
      inputRef.current?.focus();
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  const check = () => {
    if (!current || result) return;
    let ok: boolean;
    if (isSentence) {
      ok = normalizeSentenceHanzi(answer) === normalizeSentenceHanzi(target);
    } else if (mode === "hanzi") {
      ok = normalizeHanzi(answer) === normalizeHanzi(target);
    } else {
      ok = normalizePinyin(answer) === normalizePinyin(current.pinyin);
    }
    setResult(ok ? "correct" : "wrong");
    if (ok) setCorrectCount((c) => c + 1);
  };

  const next = async () => {
    if (idx + 1 >= words.length) {
      setPhase("done");
      const earned = correctCount * xpPer;
      if (earned > 0) {
        try {
          await awardXP(earned, isSentence ? "dictation_sentence" : "dictation");
          toast.success(`+${earned} XP — Luyện chính tả 🎧`);
        } catch {
          /* chưa đăng nhập → bỏ qua */
        }
      }
      return;
    }
    setIdx((i) => i + 1);
    setAnswer("");
    setResult(null);
  };

  const accuracy = useMemo(
    () => (words.length ? Math.round((correctCount / words.length) * 100) : 0),
    [correctCount, words.length]
  );

  // ── Setup screen ────────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-playfair text-2xl font-bold mb-1">Luyện chính tả 🎧</h1>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Nghe phát âm rồi gõ lại — luyện tai và tay cùng lúc.
          </p>
        </motion.div>

        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">Cấp độ</p>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6].map((lv) => (
            <button
              key={lv}
              onClick={() => setLevel(lv)}
              className={cn(
                "py-3 rounded-2xl border text-sm font-semibold transition-all active:scale-95",
                level === lv
                  ? "bg-mm-red/20 border-mm-red/50 text-mm-red"
                  : "bg-surface border-[rgba(255,255,255,0.08)] text-[var(--text-muted)]"
              )}
            >
              HSK {lv}
            </button>
          ))}
        </div>

        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">Đơn vị nghe</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            onClick={() => setUnit("word")}
            className={cn(
              "py-4 rounded-2xl border text-left px-4 transition-all active:scale-95",
              unit === "word" ? "bg-mm-red/15 border-mm-red/50" : "bg-surface border-[rgba(255,255,255,0.08)]"
            )}
          >
            <p className="text-sm font-semibold">Từ đơn 词</p>
            <p className="text-xs text-[var(--text-muted)]">{sessionSize} từ · +{XP_PER_WORD} XP/từ</p>
          </button>
          <button
            onClick={() => { setUnit("sentence"); setMode("hanzi"); }}
            className={cn(
              "py-4 rounded-2xl border text-left px-4 transition-all active:scale-95",
              unit === "sentence" ? "bg-mm-red/15 border-mm-red/50" : "bg-surface border-[rgba(255,255,255,0.08)]"
            )}
          >
            <p className="text-sm font-semibold">Cả câu 句子 🔥</p>
            <p className="text-xs text-[var(--text-muted)]">~60% số từ đã chọn · +{XP_PER_SENTENCE} XP/câu</p>
          </button>
        </div>

        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">Số lượng mỗi phiên</p>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[5, 10, 20].map((n) => (
            <button
              key={n}
              onClick={() => setSessionSize(n)}
              className={cn(
                "py-3 rounded-2xl border text-sm font-semibold transition-all active:scale-95",
                sessionSize === n
                  ? "bg-mm-red/20 border-mm-red/50 text-mm-red"
                  : "bg-surface border-[rgba(255,255,255,0.08)] text-[var(--text-muted)]"
              )}
            >
              {n} {isSentence ? "từ gốc" : "từ"}
            </button>
          ))}
        </div>

        {!isSentence && (
          <>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">Chế độ gõ</p>
            <div className="grid grid-cols-2 gap-2 mb-8">
              <button
                onClick={() => setMode("hanzi")}
                className={cn(
                  "py-4 rounded-2xl border text-left px-4 transition-all active:scale-95",
                  mode === "hanzi" ? "bg-mm-gold/15 border-mm-gold/50" : "bg-surface border-[rgba(255,255,255,0.08)]"
                )}
              >
                <p className="text-sm font-semibold">Chữ Hán 汉字</p>
                <p className="text-xs text-[var(--text-muted)]">Cần bàn phím tiếng Trung</p>
              </button>
              <button
                onClick={() => setMode("pinyin")}
                className={cn(
                  "py-4 rounded-2xl border text-left px-4 transition-all active:scale-95",
                  mode === "pinyin" ? "bg-mm-gold/15 border-mm-gold/50" : "bg-surface border-[rgba(255,255,255,0.08)]"
                )}
              >
                <p className="text-sm font-semibold">Pinyin</p>
                <p className="text-xs text-[var(--text-muted)]">Không cần dấu thanh (nv = nǚ)</p>
              </button>
            </div>
          </>
        )}
        {isSentence && (
          <p className="text-xs text-[var(--text-muted)] mb-8">
            💡 Chế độ câu: nghe cả câu ví dụ và gõ lại bằng chữ Hán. Dấu câu và khoảng trắng không tính.
          </p>
        )}

        <button onClick={start} className="btn-primary w-full text-center">
          Bắt đầu — {isSentence ? `${Math.max(3, Math.round(sessionSize * 0.6))} câu` : `${sessionSize} từ`}
        </button>
      </div>
    );
  }

  // ── Done screen ─────────────────────────────────────────────────────────────
  if (phase === "done") {
    return (
      <div className="min-h-screen px-4 py-6 max-w-lg mx-auto flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Trophy size={48} className="text-mm-gold mx-auto mb-4" />
          <h2 className="font-playfair text-2xl font-bold mb-2">Hoàn thành! 🎉</h2>
          <p className="text-[var(--text-muted)] mb-1">
            Đúng <span className="text-mm-gold font-bold">{correctCount}/{words.length}</span> ({accuracy}%)
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-8">+{correctCount * xpPer} XP</p>
          <div className="flex gap-3">
            <button onClick={() => setPhase("setup")} className="btn-ghost border border-[rgba(255,255,255,0.1)]">
              Đổi chế độ
            </button>
            <button onClick={start} className="btn-primary flex items-center gap-2">
              <RotateCcw size={16} /> Chơi lại
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Playing ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-[var(--text-muted)]">
          {isSentence ? "Câu" : "Từ"} {idx + 1}/{words.length} · HSK {level}
          {!isSentence && ` · ${mode === "hanzi" ? "汉字" : "Pinyin"}`}
        </p>
        <p className="text-xs text-mm-gold font-semibold">✓ {correctCount}</p>
      </div>
      <div className="h-1.5 rounded-full bg-surface2 mb-8 overflow-hidden">
        <div
          className="h-full bg-mm-red rounded-full transition-all duration-300"
          style={{ width: `${((idx + (result ? 1 : 0)) / words.length) * 100}%` }}
        />
      </div>

      {/* Speaker */}
      <div className="flex flex-col items-center mb-8">
        <button
          onClick={() => target && playTTS(target).catch(() => null)}
          className="w-24 h-24 rounded-full bg-mm-red/15 border border-mm-red/40 grid place-items-center text-mm-red transition-all active:scale-90 hover:bg-mm-red/25"
          aria-label="Nghe lại"
        >
          <Volume2 size={36} />
        </button>
        <p className="text-xs text-[var(--text-muted)] mt-3">Bấm để nghe lại</p>
      </div>

      {/* Answer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (result) next();
          else check();
        }}
      >
        <input
          ref={inputRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={!!result}
          placeholder={
            isSentence
              ? "Gõ lại cả câu bằng chữ Hán…"
              : mode === "hanzi"
              ? "Gõ chữ Hán bạn nghe được…"
              : "Gõ pinyin (vd: nihao)…"
          }
          className={cn(
            "input text-center",
            isSentence ? "text-base" : "text-lg",
            (isSentence || mode === "hanzi") && "font-chinese",
            result === "correct" && "border-green-500",
            result === "wrong" && "border-mm-red"
          )}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />

        <AnimatePresence>
          {result && current && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "mt-4 rounded-2xl border px-4 py-3 flex items-start gap-3",
                result === "correct" ? "bg-green-500/10 border-green-500/30" : "bg-mm-red/10 border-mm-red/30"
              )}
            >
              {result === "correct" ? (
                <CheckCircle size={20} className="text-green-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle size={20} className="text-mm-red shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-chinese text-xl">{target}</p>
                <p className="text-sm text-mm-gold">{current.pinyin}{isSentence && ` (từ khoá: ${current.hanzi})`}</p>
                <p className="text-sm text-[var(--text-muted)]">{current.meaning}</p>
                {!isSentence && current.example && (
                  <p className="text-xs text-[var(--text-muted)] mt-1 font-chinese">{current.example}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button type="submit" className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
          {result ? (
            <>
              {idx + 1 >= words.length ? "Xem kết quả" : "Tiếp theo"} <ArrowRight size={16} />
            </>
          ) : (
            "Kiểm tra"
          )}
        </button>
      </form>
    </div>
  );
}
