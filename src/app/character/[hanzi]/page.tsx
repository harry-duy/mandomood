"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Lightbulb, Star } from "lucide-react";
import { useState } from "react";
import { playTTS } from "@/hooks/useTTS";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Dynamic import HanziWriterDisplay — tránh SSR crash
const HanziWriterDisplay = dynamic(
  () => import("@/components/ui/HanziWriterDisplay"),
  {
    ssr: false,
    loading: () => (
      <div className="w-32 h-32 rounded-2xl bg-[#111111] border-2 border-[rgba(255,255,255,0.1)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#E8504A]/30 border-t-[#E8504A] rounded-full animate-spin" />
      </div>
    ),
  }
);

// ─── Hanzi data (sẽ fetch từ DB sau) ─────────────────────────────────────────

const HANZI_DATA: Record<string, {
  hanzi: string; pinyin: string; tone: number; meaning: string[];
  radical: string; stroke_count: number; hsk_level: number;
  origin_story: string; visual_mnemonic: string; emotional_hook: string;
  example_sentences: { zh: string; pinyin: string; vi: string }[];
  related: string[];
}> = {
  爱: {
    hanzi: "爱", pinyin: "ài", tone: 4, meaning: ["tình yêu", "yêu", "thích"],
    radical: "心", stroke_count: 10, hsk_level: 2,
    origin_story: "Chữ 爱 trong tiếng Trung giản thể có 心 (trái tim) ở trung tâm. Chữ 爱 truyền thống 愛 bao gồm 心 (tim), 受 (nhận), và 友 (bạn bè) — tình yêu là khi bạn nhận bạn bè vào trái tim.",
    visual_mnemonic: "Hình dung: một trái tim 心 được bọc bởi hai cánh tay đang ôm — đó chính là 爱.",
    emotional_hook: "Người Trung Quốc nói '我爱你' (wǒ ài nǐ) nhưng thường chỉ nói khi thật sự nghiêm túc. Những cảm xúc nhỏ hàng ngày được thể hiện qua hành động, không phải lời nói.",
    example_sentences: [
      { zh: "我爱你", pinyin: "Wǒ ài nǐ", vi: "Anh/em yêu bạn" },
      { zh: "我爱喝咖啡", pinyin: "Wǒ ài hē kāfēi", vi: "Tôi thích uống cà phê" },
      { zh: "爱情很复杂", pinyin: "Àiqíng hěn fùzá", vi: "Tình yêu rất phức tạp" },
    ],
    related: ["情", "心", "恋", "爱好"],
  },
  心: {
    hanzi: "心", pinyin: "xīn", tone: 1, meaning: ["tim", "tâm", "lòng", "ý nghĩ"],
    radical: "心", stroke_count: 4, hsk_level: 3,
    origin_story: "Chữ 心 có nguồn gốc là hình ảnh của trái tim người thực. Trong tiếng Trung cổ, 心 đại diện cho cả trái tim vật lý lẫn tâm trí — vì người xưa tin rằng suy nghĩ xuất phát từ tim.",
    visual_mnemonic: "Nhìn chữ 心: ba nét như ba giọt máu nhỏ từ trái tim, và một nét cong bên dưới như quả tim. Đơn giản nhưng đầy cảm xúc.",
    emotional_hook: "心 xuất hiện trong hàng trăm từ cảm xúc: 心情 (tâm trạng), 心动 (rung động), 心碎 (tan vỡ lòng). Học 心 là học tất cả ngôn ngữ cảm xúc tiếng Trung.",
    example_sentences: [
      { zh: "你在我心里", pinyin: "Nǐ zài wǒ xīn lǐ", vi: "Bạn ở trong lòng tôi" },
      { zh: "今天心情很好", pinyin: "Jīntiān xīnqíng hěn hǎo", vi: "Tâm trạng hôm nay rất tốt" },
      { zh: "我全心全意", pinyin: "Wǒ quánxīn quányì", vi: "Tôi hết lòng hết dạ" },
    ],
    related: ["爱", "情", "心情", "心动"],
  },
  缘: {
    hanzi: "缘", pinyin: "yuán", tone: 2, meaning: ["duyên", "duyên phận", "lý do", "viền"],
    radical: "糸", stroke_count: 12, hsk_level: 5,
    origin_story: "缘 gồm bộ 糸 (sợi chỉ — mối liên hệ) và phần bên phải nghĩa là 'đường viền'. Người xưa hình dung duyên phận như những sợi chỉ đỏ vô hình kết nối những người có duyên với nhau.",
    visual_mnemonic: "Tưởng tượng những sợi chỉ đỏ (糸) quấn quanh hai người — đó là 缘 phận giữa họ.",
    emotional_hook: "Sợi chỉ đỏ (红线) trong văn hóa Trung Hoa: Thần Tơ Hồng buộc sợi chỉ đỏ vào cổ tay hai người có duyên, dù họ ở đâu, dù thế nào — họ sẽ gặp nhau.",
    example_sentences: [
      { zh: "这是我们的缘分", pinyin: "Zhè shì wǒmen de yuánfèn", vi: "Đây là duyên phận của chúng ta" },
      { zh: "无缘无故", pinyin: "Wú yuán wú gù", vi: "Không có lý do gì cả" },
      { zh: "有缘再见", pinyin: "Yǒu yuán zàijiàn", vi: "Nếu có duyên thì gặp lại" },
    ],
    related: ["分", "缘分", "命运", "红线"],
  },
};

