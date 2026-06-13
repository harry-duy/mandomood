"use client";

import { useState, useEffect } from "react";
import { playTTS } from "@/hooks/useTTS";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, RefreshCw, Save, Volume2,
  BookOpen, Globe, ChevronRight, History, Clock, ChevronDown, BookMarked
} from "lucide-react";
import { VocabList } from "@/components/ui/VocabCard";
import { StoryKaraoke } from "@/components/ui/StoryKaraoke";
import StoryQuiz from "@/components/ui/StoryQuiz";
import { QuoteCardSkeleton } from "@/components/ui/LoadingSkeleton";
import { addCustomPassage } from "@/lib/readingLibrary";
import { recordStoriesDeleted } from "@/lib/syncDeleted";
import { postJSON } from "@/lib/fetchRetry";
import { trackEvent } from "@/lib/analytics";
import QuotaBadge from "@/components/ui/QuotaBadge";
import ShareCard from "@/components/ui/ShareCard";
import { cn } from "@/lib/utils";
import { MOOD_COLORS, MOOD_EMOJI, MOOD_LABEL, readJSON, writeJSON } from "@/lib/utils";
import { toast } from "sonner";
import { useProgress } from "@/hooks/useProgress";

// ─── Types ────────────────────────────────────────────────────────────────────

type Mood = "romantic" | "healing" | "motivation" | "sad" | "friendship" | "aesthetic" | "funny";
type Level = "beginner" | "hsk1" | "hsk2" | "hsk3" | "hsk4" | "hsk5";

interface GeneratedStory {
  title: string;
  chinese_text: string;
  pinyin: string;
  translation: string;
  vocabulary: { hanzi: string; pinyin: string; meaning: string; example: string }[];
  grammar_notes: string;
  cultural_note: string;
  mood: Mood;
}

// ─── Config Options ────────────────────────────────────────────────────────────

const MOODS: { key: Mood; emoji: string; label: string }[] = [
  { key: "romantic",   emoji: "💌", label: "Lãng mạn"   },
  { key: "healing",    emoji: "🌿", label: "Chữa lành"  },
  { key: "motivation", emoji: "🔥", label: "Động lực"   },
  { key: "sad",        emoji: "🌧️", label: "Tâm trạng"  },
  { key: "friendship", emoji: "💚", label: "Tình bạn"   },
  { key: "aesthetic",  emoji: "🌙", label: "Aesthetic"  },
  { key: "funny",      emoji: "😂", label: "Hài hước"   },
];

const LEVELS: { key: Level; label: string; desc: string }[] = [
  { key: "beginner", label: "Mới bắt đầu", desc: "Câu rất đơn giản" },
  { key: "hsk1",     label: "HSK 1",       desc: "~150 từ cơ bản"   },
  { key: "hsk2",     label: "HSK 2",       desc: "~300 từ"          },
  { key: "hsk3",     label: "HSK 3",       desc: "~600 từ"          },
  { key: "hsk4",     label: "HSK 4",       desc: "~1200 từ"         },
  { key: "hsk5",     label: "HSK 5",       desc: "~2500 từ"         },
];

const THEME_SUGGESTIONS = [
  "Mùa hè", "Tình yêu xa", "Cà phê sáng", "Bạn bè cũ",
  "Giấc mơ", "Ký ức tuổi thơ", "Chuyến đi mới", "Đêm mưa",
];

// ─── Component ────────────────────────────────────────────────────────────────

interface HistoryItem {
  id: string;
  story: GeneratedStory;
  theme: string;
  level: Level;
  createdAt: string;
}

const HISTORY_KEY = "mm_story_history";
const MAX_HISTORY = 50;

/** Tách văn bản tiếng Trung thành từng câu (giữ lại dấu câu 。！？；…). */
function splitChineseSentences(text: string): string[] {
  if (!text) return [];
  const parts = text.match(/[^。！？；\n]+[。！？；]?/g);
  return (parts ?? [text]).map((s) => s.trim()).filter(Boolean);
}

