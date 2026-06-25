"use client";

/**
 * DailyGoalRing — Mục tiêu XP hàng ngày, kiểu Duolingo.
 *
 * - Đọc XP kiếm được hôm nay từ localStorage (mm_xp_YYYY-MM-DD).
 * - Mục tiêu mặc định: 50 XP/ngày (tương đương 2–3 hoạt động).
 * - Hiển thị: thanh progress màu cam + streak fire + tỉ lệ % + message động lực.
 * - Không cần backend — hoạt động hoàn toàn offline.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Zap, Pencil } from "lucide-react";
import { readJSON, writeJSON } from "@/lib/utils";
import { cn } from "@/lib/utils";

const DEFAULT_XP_GOAL = 50; // XP target mặc định
const GOAL_KEY = "mm_daily_goal";
/** Các mức mục tiêu cho user chọn (kiểu Duolingo) */
const GOAL_OPTIONS: { xp: number; label: string }[] = [
  { xp: 20, label: "Nhẹ nhàng" },
  { xp: 50, label: "Bình thường" },
  { xp: 100, label: "Nghiêm túc" },
  { xp: 150, label: "Cường độ cao" },
];

function xpKeyFor(d: Date): string {
  return `mm_xp_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getTodayKey(): string {
  return xpKeyFor(new Date());
}

/**
 * Đếm chuỗi ngày học liên tiếp (streak kiểu Duolingo) từ localStorage.
 * - Lùi từ hôm nay; mỗi ngày có XP > 0 thì +1.
 * - Hôm nay CHƯA học (0 XP) không làm đứt chuỗi: vẫn tính từ hôm qua trở về,
 *   để buổi sáng chưa học không hiển thị 0 gây nản.
 */
function computeLocalStreak(): number {
  if (typeof localStorage === "undefined") return 0;
  let streak = 0;
  const cursor = new Date();
  // Nếu hôm nay chưa có XP, bắt đầu đếm từ hôm qua (cho phép 1 ngày "ân hạn" trong ngày).
  if (readJSON<number>(xpKeyFor(cursor), 0) <= 0) {
    cursor.setDate(cursor.getDate() - 1);
  }
  // Đếm ngược các ngày liên tiếp có XP > 0 (giới hạn 365 để an toàn).
  for (let i = 0; i < 365; i++) {
    if (readJSON<number>(xpKeyFor(cursor), 0) > 0) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function countDailyPlanDone(): number {
  const now = new Date();
  const key = `mm_daily_plan_${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}`;
  const plan = readJSON<Record<string, boolean>>(key, {});
  return Object.values(plan).filter(Boolean).length;
}

const MESSAGES = {
  zero:    "Bắt đầu hôm nay — chỉ cần 1 bài thôi! 🌱",
  quarter: "Đã bắt đầu rồi — tiếp tục nhé! 💪",
  half:    "Đã qua nửa đường — sắp xong rồi! 🔥",
  almost:  "Gần đạt mục tiêu — thêm một chút nữa! ⚡",
  done:    "Đạt mục tiêu hôm nay! Xuất sắc! 🎉",
  over:    "Vượt mục tiêu! Bạn đang bứt phá! 👑",
};

export default function DailyGoalRing() {
  const [xpToday, setXpToday] = useState(0);
  const [tasks, setTasks] = useState(0);
  const [streak, setStreak] = useState(0);
  const [goal, setGoal] = useState(DEFAULT_XP_GOAL);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setXpToday(readJSON<number>(getTodayKey(), 0));
      setTasks(countDailyPlanDone());
      setStreak(computeLocalStreak());
      setGoal(readJSON<number>(GOAL_KEY, DEFAULT_XP_GOAL));
    };
    refresh();
    // Cập nhật ngay khi nhận XP (cùng tab) hoặc tab khác ghi localStorage
    window.addEventListener("mm:xp", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("mm:xp", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const selectGoal = (xp: number) => {
    writeJSON(GOAL_KEY, xp);
    setGoal(xp);
    setEditing(false);
  };

  const pct = Math.min(1, xpToday / goal);
  const reached = xpToday >= goal;
  const remaining = Math.max(0, goal - xpToday);

  const message =
    xpToday === 0    ? MESSAGES.zero :
    xpToday >= goal * 1.5 ? MESSAGES.over :
    reached          ? MESSAGES.done :
    pct >= 0.75      ? MESSAGES.almost :
    pct >= 0.5       ? MESSAGES.half :
                       MESSAGES.quarter;

  return (
    <div className={cn(
      "rounded-2xl border p-4 transition-all",
      reached
        ? "bg-mm-gold/8 border-mm-gold/30"
        : "bg-surface border-[rgba(255,255,255,0.07)]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={14} className={reached ? "text-mm-gold" : "text-mm-red"} />
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Mục tiêu hôm nay
          </span>
          {streak > 0 && (
            <span
              className="flex items-center gap-0.5 rounded-full bg-mm-red/12 px-2 py-0.5 text-[11px] font-bold text-mm-red"
              title={`Chuỗi ${streak} ngày học liên tiếp`}
            >
              <Flame size={11} />
              {streak}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {tasks > 0 && (
            <span className="text-[10px] text-[var(--text-muted)]">{tasks} task ·</span>
          )}
          <span className={cn("text-sm font-bold", reached ? "text-mm-gold" : "text-[var(--text)]")}>
            {xpToday} <span className="text-xs font-normal text-[var(--text-muted)]">/ {goal} XP</span>
          </span>
          <button
            onClick={() => setEditing((v) => !v)}
            aria-label="Đổi mục tiêu XP mỗi ngày"
            className="text-[var(--text-muted)] hover:text-mm-red transition-colors p-0.5"
          >
            <Pencil size={12} />
          </button>
        </div>
      </div>

      {/* Goal picker — chọn mục tiêu XP/ngày */}
      {editing && (
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {GOAL_OPTIONS.map((opt) => (
            <button
              key={opt.xp}
              onClick={() => selectGoal(opt.xp)}
              className={cn(
                "flex flex-col items-center rounded-xl py-1.5 border transition-all",
                goal === opt.xp
                  ? "bg-mm-red/15 border-mm-red/40 text-mm-red"
                  : "bg-surface2 border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
              )}
            >
              <span className="text-sm font-bold">{opt.xp}</span>
              <span className="text-[9px] leading-tight">{opt.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="relative h-3 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden mb-2.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", reached ? "bg-mm-gold" : "bg-mm-red")}
        />
        {/* Milestone marks at 25, 50, 75% */}
        {[25, 50, 75].map((p) => (
          <div
            key={p}
            className="absolute top-0 bottom-0 w-px bg-[rgba(0,0,0,0.2)]"
            style={{ left: `${p}%` }}
          />
        ))}
      </div>

      {/* Message + streak pip */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-[var(--text-muted)] leading-tight">{message}</p>
        {reached ? (
          <div className="flex items-center gap-1 text-mm-gold">
            <Flame size={13} />
            <span className="text-[11px] font-bold">
              {streak > 0 ? `Chuỗi ${streak} ngày!` : "Chuỗi tiếp tục!"}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-[var(--text-muted)]">còn {remaining} XP</span>
        )}
      </div>
    </div>
  );
}
