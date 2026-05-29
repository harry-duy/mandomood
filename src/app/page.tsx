/**
 * Trang chủ — Daily Quote Page
 * Đây là màn hình đầu tiên user thấy khi mở MandoMood
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import QuoteCard from "@/components/ui/QuoteCard";
import MoodFilter from "@/components/ui/MoodFilter";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

interface Quote {
  _id: string;
  chinese_text: string;
  pinyin: string;
  translation: string;
  mood: string;
  level: string;
  cultural_note?: string;
  author?: string;
}

// Quotes tĩnh để fallback khi chưa có DB
const FALLBACK_QUOTES: Quote[] = [
  {
    _id: "1",
    chinese_text: "有些人只能陪你走一段路",
    pinyin: "Yǒu xiē rén zhǐ néng péi nǐ zǒu yī duàn lù",
    translation: "Có những người chỉ có thể đồng hành cùng bạn một đoạn đường.",
    mood: "romantic",
    level: "hsk2",
    cultural_note: "Câu này phản ánh triết lý Phật giáo về vô thường trong mối quan hệ — mọi người đến và đi trong cuộc đời ta đều có ý nghĩa.",
  },
  {
    _id: "2",
    chinese_text: "你不需要完美，你只需要真实",
    pinyin: "Nǐ bù xūyào wánměi, nǐ zhǐ xūyào zhēnshí",
    translation: "Bạn không cần hoàn hảo, bạn chỉ cần chân thật.",
    mood: "healing",
    level: "hsk3",
    cultural_note: "Giá trị 真实 (chân thật) được đề cao trong văn hóa Trung Quốc hiện đại, đặc biệt với Gen Z.",
  },
  {
    _id: "3",
    chinese_text: "不积跬步，无以至千里",
    pinyin: "Bù jī kuǐbù, wúyǐ zhì qiānlǐ",
    translation: "Không tích lũy từng bước nhỏ, không thể đi nghìn dặm.",
    mood: "motivation",
    level: "hsk4",
    author: "Tuân Tử",
    cultural_note: "Thành ngữ cổ điển từ Tuân Tử, vẫn được dùng rộng rãi trong tiếng Trung hiện đại để nói về sự kiên trì.",
  },
  {
    _id: "4",
    chinese_text: "人生若只如初见",
    pinyin: "Rénshēng ruò zhǐ rú chū jiàn",
    translation: "Giá như cuộc đời mãi đẹp như lần đầu gặp gỡ.",
    mood: "aesthetic",
    level: "hsk5",
    author: "Nạp Lan Tính Đức",
    cultural_note: "Câu thơ nổi tiếng nhất của nhà thơ Nạp Lan Tính Đức (清朝). Được yêu thích nhất trên Weibo trong nhiều năm liền.",
  },
  {
    _id: "5",
    chinese_text: "缘分这东西，说来就来，说走就走",
    pinyin: "Yuánfèn zhè dōngxi, shuō lái jiù lái, shuō zǒu jiù zǒu",
    translation: "Duyên phận thứ đó, nói đến thì đến, nói đi thì đi.",
    mood: "sad",
    level: "hsk4",
    cultural_note: "缘分 (yuánfèn) là khái niệm văn hóa không có từ tương đương trong tiếng Anh — mối liên hệ định mệnh giữa người với người.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { dailyQuote, setDailyQuote } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quotes] = useState<Quote[]>(FALLBACK_QUOTES);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const displayedQuotes = selectedMood
    ? quotes.filter((q) => q.mood === selectedMood)
    : quotes;

  // Fetch daily quote từ API
  useEffect(() => {
    if (!dailyQuote) {
      fetchDailyQuote();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDailyQuote = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/quotes/daily");
      if (res.ok) {
        const data = await res.json();
        setDailyQuote(data);
      }
    } catch {
      // Dùng fallback nếu API lỗi (chưa có DB)
      console.log("API chưa sẵn sàng, dùng fallback quotes");
    } finally {
      setLoading(false);
    }
  };

  const todayQuote = dailyQuote ?? displayedQuotes[currentIndex];

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
          })}
        </p>
        <h1 className="font-playfair text-2xl font-bold">
          Câu chuyện hôm nay ✨
        </h1>
      </motion.div>

      {/* Daily Quote — hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-6"
      >
        {loading ? (
          <div className="rounded-3xl bg-surface border border-[rgba(255,255,255,0.08)] h-64 flex items-center justify-center">
            <RefreshCw size={24} className="text-mm-red animate-spin" />
          </div>
        ) : (
          <QuoteCard
            quote={todayQuote ?? FALLBACK_QUOTES[0]}
            isDaily
          />
        )}
      </motion.div>

      {/* AI Hub */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-6 grid grid-cols-2 gap-3"
      >
        <button
          className={cn(
            "flex items-center justify-center gap-2",
            "bg-gradient-to-r from-mm-red/20 to-mm-gold/10",
            "border border-mm-red/20 rounded-2xl py-3.5",
            "text-sm font-medium text-[#F5F0EB]",
            "hover:from-mm-red/30 hover:border-mm-red/40 transition-all duration-300"
          )}
          onClick={() => router.push("/generate")}
        >
          <Sparkles size={15} className="text-mm-red" />
          AI Story
        </button>
        <button
          className={cn(
            "flex items-center justify-center gap-2",
            "bg-gradient-to-r from-[#8A9DC9]/20 to-[#7AB8D4]/10",
            "border border-[#8A9DC9]/20 rounded-2xl py-3.5",
            "text-sm font-medium text-[#F5F0EB]",
            "hover:from-[#8A9DC9]/30 hover:border-[#8A9DC9]/40 transition-all duration-300"
          )}
          onClick={() => router.push("/smart-lesson")}
        >
          <span className="text-[#8A9DC9]">AI</span>
          Smart Lesson
        </button>
      </motion.div>

      {/* Mood filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="mb-4"
      >
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
          Khám phá theo mood
        </p>
        <MoodFilter selected={selectedMood} onChange={setSelectedMood} />
      </motion.div>

      {/* Quote list */}
      <div className="flex flex-col gap-4">
        {displayedQuotes.map((quote, i) => (
          <motion.div
            key={quote._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
            onClick={() => setCurrentIndex(i)}
          >
            <QuoteCard
              quote={quote}
              className={cn(
                currentIndex === i && !dailyQuote
                  ? "border-mm-red/30"
                  : ""
              )}
            />
          </motion.div>
        ))}

        {displayedQuotes.length === 0 && (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <p className="text-4xl mb-3">🌸</p>
            <p className="text-sm">Không có quote với mood này</p>
          </div>
        )}
      </div>

      {/* Bottom spacer */}
      <div className="h-8" />
    </div>
  );
}
