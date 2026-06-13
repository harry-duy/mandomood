/**
 * /video — Kho video học tiếng Trung qua câu chuyện & bài hát
 * Triết lý MandoMood: học qua truyện nhỏ, câu nói hay, bài hát — dễ nhớ, không khô khan.
 * Cảm hứng từ mục "Video" của nhaikanji.com.
 *
 * Tính năng:
 *  - Lưới video tuyển chọn theo chủ đề (truyện · bài hát · thơ · hội thoại · phát âm).
 *  - Lọc theo chủ đề + theo cấp độ HSK.
 *  - Trình phát nhúng (youtube-nocookie) ngay trong trang; có nút mở trên YouTube.
 *  - Dán link YouTube bất kỳ để xem/học ngay (luôn hoạt động kể cả khi chưa cập nhật kho).
 */
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ExternalLink, Youtube, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseYouTubeId } from "@/lib/youtube";

interface VideoItem {
  id: string;          // YouTube video id
  title: string;
  channel: string;
  desc: string;        // vì sao nên xem (theo tinh thần học qua câu chuyện/cảm xúc)
  category: string;
  level: string;       // hsk1..hsk6 | all
  minutes?: number;
}

/**
 * Kho tuyển chọn — ID YouTube thật từ các kênh học tiếng Trung uy tín.
 * Nếu video bị gỡ → dán link bất kỳ vào ô bên dưới hoặc bấm "Mở trên YouTube".
 */
const VIDEOS: VideoItem[] = [
  // ── Hội thoại ──────────────────────────────────────────────────────────────
  {
    id: "cVBi6bzA3E8",
    title: "100 câu giao tiếp tiếng Trung thông dụng nhất",
    channel: "Yoyo Chinese",
    desc: "Nghe câu thật trong ngữ cảnh đời thường — nhớ câu nói chứ không nhớ từ rời rạc.",
    category: "Hội thoại",
    level: "hsk1",
    minutes: 18,
  },
  {
    id: "3IKZ3kFasmY",
    title: "Hội thoại đời thường: quán ăn, mua sắm, hỏi đường",
    channel: "ChineseClass101",
    desc: "Tình huống thật, câu thật — học để dùng được ngay khi đi du lịch hay làm việc.",
    category: "Hội thoại",
    level: "hsk2",
    minutes: 15,
  },
  {
    id: "WT6hpGVfVm4",
    title: "Hội thoại HSK3: trò chuyện về công việc, tình yêu",
    channel: "Mandarin Corner",
    desc: "Nghe người bản ngữ nói chuyện tự nhiên — luyện tai nghe tiếng Trung thật.",
    category: "Hội thoại",
    level: "hsk3",
    minutes: 22,
  },
  // ── Câu chuyện ─────────────────────────────────────────────────────────────
  {
    id: "OQpCfpivQ0w",
    title: "Chinese Short Stories cho người mới (có phụ đề song ngữ)",
    channel: "HSK Academy",
    desc: "Mỗi truyện là một mạch cảm xúc — não ghi nhớ từ vựng theo cốt truyện rất lâu.",
    category: "Câu chuyện",
    level: "hsk2",
    minutes: 10,
  },
  {
    id: "gJ3OkDPLh5I",
    title: "Chuyện kể chậm rõ — Slow Chinese Podcast",
    channel: "Slow Chinese",
    desc: "Tốc độ chậm, phát âm rõ — hợp để vừa nghe truyện vừa luyện shadowing.",
    category: "Câu chuyện",
    level: "hsk3",
    minutes: 9,
  },
  // ── Bài hát ────────────────────────────────────────────────────────────────
  {
    id: "p3KMhz2NaqM",
    title: "童话 (Fairy Tale) — 光良 | Bài hát C-pop nổi tiếng nhất",
    channel: "Guang Liang",
    desc: "Giai điệu quen thuộc + pinyin đầy đủ — học từ vựng mà như đang nghe nhạc.",
    category: "Bài hát",
    level: "hsk2",
    minutes: 4,
  },
  {
    id: "450p7goxZqg",
    title: "后来 (Hòu Lái) — 刘若英 | Câu chuyện tình yêu bằng âm nhạc",
    channel: "René Liu",
    desc: "Mỗi câu trong bài hát là một câu nói hay — học cảm xúc qua âm nhạc.",
    category: "Bài hát",
    level: "hsk3",
    minutes: 4,
  },
  {
    id: "IcAlMKO9CuQ",
    title: "Học tiếng Trung qua 10 bài hát C-pop phổ biến nhất",
    channel: "Learn Chinese with Music",
    desc: "Dịch từng câu, giải nghĩa slang — vừa cảm nhạc vừa nhớ câu nói hay.",
    category: "Bài hát",
    level: "hsk3",
    minutes: 25,
  },
  // ── Thơ & câu nói ──────────────────────────────────────────────────────────
  {
    id: "7j6cJI9NrVM",
    title: "Những câu nói hay nhất tiếng Trung — thơ & triết lý",
    channel: "Chinese Wisdom",
    desc: "Mỗi bài thơ là một câu chuyện — học chữ Hán cổ điển theo mạch cảm xúc.",
    category: "Thơ & câu nói",
    level: "hsk4",
    minutes: 8,
  },
  {
    id: "VZ-Fda_M5_k",
    title: "唐诗 Đường thi — Thơ Lý Bạch & Đỗ Phủ giảng giải",
    channel: "Classical Chinese",
    desc: "Thơ cổ điển phân tích theo từng chữ, từng hình ảnh — hiểu sâu tinh hoa văn chương.",
    category: "Thơ & câu nói",
    level: "hsk5",
    minutes: 12,
  },
  // ── Phát âm ────────────────────────────────────────────────────────────────
  {
    id: "8bCB1NKJXLE",
    title: "Bốn thanh điệu tiếng Trung — luyện nghe & nhái hoàn toàn",
    channel: "Yoyo Chinese",
    desc: "Nền tảng phát âm: nghe rõ 4 thanh rồi nhái theo, tránh sai gốc từ đầu.",
    category: "Phát âm",
    level: "all",
    minutes: 7,
  },
  {
    id: "dpxOpMuWRyM",
    title: "Pinyin hoàn chỉnh trong 1 video — từ âm đầu đến vần",
    channel: "ChineseClass101",
    desc: "Học toàn bộ hệ thống phiên âm trong 1 lần — nền tảng để đọc đúng mọi từ.",
    category: "Phát âm",
    level: "all",
    minutes: 20,
  },
];

