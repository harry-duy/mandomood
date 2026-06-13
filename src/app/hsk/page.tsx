"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { playTTS } from "@/hooks/useTTS";
import { Volume2, ChevronDown, BookOpen, Star, Lock, Search, ListChecks } from "lucide-react";
import { cn, readJSON, writeJSON } from "@/lib/utils";
import { saveWord, isWordSaved } from "@/lib/savedWords";
import { toast } from "sonner";
import { HSK_DATA } from "@/lib/hsk-data";
import VocabQuiz from "@/components/ui/VocabQuiz";
import MatchGame from "@/components/ui/MatchGame";
import { useProgress } from "@/hooks/useProgress";


const LEVEL_INFO = [
  { level: 1, label: "HSK 1", color: "from-green-500 to-emerald-400", words: 150, desc: "Cơ bản nhất", free: true },
  { level: 2, label: "HSK 2", color: "from-teal-500 to-cyan-400", words: 300, desc: "Giao tiếp đơn giản", free: true },
  { level: 3, label: "HSK 3", color: "from-blue-500 to-indigo-400", words: 600, desc: "Giao tiếp hàng ngày", free: true },
  { level: 4, label: "HSK 4", color: "from-violet-500 to-purple-400", words: 1200, desc: "Thành thạo", free: false },
  { level: 5, label: "HSK 5", color: "from-pink-500 to-rose-400", words: 2500, desc: "Nâng cao", free: false },
  { level: 6, label: "HSK 6", color: "from-mm-red to-orange-400", words: 5000, desc: "Gần như bản địa", free: false },
];

