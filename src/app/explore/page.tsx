/**
 * Khám phá — trang tổng hợp toàn bộ công cụ học, gom từ trang chủ cũ.
 * Có ô lọc nhanh theo tên để tìm công cụ trong 1 chạm.
 */
"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles, BookOpen, Wand2, Brain, Zap, Trophy, Users, BookMarked, Sword,
  Flame, Star, MicVocal, Mic, Layers, FileQuestion, Gauge, Network, MessageCircle,
  PenLine, Search, Video, Pencil, NotebookPen, TrendingUp, ClipboardList,
  BarChart2, Repeat, MonitorPlay, Rss,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { computeSkillScores, weakestSkill } from "@/lib/skillScores";

type Tool = {
  href: string;
  icon: React.ElementType;
  label: string;
  sublabel: string;
  gradient: string;
  border: string;
};

type Section = { title: string; tools: Tool[] };

/** Gợi ý công cụ theo kỹ năng yếu nhất */
const SKILL_RECS: Record<string, { href: string; emoji: string; label: string; why: string }[]> = {
  vocab: [
    { href: "/hsk", emoji: "📚", label: "Quiz HSK", why: "Nạp từ vựng theo cấp độ" },
    { href: "/flashcards", emoji: "🎴", label: "Flashcard SRS", why: "Ôn từ đúng lúc sắp quên" },
    { href: "/so-tay", emoji: "📒", label: "Sổ tay từ", why: "Xem & ôn lại từ đã lưu" },
  ],
  listening: [
    { href: "/tones", emoji: "🎵", label: "Thanh điệu", why: "Phân biệt 4 tones cơ bản" },
    { href: "/karaoke", emoji: "🎤", label: "Karaoke", why: "Nghe bài hát + shadowing" },
    { href: "/dictation", emoji: "✏️", label: "Chính tả", why: "Nghe → gõ lại từng từ" },
  ],
  speaking: [
    { href: "/pronunciation", emoji: "🎙️", label: "Phát âm", why: "Nói + nhận điểm AI" },
    { href: "/shadowing", emoji: "🔊", label: "Shadowing", why: "Nghe & nhái theo người bản ngữ" },
    { href: "/practice", emoji: "⚔️", label: "Ghép câu", why: "Xây câu hoàn chỉnh" },
  ],
  reading: [
    { href: "/reading", emoji: "📖", label: "Đọc hiểu", why: "Đoạn văn theo cấp HSK" },
    { href: "/grammar", emoji: "⭐", label: "Ngữ pháp", why: "12 cấu trúc thông dụng" },
    { href: "/generate", emoji: "✨", label: "AI Story", why: "Đọc truyện ngắn AI tạo" },
  ],
  writing: [
    { href: "/viet-tay", emoji: "✍️", label: "Vẽ tay tra chữ", why: "Viết tay để tra Hán tự" },
    { href: "/luyen-viet/online", emoji: "🖊️", label: "Luyện viết online", why: "Nét bút động hanzi-writer" },
    { href: "/generate", emoji: "🤖", label: "AI Story", why: "Tạo truyện → luyện tư duy viết" },
  ],
};

