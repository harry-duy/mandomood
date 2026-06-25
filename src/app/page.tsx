/**
 * Trang chủ — Daily Quote Page
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { RefreshCw, BookOpen, Wand2, Flame, MicVocal, ClipboardList, Mic } from "lucide-react";
import QuoteCard from "@/components/ui/QuoteCard";
import MoodFilter from "@/components/ui/MoodFilter";
import StreakCalendar from "@/components/ui/StreakCalendar";
import WordOfDay from "@/components/ui/WordOfDay";
import NextLesson from "@/components/ui/NextLesson";
import TrialReminderBanner from "@/components/ui/TrialReminderBanner";
import MoodCheckIn from "@/components/ui/MoodCheckIn";
import DailyGoalRing from "@/components/ui/DailyGoalRing";
import DueReviewCard from "@/components/ui/DueReviewCard";
import { useAppStore } from "@/store/useAppStore";
import { cn, readJSON } from "@/lib/utils";
import { dayKeyLocal } from "@/lib/streak";

// ── Types ────────────────────────────────────────────────────────────────────
interface Quote {
  _id: string;
  chinese_text: string;
  pinyin: string;
  translation: string;
  mood: string;
  level: string;
  cultural_note?: string;
  author?: string;
  view_count: number;
  save_count: number;
  // optional runtime fields
  daily_date?: string;
  is_daily?: boolean;
}

// ── Static quote pool ─────────────────────────────────────────────────────────
const STATIC_POOL: Omit<Quote, '_id' | 'view_count' | 'save_count'>[] = [
  { chinese_text: "有些人只能陪你走一段路", pinyin: "Yǒu xiē rén zhǐ néng péi nǐ zǒu yī duàn lù", translation: "Có những người chỉ có thể đồng hành cùng bạn một đoạn đường.", mood: "romantic", level: "hsk2", cultural_note: "Triết lý Phật giáo về vô thường.", author: undefined },
  { chinese_text: "你不需要完美，你只需要真实", pinyin: "Nǐ bù xūyào wánměi, nǐ zhǐ xūyào zhēnshí", translation: "Bạn không cần hoàn hảo, bạn chỉ cần chân thật.", mood: "healing", level: "hsk3", cultural_note: "Giá trị 真实 được Gen Z Trung Quốc đề cao.", author: undefined },
  { chinese_text: "不积跬步，无以至千里", pinyin: "Bù jī kuǐbù, wúyǐ zhì qiānlǐ", translation: "Không tích lũy từng bước nhỏ, không thể đi nghìn dặm.", mood: "motivation", level: "hsk4", cultural_note: "Thành ngữ từ Tuân Tử.", author: "荀子" },
  { chinese_text: "人生若只如初见", pinyin: "Rénshēng ruò zhǐ rú chū jiàn", translation: "Giá như cuộc đời mãi đẹp như lần đầu gặp gỡ.", mood: "aesthetic", level: "hsk5", cultural_note: "Câu thơ nổi tiếng nhất của Nạp Lan Tính Đức.", author: "纳兰性德" },
  { chinese_text: "缘分这东西，说来就来，说走就走", pinyin: "Yuánfèn zhè dōngxi, shuō lái jiù lái, shuō zǒu jiù zǒu", translation: "Duyên phận thứ đó, nói đến thì đến, nói đi thì đi.", mood: "sad", level: "hsk4", cultural_note: "缘分 — mối liên hệ định mệnh.", author: undefined },
  { chinese_text: "再难的路，走着走着就习惯了", pinyin: "Zài nán de lù, zǒuzhe zǒuzhe jiù xíguàn le", translation: "Con đường dù khó đến đâu, đi mãi rồi cũng quen.", mood: "motivation", level: "hsk3", cultural_note: "Triết lý kiên nhẫn.", author: undefined },
  { chinese_text: "有时候，沉默是最好的回答", pinyin: "Yǒushíhòu, chénmò shì zuì hǎo de huídá", translation: "Đôi khi, im lặng là câu trả lời tốt nhất.", mood: "aesthetic", level: "hsk3", cultural_note: "Im lặng trong văn hóa Trung Hoa mang nhiều ý nghĩa.", author: undefined },
  { chinese_text: "思念是一种病，你是我的药", pinyin: "Sīniàn shì yī zhǒng bìng, nǐ shì wǒ de yào", translation: "Nỗi nhớ là một căn bệnh, và bạn là thuốc của tôi.", mood: "romantic", level: "hsk4", cultural_note: "Ẩn dụ y học về tình yêu — viral trên Weibo.", author: undefined },
  { chinese_text: "你若安好，便是晴天", pinyin: "Nǐ ruò ān hǎo, biàn shì qíngtiān", translation: "Nếu bạn bình an, đó chính là trời quang.", mood: "healing", level: "hsk3", cultural_note: "Hạnh phúc của người mình yêu là ánh sáng.", author: undefined },
  { chinese_text: "忍一时风平浪静，退一步海阔天空", pinyin: "Rěn yī shí fēng píng làng jìng, tuì yī bù hǎi kuò tiān kōng", translation: "Nhẫn một lúc gió yên sóng lặng, lùi một bước biển rộng trời cao.", mood: "motivation", level: "hsk5", cultural_note: "Triết lý nhẫn nhịn.", author: undefined },
  { chinese_text: "落叶归根，游子思乡", pinyin: "Luò yè guī gēn, yóuzǐ sī xiāng", translation: "Lá rụng về cội, người xa nhớ quê.", mood: "sad", level: "hsk4", cultural_note: "Nỗi nhớ quê hương trong thơ Trung Hoa.", author: undefined },
  { chinese_text: "心有灵犀一点通", pinyin: "Xīn yǒu língxī yī diǎn tōng", translation: "Hai tâm hồn kết nối — chạm nhau là hiểu nhau ngay.", mood: "romantic", level: "hsk5", cultural_note: "Từ thơ Lý Thương Ẩn.", author: "李商隐" },
  { chinese_text: "梦里不知身是客，一晌贪欢", pinyin: "Mèng lǐ bù zhī shēn shì kè, yī shǎng tān huān", translation: "Trong mơ quên mình là khách tha hương, vui hưởng một lúc ngắn ngủi.", mood: "aesthetic", level: "hsk5", cultural_note: "Thơ Lý Dục.", author: "李煜" },
  { chinese_text: "山高水长，情深义重", pinyin: "Shān gāo shuǐ cháng, qíng shēn yì zhòng", translation: "Núi cao sông dài, tình nghĩa sâu nặng.", mood: "healing", level: "hsk4", cultural_note: "Dùng thiên nhiên để diễn tả tình cảm.", author: undefined },
  { chinese_text: "我们都是过客，何必太认真", pinyin: "Wǒmen dōu shì guòkè, hébì tài rènzhēn", translation: "Chúng ta đều là người qua đường, sao phải quá nghiêm túc.", mood: "sad", level: "hsk3", cultural_note: "Triết lý Đạo gia về sự vô thường.", author: undefined },
];

const FALLBACK_QUOTES: Quote[] = STATIC_POOL.map((q, i) => ({ ...q, _id: String(i + 1), view_count: 0, save_count: 0 }));

function getClientDailyQuote(): Quote {
  const d = new Date();
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  const q = STATIC_POOL[dayOfYear % STATIC_POOL.length];
  return { ...q, _id: `static_${dayOfYear}`, view_count: 0, save_count: 0, is_daily: true, daily_date: new Date().toISOString() };
}

// ── Quick access — 6 công cụ dùng nhiều nhất, còn lại nằm ở /explore ──
const FEATURED_TOOLS = [
  { href: "/daily-plan", icon: ClipboardList, label: "Kế hoạch", sublabel: "Nhiệm vụ hôm nay", gradient: "from-violet-500/20 to-blue-500/10", border: "border-violet-500/20" },
  { href: "/generate", icon: Wand2, label: "AI Story", sublabel: "Tạo câu chuyện", gradient: "from-mm-red/20 to-mm-gold/10", border: "border-mm-red/20" },
  { href: "/karaoke", icon: Mic, label: "Karaoke", sublabel: "Nghe · Shadowing · Chính tả", gradient: "from-[#E8504A]/20 to-rose-500/10", border: "border-[#E8504A]/20" },
  { href: "/hsk", icon: BookOpen, label: "HSK", sublabel: "Từ vựng HSK 1-6", gradient: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/20" },
  { href: "/pronunciation", icon: MicVocal, label: "Phát âm", sublabel: "Nói + nhận điểm AI", gradient: "from-rose-500/20 to-pink-500/10", border: "border-rose-500/20" },
  { href: "/challenge", icon: Flame, label: "Thử thách", sublabel: "6 câu mỗi ngày", gradient: "from-orange-500/20 to-red-500/10", border: "border-orange-500/20" },
];

type ToolItem = { href: string; icon: React.ElementType; label: string; sublabel: string; gradient: string; border: string };

function ToolGrid({ items, onNavigate }: { items: ToolItem[]; onNavigate: (href: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((tool) => (
        <button
          key={tool.href}
          onClick={() => onNavigate(tool.href)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl text-left",
            "bg-gradient-to-r border transition-all active:scale-95",
            tool.gradient, tool.border
          )}
        >
          <tool.icon size={18} className="text-[var(--text-secondary)] shrink-0" />
          <div>
            <p className="text-sm font-semibold leading-tight">{tool.label}</p>
            <p className="text-xs text-[var(--text-muted)] leading-tight">{tool.sublabel}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { dailyQuote, setDailyQuote, onboarding } = useAppStore();

  // Redirect new users to onboarding
  useEffect(() => {
    if (!onboarding.completed) {
      router.push("/onboarding");
    }
  }, [onboarding.completed, router]);
  const [loading, setLoading] = useState(false);
  const [quotes] = useState<Quote[]>(FALLBACK_QUOTES);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [nowMs] = useState(() => Date.now());
  const [localActiveDays, setLocalActiveDays] = useState<string[]>([]);

  // Đọc localStorage để lấy ngày học (story history + daily-plan)
  useEffect(() => {
    const days = new Set<string>();
    // Story history
    const history = readJSON<Array<{ createdAt: string }>>("mm_story_history", []);
    for (const h of history) {
      const d = new Date(h.createdAt);
      if (!isNaN(d.getTime())) days.add(dayKeyLocal(d));
    }
    // Daily-plan keys: mm_daily_plan_YYYY_M_D
    // Bọc try/catch: Safari private mode có thể ném khi truy cập localStorage.
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) ?? "";
        if (!key.startsWith("mm_daily_plan_")) continue;
        const parts = key.replace("mm_daily_plan_", "").split("_");
        if (parts.length !== 3) continue;
        const [y, m, dd] = parts;
        const plan = readJSON<Record<string, boolean>>(key, {});
        if (Object.values(plan).some(Boolean)) {
          days.add(`${y}-${String(m).padStart(2, "0")}-${String(dd).padStart(2, "0")}`);
        }
      }
    } catch { /* localStorage bị chặn — bỏ qua phần daily-plan */ }
    setLocalActiveDays(Array.from(days));
  }, []);

  const handleMoodCheckIn = (mood: string) => {
    setSelectedMood(mood);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbUser = (session as any)?.dbUser as { streak_days?: number } | undefined;
  const streakDays = dbUser?.streak_days ?? 0;

  const activeDays = useMemo(() => {
    // Backend streak: N consecutive days counting back from today
    const backendDays = Array.from({ length: Math.min(streakDays, 7) }, (_, i) =>
      dayKeyLocal(new Date(nowMs - i * 86400000))
    );
    // Merge với localStorage (chỉ giữ 7 ngày gần nhất)
    const cutoff = dayKeyLocal(new Date(nowMs - 6 * 86400000));
    const merged = new Set([...backendDays, ...localActiveDays.filter(d => d >= cutoff)]);
    return Array.from(merged);
  }, [streakDays, nowMs, localActiveDays]);

  const displayedQuotes = selectedMood
    ? quotes.filter((q) => q.mood === selectedMood)
    : quotes;

  const fetchDailyQuote = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/quotes/daily", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json() as { _id?: string };
        if (!data._id || data._id === "fallback") {
          setDailyQuote(getClientDailyQuote() as unknown as Parameters<typeof setDailyQuote>[0]);
        } else {
          setDailyQuote(data as unknown as Parameters<typeof setDailyQuote>[0]);
        }
      } else {
        setDailyQuote(getClientDailyQuote() as unknown as Parameters<typeof setDailyQuote>[0]);
      }
    } catch {
      setDailyQuote(getClientDailyQuote() as unknown as Parameters<typeof setDailyQuote>[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const stored = dailyQuote as unknown as Quote | null;
    const quoteDate = stored?.daily_date
      ? new Date(stored.daily_date).toISOString().slice(0, 10)
      : null;
    const isStale = !stored || quoteDate !== todayStr || stored._id === "fallback";
    if (isStale) fetchDailyQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayQuote = (dailyQuote as unknown as Quote) ?? displayedQuotes[0];

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
          {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })}
        </p>
        <h1 className="font-playfair text-2xl font-bold">Câu chuyện hôm nay ✨</h1>
      </motion.div>

      {/* Daily Mood Check-in */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="mb-5"
      >
        <MoodCheckIn onMoodSelect={handleMoodCheckIn} />
      </motion.div>

      {/* Daily Quote */}
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
          <QuoteCard quote={todayQuote ?? FALLBACK_QUOTES[0]} isDaily />
        )}
      </motion.div>

      {/* Streak Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.18 }}
        className="mb-6"
      >
        <DueReviewCard />
        <div className="mb-3">
          <DailyGoalRing />
        </div>
        <StreakCalendar
          currentStreak={streakDays}
          activeDays={activeDays}
          todayMood={selectedMood ?? undefined}
        />
        {/* Quick Stats — đọc localStorage, hiện với mọi user */}
        {localActiveDays.length > 0 && !session?.user && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="bg-surface rounded-2xl p-3 text-center border border-[rgba(255,255,255,0.06)]">
              <p className="text-lg font-bold text-mm-red">{localActiveDays.length}</p>
              <p className="text-[10px] text-[var(--text-muted)]">Ngày đã học</p>
            </div>
            <div className="bg-surface rounded-2xl p-3 text-center border border-[rgba(255,255,255,0.06)]">
              <p className="text-lg font-bold text-mm-gold">{readJSON<Array<unknown>>("mm_story_history", []).length}</p>
              <p className="text-[10px] text-[var(--text-muted)]">Truyện đã đọc</p>
            </div>
            <div className="bg-surface rounded-2xl p-3 text-center border border-[rgba(255,255,255,0.06)]">
              <p className="text-lg font-bold text-emerald-400">{readJSON<Array<{saved?: boolean}>>("mm_saved_words", []).length}</p>
              <p className="text-[10px] text-[var(--text-muted)]">Từ đã lưu</p>
            </div>
          </div>
        )}
        <div className="mt-2 flex items-center justify-center gap-4">
          <Link
            href="/progress"
            className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-mm-red transition-colors"
          >
            📈 Tiến trình
          </Link>
          <Link
            href="/lo-trinh"
            className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-mm-red transition-colors"
          >
            🗺️ Lộ trình
          </Link>
          <Link
            href="/so-tay"
            className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-mm-red transition-colors"
          >
            📒 Sổ tay từ
          </Link>
        </div>
      </motion.div>

      {/* Nhắc trial sắp hết / đã hết (dismiss theo ngày) */}
      <TrialReminderBanner />

      {/* Word of the Day */}
      <div className="mb-6">
        <WordOfDay />
      </div>

      {/* Gợi ý học tiếp theo — cá nhân hóa theo onboarding */}
      <NextLesson />

      {/* Quick Access Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-6 space-y-2"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Công cụ nổi bật</p>
          <Link href="/explore" className="text-xs text-mm-red font-medium">
            Xem tất cả →
          </Link>
        </div>
        <ToolGrid items={FEATURED_TOOLS} onNavigate={router.push} />

        {/* Khám phá full-width */}
        <button
          onClick={() => router.push("/explore")}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-gradient-to-r from-mm-brown/20 to-mm-gold/10 border border-mm-gold/20 transition-all active:scale-95 mt-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🧭</span>
            <div className="text-left">
              <p className="text-sm font-semibold">Khám phá tất cả công cụ</p>
              <p className="text-xs text-[var(--text-muted)]">30+ công cụ: karaoke, chiết tự, đề thi HSK, luyện viết…</p>
            </div>
          </div>
          <span className="text-[var(--text-muted)] text-sm">→</span>
        </button>
      </motion.div>

      {/* Mood Filter + Quote Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Câu hay theo mood</p>
          <button onClick={() => router.push("/feed")} className="text-xs text-mm-red font-medium">
            Xem tất cả →
          </button>
        </div>
        <MoodFilter selected={selectedMood} onChange={setSelectedMood} />
      </motion.div>

      {/* Quote scroll feed */}
      <div className="space-y-4 mb-20">
        {displayedQuotes.slice(0, 5).map((quote, idx) => (
          <motion.div
            key={quote._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 * idx }}
          >
            <QuoteCard quote={quote} isDaily={false} />
          </motion.div>
        ))}
        {displayedQuotes.length === 0 && (
          <p className="text-center py-10 text-[var(--text-muted)]">Không có câu nào cho mood này</p>
        )}
        <button
          onClick={() => router.push("/feed")}
          className="w-full py-3 rounded-2xl border border-[rgba(255,255,255,0.08)] text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          Xem thêm bài học →
        </button>
      </div>
    </div>
  );
}
