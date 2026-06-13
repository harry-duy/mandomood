"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { playTTS } from "@/hooks/useTTS";
import {
  Volume2, Download, BookOpen, GraduationCap,
  BarChart2, Star, Flame, Trophy, RefreshCw, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import QuickAddCard from "@/components/ui/QuickAddCard";

interface SavedQuote {
  _id: string;
  chinese_text: string;
  pinyin?: string;
  translation: string;
  author?: string;
  mood?: string;
}
interface VocabWord {
  _id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  mastery: number;
  next_review?: string;
  repetitions?: number;
}
interface Progress {
  xp: number;
  streak_days: number;
  level: string;
  weekly_xp: number;
  lessons_completed?: number;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Người mới", hsk1: "HSK 1", hsk2: "HSK 2",
  hsk3: "HSK 3", hsk4: "HSK 4", hsk5: "HSK 5", hsk6: "HSK 6",
};
const MOOD_COLORS: Record<string, string> = {
  romantic: "#E8634A", healing: "#8FAF8F", motivation: "#7AB8D4",
  aesthetic: "#D4AF37", sad: "#9B8BBF", funny: "#E8A838",
};

type Tab = "summary" | "quotes" | "vocab" | "export";

export default function ReviewPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("summary");
  const [progress, setProgress] = useState<Progress | null>(null);
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [vocab, setVocab] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) { setLoading(false); return; }
    Promise.all([
      fetch("/api/user/progress").then(r => r.json()),
      fetch("/api/user/saved-quotes").then(r => r.json()),
      fetch("/api/user/vocabulary?filter=all").then(r => r.json()),
    ]).then(([prog, q, v]) => {
      setProgress(prog);
      setQuotes(Array.isArray(q) ? q : q.saved_quotes ?? q.quotes ?? []);
      setVocab(Array.isArray(v) ? v : v.cards ?? v.words ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [session]);

  /* ── Export as plain text ── */
  const handleExport = () => {
    const lines: string[] = [
      "=== MandoMood — Tổng hợp học tập ===",
      `Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`,
      "",
      "── CÂU NÓI HAY ĐÃ LƯU ──",
      ...quotes.map(q => `${q.chinese_text}\n${q.pinyin ?? ""}\n${q.translation}\n`),
      "",
      "── TỪ VỰNG ĐÃ HỌC ──",
      ...vocab.map(v => `${v.hanzi}  ${v.pinyin}  ${v.meaning}  (Mastery: ${v.mastery}/5)`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `mandomood-review-${new Date().toISOString().slice(0,10)}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  /** Xuất CSV theo định dạng Anki: Hanzi [tab] Pinyin [tab] Nghĩa [tab] Tags */
  const handleExportCSV = () => {
    const date = new Date().toISOString().slice(0, 10);
    const rows: string[] = [
      // Header comment (Anki bỏ qua dòng #)
      `#separator:tab`,
      `#html:false`,
      `#deck:MandoMood Export ${date}`,
      `#notetype:Basic (and reversed card)`,
    ];

    // Từ vựng từ bộ thẻ tùy chỉnh
    vocab.forEach(v => {
      const front = `${v.hanzi}${v.pinyin ? ` (${v.pinyin})` : ""}`;
      const back  = v.meaning;
      rows.push(`${front}\t${back}\tMandoMood vocab`);
    });

    // Câu nói hay đã lưu (front = hanzi, back = dịch)
    quotes.forEach(q => {
      const front = q.chinese_text;
      const back  = `${q.pinyin ? q.pinyin + "\n" : ""}${q.translation}`;
      rows.push(`${front}\t${back}\tMandoMood quotes`);
    });

    const blob = new Blob([rows.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `mandomood-anki-${date}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "summary", label: "Tổng quan", icon: <BarChart2 size={13} /> },
    { key: "quotes",  label: `Câu (${quotes.length})`,  icon: <Star size={13} /> },
    { key: "vocab",   label: `Từ (${vocab.length})`,   icon: <BookOpen size={13} /> },
    { key: "export",  label: "Xuất file", icon: <Download size={13} /> },
  ];

  if (!session?.user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-5 px-6">
        <Lock size={32} className="text-mm-red/50" />
        <div className="text-center">
          <h2 className="font-display text-xl font-bold mb-2">Đăng nhập để xem tổng hợp</h2>
          <p className="text-sm text-[var(--text-muted)]">Lưu tiến trình học, từ vựng và câu nói hay của bạn</p>
        </div>
        <button onClick={() => router.push("/login")}
          className="px-8 py-3 bg-mm-red text-white rounded-2xl font-semibold hover:bg-mm-red/90 transition-colors">
          Đăng nhập
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-28 bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="sticky top-0 z-30 glass border-b border-[rgba(255,255,255,0.06)] px-4 py-4">
        <div className="max-w-xl mx-auto">
          <h1 className="font-display text-xl font-bold">Tổng hợp học tập</h1>
          <p className="text-xs text-[var(--text-muted)]">Mọi thứ bạn đã học trong MandoMood</p>
          {/* Tabs */}
          <div className="flex gap-1 mt-3 bg-[var(--bg-card)] rounded-2xl p-1">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] rounded-xl font-medium transition-all",
                  tab === t.key ? "bg-mm-red text-white" : "text-[var(--text-muted)] hover:text-white"
                )}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-5">
        <AnimatePresence mode="wait">

          {/* ── TAB: SUMMARY ── */}
          {tab === "summary" && (
            <motion.div key="summary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_,i) => (
                    <div key={i} className="h-24 bg-[var(--bg-card)] rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : progress ? (
                <>
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: <Trophy size={20} className="text-mm-gold" />, value: progress.xp.toLocaleString(), label: "Tổng XP", color: "text-mm-gold" },
                      { icon: <Flame size={20} className="text-mm-red" />, value: `${progress.streak_days} ngày`, label: "Streak hiện tại", color: "text-mm-red" },
                      { icon: <GraduationCap size={20} className="text-blue-400" />, value: LEVEL_LABELS[progress.level] ?? progress.level, label: "Cấp độ", color: "text-blue-400" },
                      { icon: <BarChart2 size={20} className="text-green-400" />, value: progress.weekly_xp ?? 0, label: "XP tuần này", color: "text-green-400" },
                    ].map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                        className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[rgba(255,255,255,0.05)]">
                        {s.icon}
                        <div className={cn("text-xl font-bold mt-2", s.color)}>{s.value}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Content stats */}
                  <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[rgba(255,255,255,0.05)] space-y-3">
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Nội dung đã tích lũy</p>
                    {[
                      { label: "Câu nói hay đã lưu", value: quotes.length, max: 50, color: "bg-mm-red" },
                      { label: "Từ vựng trong bộ thẻ", value: vocab.length, max: 200, color: "bg-blue-400" },
                      { label: "Từ đã thành thạo (mastery 4-5)", value: vocab.filter(v => v.mastery >= 4).length, max: vocab.length || 1, color: "bg-green-400" },
                    ].map((s, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[var(--text-muted)]">{s.label}</span>
                          <span className="font-semibold">{s.value}</span>
                        </div>
                        <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (s.value / s.max) * 100)}%` }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                            className={cn("h-full rounded-full", s.color)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => router.push("/flashcards")}
                      className="flex items-center gap-2 p-3 bg-[var(--bg-card)] rounded-2xl border border-[rgba(255,255,255,0.05)] text-sm hover:border-mm-red/30 transition-colors">
                      <GraduationCap size={16} className="text-mm-red shrink-0" />
                      <span>Ôn flashcard ngay</span>
                    </button>
                    <button onClick={() => router.push("/hsk")}
                      className="flex items-center gap-2 p-3 bg-[var(--bg-card)] rounded-2xl border border-[rgba(255,255,255,0.05)] text-sm hover:border-green-500/30 transition-colors">
                      <BookOpen size={16} className="text-green-400 shrink-0" />
                      <span>Học từ HSK mới</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-[var(--text-muted)]">
                  <RefreshCw size={24} className="mx-auto mb-3 animate-spin opacity-40" />
                  <p className="text-sm">Đang tải dữ liệu...</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── TAB: SAVED QUOTES ── */}
          {tab === "quotes" && (
            <motion.div key="quotes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              {loading ? (
                [...Array(3)].map((_,i) => <div key={i} className="h-28 bg-[var(--bg-card)] rounded-2xl animate-pulse" />)
              ) : quotes.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <p className="text-4xl">💭</p>
                  <p className="text-sm text-[var(--text-muted)]">Chưa có câu nói nào được lưu</p>
                  <button onClick={() => router.push("/")} className="text-mm-red text-sm hover:underline">
                    Khám phá Daily Quote →
                  </button>
                </div>
              ) : (
                quotes.map((q, i) => (
                  <motion.div key={q._id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[rgba(255,255,255,0.04)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {q.mood && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full mb-2 inline-block"
                            style={{ background: `${MOOD_COLORS[q.mood] ?? "#888"}20`, color: MOOD_COLORS[q.mood] ?? "#888" }}>
                            {q.mood}
                          </span>
                        )}
                        <p className="text-lg font-bold leading-snug">{q.chinese_text}</p>
                        {q.pinyin && <p className="text-xs text-mm-red/70 mt-0.5">{q.pinyin}</p>}
                        <p className="text-sm text-[var(--text-muted)] mt-1">{q.translation}</p>
                        {q.author && <p className="text-xs text-[rgba(255,255,255,0.3)] mt-1">— {q.author}</p>}
                      </div>
                      <button onClick={() => playTTS(q.chinese_text)}
                        className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.08)] shrink-0">
                        <Volume2 size={15} className="text-mm-red/60" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* ── TAB: VOCAB ── */}
          {tab === "vocab" && (
            <motion.div key="vocab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <div className="mb-3">
                <QuickAddCard
                  onAdded={() =>
                    fetch("/api/user/vocabulary?filter=all")
                      .then((r) => r.json())
                      .then((v) => setVocab(Array.isArray(v) ? v : v.cards ?? v.words ?? []))
                      .catch(() => {})
                  }
                />
              </div>
              {loading ? (
                [...Array(5)].map((_,i) => <div key={i} className="h-14 bg-[var(--bg-card)] rounded-2xl animate-pulse" />)
              ) : vocab.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <p className="text-4xl">📚</p>
                  <p className="text-sm text-[var(--text-muted)]">Chưa có từ vựng nào trong bộ thẻ</p>
                  <button onClick={() => router.push("/feed")} className="text-mm-red text-sm hover:underline">
                    Học bài và thêm từ vựng →
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 text-xs text-[var(--text-muted)] mb-3">
                    <span>{vocab.length} từ tổng cộng</span>
                    <span>·</span>
                    <span className="text-green-400">{vocab.filter(v=>v.mastery>=4).length} thành thạo</span>
                    <span>·</span>
                    <span className="text-yellow-400">{vocab.filter(v=>v.mastery<4 && v.mastery>0).length} đang học</span>
                  </div>
                  {/* Sort: due first, then by mastery */}
                  {[...vocab].sort((a,b) => (a.mastery ?? 0) - (b.mastery ?? 0)).map((v, i) => (
                    <motion.div key={v._id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                      className="flex items-center gap-3 bg-[var(--bg-card)] rounded-2xl px-4 py-3 border border-[rgba(255,255,255,0.04)]"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-lg font-bold">{v.hanzi}</span>
                        <span className="text-xs text-mm-red/70 ml-2">{v.pinyin}</span>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{v.meaning}</p>
                      </div>
                      {/* Mastery dots */}
                      <div className="flex gap-0.5 shrink-0">
                        {[1,2,3,4,5].map(d => (
                          <div key={d} className={cn("w-2 h-2 rounded-full",
                            d <= (v.mastery ?? 0) ? "bg-mm-gold" : "bg-[rgba(255,255,255,0.1)]")} />
                        ))}
                      </div>
                      <button onClick={() => playTTS(v.hanzi)}
                        className="p-1.5 rounded-full hover:bg-[rgba(255,255,255,0.08)] shrink-0">
                        <Volume2 size={13} className="text-[var(--text-muted)]" />
                      </button>
                    </motion.div>
                  ))}
                </>
              )}
            </motion.div>
          )}

          {/* ── TAB: EXPORT ── */}
          {tab === "export" && (
            <motion.div key="export" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[rgba(255,255,255,0.05)] space-y-4">
                <div>
                  <h3 className="font-semibold text-sm mb-1">📄 Xuất file .txt</h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Tải xuống toàn bộ câu nói hay + từ vựng dưới dạng file text. Dùng để ôn tập offline hoặc import vào Anki.
                  </p>
                </div>
                <div className="text-xs text-[var(--text-muted)] space-y-1">
                  <div className="flex justify-between"><span>Câu nói đã lưu</span><span className="font-semibold text-white">{quotes.length}</span></div>
                  <div className="flex justify-between"><span>Từ vựng trong bộ thẻ</span><span className="font-semibold text-white">{vocab.length}</span></div>
                </div>
                <button onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-mm-red text-white rounded-2xl font-semibold hover:bg-mm-red/90 transition-colors">
                  <Download size={16} /> Tải xuống .txt
                </button>
              </div>

              {/* Anki tip */}
              <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-4 border border-[rgba(255,255,255,0.05)]">
                <p className="text-xs font-semibold mb-2">💡 Import vào Anki</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Sau khi tải file .txt, mở Anki → File → Import → chọn file → chọn separator là tab.
                  Format: <code className="text-mm-gold bg-[rgba(255,255,255,0.06)] px-1 rounded">Hanzi [tab] Pinyin [tab] Nghĩa</code>
                </p>
              </div>

              {/* CSV — Anki format */}
              <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-5 border border-[rgba(255,255,255,0.05)] space-y-4">
                <div>
                  <h3 className="font-semibold text-sm mb-1">📊 Xuất CSV cho Anki</h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Tải xuống file .txt tab-separated tương thích Anki — chứa cả câu hay lẫn từ vựng, kèm tag riêng biệt.
                  </p>
                </div>
                <div className="text-xs text-[var(--text-muted)] space-y-1">
                  <div className="flex justify-between"><span>Từ vựng (bộ thẻ)</span><span className="font-semibold text-white">{vocab.length} từ</span></div>
                  <div className="flex justify-between"><span>Câu nói hay</span><span className="font-semibold text-white">{quotes.length} câu</span></div>
                  <div className="flex justify-between"><span>Tổng thẻ Anki</span><span className="font-semibold text-white">{vocab.length + quotes.length}</span></div>
                </div>
                <button onClick={handleExportCSV}
                  disabled={vocab.length + quotes.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#D4AF37] text-black rounded-2xl font-semibold hover:bg-[#c9a22e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <Download size={16} /> Tải xuống Anki CSV
                </button>
                <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3 border border-[rgba(255,255,255,0.05)]">
                  <p className="text-xs font-semibold mb-1.5">📖 Cách import vào Anki</p>
                  <ol className="text-xs text-[var(--text-muted)] space-y-1 list-decimal list-inside">
                    <li>Mở Anki → File → Import</li>
                    <li>Chọn file vừa tải (mandomood-anki-...txt)</li>
                    <li>Separator: Tab | Fields: 3</li>
                    <li>Nhấn Import — xong!</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
