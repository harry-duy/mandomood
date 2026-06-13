"use client";

/**
 * StoryQuiz — quiz hiểu nhanh sau khi đọc truyện.
 * Lấy 3 từ vựng ngẫu nhiên, hỏi nghĩa với 4 lựa chọn (nhiễu lấy từ các từ khác).
 * Trả lời xong cộng XP qua useProgress (hoạt động cả khi chưa đăng nhập — cộng local).
 * Triết lý MandoMood: kiểm tra nhẹ nhàng, khích lệ, không "bài tập cứng nhắc".
 */

import { useMemo, useState } from "react";
import { CheckCircle, XCircle, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";

interface Vocab {
  hanzi: string;
  pinyin: string;
  meaning: string;
}

interface Question {
  hanzi: string;
  pinyin: string;
  answer: string;
  options: string[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(vocab: Vocab[]): Question[] {
  // Cần tối thiểu 4 nghĩa phân biệt để có 4 lựa chọn.
  const uniq = vocab.filter(
    (v, i, arr) => v.meaning && arr.findIndex((x) => x.meaning === v.meaning) === i
  );
  if (uniq.length < 4) return [];
  const picks = shuffle(uniq).slice(0, Math.min(3, uniq.length));
  return picks.map((p) => {
    const distractors = shuffle(uniq.filter((v) => v.meaning !== p.meaning))
      .slice(0, 3)
      .map((v) => v.meaning);
    return {
      hanzi: p.hanzi,
      pinyin: p.pinyin,
      answer: p.meaning,
      options: shuffle([p.meaning, ...distractors]),
    };
  });
}

export default function StoryQuiz({ vocabulary }: { vocabulary: Vocab[] }) {
  const questions = useMemo(() => buildQuestions(vocabulary), [vocabulary]);
  const { awardXP } = useProgress();

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  if (questions.length === 0) return null;

  const q = questions[idx];

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    const isRight = opt === q.answer;
    if (isRight) setCorrect((c) => c + 1);
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        const finalCorrect = correct + (isRight ? 1 : 0);
        const xp = finalCorrect * 5;
        if (xp > 0) void awardXP(xp, "story_quiz");
        setDone(true);
      } else {
        setIdx((i) => i + 1);
        setPicked(null);
      }
    }, 700);
  };

  const restart = () => {
    setIdx(0);
    setPicked(null);
    setCorrect(0);
    setDone(false);
  };

  if (done) {
    const xp = correct * 5;
    return (
      <div className="card text-center">
        <div className="text-4xl mb-2">{correct === questions.length ? "🏆" : correct > 0 ? "🎉" : "💪"}</div>
        <p className="font-semibold mb-1">
          Đúng {correct}/{questions.length}
        </p>
        {xp > 0 && (
          <p className="text-sm text-mm-gold flex items-center justify-center gap-1 mb-3">
            <Sparkles size={14} /> +{xp} XP
          </p>
        )}
        <button
          onClick={restart}
          className="inline-flex items-center gap-1.5 text-xs bg-surface2 text-[var(--text-muted)] hover:text-white px-4 py-2 rounded-full transition-colors"
        >
          <RotateCcw size={13} /> Làm lại
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-mm-gold uppercase tracking-widest font-semibold">
          Quiz hiểu nhanh
        </p>
        <span className="text-xs text-[var(--text-muted)]">
          {idx + 1}/{questions.length}
        </span>
      </div>

      <p className="text-sm text-[var(--text-muted)] mb-1">Từ này nghĩa là gì?</p>
      <p className="font-chinese text-3xl font-bold mb-1">{q.hanzi}</p>
      <p className="text-xs text-mm-gold/70 mb-4">{q.pinyin}</p>

      <div className="grid grid-cols-1 gap-2">
        {q.options.map((opt) => {
          const isAnswer = opt === q.answer;
          const isPicked = opt === picked;
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              disabled={!!picked}
              className={cn(
                "flex items-center justify-between gap-2 text-left text-sm px-4 py-3 rounded-2xl border transition-all",
                !picked && "bg-surface2 border-[rgba(255,255,255,0.08)] hover:border-mm-red/40",
                picked && isAnswer && "bg-green-500/20 border-green-500/40 text-green-400",
                picked && isPicked && !isAnswer && "bg-mm-red/20 border-mm-red/40 text-mm-red",
                picked && !isAnswer && !isPicked && "opacity-50 border-transparent"
              )}
            >
              <span>{opt}</span>
              {picked && isAnswer && <CheckCircle size={16} />}
              {picked && isPicked && !isAnswer && <XCircle size={16} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
