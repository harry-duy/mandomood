"use client";

/**
 * /profile — Ho so nguoi dung
 * - Stats: XP, streak, saved count (real API)
 * - Achievements
 * - Saved quotes tab (real API via useSavedQuotes)
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Flame, Star, Heart,
  Settings, LogIn, ChevronRight, Zap, Trophy,
  HeartOff, ExternalLink
} from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { useProgress } from "@/hooks/useProgress";
import { useSavedQuotes } from "@/hooks/useSavedQuotes";
import { cn } from "@/lib/utils";
import Image from "next/image";

// ─── Level config ─────────────────────────────────────────────────────────────
const LEVEL_CONFIG: Record<string, {
  label: string; hanzi: string; color: string; nextXP: number; emoji: string;
}> = {
  beginner: { label: "Moi bat dau", hanzi: "初见", color: "#8A8078", nextXP: 100, emoji: "🌱" },
  hsk1:     { label: "HSK 1",       hanzi: "好奇", color: "#7AB8D4", nextXP: 300, emoji: "🌸" },
  hsk2:     { label: "HSK 2",       hanzi: "迷恋", color: "#8FAF8F", nextXP: 700, emoji: "🌿" },
  hsk3:     { label: "HSK 3",       hanzi: "心动", color: "#D4AF37", nextXP: 1500, emoji: "⭐" },
  hsk4:     { label: "HSK 4",       hanzi: "相知", color: "#E8504A", nextXP: 3000, emoji: "🔥" },
  hsk5:     { label: "HSK 5",       hanzi: "深情", color: "#C9878A", nextXP: 6000, emoji: "💎" },
  hsk6:     { label: "HSK 6",       hanzi: "灵魂", color: "#D4AF37", nextXP: 9999, emoji: "👑" },
};

const LEVEL_ORDER = ["beginner", "hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6"];

const MOOD_COLOR: Record<string, string> = {
  romantic: "#E8634A",
  motivation: "#E8A838",
  healing: "#8FAF8F",
  aesthetic: "#8A9DC9",
  sad: "#6B7FA8",
  funny: "#E8A838",
};

function getPrevLevelXP(level: string): number {
  const thresholds: Record<string, number> = {
    beginner: 0, hsk1: 100, hsk2: 300, hsk3: 700, hsk4: 1500, hsk5: 3000, hsk6: 6000,
  };
  return thresholds[level] ?? 0;
}

// ─── Streak fire display ──────────────────────────────────────────────────────
function StreakDisplay({ days }: { days: number }) {
  const intensity = days >= 30 ? "text-[#E8504A]" : days >= 7 ? "text-[#D4AF37]" : "text-[#8A8078]";
  return (
    <div className="flex items-center gap-1.5">
      <Flame size={20} className={cn("shrink-0", intensity)} />
      <span className="text-2xl font-bold leading-none">{days}</span>
      <span className="text-xs text-[#8A8078] mt-1">ngay</span>
    </div>
  );
}

// ─── XP Progress bar ──────────────────────────────────────────────────────────
function XPProgressBar({ xp, level }: { xp: number; level: string }) {
  const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.beginner;
  const prevXP = getPrevLevelXP(level);
  const range = cfg.nextXP - prevXP;
  const progress = level === "hsk6" ? 100 : Math.min(100, ((xp - prevXP) / range) * 100);
  const xpToNext = level === "hsk6" ? 0 : Math.max(0, cfg.nextXP - xp);
  const nextLevel = LEVEL_ORDER[LEVEL_ORDER.indexOf(level) + 1];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#8A8078]">
          {level === "hsk6"
            ? "Level toi da"
            : `${xpToNext.toLocaleString()} XP den ${nextLevel?.toUpperCase() ?? ""}`
          }
        </span>
        <span className="text-[#D4AF37] font-semibold">{xp.toLocaleString()} XP</span>
      </div>
      <div className="h-2 rounded-full bg-[#1A1A1A] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})` }}
        />
      </div>
    </div>
  );
}

// ─── Saved Quote Card ─────────────────────────────────────────────────────────
interface SavedQuote {
  _id: string;
  chinese_text: string;
  pinyin: string;
  translation: string;
  mood: string;
  author?: string;
}

function SavedQuoteCard({
  quote,
  onUnsave,
}: {
  quote: SavedQuote;
  onUnsave: (id: string) => void;
}) {
  const accent = MOOD_COLOR[quote.mood] ?? "#8A9DC9";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="rounded-2xl p-4 relative"
      style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Mood dot */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full"
          style={{ color: accent, background: `${accent}18` }}
        >
          {quote.mood}
        </span>
      </div>

      {/* Chinese */}
      <p
        className="font-noto text-xl leading-relaxed mb-1"
        style={{ color: "#F5F0EB" }}
      >
        {quote.chinese_text}
      </p>

      {/* Pinyin */}
      <p className="text-xs text-[#5A5450] mb-2">{quote.pinyin}</p>

      {/* Divider */}
      <div className="h-px w-8 mb-2" style={{ background: `${accent}50` }} />

      {/* Translation */}
      <p className="text-sm italic text-[#8A8078] leading-relaxed">
        &ldquo;{quote.translation}&rdquo;
      </p>

      {quote.author && (
        <p className="text-xs text-[#3A3A3A] mt-1">&mdash; {quote.author}</p>
      )}

      {/* Unsave button */}
      <button
        onClick={() => onUnsave(quote._id)}
        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-[#5A5450] hover:text-[#E8504A] hover:bg-[rgba(232,80,74,0.1)] transition-all"
        aria-label="Bo luu"
      >
        <HeartOff size={13} />
      </button>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { stats, loading: progressLoading } = useProgress();
  const { quotes: savedQuotes, count: savedCount, loading: savesLoading, toggleSave } = useSavedQuotes();
  const [showSaved, setShowSaved] = useState(false);

  const user = session?.user;
  const isLoggedIn = !!user;
  const displayName = user?.name ?? "Khach";
  const initial = displayName.charAt(0).toUpperCase();

  const level = stats.level ?? "beginner";
  const xp = stats.xp ?? 0;
  const streak = stats.streak_days ?? 0;

  const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.beginner;

  const handleUnsave = async (quoteId: string) => {
    await toggleSave(quoteId);
  };

  // Loading skeleton
  if (status === "loading" || (isLoggedIn && progressLoading)) {
    return (
      <div className="min-h-screen px-4 py-6 max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 rounded-full bg-[#1A1A1A] animate-pulse" />
            <div className="h-4 w-20 rounded-full bg-[#1A1A1A] animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-[#1A1A1A] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto pb-24">

      {/* ── Avatar + Name ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4 mb-6"
      >
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-[rgba(255,255,255,0.08)]">
            {user?.image ? (
              <Image src={user.image} alt={displayName} width={64} height={64} />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: "linear-gradient(135deg, #E8504A, #D4AF37)" }}
              >
                {initial}
              </div>
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 text-base leading-none">
            {cfg.emoji}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{displayName}</h1>
          <p className="text-sm" style={{ color: cfg.color }}>
            {cfg.hanzi} &middot; {cfg.label}
          </p>
          {user?.email && (
            <p className="text-xs text-[#5A5450] truncate mt-0.5">{user.email}</p>
          )}
        </div>

        <button
          className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#5A5450] hover:text-white transition-colors shrink-0"
          onClick={() => {}}
          aria-label="Cai dat"
        >
          <Settings size={16} />
        </button>
      </motion.div>

      {/* ── XP Progress ── */}
      {isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl bg-[#141414] p-4 mb-4"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} style={{ color: cfg.color }} />
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: cfg.color }}>
              Tien do cap do
            </p>
          </div>
          <XPProgressBar xp={xp} level={level} />
        </motion.div>
      )}

      {/* ── Stats grid ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="grid grid-cols-2 gap-3 mb-4"
      >
        {/* Streak */}
        <div className="rounded-2xl bg-[#141414] p-4" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] text-[#5A5450] uppercase tracking-wider mb-2">Streak</p>
          <StreakDisplay days={streak} />
          <p className="text-[10px] text-[#5A5450] mt-1">
            {streak === 0 ? "Hay hoc hom nay!" : streak >= 30 ? "Xuat sac!" : "Tiep tuc nhe!"}
          </p>
        </div>

        {/* XP */}
        <div className="rounded-2xl bg-[#141414] p-4" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] text-[#5A5450] uppercase tracking-wider mb-2">Tong XP</p>
          <div className="flex items-center gap-1.5">
            <Star size={20} className="text-[#D4AF37] shrink-0" />
            <span className="text-2xl font-bold leading-none">{xp.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-[#5A5450] mt-1">{level.toUpperCase()}</p>
        </div>

        {/* Lessons */}
        <div className="rounded-2xl bg-[#141414] p-4" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] text-[#5A5450] uppercase tracking-wider mb-2">Bai da hoc</p>
          <div className="flex items-center gap-1.5">
            <BookOpen size={20} className="text-[#8FAF8F] shrink-0" />
            <span className="text-2xl font-bold leading-none">{Math.floor(xp / 20)}</span>
          </div>
          <p className="text-[10px] text-[#5A5450] mt-1">bai hoan thanh</p>
        </div>

        {/* Saved — clickable, shows real count from API */}
        <button
          onClick={() => isLoggedIn && setShowSaved((v) => !v)}
          className="rounded-2xl bg-[#141414] p-4 text-left hover:bg-[#1A1A1A] transition-colors"
          style={{ border: `1px solid ${showSaved ? "rgba(201,135,138,0.3)" : "rgba(255,255,255,0.06)"}` }}
        >
          <p className="text-[10px] text-[#5A5450] uppercase tracking-wider mb-2">Da luu</p>
          <div className="flex items-center gap-1.5">
            <Heart size={20} className="text-[#C9878A] shrink-0" />
            <span className="text-2xl font-bold leading-none">
              {savesLoading ? (
                <span className="inline-block w-6 h-6 rounded bg-[#242424] animate-pulse" />
              ) : savedCount}
            </span>
          </div>
          <p className="text-[10px] mt-1" style={{ color: showSaved ? "#C9878A" : "#5A5450" }}>
            {showSaved ? "Tap de dong" : "cau quote"}
          </p>
        </button>
      </motion.div>

      {/* ── Saved Quotes Panel ── */}
      <AnimatePresence>
        {showSaved && isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden mb-4"
          >
            <div className="rounded-2xl bg-[#0D0D0D] p-4" style={{ border: "1px solid rgba(201,135,138,0.15)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Heart size={14} className="text-[#C9878A]" />
                <p className="text-xs text-[#C9878A] uppercase tracking-widest font-semibold">
                  Cau da luu ({savedCount})
                </p>
              </div>

              {savesLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-28 rounded-2xl bg-[#1A1A1A] animate-pulse" />
                  ))}
                </div>
              ) : savedQuotes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">🌸</p>
                  <p className="text-sm text-[#5A5450]">Chua co cau nao duoc luu</p>
                  <button
                    onClick={() => router.push("/feed")}
                    className="mt-3 flex items-center gap-1.5 mx-auto text-xs text-[#8A8078] hover:text-white transition-colors"
                  >
                    <ExternalLink size={11} />
                    Kham pha quotes
                  </button>
                </div>
              ) : (
                <motion.div layout className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {savedQuotes.map((q) => (
                      <SavedQuoteCard
                        key={q._id}
                        quote={q}
                        onUnsave={handleUnsave}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Achievements ── */}
      {isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="rounded-2xl bg-[#141414] p-4 mb-4"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} className="text-[#D4AF37]" />
            <p className="text-xs text-[#D4AF37] uppercase tracking-widest font-semibold">
              Thanh tich
            </p>
          </div>
          <div className="space-y-2">
            {[
              { label: "Ngay dau tien", emoji: "🌱", done: xp >= 20 },
              { label: "7 ngay lien tuc", emoji: "🔥", done: streak >= 7 },
              { label: "Dat HSK 1", emoji: "🌸", done: xp >= 100 },
              { label: "100 XP", emoji: "⭐", done: xp >= 100 },
              { label: "30 ngay streak", emoji: "💎", done: streak >= 30 },
              { label: "Dat HSK 3", emoji: "👑", done: xp >= 700 },
            ].map(({ label, emoji, done }) => (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-2 text-sm",
                  done ? "text-[#F5F0EB]" : "text-[#3A3A3A]"
                )}
              >
                <span className={cn("text-base", !done && "grayscale opacity-30")}>{emoji}</span>
                <span className={done ? "" : "line-through"}>{label}</span>
                {done && <span className="ml-auto text-[10px] text-[#8FAF8F]">check</span>}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Quick links ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="rounded-2xl bg-[#141414] overflow-hidden mb-6"
        style={{ border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {[
          { label: "Kham pha quotes moi", href: "/feed", emoji: "✨", sub: "Feed hom nay" },
          { label: "Tao story AI", href: "/generate", emoji: "🤖", sub: "Ca nhan hoa" },
          { label: "Luyen voi AI Tutor", href: "/ai-tutor", emoji: "💬", sub: "Chat ngay" },
        ].map(({ label, href, emoji, sub }, i, arr) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#1A1A1A] transition-colors text-left",
              i < arr.length - 1 && "border-b border-[rgba(255,255,255,0.04)]"
            )}
          >
            <span className="text-lg">{emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#F5F0EB]">{label}</p>
              <p className="text-xs text-[#5A5450]">{sub}</p>
            </div>
            <ChevronRight size={16} className="text-[#3A3A3A]" />
          </button>
        ))}
      </motion.div>

      {/* ── Login prompt ── */}
      {!isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 text-center"
          style={{ border: "1px solid rgba(232,80,74,0.2)", background: "rgba(232,80,74,0.04)" }}
        >
          <p className="text-3xl mb-3">🌸</p>
          <p className="font-semibold mb-1">Dang nhap de luu tien trinh</p>
          <p className="text-sm text-[#8A8078] mb-4 leading-relaxed">
            Streak, XP va bo suu tap quote se duoc luu vinh vien
          </p>
          <button
            onClick={() => signIn("google", { callbackUrl: "/profile" })}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#E8504A] text-white font-semibold text-sm hover:bg-[#d43f39] transition-colors"
          >
            <LogIn size={16} />
            Dang nhap voi Google
          </button>
        </motion.div>
      )}
    </div>
  );
}