function loadHistory(): HistoryItem[] {
  return readJSON<HistoryItem[]>(HISTORY_KEY, []);
}
function saveHistory(item: HistoryItem) {
  const prev = loadHistory();
  const next = [item, ...prev.filter(h => h.id !== item.id)].slice(0, MAX_HISTORY);
  writeJSON(HISTORY_KEY, next);
}

export default function GeneratePage() {
  const { awardXP } = useProgress();
  const [selectedMood, setSelectedMood] = useState<Mood>("healing");
  const [selectedLevel, setSelectedLevel] = useState<Level>("hsk2");
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [showPinyin, setShowPinyin] = useState(true);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "history">("generate");
  const [karaoke, setKaraoke] = useState(false);
  const [savedToReading, setSavedToReading] = useState(false);

  useEffect(() => { setHistory(loadHistory()); }, []);

  // Lưu truyện AI hiện tại vào thư viện đọc (/reading), dùng vocabulary làm từ tra cứu.
  const handleSaveToReading = () => {
    if (!story) return;
    const ok = addCustomPassage({
      id: `gen-${story.title}-${selectedLevel}`,
      title: story.title,
      titleVi: story.translation.slice(0, 60),
      level: selectedLevel.toUpperCase(),
      mood: MOOD_LABEL[selectedMood] ?? selectedMood,
      moodColor: MOOD_COLORS[selectedMood] ?? "#E8634A",
      words: (story.vocabulary ?? []).map((v) => ({
        hanzi: v.hanzi, pinyin: v.pinyin, meaning: v.meaning,
      })),
      translation: story.translation,
      culturalNote: story.cultural_note ?? "",
    });
    setSavedToReading(true);
    toast(ok ? "📖 Đã thêm vào thư viện Đọc!" : "Truyện này đã có trong thư viện Đọc", { duration: 2000 });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setSaved(false);
    setSavedToReading(false);
    setStory(null);

    try {
      const { story: generated } = await postJSON<{ story: GeneratedStory }>(
        "/api/ai/story",
        {
          level: selectedLevel,
          mood: selectedMood,
          theme: theme.trim() || undefined,
          save: false,
        },
        {
          timeoutMs: 45_000,
          onRetry: (attempt) =>
            toast(`Mạng chập chờn, đang thử lại (${attempt})...`, { duration: 1500 }),
        }
      );
      setStory(generated);
      trackEvent("story_generated");
      awardXP(20, "Tao truyen AI");
      const histItem: HistoryItem = {
        id: Date.now().toString(),
        story: generated,
        theme: theme.trim() || "",
        level: selectedLevel,
        createdAt: new Date().toISOString(),
      };
      saveHistory(histItem);
      setHistory(loadHistory());
      toast("✨ Câu chuyện đã được tạo!", { duration: 2000 });
    } catch (error) {
      const status = (error as { status?: number })?.status;
      if (status === 402) {
        // Hết lượt miễn phí → đo nhu cầu nâng cấp + CTA
        trackEvent("upgrade_required_hit");
        toast.error(error instanceof Error ? error.message : "Hết lượt miễn phí hôm nay", {
          duration: 6000,
          action: { label: "Nâng cấp 👑", onClick: () => { window.location.href = "/pricing"; } },
        });
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Lỗi kết nối AI. Kiểm tra GEMINI_API_KEY trong .env.local"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!story || saved) return;
    try {
      const res = await fetch("/api/ai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: selectedLevel,
          mood: selectedMood,
          theme: theme.trim() || undefined,
          save: true,
        }),
      });
      if (res.ok) {
        setSaved(true);
        toast("💾 Đã lưu vào thư viện!", { duration: 2000 });
      }
    } catch {
      toast.error("Lỗi lưu story");
    }
  };

  const playAudio = () => {
    if (!story) return;
    void playTTS(story.chinese_text);
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-6">
      {/* Tab switcher */}
      <div className="flex gap-1 mb-5 bg-surface rounded-2xl p-1 border border-[rgba(255,255,255,0.06)]">
        {(["generate", "history"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
              activeTab === tab ? "bg-mm-red text-white" : "text-[var(--text-muted)]"
            )}>
            {tab === "generate" ? <><Sparkles size={13} /> Tạo mới</> : (
              <><History size={13} /> Lịch sử {history.length > 0 && (
                <span className="ml-1 bg-mm-gold text-black text-xs px-1.5 rounded-full">{history.length}</span>
              )}</>
            )}
          </button>
        ))}
      </div>

      {/* History tab */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-muted)]">
              <History size={36} className="mx-auto mb-3 opacity-30" />
              <p className="mb-1">Chưa có câu chuyện nào</p>
              <p className="text-xs">Tạo story đầu tiên để xem ở đây</p>
            </div>
          ) : (
            <>
              {history.map((item) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-surface rounded-2xl border border-[rgba(255,255,255,0.07)] overflow-hidden">
                  <button className="w-full flex items-start gap-3 p-4 text-left"
                    onClick={() => { setStory(item.story); setSelectedLevel(item.level); setTheme(item.theme); setActiveTab("generate"); setSaved(false); }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{MOOD_EMOJI[item.story.mood as keyof typeof MOOD_EMOJI]}</span>
                        <span className="font-medium text-sm truncate">{item.story.title}</span>
                      </div>
                      <p className="font-noto text-xs text-[var(--text-muted)] truncate mb-1.5">{item.story.chinese_text.split("\n")[0]}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-surface2 text-[var(--text-muted)]">{item.level.toUpperCase()}</span>
                        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                          <Clock size={10} />{new Date(item.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-[var(--text-muted)] mt-1 shrink-0" />
                  </button>
                </motion.div>
              ))}
              <button onClick={() => {
                  // Tombstone từng truyện để sau khi sync chúng không quay lại từ cloud
                  recordStoriesDeleted(history.map((h) => h.id));
                  localStorage.removeItem("mm_story_history");
                  setHistory([]);
                }}
                className="w-full py-2 text-xs text-[var(--text-muted)] hover:text-red-400 transition-colors text-center">
                Xóa toàn bộ lịch sử
              </button>
            </>
          )}
        </div>
      )}

      {/* Generate tab */}
      {activeTab === "generate" && <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-mm-red" />
          <h1 className="font-playfair text-2xl font-bold">AI Story Generator</h1>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          Nhập mood + level → AI tạo câu chuyện tiếng Trung riêng cho bạn
        </p>
      </div>

      {/* Config form */}
      <div className="space-y-5 mb-6">
        {/* Mood selector */}
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
            Mood 感情
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {MOODS.map(({ key, emoji, label }) => {
              const color = MOOD_COLORS[key];
              const isSelected = selectedMood === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedMood(key)}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border",
                    isSelected
                      ? "text-white"
                      : "bg-surface2 text-[var(--text-muted)] border-transparent hover:text-white"
                  )}
                  style={
                    isSelected
                      ? { background: `${color}25`, borderColor: color, color }
                      : {}
                  }
                >
                  {emoji} {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Level selector */}
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
            Trình độ 水平
          </p>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setSelectedLevel(key)}
                className={cn(
                  "py-2.5 px-2 rounded-xl text-center transition-all border text-xs",
                  selectedLevel === key
                    ? "bg-mm-red/15 border-mm-red/50 text-mm-red"
                    : "bg-surface2 border-transparent text-[var(--text-muted)] hover:text-white"
                )}
              >
                <p className="font-semibold">{label}</p>
                <p className="text-[9px] opacity-70 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Theme input */}
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
            Chủ đề (tùy chọn) 主题
          </p>
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Ví dụ: mùa thu, tình bạn xa..." aria-label="Ví dụ: mùa thu, tình bạn xa"
            className="input"
            maxLength={50}
          />
          {/* Suggestions */}
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {THEME_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setTheme(s)}
                className={cn(
                  "text-[10px] px-2.5 py-1 rounded-full transition-all",
                  theme === s
                    ? "bg-mm-red/20 text-mm-red border border-mm-red/40"
                    : "bg-surface2 text-[var(--text-muted)] hover:text-white"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <motion.button
          onClick={handleGenerate}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all",
            loading
              ? "bg-surface2 text-[var(--text-muted)]"
              : "btn-primary"
          )}
        >
          {loading ? (
            <><RefreshCw size={16} className="animate-spin" /> AI đang tạo câu chuyện...</>
          ) : (
            <><Sparkles size={16} /> Tạo câu chuyện ✨</>
          )}
        </motion.button>

        {/* Lượt miễn phí còn lại hôm nay / trạng thái Premium */}
        <QuotaBadge feature="story" />
      </div>

      {/* Skeleton trong lúc AI tạo truyện (tránh màn hình trống) */}
      {loading && !story && (
        <div className="mt-2">
          <QuoteCardSkeleton />
        </div>
      )}

      {/* Generated story */}
      <AnimatePresence>
        {story && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Story card */}
            <div
              className="card relative overflow-hidden"
              style={{
                borderColor: `${MOOD_COLORS[story.mood] ?? "#8A8078"}30`,
              }}
            >
              {/* Glow */}
              <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{ background: MOOD_COLORS[story.mood] ?? "#E8504A" }}
              />

              {/* Badges + title */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="badge text-[10px]"
                  style={{
                    background: `${MOOD_COLORS[story.mood]}20`,
                    color: MOOD_COLORS[story.mood],
                  }}
                >
                  {MOOD_EMOJI[story.mood]} {MOOD_LABEL[story.mood]}
                </span>
                <span className="badge bg-white/5 text-[var(--text-muted)] text-[10px]">
                  {selectedLevel.toUpperCase()}
                </span>
                <span className="ml-auto text-[10px] text-mm-gold/70 flex items-center gap-1">
                  <Sparkles size={10} /> AI Generated
                </span>
              </div>

              <h2 className="font-playfair text-lg font-bold mb-4">{story.title}</h2>

              {/* Chinese text — chế độ karaoke (đọc + sáng chữ) hoặc tĩnh */}
              {karaoke ? (
                <StoryKaraoke
                  text={story.chinese_text}
                  pinyin={story.pinyin}
                  showPinyin={showPinyin}
                  className="mb-2"
                />
              ) : (
                <>
                  <p className="font-chinese text-xl font-bold leading-loose tracking-wider text-[#F5F0EB] mb-2 whitespace-pre-line">
                    {splitChineseSentences(story.chinese_text).map((sentence, si) => (
                      <span
                        key={si}
                        role="button"
                        tabIndex={0}
                        onClick={() => void playTTS(sentence)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); void playTTS(sentence); } }}
                        title="Nhấn để nghe câu này"
                        className="cursor-pointer rounded-md px-0.5 transition-colors hover:bg-mm-red/15 active:bg-mm-red/25"
                      >
                        {sentence}
                      </span>
                    ))}
                  </p>

                  {/* Pinyin */}
                  <div
                    className={cn(
                      "transition-all duration-300 overflow-hidden",
                      showPinyin ? "max-h-40 opacity-100 mb-2" : "max-h-0 opacity-0 mb-0"
                    )}
                  >
                    <p className="text-xs text-mm-gold/60 tracking-wider whitespace-pre-line">
                      {story.pinyin}
                    </p>
                  </div>
                </>
              )}

              <div className="w-8 h-px bg-[rgba(255,255,255,0.1)] mb-3" />

              {/* Translation */}
              <p className="text-sm text-[var(--text-muted)] italic font-light leading-relaxed whitespace-pre-line">
                &ldquo;{story.translation}&rdquo;
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                <button
                  onClick={playAudio}
                  className="flex items-center gap-1.5 text-xs bg-surface2 text-[var(--text-muted)] hover:text-white px-3 py-2 rounded-full transition-colors"
                >
                  <Volume2 size={13} /> Nghe
                </button>
                <button
                  onClick={() => setKaraoke((v) => !v)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-3 py-2 rounded-full transition-colors",
                    karaoke
                      ? "bg-mm-red/20 text-mm-red"
                      : "bg-surface2 text-[var(--text-muted)] hover:text-white"
                  )}
                >
                  🎤 Karaoke
                </button>
                <button
                  onClick={() => setShowPinyin(!showPinyin)}
                  className="flex items-center gap-1.5 text-xs bg-surface2 text-[var(--text-muted)] hover:text-white px-3 py-2 rounded-full transition-colors"
                >
                  {showPinyin ? "Ẩn pinyin" : "Hiện pinyin"}
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <ShareCard
                    quote={{
                      _id: `story-${story.chinese_text.slice(0, 8)}-${story.mood}`,
                      chinese_text: story.chinese_text,
                      pinyin: story.pinyin,
                      translation: story.translation,
                      mood: story.mood,
                      author: story.title,
                    }}
                  />
                  <button
                    onClick={handleSave} aria-label="Lưu"
                    disabled={saved}
                    className={cn(
                      "flex items-center gap-1.5 text-xs px-3 py-2 rounded-full transition-all",
                      saved
                        ? "bg-mm-sage/20 text-mm-sage"
                        : "bg-surface2 text-[var(--text-muted)] hover:text-white"
                    )}
                  >
                    <Save size={13} /> {saved ? "Đã lưu" : "Lưu lại"}
                  </button>
                </div>
              </div>
            </div>

            {/* Lưu vào thư viện Đọc */}
            <button
              onClick={handleSaveToReading}
              disabled={savedToReading}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all",
                savedToReading
                  ? "bg-mm-sage/20 text-mm-sage"
                  : "bg-surface2 text-[var(--text-muted)] hover:text-white border border-[rgba(255,255,255,0.08)] hover:border-[rgba(232,80,74,0.3)]"
              )}
            >
              <BookMarked size={14} /> {savedToReading ? "Đã thêm vào thư viện Đọc" : "Lưu vào thư viện Đọc"}
            </button>

            {/* Vocabulary section */}
            {story.vocabulary && story.vocabulary.length > 0 && (
              <div className="card">
                <VocabList vocabulary={story.vocabulary} />
              </div>
            )}

            {/* Quiz hiểu nhanh + XP */}
            {story.vocabulary && story.vocabulary.length >= 4 && (
              <StoryQuiz vocabulary={story.vocabulary} />
            )}

            {/* Grammar notes */}
            {story.grammar_notes && (
              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={14} className="text-mm-gold" />
                  <p className="text-xs text-mm-gold uppercase tracking-widest font-semibold">
                    Ngữ pháp
                  </p>
                </div>
                <p className="text-sm text-[#F5F0EB] leading-relaxed font-light">
                  {story.grammar_notes}
                </p>
              </div>
            )}

            {/* Cultural note */}
            {story.cultural_note && (
              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <Globe size={14} className="text-mm-rose" />
                  <p className="text-xs text-mm-rose uppercase tracking-widest font-semibold">
                    Văn hóa & Cảm xúc
                  </p>
                </div>
                <p className="text-sm text-[#F5F0EB] leading-relaxed font-light">
                  {story.cultural_note}
                </p>
              </div>
            )}

            {/* Generate again */}
            <button
              onClick={handleGenerate}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm text-[var(--text-muted)] hover:text-white border border-[rgba(255,255,255,0.08)] transition-all hover:border-[rgba(232,80,74,0.3)]"
            >
              <RefreshCw size={14} /> Tạo câu chuyện khác
              <ChevronRight size={14} className="ml-auto" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-8" />
      </>
    }
    </div>
  );
}