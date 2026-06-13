"use client";

/**
 * /flashcards — Hệ thống ôn tập từ vựng SRS (Spaced Repetition)
 * Flip card animation, SM-2 grading, streak tracking
 */

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  RotateCcw, CheckCircle, XCircle, Clock,
  BookOpen, Zap, Trophy, ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { invalidateDueCount } from "@/hooks/useDueCount";

interface VocabCard {
  _id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  example_sentence?: string;
  example_pinyin?: string;
  example_translation?: string;
  mastery: number;
  interval: number;
  repetitions: number;
}

const QUALITY_LABELS = [
  { q: 5, label: "Dễ quá!", color: "bg-green-500/20 border-green-500/40 text-green-400", icon: "🚀" },
  { q: 4, label: "Nhớ rồi", color: "bg-[#8FAF8F]/20 border-[#8FAF8F]/40 text-[#8FAF8F]", icon: "✅" },
  { q: 2, label: "Khó nhớ", color: "bg-yellow-500/20 border-yellow-500/40 text-yellow-400", icon: "😅" },
  { q: 0, label: "Quên rồi", color: "bg-mm-red/20 border-mm-red/40 text-mm-red", icon: "😭" },
];

export default function FlashcardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [cards, setCards] = useState<VocabCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [stats, setStats] = useState({ reviewed: 0, correct: 0, wrong: 0 });

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/vocabulary?filter=due");
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards);
      }
    } catch {
      toast("Không tải được flashcards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchCards();
    if (status === "unauthenticated") setLoading(false);
  }, [status, fetchCards]);

  const currentCard = cards[currentIdx];

  const handleGrade = async (quality: number) => {
    if (!currentCard || grading) return;
    setGrading(true);

    try {
      await fetch("/api/user/vocabulary", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: currentCard._id, quality }),
      });
      invalidateDueCount(); // thẻ vừa ôn không còn đến hạn → badge cập nhật
    } catch { /* non-critical */ }

    setStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (quality >= 3 ? 1 : 0),
      wrong: prev.wrong + (quality < 3 ? 1 : 0),
    }));

    setFlipped(false);
    setGrading(false);

    if (currentIdx + 1 >= cards.length) {
      setSessionDone(true);
    } else {
      setCurrentIdx(i => i + 1);
    }
  };

  const masteryDots = (n: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={cn(
          "w-2 h-2 rounded-full transition-colors",
          i < n ? "bg-mm-gold" : "bg-[rgba(255,255,255,0.1)]"
        )}
      />
    ));

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🎴</div>
          <h1 className="font-playfair text-xl font-bold mb-2">Flashcard SRS theo tài khoản</h1>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Đăng nhập để đồng bộ thẻ và lịch ôn trên mọi thiết bị — hoặc dùng
            Bộ thẻ của tôi (không cần tài khoản, lưu trên máy).
          </p>
          <div className="flex flex-col gap-2">
            <button onClick={() => router.push("/login")} className="btn-primary w-full">
              Đăng nhập / Đăng ký
            </button>
            <button
              onClick={() => router.push("/my-decks")}
              className="w-full py-3 rounded-full border border-[rgba(255,255,255,0.12)] text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              🎴 Dùng Bộ thẻ của tôi (offline)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">🧠</div>
          <p className="text-[var(--text-muted)] text-sm">Đang tải flashcards...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0 && !sessionDone) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-xs">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-xl font-bold mb-2">Xong rồi!</h2>
          <p className="text-[var(--text-muted)] text-sm mb-6">
            Hôm nay không có từ nào cần ôn. Học bài mới để thêm từ vào bộ thẻ nhé!
          </p>
          <button
            onClick={() => router.push("/feed")}
            className="w-full py-3 bg-mm-red text-white rounded-2xl font-medium text-sm"
          >
            Học bài mới
          </button>
        </div>
      </div>
    );
  }

  if (sessionDone) {
    const accuracy = stats.reviewed > 0
      ? Math.round((stats.correct / stats.reviewed) * 100)
      : 0;
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-xs w-full"
        >
          <div className="text-6xl mb-4">
            {accuracy >= 80 ? "🏆" : accuracy >= 50 ? "📚" : "💪"}
          </div>
          <h2 className="text-2xl font-bold mb-1">Phiên ôn tập xong!</h2>
          <p className="text-[var(--text-muted)] text-sm mb-6">
            {accuracy >= 80
              ? "Xuất sắc! Bộ nhớ của bạn rất tốt."
              : accuracy >= 50
              ? "Tốt lắm! Tiếp tục luyện tập nhé."
              : "Đừng nản — kiên trì là chìa khóa! 🔑"}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Đã ôn", value: stats.reviewed, icon: <BookOpen size={16} /> },
              { label: "Nhớ", value: stats.correct, icon: <CheckCircle size={16} className="text-green-400" /> },
              { label: "Độ chính xác", value: `${accuracy}%`, icon: <Zap size={16} className="text-mm-gold" /> },
            ].map(s => (
              <div key={s.label} className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-3 text-center">
                <div className="flex justify-center mb-1 text-[var(--text-muted)]">{s.icon}</div>
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setSessionDone(false); setCurrentIdx(0); setStats({ reviewed: 0, correct: 0, wrong: 0 }); fetchCards(); }}
              className="flex-1 py-3 bg-surface border border-[rgba(255,255,255,0.1)] rounded-2xl text-sm font-medium"
            >
              Ôn lại
            </button>
            <button
              onClick={() => router.push("/feed")}
              className="flex-1 py-3 bg-mm-red text-white rounded-2xl text-sm font-medium"
            >
              Học thêm
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="text-[var(--text-muted)] hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Ôn tập từ vựng</p>
          <p className="text-sm font-semibold">
            {currentIdx + 1} / {cards.length}
          </p>
        </div>
        <div className="flex items-center gap-1 text-mm-gold text-xs">
          <Trophy size={14} />
          <span>{stats.correct}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-surface rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-mm-red to-mm-gold rounded-full"
          animate={{ width: `${((currentIdx) / cards.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Flashcard */}
      <div className="relative w-full" style={{ perspective: "1200px" }}>
        <motion.div
          className="relative w-full cursor-pointer"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          onClick={() => !flipped && setFlipped(true)}
        >
          {/* Front */}
          <div
            className={cn(
              "w-full min-h-[280px] rounded-3xl p-8",
              "bg-surface border border-[rgba(255,255,255,0.08)]",
              "flex flex-col items-center justify-center gap-4",
              "backface-hidden"
            )}
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Mastery */}
            <div className="flex gap-1.5">{masteryDots(currentCard.mastery)}</div>

            {/* Hanzi */}
            <div className="font-chinese text-7xl font-bold text-center leading-none" style={{ textShadow: "0 0 40px rgba(232,168,56,0.3)" }}>
              {currentCard.hanzi}
            </div>

            {/* Tap hint */}
            <p className="text-[var(--text-muted)] text-xs mt-2">
              Nhấn để xem nghĩa →
            </p>
          </div>

          {/* Back */}
          <div
            className={cn(
              "absolute inset-0 w-full min-h-[280px] rounded-3xl p-6",
              "bg-surface border border-mm-gold/20",
              "flex flex-col items-center justify-center gap-3",
              "backface-hidden"
            )}
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="font-chinese text-4xl font-bold">{currentCard.hanzi}</div>
            <p className="text-mm-gold text-lg font-medium">{currentCard.pinyin}</p>
            <p className="text-[#F5F0EB] text-xl font-semibold text-center">{currentCard.meaning}</p>

            {currentCard.example_sentence && (
              <div className="w-full mt-2 p-3 bg-[rgba(255,255,255,0.04)] rounded-2xl text-center">
                <p className="font-chinese text-sm text-[var(--text-muted)]">{currentCard.example_sentence}</p>
                {currentCard.example_pinyin && (
                  <p className="text-xs text-mm-gold/70 mt-0.5">{currentCard.example_pinyin}</p>
                )}
                {currentCard.example_translation && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 italic">{currentCard.example_translation}</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Grade buttons — only visible when flipped */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="mt-6 grid grid-cols-2 gap-3"
          >
            {QUALITY_LABELS.map(({ q, label, color, icon }) => (
              <button
                key={q}
                onClick={() => handleGrade(q)}
                disabled={grading}
                className={cn(
                  "py-3.5 rounded-2xl border text-sm font-medium transition-all duration-200",
                  "flex items-center justify-center gap-2",
                  color,
                  "hover:scale-[1.02] active:scale-95"
                )}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flip hint */}
      {!flipped && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-[var(--text-muted)] text-xs mt-6"
        >
          Nhấn vào thẻ để lật
        </motion.p>
      )}

      {/* Next interval hint */}
      {currentCard.interval > 0 && (
        <div className="flex items-center justify-center gap-1.5 mt-4 text-[var(--text-muted)] text-xs">
          <Clock size={11} />
          <span>Ôn lại sau {currentCard.interval} ngày</span>
        </div>
      )}
    </div>
  );
}
