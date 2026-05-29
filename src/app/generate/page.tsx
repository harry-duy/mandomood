"use client";

import { useState } from "react";
import { playTTS } from "@/hooks/useTTS";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, RefreshCw, Save, Volume2,
  BookOpen, Globe, ChevronRight
} from "lucide-react";
import { VocabList } from "@/components/ui/VocabCard";
import { cn } from "@/lib/utils";
import { MOOD_COLORS, MOOD_EMOJI, MOOD_LABEL } from "@/lib/utils";
import { toast } from "sonner";

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

export default function GeneratePage() {
  const [selectedMood, setSelectedMood] = useState<Mood>("healing");
  const [selectedLevel, setSelectedLevel] = useState<Level>("hsk2");
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [showPinyin, setShowPinyin] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setSaved(false);
    setStory(null);

    try {
      const res = await fetch("/api/ai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: selectedLevel,
          mood: selectedMood,
          theme: theme.trim() || undefined,
          save: false,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Lỗi generate");
      }

      const { story: generated } = await res.json();
      setStory(generated);
      toast("✨ Câu chuyện đã được tạo!", { duration: 2000 });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Lỗi kết nối AI. Kiểm tra OPENAI_API_KEY trong .env.local"
      );
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
            placeholder="Ví dụ: mùa thu, tình bạn xa..."
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
      </div>

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

              {/* Chinese text */}
              <p className="font-chinese text-xl font-bold leading-loose tracking-wider text-[#F5F0EB] mb-2 whitespace-pre-line">
                {story.chinese_text}
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

              <div className="w-8 h-px bg-[rgba(255,255,255,0.1)] mb-3" />

              {/* Translation */}
              <p className="text-sm text-[var(--text-muted)] italic font-light leading-relaxed whitespace-pre-line">
                "{story.translation}"
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
                  onClick={() => setShowPinyin(!showPinyin)}
                  className="flex items-center gap-1.5 text-xs bg-surface2 text-[var(--text-muted)] hover:text-white px-3 py-2 rounded-full transition-colors"
                >
                  {showPinyin ? "Ẩn pinyin" : "Hiện pinyin"}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saved}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-3 py-2 rounded-full transition-all ml-auto",
                    saved
                      ? "bg-mm-sage/20 text-mm-sage"
                      : "bg-surface2 text-[var(--text-muted)] hover:text-white"
                  )}
                >
                  <Save size={13} /> {saved ? "Đã lưu" : "Lưu lại"}
                </button>
              </div>
            </div>

            {/* Vocabulary section */}
            {story.vocabulary && story.vocabulary.length > 0 && (
              <div className="card">
                <VocabList vocabulary={story.vocabulary} />
              </div>
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
    </div>
  );
}
