"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VocabItem {
  hanzi: string;
  pinyin: string;
  meaning: string;
}

interface MiniQuizProps {
  vocabulary: VocabItem[];
  onComplete?: (score: number, total: number) => void;
}

interface Question {
  hanzi: string;
  pinyin: string;
  correctAnswer: string;
  options: string[];
}

function buildQuestions(vocab: VocabItem[]): Question[] {
  if (vocab.length < 2) return [];

  // Tạo tối đa 3 câu hỏi
  const questions: Question[] = [];
  const shuffled = [...vocab].sort(() => Math.random() - 0.5);
  const count = Math.min(3, shuffled.length);

  for (let i = 0; i < count; i++) {
    const target = shuffled[i];
    const distractors = vocab
      .filter((v) => v.hanzi !== target.hanzi)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((v) => v.meaning);

    // Nếu không đủ distractors, thêm fake ones
    while (distractors.length < 3) {
      distractors.push(["không biết", "sai rồi", "thử lại"][distractors.length] ?? "—");
    }

    const options = [target.meaning, ...distractors].sort(() => Math.random() - 0.5);

    questions.push({
      hanzi: target.hanzi,
      pinyin: target.pinyin,
      correctAnswer: target.meaning,
      options,
    });
  }

  return questions;
}

export default function MiniQuiz({ vocabulary, onComplete }: MiniQuizProps) {
  const questions = useMemo(() => buildQuestions(vocabulary), [vocabulary]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  if (questions.length === 0) return null;

  const question = questions[currentQ];
  const isCorrect = selected === question.correctAnswer;

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);

    if (option === question.correctAnswer) {
      setScore((s) => s + 1);
      toast("✅ Chính xác! +10 XP", { duration: 1200 });
    } else {
      toast("❌ Sai rồi!", { duration: 1200 });
    }

    // Auto-advance sau 1.5s
    setTimeout(() => {
      if (currentQ + 1 >= questions.length) {
        setDone(true);
        onComplete?.(score + (option === question.correctAnswer ? 1 : 0), questions.length);
      } else {
        setCurrentQ((q) => q + 1);
        setSelected(null);
        setAnswered(false);
      }
    }, 1500);
  };

  const reset = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setDone(false);
  };

  if (!showQuiz) {
    return (
      <button
        onClick={() => setShowQuiz(true)}
        className={cn(
          "w-full py-3.5 rounded-2xl text-sm font-medium transition-all duration-300",
          "border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.05)]",
          "text-mm-gold hover:bg-[rgba(212,175,55,0.1)] hover:border-[rgba(212,175,55,0.4)]",
          "flex items-center justify-center gap-2"
        )}
      >
        <Trophy size={15} />
        Kiểm tra từ vựng ({questions.length} câu) · +{questions.length * 10} XP
      </button>
    );
  }

  return (
    <div className="bg-surface2 rounded-2xl p-5 border border-[rgba(255,255,255,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">
          Kiểm tra nhanh
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-mm-gold font-medium">
            {currentQ + 1}/{questions.length}
          </span>
          {/* Progress bar */}
          <div className="w-20 h-1 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-mm-gold transition-all duration-500"
              style={{ width: `${((currentQ + (answered ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Question */}
            <div className="text-center mb-5">
              <p className="font-chinese text-5xl font-bold text-mm-gold mb-1">
                {question.hanzi}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{question.pinyin}</p>
              <p className="text-sm text-[var(--text-muted)] mt-2">có nghĩa là gì?</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2">
              {question.options.map((opt) => {
                let optState: "default" | "correct" | "wrong" | "missed" = "default";
                if (answered) {
                  if (opt === question.correctAnswer) optState = "correct";
                  else if (opt === selected) optState = "wrong";
                  else optState = "missed"; // Options khác — mờ đi
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    disabled={answered}
                    className={cn(
                      "px-3 py-3 rounded-xl text-sm font-medium text-left transition-all duration-200",
                      "border leading-snug",
                      optState === "default" && "bg-surface border-[rgba(255,255,255,0.08)] text-[#F5F0EB] hover:border-mm-red/40 hover:bg-[rgba(232,80,74,0.05)]",
                      optState === "correct" && "bg-[rgba(143,175,143,0.2)] border-[#8FAF8F] text-[#8FAF8F]",
                      optState === "wrong" && "bg-[rgba(232,80,74,0.15)] border-mm-red text-mm-red",
                      optState === "missed" && "opacity-40"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {answered && optState === "correct" && <CheckCircle2 size={13} />}
                      {answered && optState === "wrong" && <XCircle size={13} />}
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* Done screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="text-5xl mb-3">
              {score === questions.length ? "🏆" : score >= questions.length / 2 ? "🌸" : "💪"}
            </div>
            <p className="font-semibold text-lg mb-1">
              {score}/{questions.length} câu đúng
            </p>
            <p className="text-sm text-[var(--text-muted)] mb-1">
              {score === questions.length
                ? "Tuyệt vời! Bạn thuộc hết rồi!"
                : score >= questions.length / 2
                ? "Khá tốt! Ôn thêm một chút nha."
                : "Tiếp tục luyện tập nhé!"}
            </p>
            <p className="text-mm-gold text-sm font-semibold mb-4">
              +{score * 10} XP đã nhận
            </p>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-white mx-auto transition-colors"
            >
              <RotateCcw size={12} />
              Làm lại
            </button>
              </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
