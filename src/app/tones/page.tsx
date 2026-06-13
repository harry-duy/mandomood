"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playTTS } from "@/hooks/useTTS";
import { Volume2, CheckCircle, XCircle, RefreshCw, ChevronRight } from "lucide-react";
import { cn, readJSON, writeJSON } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";

/* ─── Data ─── */
const TONE_INFO = [
  {
    tone: 1,
    name: "Thanh 1 — Bằng",
    symbol: "ā",
    color: "#E8634A",
    bg: "from-[#E8634A]/20 to-[#E8634A]/5",
    border: "border-[#E8634A]/40",
    desc: "Cao đều, kéo dài — như đang hát một nốt nhạc",
    mnemonic: "📏 Nằm ngang — giọng giữ cao không đổi",
    curve: "M 10,50 L 90,50",
  },
  {
    tone: 2,
    name: "Thanh 2 — Sắc",
    symbol: "á",
    color: "#D4AF37",
    bg: "from-[#D4AF37]/20 to-[#D4AF37]/5",
    border: "border-[#D4AF37]/40",
    desc: "Lên cao, như hỏi 'Hả?' bằng tiếng Việt",
    mnemonic: "📈 Đi lên — như khi hỏi ngạc nhiên",
    curve: "M 10,70 Q 50,40 90,15",
  },
  {
    tone: 3,
    name: "Thanh 3 — Hỏi",
    symbol: "ǎ",
    color: "#8FAF8F",
    bg: "from-[#8FAF8F]/20 to-[#8FAF8F]/5",
    border: "border-[#8FAF8F]/40",
    desc: "Xuống rồi lên lại — như chữ V, nghe lạ tai",
    mnemonic: "📉📈 Xuống rồi lên — chữ V, chán nản rồi hỏi lại",
    curve: "M 10,30 Q 50,80 90,20",
  },
  {
    tone: 4,
    name: "Thanh 4 — Nặng",
    symbol: "à",
    color: "#C9878A",
    bg: "from-[#C9878A]/20 to-[#C9878A]/5",
    border: "border-[#C9878A]/40",
    desc: "Xuống mạnh, dứt khoát — như ra lệnh",
    mnemonic: "📉 Xuống mạnh — như nói 'KHÔNG!' rất quyết",
    curve: "M 10,15 Q 50,50 90,75",
  },
  {
    tone: 5,
    name: "Thanh nhẹ (0)",
    symbol: "a",
    color: "#7AB8D4",
    bg: "from-[#7AB8D4]/20 to-[#7AB8D4]/5",
    border: "border-[#7AB8D4]/40",
    desc: "Ngắn, nhẹ, không có thanh — thường ở cuối câu",
    mnemonic: "⚬ Nhỏ nhẹ — không nhấn, nói nhanh qua",
    curve: "M 35,55 L 65,55",
  },
];

const TONE_PAIRS: { words: [string, string, string, string]; meaning: [string, string, string, string] }[] = [
  { words: ["māo", "máo", "mǎo", "mào"], meaning: ["Mèo 猫", "Lông/Mao 毛", "Buổi sáng 卯", "Mũ 帽"] },
  { words: ["tā", "tá", "tǎ", "tà"], meaning: ["Anh ấy 他", "Gạch 砖", "Cái tháp 塔", "Ngạ quỷ 魅"] },
  { words: ["mā", "má", "mǎ", "mà"], meaning: ["Mẹ 妈", "Lanh/Cây gai 麻", "Ngựa 马", "Mắng 骂"] },
  { words: ["shū", "shú", "shǔ", "shù"], meaning: ["Sách 书", "Chín/Quen 熟", "Chuột 鼠", "Cây/Số 树"] },
  { words: ["bō", "bó", "bǒ", "bò"], meaning: ["Sóng 波", "Bác học 博", "Bỏ/Ném 剥", "Bo 菠"] },
  { words: ["fēng", "féng", "fěng", "fèng"], meaning: ["Gió 风", "Gặp gỡ 逢", "Nhạo báng 讽", "Phụng 凤"] },
  { words: ["lí", "lǐ", "lì", "li"], meaning: ["Lê 梨", "Lý lẽ 理", "Lực 力", "Trợ từ 里"] },
  { words: ["yī", "yí", "yǐ", "yì"], meaning: ["Một 一", "Di chuyển 移", "Ghế 椅", "Ý nghĩa 意"] },
];

interface QuizQuestion {
  word: string;
  correct: number; // 1-4
  options: number[];
}

function generateQuiz(): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const pairs = [...TONE_PAIRS].sort(() => Math.random() - 0.5).slice(0, 6);
  for (const pair of pairs) {
    const correctTone = Math.floor(Math.random() * 4) + 1;
    const word = pair.words[correctTone - 1];
    const opts = [1, 2, 3, 4].sort(() => Math.random() - 0.5);
    questions.push({ word, correct: correctTone, options: opts });
  }
  return questions;
}

