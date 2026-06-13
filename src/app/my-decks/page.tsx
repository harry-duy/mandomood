/**
 * /my-decks — Bộ flashcard tự tạo (kiểu Quizlet/OpenQuiz)
 * Tạo bộ thẻ riêng → thêm thẻ (tay hoặc AI từ văn bản) → học SRS hoặc quiz trắc nghiệm.
 * Lưu localStorage, hoạt động offline, không cần đăng nhập.
 */
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, ArrowLeft, Volume2, Layers, GraduationCap, X, Sparkles, ListChecks, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { playTTS } from "@/hooks/useTTS";
import { useProgress } from "@/hooks/useProgress";
import { autoSyncOncePerSession } from "@/lib/cloudSync";
import VocabQuiz from "@/components/ui/VocabQuiz";
import MatchGame from "@/components/ui/MatchGame";
import {
  type CustomDeck, type CustomCard,
  getDecks, createDeck, deleteDeck, addCard, removeCard, getDueCards, gradeCard,
} from "@/lib/customDecks";

const DECK_EMOJIS = ["📚", "🌸", "🔥", "💼", "🎬", "🍜", "✈️", "💖"];

const QUALITY_BUTTONS = [
  { q: 5, label: "Dễ quá!", cls: "bg-green-500/20 border-green-500/40 text-green-400", icon: "🚀" },
  { q: 4, label: "Nhớ rồi", cls: "bg-emerald-500/15 border-emerald-500/35 text-emerald-300", icon: "✅" },
  { q: 2, label: "Khó nhớ", cls: "bg-yellow-500/20 border-yellow-500/40 text-yellow-400", icon: "😅" },
  { q: 0, label: "Quên rồi", cls: "bg-mm-red/20 border-mm-red/40 text-mm-red", icon: "😭" },
];

type View =
  | { name: "list" }
  | { name: "deck"; deckId: string }
  | { name: "study"; deckId: string }
  | { name: "quiz"; deckId: string }
  | { name: "match"; deckId: string };

interface AIVocabItem {
  hanzi?: string;
  pinyin?: string;
  meaning?: string;
}