export default function HSKPage() {
  const { awardXP } = useProgress();
  const searchParams = useSearchParams();
  const [activeLevel, setActiveLevel] = useState(() => {
    const lp = searchParams?.get("level"); // e.g. "hsk2"
    const m = /hsk(\d)/.exec(lp ?? "");
    return m ? Number(m[1]) : 1;
  });
  const [expandedWord, setExpandedWord] = useState<string | null>(null);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizKind, setQuizKind] = useState<"read" | "listen" | "match">("read");

  const router = useRouter();

  const [query, setQuery] = useState("");
  const [savedTick, setSavedTick] = useState(0); // tăng sau mỗi lần lưu để cập nhật icon

  const allWords = useMemo(() => HSK_DATA[activeLevel] ?? [], [activeLevel]);
  const info = LEVEL_INFO.find(l => l.level === activeLevel)!;

  // Bo dau tieng Viet → tim "nhi hao" van ra "nhĩ hảo"
  const fold = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");

  const words = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return allWords;
    return allWords.filter(
      (w) =>
        w.hanzi.includes(query.trim()) ||
        fold(w.pinyin).replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        fold(w.meaning).includes(q) ||
        (w.hanViet && fold(w.hanViet).includes(q))
    );
  }, [allWords, query]);

  return (
    <main className="min-h-screen pb-28 bg-[var(--bg-primary)]">
      <div className="sticky top-0 z-30 glass border-b border-[rgba(255,255,255,0.06)] px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold">Từ vựng HSK</h1>
            <p className="text-xs text-[var(--text-muted)]">Danh sách chuẩn theo cấp độ</p>
          </div>
          <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuiz(q => !q)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1",
              showQuiz
                ? "border-mm-gold text-mm-gold bg-mm-gold/10"
                : "border-[rgba(255,255,255,0.1)] text-[var(--text-muted)]"
            )}
          >
            <ListChecks size={12} /> Quiz
          </button>
          <button
            onClick={() => setShowPinyin(p => !p)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all",
              showPinyin
                ? "border-mm-red text-mm-red bg-mm-red/10"
                : "border-[rgba(255,255,255,0.1)] text-[var(--text-muted)]"
            )}
          >
            拼音
          </button>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Level Selector */}
        <div className="grid grid-cols-3 gap-2">
          {LEVEL_INFO.map(({ level, label, color, words: wCount, desc, free }) => (
            <button
              key={level}
              onClick={() => { setActiveLevel(level); setExpandedWord(null); setShowQuiz(false); }}
              className={cn(
                "relative rounded-2xl p-3 text-left transition-all border",
                activeLevel === level
                  ? "border-transparent ring-2 ring-mm-red/60 scale-[1.02]"
                  : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)]",
                "bg-[var(--bg-card)]"
              )}
            >
              {!free && (
                <Lock size={10} className="absolute top-2 right-2 text-[var(--text-muted)]" />
              )}
              <div className={cn("text-xs font-bold bg-gradient-to-r bg-clip-text text-transparent", color)}>
                {label}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{desc}</div>
              <div className="text-[9px] text-[var(--text-muted)] mt-1">
                {(HSK_DATA[level] ?? []).length}/{wCount} từ
              </div>
              {/* Tiến độ kho từ trong app so với chuẩn HSK */}
              <div className="mt-1 h-1 rounded bg-white/10 overflow-hidden">
                <div
                  className={cn("h-full rounded bg-gradient-to-r", color)}
                  style={{ width: `${Math.min(100, Math.round(((HSK_DATA[level] ?? []).length / wCount) * 100))}%` }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Level banner */}
        <div className={cn("rounded-2xl p-4 bg-gradient-to-r text-white", info.color)}>
          <div className="flex items-center gap-3">
            <BookOpen size={22} className="opacity-80" />
            <div>
              <div className="font-bold text-sm">{info.label} — {info.desc}</div>
              <div className="text-xs opacity-80">
                {info.words} từ vựng chuẩn • {allWords.length} từ trong app
                {allWords.length >= info.words && " — đủ chuẩn ✓"}
              </div>
            </div>
          </div>
        </div>

        {/* Tim kiem: hanzi / pinyin / nghia / am Han Viet (kieu nhaikanji) */}
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo âm Hán Việt, nghĩa, pinyin… (vd: ái, nhẫn nại)"
            aria-label="Tìm từ vựng"
            className="input pl-10 !rounded-2xl"
          />
        </div>
        {query.trim() && words.length > 0 && (
          <p className="text-xs text-[var(--text-muted)] -mt-3 px-1">
            Tìm thấy {words.length} từ trong {info.label}
          </p>
        )}

        {/* Quiz trac nghiem cho level hien tai */}
        {showQuiz && (
          <div className="card !p-5">
            <div className="flex items-center gap-2 mb-4">
              {([
                { k: "read", label: "📖 Đọc" },
                { k: "listen", label: "👂 Nghe" },
                { k: "match", label: "⚡ Ghép đôi" },
              ] as const).map(({ k, label }) => (
                <button
                  key={k}
                  onClick={() => setQuizKind(k)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border transition-all",
                    quizKind === k
                      ? "border-mm-gold text-mm-gold bg-mm-gold/10"
                      : "border-[rgba(255,255,255,0.1)] text-[var(--text-muted)]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {quizKind === "match" ? (
              <MatchGame
                key={`match-${activeLevel}`}
                items={allWords.map((w) => ({ front: w.hanzi, back: w.meaning, pinyin: w.pinyin }))}
                onExit={() => setShowQuiz(false)}
              />
            ) : (
              <VocabQuiz
                key={`quiz-${activeLevel}-${quizKind}`}
                items={allWords.map((w) => ({ front: w.hanzi, back: w.meaning, pinyin: w.pinyin }))}
                listening={quizKind === "listen"}
                onDone={(correct, total) => {
                  // Luu diem tot nhat cho trang Lo trinh
                  const pct = Math.round((correct / total) * 100);
                  const best = readJSON<Record<string, number>>("mm_hsk_quiz_best", {});
                  if (pct > (best[activeLevel] ?? 0)) {
                    writeJSON("mm_hsk_quiz_best", { ...best, [activeLevel]: pct });
                  }
                  awardXP(Math.max(10, correct * 5), "HSK quiz");
                }}
                onExit={() => setShowQuiz(false)}
              />
            )}
          </div>
        )}

        {/* Word list */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLevel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {words.length === 0 && (
              <p className="text-center py-8 text-sm text-[var(--text-muted)]">
                Không tìm thấy từ nào cho &ldquo;{query}&rdquo; trong {info.label}
              </p>
            )}
            {words.map((word, i) => {
              const isOpen = expandedWord === word.hanzi;
              return (
                <motion.div
                  key={word.hanzi}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025 }}
                  className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.04)]"
                >
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    onClick={() => setExpandedWord(isOpen ? null : word.hanzi)}
                  >
                    <span className="text-[10px] text-[var(--text-muted)] w-5 shrink-0 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-bold leading-tight">{word.hanzi}</div>
                      {showPinyin && (
                        <div className="text-[11px] text-mm-red/80 mt-0.5">{word.pinyin}</div>
                      )}
                      {word.hanViet && (
                        <div className="text-[10px] text-mm-gold/80 mt-0.5 italic">HV: {word.hanViet}</div>
                      )}
                    </div>
                    <div className="text-sm text-[var(--text-muted)] flex-1 text-right truncate">{word.meaning}</div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={e => { e.stopPropagation(); playTTS(word.hanzi); }}
                        className="p-1.5 rounded-full hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                      >
                        <Volume2 size={13} className="text-[var(--text-muted)]" />
                      </button>
                      <ChevronDown
                        size={13}
                        className={cn("text-[var(--text-muted)] transition-transform", isOpen && "rotate-180")}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && word.example && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-[rgba(255,255,255,0.04)]">
                          <p className="text-xs text-[var(--text-muted)] mt-2 mb-1">Ví dụ:</p>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm text-white/90">{word.example}</p>
                            <button
                              onClick={() => playTTS(word.example!)}
                              className="p-1.5 rounded-full hover:bg-[rgba(255,255,255,0.08)] shrink-0"
                            >
                              <Volume2 size={12} className="text-mm-red/70" />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center gap-4">
                            <button
                              onClick={() => router.push(`/character/${encodeURIComponent(word.hanzi[0])}`)}
                              className="text-[10px] text-mm-red/70 hover:text-mm-red flex items-center gap-1"
                            >
                              <Star size={9} /> Xem chi tiết ký tự
                            </button>
                            {/* Lưu vào sổ tay → ôn SRS ở /flashcards (đồng bộ pattern /search) */}
                            <button
                              onClick={async () => {
                                if (isWordSaved(word.hanzi)) { toast("Từ này đã có trong sổ tay", { duration: 1500 }); return; }
                                await saveWord({ hanzi: word.hanzi, pinyin: word.pinyin, meaning: word.meaning, example: word.example });
                                setSavedTick((t) => t + 1);
                                toast("📒 Đã lưu vào sổ tay!", { duration: 1500 });
                              }}
                              className={cn(
                                "text-[10px] flex items-center gap-1 transition-colors",
                                savedTick >= 0 && isWordSaved(word.hanzi)
                                  ? "text-[#E8A838]"
                                  : "text-[var(--text-muted)] hover:text-[#E8A838]"
                              )}
                            >
                              📒 {isWordSaved(word.hanzi) ? "Đã trong sổ tay" : "Lưu vào sổ tay"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Premium CTA */}
        {!info.free && (
          <div className="rounded-2xl p-5 bg-gradient-to-r from-mm-red/10 to-violet-500/10 border border-mm-red/20 text-center">
            <Lock size={20} className="mx-auto mb-2 text-mm-red/60" />
            <p className="text-sm font-semibold mb-1">Mở khóa toàn bộ {info.label}</p>
            <p className="text-xs text-[var(--text-muted)] mb-3">{info.words} từ vựng + bài tập + TTS</p>
            <button
              onClick={() => router.push("/pricing")}
              className="px-6 py-2 bg-mm-red text-white text-sm font-semibold rounded-full hover:bg-mm-red/90 transition-colors"
            >
              Nâng cấp Premium
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
