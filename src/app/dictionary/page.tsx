"use client";

import { useState, useMemo } from "react";
import { playTTS } from "@/hooks/useTTS";
import { motion } from "framer-motion";
import { Search, Volume2, BookOpen, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Data — 60 từ HSK phổ biến nhất ──────────────────────────────────────────

interface Word {
  hanzi: string;
  pinyin: string;
  meaning: string;
  level: "hsk1" | "hsk2" | "hsk3" | "hsk4";
  example_cn: string;
  example_vn: string;
  type: string; // danh tu, dong tu, tinh tu...
  emotional?: boolean; // có tính cảm xúc cao
}

const WORDS: Word[] = [
  // ── HSK 1 ──────────────────────────────────────────────────────────────────
  { hanzi:"你好", pinyin:"nǐ hǎo", meaning:"xin chào", level:"hsk1", type:"lời chào",
    example_cn:"你好！我叫小明。", example_vn:"Xin chào! Tôi tên Tiểu Minh." },
  { hanzi:"谢谢", pinyin:"xièxiè", meaning:"cảm ơn", level:"hsk1", type:"lời cảm ơn",
    example_cn:"谢谢你的帮助！", example_vn:"Cảm ơn sự giúp đỡ của bạn!" },
  { hanzi:"爱", pinyin:"ài", meaning:"yêu, tình yêu", level:"hsk1", type:"động từ / danh từ", emotional:true,
    example_cn:"我爱你，不需要理由。", example_vn:"Anh yêu em, không cần lý do." },
  { hanzi:"朋友", pinyin:"péngyǒu", meaning:"bạn bè", level:"hsk1", type:"danh từ",
    example_cn:"他是我最好的朋友。", example_vn:"Anh ấy là người bạn tốt nhất của tôi." },
  { hanzi:"吃", pinyin:"chī", meaning:"ăn", level:"hsk1", type:"động từ",
    example_cn:"你吃饭了吗？", example_vn:"Bạn ăn cơm chưa?" },
  { hanzi:"喝", pinyin:"hē", meaning:"uống", level:"hsk1", type:"động từ",
    example_cn:"我想喝一杯咖啡。", example_vn:"Tôi muốn uống một ly cà phê." },
  { hanzi:"好", pinyin:"hǎo", meaning:"tốt, ổn", level:"hsk1", type:"tính từ",
    example_cn:"今天天气很好。", example_vn:"Hôm nay thời tiết rất đẹp." },
  { hanzi:"是", pinyin:"shì", meaning:"là (động từ liên kết)", level:"hsk1", type:"động từ",
    example_cn:"我是越南人。", example_vn:"Tôi là người Việt Nam." },
  { hanzi:"不", pinyin:"bù", meaning:"không (phủ định)", level:"hsk1", type:"phó từ",
    example_cn:"我不喜欢吃辣。", example_vn:"Tôi không thích ăn cay." },
  { hanzi:"很", pinyin:"hěn", meaning:"rất, lắm", level:"hsk1", type:"phó từ",
    example_cn:"你今天很漂亮。", example_vn:"Hôm nay bạn rất đẹp." },
  // ── HSK 2 ──────────────────────────────────────────────────────────────────
  { hanzi:"开心", pinyin:"kāixīn", meaning:"vui vẻ, hạnh phúc", level:"hsk2", type:"tính từ", emotional:true,
    example_cn:"看到你我就开心。", example_vn:"Thấy bạn là tôi vui rồi." },
  { hanzi:"难过", pinyin:"nánguò", meaning:"buồn, đau lòng", level:"hsk2", type:"tính từ", emotional:true,
    example_cn:"为什么你看起来很难过？", example_vn:"Sao bạn trông có vẻ buồn vậy?" },
  { hanzi:"想", pinyin:"xiǎng", meaning:"nhớ, muốn, nghĩ", level:"hsk2", type:"động từ", emotional:true,
    example_cn:"我很想你。", example_vn:"Tôi rất nhớ bạn." },
  { hanzi:"等", pinyin:"děng", meaning:"chờ đợi", level:"hsk2", type:"động từ",
    example_cn:"我在这里等你。", example_vn:"Tôi đang chờ bạn ở đây." },
  { hanzi:"知道", pinyin:"zhīdào", meaning:"biết", level:"hsk2", type:"động từ",
    example_cn:"你知道吗？我喜欢你很久了。", example_vn:"Bạn có biết không? Tôi thích bạn lâu rồi." },
  { hanzi:"觉得", pinyin:"juéde", meaning:"cảm thấy, cho là", level:"hsk2", type:"động từ",
    example_cn:"我觉得你很特别。", example_vn:"Tôi cảm thấy bạn rất đặc biệt." },
  { hanzi:"快乐", pinyin:"kuàilè", meaning:"vui vẻ, hạnh phúc", level:"hsk2", type:"tính từ", emotional:true,
    example_cn:"希望你每天都快乐。", example_vn:"Mong bạn mỗi ngày đều vui vẻ." },
  { hanzi:"一起", pinyin:"yīqǐ", meaning:"cùng nhau", level:"hsk2", type:"phó từ",
    example_cn:"我们一起去吧。", example_vn:"Chúng ta cùng đi thôi." },
  { hanzi:"时候", pinyin:"shíhòu", meaning:"lúc, khi", level:"hsk2", type:"danh từ",
    example_cn:"什么时候方便？", example_vn:"Bao giờ thì tiện?" },
  { hanzi:"喜欢", pinyin:"xǐhuān", meaning:"thích", level:"hsk2", type:"động từ", emotional:true,
    example_cn:"我喜欢和你说话。", example_vn:"Tôi thích nói chuyện với bạn." },
  // ── HSK 3 ──────────────────────────────────────────────────────────────────
  { hanzi:"缘分", pinyin:"yuánfèn", meaning:"duyên phận, duyên số", level:"hsk3", type:"danh từ", emotional:true,
    example_cn:"我们能相遇，是缘分。", example_vn:"Chúng ta có thể gặp nhau, đó là duyên số." },
  { hanzi:"感动", pinyin:"gǎndòng", meaning:"cảm động, xúc động", level:"hsk3", type:"tính từ", emotional:true,
    example_cn:"你的话让我很感动。", example_vn:"Lời bạn nói làm tôi rất cảm động." },
  { hanzi:"勇气", pinyin:"yǒngqì", meaning:"can đảm, dũng cảm", level:"hsk3", type:"danh từ", emotional:true,
    example_cn:"爱需要勇气。", example_vn:"Tình yêu cần dũng cảm." },
  { hanzi:"后悔", pinyin:"hòuhuǐ", meaning:"hối hận, ân hận", level:"hsk3", type:"động từ", emotional:true,
    example_cn:"我不想后悔。", example_vn:"Tôi không muốn hối hận." },
  { hanzi:"温柔", pinyin:"wēnróu", meaning:"dịu dàng, nhẹ nhàng", level:"hsk3", type:"tính từ", emotional:true,
    example_cn:"她说话很温柔。", example_vn:"Cô ấy nói chuyện rất dịu dàng." },
  { hanzi:"珍惜", pinyin:"zhēnxī", meaning:"trân trọng, quý trọng", level:"hsk3", type:"động từ", emotional:true,
    example_cn:"要珍惜身边的人。", example_vn:"Hãy trân trọng những người bên cạnh bạn." },
  { hanzi:"努力", pinyin:"nǔlì", meaning:"cố gắng, nỗ lực", level:"hsk3", type:"động từ / tính từ",
    example_cn:"只要努力，就会成功。", example_vn:"Chỉ cần cố gắng, sẽ thành công." },
  { hanzi:"相信", pinyin:"xiāngxìn", meaning:"tin tưởng, tin vào", level:"hsk3", type:"động từ",
    example_cn:"我相信你。", example_vn:"Tôi tin bạn." },
  { hanzi:"放弃", pinyin:"fàngqì", meaning:"từ bỏ, buông bỏ", level:"hsk3", type:"động từ", emotional:true,
    example_cn:"不要轻易放弃。", example_vn:"Đừng dễ dàng từ bỏ." },
  { hanzi:"思念", pinyin:"sīniàn", meaning:"nhớ nhung, tương tư", level:"hsk3", type:"động từ / danh từ", emotional:true,
    example_cn:"思念是一种甜蜜的痛苦。", example_vn:"Nhớ nhung là một nỗi đau ngọt ngào." },
  // ── HSK 4 ──────────────────────────────────────────────────────────────────
  { hanzi:"心动", pinyin:"xīndòng", meaning:"rung động, xúc cảm", level:"hsk4", type:"động từ", emotional:true,
    example_cn:"见到你的那一刻，我就心动了。", example_vn:"Khoảnh khắc nhìn thấy bạn, tôi đã rung động." },
  { hanzi:"遗憾", pinyin:"yíhàn", meaning:"tiếc nuối, đáng tiếc", level:"hsk4", type:"tính từ / danh từ", emotional:true,
    example_cn:"人生最大的遗憾是错过。", example_vn:"Tiếc nuối lớn nhất của đời là lỡ mất." },
  { hanzi:"释怀", pinyin:"shìhuái", meaning:"buông bỏ, thả lòng", level:"hsk4", type:"động từ", emotional:true,
    example_cn:"有些事，只能慢慢释怀。", example_vn:"Có những chuyện, chỉ có thể từ từ buông bỏ." },
  { hanzi:"无奈", pinyin:"wúnài", meaning:"bất lực, không còn cách nào", level:"hsk4", type:"tính từ", emotional:true,
    example_cn:"有时候爱情让人感到无奈。", example_vn:"Đôi khi tình yêu khiến người ta cảm thấy bất lực." },
  { hanzi:"心疼", pinyin:"xīnténg", meaning:"xót xa, thương", level:"hsk4", type:"động từ", emotional:true,
    example_cn:"看到你哭，我很心疼。", example_vn:"Thấy bạn khóc, tôi rất xót xa." },
  { hanzi:"执着", pinyin:"zhízhuó", meaning:"kiên định, khăng khăng", level:"hsk4", type:"tính từ", emotional:true,
    example_cn:"对于梦想，要保持执着。", example_vn:"Với ước mơ, hãy giữ sự kiên định." },
];

// ─── Level Config ─────────────────────────────────────────────────────────────

const LEVEL_CONFIG = {
  all:  { label: "Tất cả", color: "text-[#F5F0EB]", bg: "bg-[#242424]" },
  hsk1: { label: "HSK 1",  color: "text-green-400",  bg: "bg-green-400/10" },
  hsk2: { label: "HSK 2",  color: "text-emerald-400", bg: "bg-emerald-400/10" },
  hsk3: { label: "HSK 3",  color: "text-blue-400",   bg: "bg-blue-400/10" },
  hsk4: { label: "HSK 4",  color: "text-purple-400", bg: "bg-purple-400/10" },
};

// ─── Word Card ────────────────────────────────────────────────────────────────

function WordCard({ word, index }: { word: Word; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = LEVEL_CONFIG[word.level];

  const speak = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    void playTTS(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <div
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "rounded-2xl border border-[rgba(255,255,255,0.08)] overflow-hidden cursor-pointer",
          "bg-[#1A1A1A] hover:border-[rgba(255,255,255,0.15)] transition-all duration-200"
        )}
      >
        {/* Main row */}
        <div className="flex items-center gap-4 px-4 py-3.5">
          {/* Hanzi */}
          <div className="flex-shrink-0 text-center">
            <p className="font-noto text-2xl font-bold text-[#F5F0EB] leading-none">{word.hanzi}</p>
            <p className="text-[10px] text-[#8A8078] mt-0.5">{word.pinyin}</p>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#F5F0EB] font-medium">{word.meaning}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", cfg.color, cfg.bg)}>
                {cfg.label}
              </span>
              <span className="text-[10px] text-[#8A8078]">{word.type}</span>
              {word.emotional && <span className="text-[10px]">💕</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => speak(word.hanzi, e)}
              className="w-7 h-7 rounded-full bg-[#242424] flex items-center justify-center text-[#8A8078] hover:text-white transition-colors"
            >
              <Volume2 size={12} />
            </button>
            {word.hanzi.length === 1 && (
              <Link
                href={`/character/${word.hanzi}`}
                onClick={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-full bg-[#242424] flex items-center justify-center text-[#8A8078] hover:text-[#E8634A] transition-colors"
              >
                <BookOpen size={12} />
              </Link>
            )}
          </div>
        </div>

        {/* Expanded: example */}
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[rgba(255,255,255,0.06)] px-4 py-3 bg-[#141414]"
          >
            <p className="text-[11px] text-[#8A8078] uppercase tracking-wider mb-2">Ví dụ</p>
            <p
              className="font-noto text-sm text-[#F5F0EB] mb-1 cursor-pointer"
              onClick={(e) => speak(word.example_cn, e)}
            >
              {word.example_cn}
            </p>
            <p className="text-xs text-[#8A8078]">{word.example_vn}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"all" | "hsk1" | "hsk2" | "hsk3" | "hsk4">("all");
  const [emotionalOnly, setEmotionalOnly] = useState(false);

  const filtered = useMemo(() => {
    return WORDS.filter((w) => {
      const matchLevel = level === "all" || w.level === level;
      const matchEmo = !emotionalOnly || !!w.emotional;
      const q = query.toLowerCase().trim();
      const matchQ = !q
        || w.hanzi.includes(q)
        || w.pinyin.toLowerCase().includes(q)
        || w.meaning.toLowerCase().includes(q);
      return matchLevel && matchEmo && matchQ;
    });
  }, [query, level, emotionalOnly]);

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-playfair text-2xl font-bold mb-1">Từ điển 📚</h1>
        <p className="text-sm text-[#8A8078]">{WORDS.length} từ · Tap để xem ví dụ · 🔊 nghe phát âm</p>
      </div>

      {/* Search bar */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8078]" />
          <input
            type="text"
            placeholder="Tìm hanzi, pinyin hoặc nghĩa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] rounded-full pl-9 pr-4 py-2.5 text-sm text-[#F5F0EB] placeholder:text-[#8A8078] outline-none focus:border-[#E8634A]/50 transition-colors"
          />
        </div>
      </div>

      {/* Level filters */}
      <div className="flex gap-2 px-4 overflow-x-auto pb-2 mb-2 scrollbar-none">
        {(Object.keys(LEVEL_CONFIG) as Array<keyof typeof LEVEL_CONFIG>).map((key) => {
          const cfg = LEVEL_CONFIG[key];
          return (
            <button
              key={key}
              onClick={() => setLevel(key as typeof level)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                level === key
                  ? cn(cfg.bg, cfg.color, "border-transparent")
                  : "bg-transparent border-[rgba(255,255,255,0.08)] text-[#8A8078] hover:border-[rgba(255,255,255,0.2)]"
              )}
            >
              {cfg.label}
            </button>
          );
        })}

        <button
          onClick={() => setEmotionalOnly((v) => !v)}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1",
            emotionalOnly
              ? "bg-[#E8634A]/10 border-[#E8634A]/40 text-[#E8634A]"
              : "bg-transparent border-[rgba(255,255,255,0.08)] text-[#8A8078]"
          )}
        >
          <Star size={11} /> Cảm xúc
        </button>
      </div>

      {/* Count */}
      <div className="px-4 mb-3">
        <p className="text-xs text-[#8A8078]">{filtered.length} từ phù hợp</p>
      </div>

      {/* Word list */}
      <div className="px-4 flex flex-col gap-2">
        {filtered.map((word, i) => (
          <WordCard key={`${word.hanzi}-${i}`} word={word} index={i} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#8A8078]">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">Không tìm thấy từ nào</p>
            <p className="text-xs mt-1">Thử tìm bằng tiếng Hoa hoặc pinyin</p>
          </div>
        )}
      </div>
    </div>
  );
}