const TONE_COLORS: Record<number, string> = {
  1: "#7AB8D4", // flat — blue
  2: "#8FAF8F", // rising — green
  3: "#D4AF37", // dip — gold
  4: "#E8504A", // falling — red
};

const TONE_NAME: Record<number, string> = {
  1: "Thanh bằng (—)",
  2: "Thanh sắc (/)",
  3: "Thanh hỏi (∨)",
  4: "Thanh nặng (\\)",
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CharacterPage() {
  const params = useParams();
  const router = useRouter();
  const [mastery, setMastery] = useState(2); // 0-5
  const [showOrigin, setShowOrigin] = useState(false);

  const hanziKey = decodeURIComponent(params.hanzi as string);
  const data = HANZI_DATA[hanziKey];

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <p className="font-semibold mb-2">Chưa có dữ liệu cho chữ này</p>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Chúng mình đang cập nhật thêm dữ liệu cho chữ <strong className="font-chinese text-mm-gold">{hanziKey}</strong>
        </p>
        <button onClick={() => router.back()} className="btn-primary">
          Quay lại
        </button>
      </div>
    );
  }

  const toneColor = TONE_COLORS[data.tone] ?? "#8A8078";

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Quay lại
      </button>

      {/* Hero: Hanzi + info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-6 items-start mb-8"
      >
        <HanziWriterDisplay hanzi={data.hanzi} toneColor={toneColor} size={128} />

        <div className="flex-1">
          {/* Pinyin + tone */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-2xl font-bold tracking-wider"
              style={{ color: toneColor }}
            >
              {data.pinyin}
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${toneColor}20`, color: toneColor }}
            >
              {TONE_NAME[data.tone]}
            </span>
          </div>

          {/* Meanings */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {data.meaning.map((m) => (
              <span key={m} className="text-xs px-2.5 py-1 bg-surface2 rounded-full text-[#F5F0EB]">
                {m}
              </span>
            ))}
          </div>

          {/* HSK + strokes */}
          <div className="flex gap-2 text-[10px] text-[var(--text-muted)]">
            <span>HSK {data.hsk_level}</span>
            <span>·</span>
            <span>Bộ thủ: {data.radical}</span>
            <span>·</span>
            <span>{data.stroke_count} nét</span>
          </div>
        </div>
      </motion.div>

      {/* Mastery indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">
            Mức độ thuộc
          </p>
          <p className="text-xs text-mm-gold font-semibold">{mastery}/5</p>
        </div>
        <div className="flex gap-1.5 mb-3">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => {
                setMastery(level);
                toast(level === 5 ? "🏆 Thuộc hoàn toàn! +30 XP" : `✨ Level ${level}/5 · Tiếp tục luyện!`);
              }}
              className={cn(
                "flex-1 h-2 rounded-full transition-all duration-300",
                level <= mastery ? "bg-mm-gold" : "bg-surface2"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          {mastery <= 1 && "Mới gặp — cần học thêm"}
          {mastery === 2 && "Nhận ra khi thấy — học thêm vài lần nữa"}
          {mastery === 3 && "Nhớ nghĩa — cần luyện thêm pinyin"}
          {mastery === 4 && "Gần thuộc — ôn lại một lần nữa"}
          {mastery === 5 && "🏆 Thuộc hoàn toàn — xuất sắc!"}
        </p>
      </motion.div>

      {/* Content sections */}
      <div className="space-y-4">
        {/* Visual mnemonic */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={15} className="text-mm-gold" />
            <p className="text-xs text-mm-gold uppercase tracking-widest font-semibold">
              🧠 Mẹo nhớ hình ảnh
            </p>
          </div>
          <p className="text-sm text-[#F5F0EB] leading-relaxed font-light">
            {data.visual_mnemonic}
          </p>
        </motion.div>

        {/* Emotional hook */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card border-[rgba(232,80,74,0.15)]"
          style={{ background: "rgba(232,80,74,0.03)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">❤️</span>
            <p className="text-xs text-mm-rose uppercase tracking-widest font-semibold">
              Kết nối cảm xúc
            </p>
          </div>
          <p className="text-sm text-[#F5F0EB] leading-relaxed font-light">
            {data.emotional_hook}
          </p>
        </motion.div>

        {/* Origin story — collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card"
        >
          <button
            onClick={() => setShowOrigin(!showOrigin)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <BookOpen size={15} className="text-[#7AB8D4]" />
              <p className="text-xs text-[#7AB8D4] uppercase tracking-widest font-semibold">
                Nguồn gốc chữ
              </p>
            </div>
            <span className={cn("text-[var(--text-muted)] text-xs transition-transform", showOrigin && "rotate-180")}>▼</span>
          </button>

          {showOrigin && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-[#F5F0EB] leading-relaxed font-light mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]"
            >
              {data.origin_story}
            </motion.p>
          )}
        </motion.div>

        {/* Example sentences */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
            💬 Ví dụ câu ({data.example_sentences.length})
          </p>
          <div className="space-y-3">
            {data.example_sentences.map((ex, i) => (
              <div
                key={i}
                className="cursor-pointer group"
                onClick={() => {
                  void playTTS(ex.zh);
                }}
              >
                <p className="font-chinese text-lg font-bold group-hover:text-mm-gold transition-colors">
                  {ex.zh}
                </p>
                <p className="text-xs text-mm-gold/60 mb-0.5">{ex.pinyin}</p>
                <p className="text-xs text-[var(--text-muted)] italic">{ex.vi}</p>
                {i < data.example_sentences.length - 1 && (
                  <div className="w-full h-px bg-[rgba(255,255,255,0.05)] mt-3" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Related characters */}
        {data.related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="card"
          >
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
              🔗 Chữ liên quan
            </p>
            <div className="flex gap-2 flex-wrap">
              {data.related.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    const char = r.charAt(0);
                    if (HANZI_DATA[char]) {
                      router.push(`/character/${encodeURIComponent(char)}`);
                    } else {
                      toast(`Chữ "${r}" sẽ có sớm!`);
                    }
                  }}
                  className="font-chinese text-lg px-3 py-2 bg-surface2 rounded-xl hover:bg-[rgba(212,175,55,0.1)] hover:text-mm-gold transition-all"
                >
                  {r}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mark as learned */}
        <motion.button
          onClick={() => {
            setMastery(Math.min(5, mastery + 1));
            toast(mastery >= 4 ? "🏆 Thuộc rồi! +30 XP" : "✅ Đã ôn lại · +10 XP");
          }}
          whileTap={{ scale: 0.97 }}
          className="w-full btn-primary py-4 flex items-center justify-center gap-2"
        >
          <Star size={16} fill="currentColor" />
          Đánh dấu đã học · +10 XP
        </motion.button>
      </div>

      <div className="h-8" />
    </div>
  );
}