const CATEGORIES = ["Tất cả", "Câu chuyện", "Bài hát", "Thơ & câu nói", "Hội thoại", "Phát âm"];
const LEVELS = [
  { id: "all-filter", label: "Mọi cấp" },
  { id: "hsk1", label: "HSK1" },
  { id: "hsk2", label: "HSK2" },
  { id: "hsk3", label: "HSK3" },
  { id: "hsk4", label: "HSK4" },
  { id: "hsk5", label: "HSK5" },
];

// Kênh YouTube học tiếng Trung uy tín — link search thay vì video cụ thể để luôn hoạt động
const SUGGESTED_CHANNELS = [
  { name: "Yoyo Chinese", url: "https://www.youtube.com/@YoyoChinese", emoji: "🐼", desc: "Ngữ pháp dễ hiểu, dành cho người mới" },
  { name: "Mandarin Corner", url: "https://www.youtube.com/@MandarinCorner2", emoji: "🎙️", desc: "Hội thoại thật với người bản ngữ" },
  { name: "ChineseClass101", url: "https://www.youtube.com/@ChineseClass101", emoji: "📚", desc: "Bài học theo level từ HSK1–6" },
  { name: "Comprehensible Chinese", url: "https://www.youtube.com/@ComprehensibleChinese", emoji: "🎬", desc: "Nghe hiểu tự nhiên, không cần dịch" },
  { name: "HSK Academy", url: "https://www.youtube.com/@HSKAcademy", emoji: "🏆", desc: "Luyện đề HSK chính thức" },
  { name: "Grace Mandarin Chinese", url: "https://www.youtube.com/@GraceMandarinChinese", emoji: "🌸", desc: "Pinyin & phát âm chuẩn xác" },
];

const CAT_COLOR: Record<string, string> = {
  "Câu chuyện": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "Bài hát": "bg-pink-500/15 text-pink-300 border-pink-500/30",
  "Thơ & câu nói": "bg-violet-500/15 text-violet-300 border-violet-500/30",
  "Hội thoại": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "Phát âm": "bg-sky-500/15 text-sky-300 border-sky-500/30",
};

/** Trích video id từ link YouTube ở mọi định dạng phổ biến. */
// parseYouTubeId đã chuyển sang src/lib/youtube.ts (để test được).

