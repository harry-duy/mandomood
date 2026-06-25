"use client";

/**
 * /characters — Browse tất cả chữ Hán có trong app
 * Group theo cảm xúc/chủ đề, search, link đến detail page
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Heart, Flame, Droplets, Moon, Star, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { playTTS } from "@/hooks/useTTS";
import { useProgress } from "@/hooks/useProgress";
import { CHARACTERS } from "@/lib/characters";

// ─── Character catalogue ─────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "all", label: "Tất cả", icon: <Star size={14} />, color: "text-mm-gold" },
  { id: "heart", label: "Tình yêu", icon: <Heart size={14} />, color: "text-mm-red" },
  { id: "fate", label: "Duyên phận", icon: <Moon size={14} />, color: "text-purple-400" },
  { id: "pain", label: "Nỗi đau", icon: <Droplets size={14} />, color: "text-blue-400" },
  { id: "peace", label: "Bình yên", icon: <Wind size={14} />, color: "text-green-400" },
  { id: "strength", label: "Sức mạnh", icon: <Flame size={14} />, color: "text-orange-400" },
];

const CATEGORY_BG: Record<string, string> = {
  heart: "rgba(232,99,74,0.12)",
  fate: "rgba(167,139,250,0.12)",
  pain: "rgba(96,165,250,0.12)",
  peace: "rgba(74,222,128,0.12)",
  strength: "rgba(251,146,60,0.12)",
};

const HSK_COLORS: Record<number, string> = {
  1: "bg-green-500/20 text-green-300",
  2: "bg-blue-500/20 text-blue-300",
  3: "bg-purple-500/20 text-purple-300",
  4: "bg-orange-500/20 text-orange-300",
  5: "bg-red-500/20 text-red-300",
  6: "bg-yellow-500/20 text-yellow-300",
};

export default function CharactersPage() {
  const { awardXP } = useProgress();
  const [awardedSet] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    return CHARACTERS.filter(c => {
      const matchCat = category === "all" || c.category === category;
      const matchQ = !query || c.hanzi.includes(query) ||
        c.pinyin.toLowerCase().includes(query.toLowerCase()) ||
        c.meaning.includes(query);
      return matchCat && matchQ;
    });
  }, [query, category]);

  return (
    <main className="min-h-screen pb-28 bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="sticky top-0 z-30 glass border-b border-[rgba(255,255,255,0.06)] px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl font-bold">字</div>
            <div>
              <h1 className="font-display text-lg font-bold">Bộ sưu tập chữ Hán</h1>
              <p className="text-xs text-[var(--text-muted)]">{CHARACTERS.length} chữ · học qua cảm xúc</p>
            </div>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm chữ, pinyin, nghĩa..." aria-label="Tìm chữ, pinyin, nghĩa"
              className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[rgba(255,255,255,0.06)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-mm-red/50"
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-5">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                category === cat.id
                  ? "bg-mm-red text-white"
                  : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[rgba(255,255,255,0.06)]"
              )}
            >
              <span className={category === cat.id ? "text-white" : cat.color}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-[var(--text-muted)] mb-4">
          {filtered.length} chữ
          {category !== "all" ? ` trong "${CATEGORIES.find(c => c.id === category)?.label}"` : ""}
          {query ? ` · "${query}"` : ""}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((char, i) => (
            <motion.div
              key={char.hanzi}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
            >
              <Link
                href={`/character/${encodeURIComponent(char.hanzi)}`}
                onClick={() => { if (!awardedSet.has(char.hanzi)) { awardedSet.add(char.hanzi); awardXP(5, "Kham pha chu"); } }}
              >
                <div
                  className="rounded-2xl p-4 border border-[rgba(255,255,255,0.06)] hover:border-mm-red/40 transition-all cursor-pointer group active:scale-95"
                  style={{ background: CATEGORY_BG[char.category] ?? "var(--bg-card)" }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", HSK_COLORS[char.hsk] ?? "")}>
                      HSK {char.hsk}
                    </span>
                    <button
                      onClick={e => { e.preventDefault(); void playTTS(char.hanzi); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-white text-xs"
                      aria-label="Nghe"
                    >
                      🔊
                    </button>
                  </div>

                  <div className="text-5xl font-bold text-center my-3 group-hover:scale-110 transition-transform duration-200">
                    {char.hanzi}
                  </div>

                  <div className="text-center">
                    <p className="text-mm-red text-sm font-semibold">{char.pinyin}</p>
                    <p className="text-[var(--text-muted)] text-xs mt-0.5">{char.meaning}</p>
                  </div>

                  <p className="text-[10px] text-[var(--text-muted)] text-center mt-2 italic leading-relaxed line-clamp-2">
                    &ldquo;{char.emotional_hook}&rdquo;
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-[var(--text-muted)]">Không tìm thấy chữ nào</p>
            <button onClick={() => { setQuery(""); setCategory("all"); }}
              className="mt-3 text-sm text-mm-red hover:underline">
              Xóa bộ lọc
            </button>
          </div>
        )}

        <div className="mt-8 p-4 rounded-2xl bg-[var(--bg-card)] border border-[rgba(255,255,255,0.06)] text-center">
          <p className="text-sm text-[var(--text-muted)] mb-1">Mỗi chữ là một câu chuyện 💌</p>
          <p className="text-xs text-[var(--text-muted)]">Tap vào chữ để xem nguồn gốc, luyện viết và ví dụ cảm xúc</p>
        </div>
      </div>
    </main>
  );
}