export default function MyDecksPage() {
  const { awardXP } = useProgress();
  const [decks, setDecks] = useState<CustomDeck[]>([]);
  const [view, setView] = useState<View>({ name: "list" });

  // form tạo deck
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("📚");

  // form thêm thẻ
  const [front, setFront] = useState("");
  const [pinyin, setPinyin] = useState("");
  const [back, setBack] = useState("");

  // AI tạo thẻ
  const [showAI, setShowAI] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // quiz nghe
  const [quizListening, setQuizListening] = useState(false);

  // study state
  const [queue, setQueue] = useState<CustomCard[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [studied, setStudied] = useState(0);

  const refresh = () => setDecks(getDecks());
  useEffect(() => {
    refresh();
    // Kéo dữ liệu cloud về (1 lần/phiên, best-effort) rồi refresh danh sách deck
    autoSyncOncePerSession().then(refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentDeck =
    view.name !== "list" ? decks.find((d) => d.id === view.deckId) : undefined;

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleCreate = () => {
    if (!newName.trim()) return toast.error("Nhập tên bộ thẻ đã nhé");
    const deck = createDeck(newName, newEmoji);
    setNewName("");
    setShowCreate(false);
    refresh();
    setView({ name: "deck", deckId: deck.id });
  };

  const handleAddCard = () => {
    if (!currentDeck) return;
    if (!front.trim() || !back.trim())
      return toast.error("Cần ít nhất mặt trước (từ) và mặt sau (nghĩa)");
    addCard(currentDeck.id, { front, back, pinyin });
    setFront(""); setPinyin(""); setBack("");
    refresh();
  };

  /** Dán văn bản → AI trích từ vựng → thêm hàng loạt. */
  const handleAIGenerate = async () => {
    if (!currentDeck || aiLoading) return;
    if (aiText.trim().length < 5) return toast.error("Dán đoạn văn bản tiếng Trung dài hơn chút nhé");
    setAiLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", new Blob([aiText], { type: "text/plain" }), "paste.txt");
      const res = await fetch("/api/ai/analyze-upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lỗi AI");
      const vocab: AIVocabItem[] = Array.isArray(data.vocabulary) ? data.vocabulary : [];
      const valid = vocab.filter((v) => v.hanzi && v.meaning);
      if (valid.length === 0) {
        toast.error("AI không tìm được từ vựng trong đoạn này");
      } else {
        valid.forEach((v) =>
          addCard(currentDeck.id, { front: v.hanzi!, back: v.meaning!, pinyin: v.pinyin })
        );
        refresh();
        setAiText("");
        setShowAI(false);
        toast.success(`✨ AI đã thêm ${valid.length} thẻ vào bộ`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi AI — thử lại sau nhé");
    } finally {
      setAiLoading(false);
    }
  };

  const startStudy = (deck: CustomDeck) => {
    const due = getDueCards(deck);
    const pool = due.length > 0 ? due : deck.cards;
    if (pool.length === 0) return toast.error("Bộ thẻ trống — thêm thẻ trước nhé");
    setQueue(pool);
    setFlipped(false);
    setStudied(0);
    setView({ name: "study", deckId: deck.id });
  };

  const handleGrade = (q: number) => {
    if (!currentDeck || queue.length === 0) return;
    gradeCard(currentDeck.id, queue[0].id, q);
    setStudied((s) => s + 1);
    setFlipped(false);
    setQueue((prev) => prev.slice(1));
    refresh();
  };

  // ── Quiz view ───────────────────────────────────────────────────────────────
  if (view.name === "quiz" && currentDeck) {
    return (
      <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
        <button
          onClick={() => setView({ name: "deck", deckId: currentDeck.id })}
          className="flex items-center gap-1 text-sm text-[var(--text-muted)] mb-5"
        >
          <ArrowLeft size={16} /> {currentDeck.emoji} {currentDeck.name}
        </button>
        <div className="flex items-center gap-2 mb-4">
          {([
            { v: false, label: "📖 Đọc" },
            { v: true, label: "👂 Nghe" },
          ] as const).map(({ v, label }) => (
            <button
              key={label}
              onClick={() => setQuizListening(v)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border transition-all",
                quizListening === v
                  ? "border-mm-gold text-mm-gold bg-mm-gold/10"
                  : "border-[rgba(255,255,255,0.1)] text-[var(--text-muted)]"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <VocabQuiz
          key={quizListening ? "listen" : "read"}
          items={currentDeck.cards.map((c) => ({ front: c.front, back: c.back, pinyin: c.pinyin }))}
          listening={quizListening}
          onDone={(correct) => {
            if (correct > 0) {
              awardXP(correct * 2, "deck_quiz")
                .then(() => toast.success(`+${correct * 2} XP — Quiz 📝`))
                .catch(() => null);
            }
          }}
          onExit={() => setView({ name: "deck", deckId: currentDeck.id })}
        />
      </div>
    );
  }

  // ── Match view ──────────────────────────────────────────────────────────────
  if (view.name === "match" && currentDeck) {
    return (
      <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
        <button
          onClick={() => setView({ name: "deck", deckId: currentDeck.id })}
          className="flex items-center gap-1 text-sm text-[var(--text-muted)] mb-5"
        >
          <ArrowLeft size={16} /> {currentDeck.emoji} {currentDeck.name}
        </button>
        <MatchGame
          items={currentDeck.cards.map((c) => ({ front: c.front, back: c.back, pinyin: c.pinyin }))}
          onDone={() => {
            awardXP(10, "match_game")
              .then(() => toast.success("+10 XP — Ghép đôi ⚡"))
              .catch(() => null);
          }}
          onExit={() => setView({ name: "deck", deckId: currentDeck.id })}
        />
      </div>
    );
  }

  // ── Study view ──────────────────────────────────────────────────────────────
  if (view.name === "study" && currentDeck) {
    const card = queue[0];
    if (!card) {
      return (
        <div className="min-h-screen px-4 py-6 max-w-lg mx-auto flex flex-col items-center justify-center text-center">
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <span className="text-5xl block mb-4">🎉</span>
            <h2 className="font-playfair text-2xl font-bold mb-2">Hết thẻ cần ôn!</h2>
            <p className="text-sm text-[var(--text-muted)] mb-8">
              Đã ôn {studied} thẻ trong bộ {currentDeck.emoji} {currentDeck.name}
            </p>
            <button onClick={() => setView({ name: "deck", deckId: currentDeck.id })} className="btn-primary">
              Quay lại bộ thẻ
            </button>
          </motion.div>
        </div>
      );
    }
    return (
      <div className="min-h-screen px-4 py-6 max-w-lg mx-auto flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setView({ name: "deck", deckId: currentDeck.id })}
            className="flex items-center gap-1 text-sm text-[var(--text-muted)]"
          >
            <ArrowLeft size={16} /> Thoát
          </button>
          <p className="text-xs text-[var(--text-muted)]">Còn {queue.length} thẻ</p>
        </div>

        {/* Card */}
        <button
          onClick={() => setFlipped((f) => !f)}
          className="w-full min-h-[260px] rounded-3xl bg-surface border border-[rgba(255,255,255,0.1)] flex flex-col items-center justify-center px-6 py-10 transition-all active:scale-[0.98] mb-6"
        >
          {!flipped ? (
            <>
              <p className="font-chinese text-4xl mb-3 text-center">{card.front}</p>
              <p className="text-xs text-[var(--text-muted)]">Bấm để lật thẻ</p>
            </>
          ) : (
            <>
              <p className="font-chinese text-2xl mb-1 text-center">{card.front}</p>
              {card.pinyin && <p className="text-mm-gold text-sm mb-3">{card.pinyin}</p>}
              <p className="text-lg text-center">{card.back}</p>
            </>
          )}
        </button>

        <div className="flex justify-center mb-6">
          <button
            onClick={(e) => { e.stopPropagation(); playTTS(card.front).catch(() => null); }}
            className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-mm-gold transition-colors"
          >
            <Volume2 size={16} /> Nghe phát âm
          </button>
        </div>

        {flipped && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-4 gap-2">
            {QUALITY_BUTTONS.map((b) => (
              <button
                key={b.q}
                onClick={() => handleGrade(b.q)}
                className={cn("py-3 rounded-2xl border text-xs font-semibold transition-all active:scale-95", b.cls)}
              >
                <span className="block text-base mb-0.5">{b.icon}</span>
                {b.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    );
  }

  // ── Deck detail view ────────────────────────────────────────────────────────
  if (view.name === "deck" && currentDeck) {
    const due = getDueCards(currentDeck).length;
    return (
      <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
        <button
          onClick={() => setView({ name: "list" })}
          className="flex items-center gap-1 text-sm text-[var(--text-muted)] mb-4"
        >
          <ArrowLeft size={16} /> Tất cả bộ thẻ
        </button>

        <div className="flex items-center justify-between mb-1">
          <h1 className="font-playfair text-2xl font-bold">
            {currentDeck.emoji} {currentDeck.name}
          </h1>
          <button
            onClick={() => {
              deleteDeck(currentDeck.id);
              refresh();
              setView({ name: "list" });
              toast("Đã xoá bộ thẻ");
            }}
            aria-label="Xoá bộ thẻ"
            className="text-[var(--text-muted)] hover:text-mm-red transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-5">
          {currentDeck.cards.length} thẻ · {due} đến hạn ôn
        </p>

        {/* Học: flashcard SRS hoặc quiz */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => startStudy(currentDeck)}
            className="btn-primary flex items-center justify-center gap-1.5 !px-2 text-sm"
          >
            <GraduationCap size={16} /> Thẻ{due > 0 ? ` (${due})` : ""}
          </button>
          <button
            onClick={() => {
              if (currentDeck.cards.length < 4)
                return toast.error("Cần ít nhất 4 thẻ để chơi quiz");
              setView({ name: "quiz", deckId: currentDeck.id });
            }}
            className="px-2 py-3 rounded-full bg-mm-gold/15 border border-mm-gold/40 text-mm-gold text-sm font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <ListChecks size={16} /> Quiz
          </button>
          <button
            onClick={() => {
              if (currentDeck.cards.length < 3)
                return toast.error("Cần ít nhất 3 thẻ để chơi ghép đôi");
              setView({ name: "match", deckId: currentDeck.id });
            }}
            className="px-2 py-3 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-300 text-sm font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Zap size={16} /> Ghép
          </button>
        </div>

        {/* AI tạo thẻ từ văn bản */}
        <button
          onClick={() => setShowAI((s) => !s)}
          className="w-full mb-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-500/15 to-mm-red/10 border border-purple-500/25 text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Sparkles size={15} className="text-purple-300" /> AI tạo thẻ từ văn bản
        </button>
        <AnimatePresence>
          {showAI && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="card !p-4">
                <textarea
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  placeholder="Dán đoạn văn / lời bài hát / hội thoại tiếng Trung vào đây… AI sẽ trích từ vựng thành thẻ."
                  rows={4}
                  className="w-full bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl px-4 py-3 text-sm outline-none focus:border-mm-red transition-colors resize-none mb-3"
                />
                <button
                  onClick={handleAIGenerate}
                  disabled={aiLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {aiLoading ? "AI đang đọc…" : <><Sparkles size={15} /> Trích từ vựng</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thêm thẻ thủ công */}
        <div className="card !p-4 mb-6">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">Thêm thẻ mới</p>
          <div className="space-y-2">
            <input value={front} onChange={(e) => setFront(e.target.value)} placeholder="Mặt trước — từ / chữ Hán (vd: 加油)" className="input font-chinese" />
            <input value={pinyin} onChange={(e) => setPinyin(e.target.value)} placeholder="Pinyin (tuỳ chọn, vd: jiā yóu)" className="input" />
            <input value={back} onChange={(e) => setBack(e.target.value)} placeholder="Mặt sau — nghĩa (vd: Cố lên!)" className="input"
              onKeyDown={(e) => e.key === "Enter" && handleAddCard()} />
            <button onClick={handleAddCard} className="btn-primary w-full flex items-center justify-center gap-2">
              <Plus size={16} /> Thêm thẻ
            </button>
          </div>
        </div>

        {/* Danh sách thẻ */}
        <div className="space-y-2 pb-20">
          {currentDeck.cards.length === 0 && (
            <p className="text-center text-sm text-[var(--text-muted)] py-6">
              Chưa có thẻ nào — thêm tay hoặc nhờ AI ở trên nhé ☝️
            </p>
          )}
          {currentDeck.cards.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-surface border border-[rgba(255,255,255,0.06)] px-4 py-3">
              <button onClick={() => playTTS(c.front).catch(() => null)} aria-label="Nghe" className="text-[var(--text-muted)] hover:text-mm-gold shrink-0">
                <Volume2 size={15} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-chinese text-base leading-tight truncate">
                  {c.front} {c.pinyin && <span className="text-mm-gold text-xs">({c.pinyin})</span>}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">{c.back}</p>
              </div>
              <button
                onClick={() => { removeCard(currentDeck.id, c.id); refresh(); }}
                aria-label="Xoá thẻ"
                className="text-[var(--text-muted)] hover:text-mm-red shrink-0"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── List view ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-playfair text-2xl font-bold mb-1">Bộ thẻ của tôi 🎴</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Tự tạo bộ flashcard riêng, học bằng SRS hoặc quiz. Hoạt động cả offline.
        </p>
      </motion.div>

      <button
        onClick={() => setShowCreate((s) => !s)}
        className="btn-primary w-full mb-4 flex items-center justify-center gap-2"
      >
        <Plus size={16} /> Tạo bộ thẻ mới
      </button>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="card !p-4">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Tên bộ thẻ (vd: Từ vựng C-drama 🎬)"
                className="input mb-3"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <div className="flex gap-2 mb-3">
                {DECK_EMOJIS.map((em) => (
                  <button
                    key={em}
                    onClick={() => setNewEmoji(em)}
                    className={cn(
                      "w-9 h-9 rounded-xl grid place-items-center text-lg transition-all",
                      newEmoji === em ? "bg-mm-red/25 ring-1 ring-mm-red/50" : "bg-surface2"
                    )}
                  >
                    {em}
                  </button>
                ))}
              </div>
              <button onClick={handleCreate} className="btn-primary w-full">Tạo</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3 pb-20">
        {decks.length === 0 && !showCreate && (
          <div className="text-center py-10">
            <Layers size={36} className="mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">
              Chưa có bộ thẻ nào. Tạo bộ đầu tiên để bắt đầu! 🚀
            </p>
          </div>
        )}
        {decks.map((deck) => {
          const due = getDueCards(deck).length;
          return (
            <button
              key={deck.id}
              onClick={() => setView({ name: "deck", deckId: deck.id })}
              className="w-full card !p-4 flex items-center gap-4 text-left"
            >
              <span className="text-3xl shrink-0">{deck.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{deck.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {deck.cards.length} thẻ{due > 0 && <span className="text-mm-red"> · {due} đến hạn</span>}
                </p>
              </div>
              <span className="text-[var(--text-muted)]">→</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
