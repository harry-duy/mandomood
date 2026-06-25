"use client";

/**
 * StreakCalendar — Hiển thị 7 ngày gần nhất
 * - Mỗi ô = 1 ngày; màu tùy mood của hoạt động hôm đó
 * - Ngày hôm nay highlight viền đỏ
 * - Khoá ngày theo GIỜ ĐỊA PHƯƠNG qua buildWeekDays (@/lib/streak) → đồng bộ với
 *   activeDays (local) + đúng cho user VN (trước đây dùng toISOString/UTC → lệch ô).
 */

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";
import { buildWeekDays } from "@/lib/streak";

interface DayData {
  date: Date;
  active: boolean;
  isToday: boolean;
  mood?: string;
  xp?: number;
}

interface Props {
  currentStreak: number;
  /** Mảng khoá ngày (local) YYYY-MM-DD của những ngày đã học. */
  activeDays?: string[];
  /** Mood hôm nay */
  todayMood?: string;
}

const MOOD_DOT_COLORS: Record<string, string> = {
  romantic:   "#E8504A",
  healing:    "#8FAF8F",
  motivation: "#E8C94A",
  sad:        "#7B9EC4",
  friendship: "#C48B6E",
  aesthetic:  "#C4A8D4",
  funny:      "#E8A84A",
  default:    "#E8504A",
};

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function StreakCalendar({ currentStreak, activeDays = [], todayMood }: Props) {
  const days = useMemo<DayData[]>(() => {
    return buildWeekDays(activeDays).map((d) => ({
      date: d.date,
      active: d.active,
      isToday: d.isToday,
      mood: d.isToday ? todayMood : undefined,
      // XP giả lập ổn định theo khoá ngày (local) để tooltip không nhảy số mỗi render.
      xp: d.active ? (d.key.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0) % 40 + 10) : 0,
    }));
  }, [activeDays, todayMood]);

  const weekDone = days.filter((d) => d.active).length;

  return (
    <div className="card space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Flame size={15} className="text-[#E8504A]" />
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Chuỗi học
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Flame size={13} className="text-[#E8C94A]" />
          <span className="text-sm font-bold text-[#E8C94A]">{currentStreak}</span>
          <span className="text-xs text-[var(--text-muted)]">ngày</span>
        </div>
      </div>

      {/* Calendar dots */}
      <div className="flex items-end justify-between gap-1">
        {days.map((day, i) => {
          const isToday = day.isToday;
          const dotColor = day.active
            ? (MOOD_DOT_COLORS[day.mood ?? "default"] ?? MOOD_DOT_COLORS.default)
            : "rgba(255,255,255,0.06)";
          const dayLabel = DAY_LABELS[day.date.getDay()];

          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              {/* XP tooltip on hover */}
              <div className="relative group">
                <div
                  className={cn(
                    "w-full aspect-square rounded-xl transition-all duration-200",
                    isToday && "ring-2 ring-[#E8504A] ring-offset-1 ring-offset-[#0D0D0D]",
                    day.active && "shadow-[0_0_8px_rgba(232,80,74,0.3)]"
                  )}
                  style={{
                    background: dotColor,
                    minWidth: "28px",
                    minHeight: "28px",
                  }}
                />
                {/* Tooltip */}
                {day.active && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-[rgba(255,255,255,0.1)] text-[10px] text-white px-1.5 py-0.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    +{day.xp} XP
                  </div>
                )}
              </div>
              <span className={cn(
                "text-[9px] font-medium",
                isToday ? "text-[#E8504A]" : "text-[var(--text-muted)]"
              )}>
                {dayLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* Week progress */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>Tuần này: <strong className="text-white">{weekDone}/7</strong> ngày</span>
        {weekDone === 7 && (
          <span className="text-[#E8C94A] text-[10px] font-semibold">🎉 Perfect week!</span>
        )}
        {weekDone >= 5 && weekDone < 7 && (
          <span className="text-[#8FAF8F] text-[10px]">Gần hoàn hảo rồi!</span>
        )}
      </div>
    </div>
  );
}