type Tab = "learn" | "pairs" | "quiz";

export default function TonesPage() {
  const [tab, setTab] = useState<Tab>("learn");
  const [activeTone, setActiveTone] = useState<number | null>(null);

  // Quiz state
  const { awardXP } = useProgress();
  const [quiz, setQuiz] = useState<QuizQuestion[]>(() => generateQuiz());
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Save best score + award XP khi hoàn thành quiz
  useEffect(() => {
    if (!finished) return;
    const pct = Math.round((score / quiz.length) * 100);
    const prev = readJSON<number>("mm_tones_best", 0);
    if (pct > prev) writeJSON("mm_tones_best", pct);
    awardXP(score * 5, "Luyện thanh điệu");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const handleAnswer = useCallback((tone: number) => {
    if (selected !== null) return;
    setSelected(tone);
    if (tone === quiz[qIndex].correct) setScore(s => s + 1);
  }, [selected, quiz, qIndex]);

  const nextQuestion = useCallback(() => {
    if (qIndex + 1 >= quiz.length) {
      setFinished(true);
    } else {
      setQIndex(i => i + 1);
      setSelected(null);
    }
  }, [qIndex, quiz.length]);

  const restartQuiz = useCallback(() => {
    setQuiz(generateQuiz());
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }, []);

  const TABS: { key: Tab; label: string }[] = [
    { key: "learn", label: "Học thanh điệu" },
    { key: "pairs", label: "Cặp tối nghĩa" },
    { key: "quiz", label: "Luyện tập" },
  ];

  return (
    <main className="min-h-screen pb-28 bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="sticky top-0 z-30 glass border-b border-[rgba(255,255,255,0.06)] px-4 py-4">
        <div className="max-w-xl mx-auto">
          <h1 className="font-display text-xl font-bold">Thanh Điệu Tiếng Trung</h1>
          <p className="text-xs text-[var(--text-muted)]">4 thanh + thanh nhẹ — nền tảng của tiếng Trung</p>
          {/* Tabs */}
          <div className="flex gap-1 mt-3 bg-[var(--bg-card)] rounded-2xl p-1">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex-1 py-1.5 text-xs rounded-xl font-medium transition-all",
                  tab === t.key
                    ? "bg-mm-red text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-white"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-5">

        {/* ── TAB 1: LEARN ── */}
        {tab === "learn" && (
          <div className="space-y-3">
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Tiếng Trung có 4 thanh điệu chính + 1 thanh nhẹ. Cùng một âm tiết nhưng khác thanh = nghĩa hoàn toàn khác.
            </p>
            {TONE_INFO.map((t, i) => {
              const isOpen = activeTone === t.tone;
              return (
                <motion.div
                  key={t.tone}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={cn("rounded-2xl border overflow-hidden", t.border, `bg-gradient-to-br ${t.bg}`)}
                >
                  <button
                    className="w-full flex items-center gap-4 px-4 py-4 text-left"
                    onClick={() => setActiveTone(isOpen ? null : t.tone)}
                  >
                    {/* Tone number */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl font-bold shrink-0"
                      style={{ background: `${t.color}22`, color: t.color }}>
                      {t.symbol}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{t.mnemonic}</div>
                    </div>
                    {/* Tone curve SVG */}
                    <svg width="60" height="40" viewBox="0 0 100 90" className="shrink-0 opacity-70">
                      <path d={t.curve} stroke={t.color} strokeWidth="4" fill="none" strokeLinecap="round" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3 border-t border-[rgba(255,255,255,0.06)]">
                          <p className="text-sm text-white/80 mt-3">{t.desc}</p>
                          {/* Example words for this tone */}
                          <div>
                            <p className="text-xs text-[var(--text-muted)] mb-2">Ví dụ:</p>
                            <div className="flex flex-wrap gap-2">
                              {TONE_PAIRS.slice(0, 4).map(pair => {
                                const w = pair.words[t.tone <= 4 ? t.tone - 1 : 0];
                                const m = pair.meaning[t.tone <= 4 ? t.tone - 1 : 0];
                                return (
                                  <button
                                    key={w}
                                    onClick={() => playTTS(w)}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-[rgba(255,255,255,0.06)] rounded-xl hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                                  >
                                    <span className="text-lg font-bold" style={{ color: t.color }}>{w}</span>
                                    <span className="text-xs text-[var(--text-muted)]">{m.split(' ')[0]}</span>
                                    <Volume2 size={11} className="text-[var(--text-muted)]" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── TAB 2: MINIMAL PAIRS ── */}
        {tab === "pairs" && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-muted)] mb-2">
              Các cặp âm giống nhau nhưng khác thanh — nhấn 🔊 để nghe và so sánh.
            </p>
            {TONE_PAIRS.map((pair, pi) => (
              <motion.div
                key={pi}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: pi * 0.05 }}
                className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[rgba(255,255,255,0.05)]"
              >
                <div className="grid grid-cols-4 gap-2">
                  {pair.words.map((w, wi) => {
                    const tone = TONE_INFO[wi];
                    return (
                      <button
                        key={w}
                        onClick={() => playTTS(w)}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                      >
                        <span className="text-lg font-bold" style={{ color: tone.color }}>{w}</span>
                        <span className="text-[9px] text-[var(--text-muted)] text-center leading-tight">{pair.meaning[wi]}</span>
                        <Volume2 size={11} style={{ color: tone.color }} className="opacity-60" />
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── TAB 3: QUIZ ── */}
        {tab === "quiz" && (
          <div>
            {!finished ? (
              <motion.div key={qIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                {/* Progress */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-1.5 bg-[var(--bg-card)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-mm-red rounded-full transition-all duration-500"
                      style={{ width: `${((qIndex) / quiz.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">{qIndex + 1}/{quiz.length}</span>
                </div>

                {/* Question */}
                <div className="text-center mb-8">
                  <p className="text-xs text-[var(--text-muted)] mb-4">Âm tiết này thuộc thanh mấy?</p>
                  <button
                    onClick={() => playTTS(quiz[qIndex].word)}
                    className="inline-flex flex-col items-center gap-3 p-6 bg-[var(--bg-card)] rounded-3xl border border-[rgba(255,255,255,0.08)] hover:border-mm-red/40 transition-all"
                  >
                    <span className="text-5xl font-bold">{quiz[qIndex].word}</span>
                    <div className="flex items-center gap-2 text-mm-red/80">
                      <Volume2 size={16} />
                      <span className="text-xs">Nhấn để nghe</span>
                    </div>
                  </button>
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-3">
                  {quiz[qIndex].options.map(opt => {
                    const tone = TONE_INFO[opt - 1];
                    const isCorrect = opt === quiz[qIndex].correct;
                    const isSelected = selected === opt;
                    const revealed = selected !== null;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        disabled={revealed}
                        className={cn(
                          "p-4 rounded-2xl border text-left transition-all",
                          !revealed && "hover:border-[rgba(255,255,255,0.2)] bg-[var(--bg-card)] border-[rgba(255,255,255,0.06)]",
                          revealed && isCorrect && "border-green-500 bg-green-500/15",
                          revealed && isSelected && !isCorrect && "border-red-500 bg-red-500/15",
                          revealed && !isSelected && !isCorrect && "bg-[var(--bg-card)] border-[rgba(255,255,255,0.04)] opacity-50",
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl font-bold" style={{ color: tone.color }}>{tone.symbol}</span>
                          <span className="text-xs font-semibold">Thanh {opt}</span>
                          {revealed && isCorrect && <CheckCircle size={14} className="text-green-400 ml-auto" />}
                          {revealed && isSelected && !isCorrect && <XCircle size={14} className="text-red-400 ml-auto" />}
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] leading-snug">{tone.mnemonic.split(' — ')[1]}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Next */}
                <AnimatePresence>
                  {selected !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 space-y-3"
                    >
                      <div className={cn(
                        "rounded-2xl p-3 text-sm text-center",
                        selected === quiz[qIndex].correct ? "bg-green-500/15 text-green-300" : "bg-red-500/15 text-red-300"
                      )}>
                        {selected === quiz[qIndex].correct
                          ? `✅ Đúng! "${quiz[qIndex].word}" là ${TONE_INFO[quiz[qIndex].correct - 1].name}`
                          : `❌ Sai. Đây là ${TONE_INFO[quiz[qIndex].correct - 1].name} — ${TONE_INFO[quiz[qIndex].correct - 1].desc}`
                        }
                      </div>
                      <button
                        onClick={nextQuestion} aria-label="Câu tiếp theo"
                        className="w-full py-3 bg-mm-red text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-mm-red/90 transition-colors"
                      >
                        {qIndex + 1 >= quiz.length ? "Xem kết quả" : "Câu tiếp"} <ChevronRight size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* Result screen */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-5"
              >
                <div className="text-6xl">{score >= 5 ? "🏆" : score >= 3 ? "👏" : "💪"}</div>
                <div>
                  <p className="text-3xl font-bold">{score}/{quiz.length}</p>
                  <p className="text-[var(--text-muted)] text-sm mt-1">
                    {score >= 5 ? "Xuất sắc! Tai nghe thanh điệu của bạn rất tốt!" :
                      score >= 3 ? "Khá tốt! Luyện thêm một chút nữa nhé." :
                        "Cần luyện thêm. Đừng nản — thanh điệu cần thời gian!"}
                  </p>
                </div>
                <button
                  onClick={restartQuiz}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-mm-red text-white rounded-2xl font-semibold hover:bg-mm-red/90 transition-colors"
                >
                  <RefreshCw size={16} /> Thử lại
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