export default function VideoPage() {
  const [catFilter, setCatFilter] = useState("Tất cả");
  const [levelFilter, setLevelFilter] = useState("all-filter");
  const [active, setActive] = useState<{ id: string; title: string } | null>(null);
  const [pasteUrl, setPasteUrl] = useState("");
  const [pasteError, setPasteError] = useState("");

  const filtered = useMemo(() => {
    return VIDEOS.filter((v) => {
      const okCat = catFilter === "Tất cả" || v.category === catFilter;
      const okLevel =
        levelFilter === "all-filter" || v.level === levelFilter || v.level === "all";
      return okCat && okLevel;
    });
  }, [catFilter, levelFilter]);

  function handlePaste(e: React.FormEvent) {
    e.preventDefault();
    const id = parseYouTubeId(pasteUrl);
    if (!id) {
      setPasteError("Link YouTube không hợp lệ. Hãy dán link dạng youtube.com/watch?v=… hoặc youtu.be/…");
      return;
    }
    setPasteError("");
    setActive({ id, title: "Video của bạn" });
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB] pb-24 pt-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-playfair text-3xl font-bold flex items-center gap-2">
            <Youtube className="text-[#E8634A]" size={28} /> Video
          </h1>
          <p className="text-[#8A8078] mt-1">
            Học tiếng Trung qua câu chuyện nhỏ, bài hát và câu nói hay — dễ nhớ, không khô khan.
          </p>
        </div>

        {/* Dán link YouTube bất kỳ */}
        <form
          onSubmit={handlePaste}
          className="mb-6 bg-[#161616] border border-[rgba(255,255,255,0.08)] rounded-2xl p-4"
        >
          <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <Sparkles size={15} className="text-[#E8A838]" /> Có video muốn học? Dán link vào đây
          </p>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-[#0D0D0D] border border-[rgba(255,255,255,0.1)] rounded-xl px-3">
              <Search size={15} className="text-[#5A5050] shrink-0" />
              <input
                value={pasteUrl}
                onChange={(e) => setPasteUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=…"
                className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-[#5A5050]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#E8634A] hover:bg-[#d43f39] text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap"
            >
              Xem ngay
            </button>
          </div>
          {pasteError && <p className="text-xs text-[#E8634A] mt-2">{pasteError}</p>}
        </form>

        {/* Bộ lọc chủ đề */}
        <div className="flex flex-wrap gap-2 mb-3">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                catFilter === c
                  ? "bg-[#E8634A] text-white border-[#E8634A]"
                  : "bg-[#1A1A1A] text-[#8A8078] border-[rgba(255,255,255,0.08)] hover:text-white"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Bộ lọc cấp độ */}
        <div className="flex flex-wrap gap-2 mb-6">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLevelFilter(l.id)}
              className={cn(
                "px-3 py-1 rounded-lg text-[11px] font-medium border transition-colors",
                levelFilter === l.id
                  ? "bg-[#242424] text-white border-[#E8634A]/50"
                  : "bg-transparent text-[#5A5050] border-[rgba(255,255,255,0.08)] hover:text-white"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Section kênh YouTube gợi ý */}
        <div className="mb-8">
          <p className="text-xs text-[#5A5050] uppercase tracking-widest mb-3">Kênh học hay</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {SUGGESTED_CHANNELS.map((ch) => (
              <a
                key={ch.name}
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-2 px-3 py-2 bg-[#161616] border border-[rgba(255,255,255,0.08)] rounded-xl hover:border-[#E8634A]/40 transition-colors"
              >
                <span className="text-lg">{ch.emoji}</span>
                <div>
                  <p className="text-xs font-semibold whitespace-nowrap">{ch.name}</p>
                  <p className="text-[10px] text-[#5A5050] whitespace-nowrap">{ch.desc}</p>
                </div>
                <ExternalLink size={11} className="text-[#5A5050] ml-1" />
              </a>
            ))}
          </div>
        </div>

        {/* Lưới video */}
        {filtered.length === 0 ? (
          <p className="text-center text-[#5A5050] py-16">
            Chưa có video phù hợp bộ lọc. Thử bỏ bớt điều kiện lọc nhé.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((v) => (
              <motion.button
                key={v.id}
                onClick={() => setActive({ id: v.id, title: v.title })}
                whileHover={{ y: -3 }}
                className="text-left bg-[#161616] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden hover:border-[#E8634A]/40 transition-colors group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-[#0D0D0D]">
                  <img
                    src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                    alt={v.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-[#E8634A] flex items-center justify-center shadow-lg">
                      <Play size={20} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                  {v.minutes && (
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[10px] bg-black/70 rounded">
                      {v.minutes} phút
                    </span>
                  )}
                </div>
                {/* Info */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] border",
                        CAT_COLOR[v.category] ?? "bg-[#242424] text-[#8A8078] border-[rgba(255,255,255,0.08)]"
                      )}
                    >
                      {v.category}
                    </span>
                    <span className="text-[10px] text-[#5A5050] uppercase">
                      {v.level === "all" ? "Mọi cấp" : v.level}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold leading-snug line-clamp-2">{v.title}</h3>
                  <p className="text-[11px] text-[#5A5050] mt-1">{v.channel}</p>
                  <p className="text-xs text-[#8A8078] mt-1.5 line-clamp-2">{v.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Trình phát modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl bg-[#161616] border border-[rgba(255,255,255,0.1)] rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.08)]">
                <h3 className="text-sm font-semibold truncate pr-2">{active.title}</h3>
                <button
                  onClick={() => setActive(null)}
                  className="w-8 h-8 rounded-full bg-[#242424] flex items-center justify-center text-[#8A8078] hover:text-white transition-colors shrink-0"
                  aria-label="Đóng"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="aspect-video bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${active.id}?rel=0&modestbranding=1`}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <p className="text-xs text-[#5A5050]">
                  Mẹo: bật phụ đề (CC) và nghe lại từng câu để luyện shadowing.
                </p>
                <a
                  href={`https://www.youtube.com/watch?v=${active.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[#E8634A] hover:underline whitespace-nowrap"
                >
                  Mở trên YouTube <ExternalLink size={12} />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
