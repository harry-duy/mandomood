/**
 * MoodCheckIn — Widget check-in tâm trạng hàng ngày
 * Chọn mood → ghi vào localStorage → ảnh hưởng StreakCalendar + gợi ý nội dung
 */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, readJSON, writeJSON } from "@/lib/utils";
import { dayKeyLocal } from "@/lib/streak";

const MOODS = [
  { key: "romantic",   emoji: "💌", label: "Lãng mạn",  color: "from-pink-500/30 to-rose-500/10",    border: "border-pink-500/40"    },
  { key: "healing",    emoji: "🌿", label: "Chữa lành",  color: "from-emerald-500/30 to-teal-500/10", border: "border-emerald-500/40" },
  { key: "motivation", emoji: "🔥", label: "Năng lượng", color: "from-orange-500/30 to-amber-500/10", border: "border-orange-500/40"  },
  { key: "sad",        emoji: "🌙", label: "Trầm lắng",  color: "from-blue-500/30 to-indigo-500/10",  border: "border-blue-500/40"    },
  { key: "aesthetic",  emoji: "✨", label: "Thơ mộng",   color: "from-purple-500/30 to-violet-500/10", border: "border-purple-500/40"          },
  { key: "funny",      emoji: "😄", label: "Vui vẻ",     color: "from-yellow-500/30 to-amber-500/10", border: "border-yellow-500/40"  },
];

const CHECKIN_KEY = "mm_daily_mood";

interface CheckInData {
  mood: string;
  date: string;
}

interface Props {
  onMoodSelect?: (mood: string) => void;
}

export default function MoodCheckIn({ onMoodSelect }: Props) {
  const [checkedIn, setCheckedIn] = useState<CheckInData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const data = readJSON<CheckInData | null>(CHECKIN_KEY, null);
    if (!data) return;
    const today = dayKeyLocal(new Date()); // khoá ngày local (đồng bộ toàn app)
    if (data.date === today) {
      setCheckedIn(data);
      onMoodSelect?.(data.mood);
    }
  }, [onMoodSelect]);

  const handleSelect = (moodKey: string) => {
    const today = dayKeyLocal(new Date()); // khoá ngày local (đồng bộ toàn app)
    const data: CheckInData = { mood: moodKey, date: today };
    writeJSON(CHECKIN_KEY, data);
    setCheckedIn(data);
    onMoodSelect?.(moodKey);
  };

  // Already checked in today — show compact badge
  if (checkedIn) {
    const m = MOODS.find(m => m.key === checkedIn.mood);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-2xl border bg-gradient-to-r",
          m?.color, m?.border
        )}
      >
        <span className="text-xl">{m?.emoji}</span>
        <div className="flex-1">
          <p className="text-xs text-[var(--text-muted)]">Tâm trạng hôm nay</p>
          <p className="text-sm font-semibold">{m?.label}</p>
        </div>
        <button
          onClick={() => { try { localStorage.removeItem(CHECKIN_KEY); } catch { /* noop */ } setCheckedIn(null); }}
          className="text-xs text-[var(--text-muted)] hover:text-white transition-colors"
        >
          Đổi
        </button>
      </motion.div>
    );
  }

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="bg-surface rounded-3xl border border-[rgba(255,255,255,0.08)] p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-sm">Hôm nay bạn đang cảm thấy thế nào? 🌸</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Chọn để nhận nội dung phù hợp tâm trạng</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-[var(--text-muted)] hover:text-white text-lg leading-none transition-colors"
          >
            ×
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood.key}
              onClick={() => handleSelect(mood.key)}
              className={cn(
                "flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all active:scale-95",
                "bg-surface2 border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)]"
              )}
            >
              <span className="text-xl">{mood.emoji}</span>
              <span className="text-xs text-[var(--text-muted)]">{mood.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