const SECTIONS: Section[] = [
  {
    title: "Công cụ AI",
    tools: [
      { href: "/generate", icon: Wand2, label: "AI Story", sublabel: "Tạo câu chuyện theo mood", gradient: "from-mm-red/20 to-mm-gold/10", border: "border-mm-red/20" },
      { href: "/smart-lesson", icon: Brain, label: "Smart Lesson", sublabel: "Phân tích ảnh / văn bản", gradient: "from-purple-500/20 to-blue-500/10", border: "border-purple-500/20" },
      { href: "/ai-tutor", icon: MessageCircle, label: "AI Gia sư", sublabel: "Chat luyện tiếng Trung", gradient: "from-mm-red/20 to-rose-500/10", border: "border-mm-red/20" },
    ],
  },
  {
    title: "Từ vựng & Chữ Hán",
    tools: [
      { href: "/hsk", icon: BookOpen, label: "HSK", sublabel: "Từ vựng HSK 1–6", gradient: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/20" },
      { href: "/radicals", icon: Sparkles, label: "Bộ thủ", sublabel: "59 radical cơ bản", gradient: "from-amber-500/20 to-orange-500/10", border: "border-amber-500/20" },
      { href: "/characters", icon: Layers, label: "Bộ sưu tập chữ", sublabel: "28 chữ · 5 chủ đề", gradient: "from-mm-brown/20 to-mm-gold/10", border: "border-mm-gold/20" },
      { href: "/chiet-tu", icon: Search, label: "Chiết tự", sublabel: "Phân tích bộ thủ", gradient: "from-mm-gold/20 to-amber-500/10", border: "border-mm-gold/20" },
      { href: "/sodo", icon: Network, label: "Sơ đồ chữ", sublabel: "Gia phả bộ thủ", gradient: "from-fuchsia-500/20 to-purple-500/10", border: "border-fuchsia-500/20" },
      { href: "/dictionary", icon: BookMarked, label: "Từ điển", sublabel: "Tra từ theo cảm xúc", gradient: "from-blue-500/20 to-sky-500/10", border: "border-blue-500/20" },
      { href: "/so-tay", icon: NotebookPen, label: "Sổ tay từ", sublabel: "Từ đã lưu của bạn", gradient: "from-teal-500/20 to-cyan-500/10", border: "border-teal-500/20" },
      { href: "/my-decks", icon: Layers, label: "Bộ thẻ của tôi", sublabel: "Tự tạo flashcard riêng", gradient: "from-rose-500/20 to-mm-red/10", border: "border-rose-500/20" },
      { href: "/flashcards", icon: Repeat, label: "Flashcard SRS", sublabel: "Ôn từ đúng lúc sắp quên", gradient: "from-cyan-500/20 to-teal-500/10", border: "border-cyan-500/20" },
      { href: "/search", icon: Search, label: "Tìm kiếm", sublabel: "Quotes · Bài học · Từ vựng", gradient: "from-slate-500/20 to-gray-500/10", border: "border-slate-500/20" },
    ],
  },
  {
    title: "Nghe & Nói",
    tools: [
      { href: "/dictation", icon: Pencil, label: "Chính tả", sublabel: "Nghe → gõ lại", gradient: "from-lime-500/20 to-green-500/10", border: "border-lime-500/20" },
      { href: "/tones", icon: Zap, label: "Thanh điệu", sublabel: "4 tones + quiz", gradient: "from-pink-500/20 to-rose-500/10", border: "border-pink-500/20" },
      { href: "/pronunciation", icon: MicVocal, label: "Phát âm", sublabel: "Nói + nhận điểm AI", gradient: "from-rose-500/20 to-pink-500/10", border: "border-rose-500/20" },
      { href: "/shadowing", icon: Gauge, label: "Shadowing", sublabel: "Nghe & nhái theo", gradient: "from-cyan-500/20 to-blue-500/10", border: "border-cyan-500/20" },
      { href: "/karaoke", icon: Mic, label: "Karaoke", sublabel: "Nghe · Shadowing · Chính tả", gradient: "from-[#E8504A]/20 to-rose-500/10", border: "border-[#E8504A]/20" },
      { href: "/video", icon: Video, label: "Video", sublabel: "Học qua truyện", gradient: "from-indigo-500/20 to-blue-500/10", border: "border-indigo-500/20" },
    ],
  },
  {
    title: "Đọc & Viết",
    tools: [
      { href: "/reading", icon: BookMarked, label: "Đọc hiểu", sublabel: "Đoạn văn theo cấp độ", gradient: "from-sky-500/20 to-indigo-500/10", border: "border-sky-500/20" },
      { href: "/grammar", icon: Star, label: "Ngữ pháp", sublabel: "12 cấu trúc HSK", gradient: "from-violet-500/20 to-purple-500/10", border: "border-violet-500/20" },
      { href: "/luyen-viet", icon: PenLine, label: "Luyện viết PDF", sublabel: "Bảng 田字格 · tải PDF", gradient: "from-teal-500/20 to-emerald-500/10", border: "border-teal-500/20" },
      { href: "/luyen-viet/online", icon: MonitorPlay, label: "Luyện viết online", sublabel: "Nét bút động · hanzi-writer", gradient: "from-emerald-500/20 to-green-500/10", border: "border-emerald-500/20" },
      { href: "/viet-tay", icon: Pencil, label: "Vẽ tay tra chữ", sublabel: "Viết để tra Hán tự", gradient: "from-orange-500/20 to-amber-500/10", border: "border-orange-500/20" },
    ],
  },
  {
    title: "Luyện tập & Thi",
    tools: [
      { href: "/practice", icon: Sword, label: "Ghép câu", sublabel: "Sentence builder", gradient: "from-red-500/20 to-orange-500/10", border: "border-red-500/20" },
      { href: "/challenge", icon: Flame, label: "Thử thách", sublabel: "6 câu mỗi ngày", gradient: "from-orange-500/20 to-red-500/10", border: "border-orange-500/20" },
      { href: "/test", icon: FileQuestion, label: "Đề thi HSK", sublabel: "Mock test HSK 1–5", gradient: "from-indigo-500/20 to-purple-500/10", border: "border-indigo-500/20" },
      { href: "/review", icon: Trophy, label: "Tổng hợp", sublabel: "Ôn tập + xuất file", gradient: "from-yellow-500/20 to-amber-500/10", border: "border-yellow-500/20" },
      { href: "/daily-plan", icon: ClipboardList, label: "Kế hoạch ngày", sublabel: "Nhiệm vụ cá nhân hóa", gradient: "from-violet-500/20 to-blue-500/10", border: "border-violet-500/20" },
      { href: "/lo-trinh", icon: TrendingUp, label: "Lộ trình HSK", sublabel: "Hành trình 1 → 6", gradient: "from-mm-gold/20 to-yellow-500/10", border: "border-mm-gold/20" },
      { href: "/progress", icon: BarChart2, label: "Tiến trình", sublabel: "Theo dõi hành trình", gradient: "from-emerald-500/20 to-green-500/10", border: "border-emerald-500/20" },
    ],
  },
  {
    title: "Cộng đồng",
    tools: [
      { href: "/community", icon: Users, label: "Cộng đồng", sublabel: "Chia sẻ & học cùng nhau", gradient: "from-green-500/20 to-emerald-500/10", border: "border-green-500/20" },
      { href: "/leaderboard", icon: Trophy, label: "Bảng xếp hạng", sublabel: "Top học viên", gradient: "from-yellow-500/20 to-amber-500/10", border: "border-yellow-500/20" },
      { href: "/blog", icon: Rss, label: "Blog", sublabel: "Mẹo học tiếng Trung", gradient: "from-violet-500/20 to-purple-500/10", border: "border-violet-500/20" },
    ],
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [weakKey, setWeakKey] = useState<string | null>(null);

  useEffect(() => {
    const scores = computeSkillScores();
    const hasData = Object.values(scores).some((v) => v > 0);
    if (hasData) setWeakKey(weakestSkill(scores).key);
  }, []);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.map((s) => ({
      ...s,
      tools: s.tools.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.sublabel.toLowerCase().includes(q)
      ),
    })).filter((s) => s.tools.length > 0);
  }, [query]);

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5"
      >
        <h1 className="font-playfair text-2xl font-bold mb-1">Khám phá 🧭</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Tất cả công cụ học tiếng Trung, gom về một nơi.
        </p>
      </motion.div>

      {/* Lọc nhanh */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm công cụ… (vd: phát âm, HSK)"
          className="input pl-10"
          aria-label="Tìm công cụ"
        />
      </div>

      {/* Gợi ý cá nhân hoá — chỉ hiện khi có dữ liệu kỹ năng và không đang tìm kiếm */}
      {!query && weakKey && SKILL_RECS[weakKey] && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-7"
        >
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
            🎯 Dành cho bạn — luyện kỹ năng {weakKey === "vocab" ? "Từ vựng" : weakKey === "listening" ? "Nghe" : weakKey === "speaking" ? "Nói" : weakKey === "reading" ? "Đọc" : "Viết"}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {SKILL_RECS[weakKey].map((rec) => (
              <button
                key={rec.href}
                onClick={() => router.push(rec.href)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-surface border border-mm-red/20 hover:border-mm-red/50 hover:bg-mm-red/5 transition-all text-center group"
              >
                <span className="text-2xl">{rec.emoji}</span>
                <p className="text-[11px] font-semibold text-[var(--text)] group-hover:text-mm-red transition-colors leading-tight">{rec.label}</p>
                <p className="text-[9px] text-[var(--text-muted)] leading-tight">{rec.why}</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {sections.length === 0 && (
        <p className="text-center py-10 text-[var(--text-muted)]">
          Không tìm thấy công cụ nào cho “{query}”
        </p>
      )}

      {sections.map((section, si) => (
        <motion.section
          key={section.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 * si }}
          className="mb-7"
        >
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
            {section.title}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {section.tools.map((tool) => (
              <button
                key={tool.href + tool.label}
                onClick={() => router.push(tool.href)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left",
                  "bg-gradient-to-r border transition-all active:scale-95",
                  "hover:brightness-110",
                  tool.gradient,
                  tool.border
                )}
              >
                <tool.icon size={18} className="shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">{tool.label}</p>
                  <p className="text-xs text-[var(--text-muted)] leading-tight truncate">
                    {tool.sublabel}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
