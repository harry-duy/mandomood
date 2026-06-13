"use client";

/**
 * VocabQuiz — quiz trắc nghiệm 4 đáp án (kiểu Quizlet Learn / OpenQuiz).
 * Generic: nhận danh sách {front, back, pinyin?}, tự sinh câu hỏi + 3 đáp án nhiễu.
 * Dùng cho: bộ thẻ tự tạo (/my-decks) và từ vựng HSK (/hsk).
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, ArrowRight, Trophy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { playTTS } from "@/hooks/useTTS";
import { shuffle } from "@/lib/shuffle";

export interface QuizItem {
  front: string;   // chữ Hán
  back: string;    // nghĩa
  pinyin?: string;
}

interface Question {
  item: QuizItem;
  choices: string[]; // 4 đáp án (back), đã trộn
}

function buildQuestions(items: QuizItem[], max: number): Question[] {
  const pool = shuffle(items).slice(0, max);
  return pool.map((item) => {
    const distractors = shuffle(items.filter((i) => i.back !== item.back))
      .slice(0, 3)
      .map((i) => i.back);
    return { item, choices: shuffle([item.back, ...distractors]) };
  });
}

export default function VocabQuiz({
  items,
  maxQuestions = 10,
  listening = false,
  onDone,
  onExit,
}: {
  items: QuizItem[];
  maxQuestions?: number;
  /** Che do NGHE: an chu Han, tu phat am, nguoi choi chon nghia bang tai. */
  listening?: boolean;
  onDone?: (correct: number, total: number) => void;
  onExit?: () => void;
}) {
  const [seed, setSeed] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questions = useMemo(() => buildQuestions(items, maxQuestions), [items, maxQuestions, seed]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[idx];

  // Che do nghe: tu phat am moi khi sang cau moi
  useEffect(() => {
    if (listening && q && !finished) {
      const t = setTimeout(() => playTTS(q.item.front).catch(() => null), 300);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, listening, finished]);

  if (items.length < 4) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-[var(--text-muted)]">
          Cần ít nhất 4 từ để chơi quiz trắc nghiệm 🙏
        </p>
      </div>
    );
  }

  const pick = (choice: string) => {
    if (picked) return;
    setPicked(choice);
    if (choice === q.item.back) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      setFinished(true);
      onDone?.(correct, questions.length);
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
  };

  const restart = () => {
    setSeed((s) => s + 1);
    setIdx(0);
    setPicked(null);
    setCorrect(0);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
        <Trophy size={42} className="text-mm-gold mx-auto mb-3" />
        <p className="font-playfair text-xl font-bold mb-1">
          {pct >= 80 ? "Xuất sắc! 🎉" : pct >= 50 ? "Khá lắm! 💪" : "Cố lên, ôn thêm nhé! 🌱"}
        </p>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Đúng {correct}/{questions.length} câu ({pct}%)
        </p>
        <div className="flex gap-2 justify-center">
          {onExit && (
            <button onClick={onExit} className="btn-ghost border border-[rgba(255,255,255,0.1)]">
              Thoát
            </button>
          )}
          <button onClick={restart} className="btn-primary flex items-center gap-2">
            <RotateCcw size={15} /> Chơi lại
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[var(--text-muted)]">Câu {idx + 1}/{questions.length}</p>
        <p className="text-xs text-mm-gold font-semibold">✓ {correct}</p>
      </div>
      <div className="h-1.5 rounded-full bg-surface2 mb-6 overflow-hidden">
        <div
          className="h-full bg-mm-gold rounded-full transition-all duration-300"
          style={{ width: `${((idx + (picked ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="text-center mb-6">
        <button
          onClick={() => playTTS(q.item.front).catch(() => null)}
          className="inline-flex items-center gap-2 group"
          aria-label="Nghe phát âm"
        >
          {listening && !picked ? (
            <span className="w-20 h-20 rounded-full bg-mm-red/15 border border-mm-red/40 grid place-items-center text-mm-red">
              <Volume2 size={30} />
            </span>
          ) : (
            <>
              <span className="font-chinese text-4xl">{q.item.front}</span>
              <Volume2 size={18} className="text-[var(--text-muted)] group-hover:text-mm-gold transition-colors" />
            </>
          )}
        </button>
        {listening && !picked && (
          <p className="text-xs text-[var(--text-muted)] mt-2">Nghe và chọn nghĩa đúng 👂</p>
        )}
        {picked && q.item.pinyin && (
          <p className="text-mm-gold text-sm mt-2">{q.item.pinyin}</p>
        )}
      </div>

      {/* Choices */}
      <div className="space-y-2 mb-5">
        {q.choices.map((choice) => {
          const isCorrect = choice === q.item.back;
          const isPicked = choice === picked;
          return (
            <button
              key={choice}
              onClick={() => pick(choice)}
              disabled={!!picked}
              className={cn(
                "w-full text-left px-4 py-3 rounded-2xl border text-sm transition-all active:scale-[0.98]",
                !picked && "bg-surface border-[rgba(255,255,255,0.08)] hover:border-mm-gold/40",
                picked && isCorrect && "bg-green-500/15 border-green-500/50 text-green-300",
                picked && isPicked && !isCorrect && "bg-mm-red/15 border-mm-red/50 text-mm-red",
                picked && !isPicked && !isCorrect && "opacity-50 bg-surface border-[rgba(255,255,255,0.05)]"
              )}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {picked && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={next}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {idx + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp theo"} <ArrowRight size={16} />
        </motion.button>
      )}
    </div>
  );
}
