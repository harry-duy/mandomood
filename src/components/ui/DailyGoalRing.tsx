"use client";

/**
 * DailyGoalRing — vòng tiến độ mục tiêu hôm nay.
 * Mục tiêu suy từ onboarding.dailyGoal (phút): 5→1, 10→2, 20→4 hoạt động/ngày.
 * "Hoạt động" = stories tạo hôm nay + daily-plan tasks đã check hôm nay.
 */

import { useEffect, useState } from "react";
import { readJSON } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

function isToday(iso: string): boolean {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

/** Đọc số task daily-plan đã check hôm nay từ localStorage */
function countDailyPlanDone(): number {
  const now = new Date();
  const key = `mm_daily_plan_${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}`;
  const plan = readJSON<{ checked: Record<string, boolean> }>(key, { checked: {} });
  return Object.values(plan.checked || {}).filter(Boolean).length;
}

export default function DailyGoalRing() {
  const dailyGoal = useAppStore((s) => s.onboarding.dailyGoal);
  const target = Math.max(1, Math.round((dailyGoal || 10) / 5));
  const [done, setDone] = useState(0);
  const [breakdown, setBreakdown] = useState({ stories: 0, tasks: 0 });

  useEffect(() => {
    const hist = readJSON<{ createdAt: string }[]>("mm_story_history", []);
    const stories = hist.filter((h) => isToday(h.createdAt)).length;
    const tasks = countDailyPlanDone();
    const total = stories + tasks;
    setBreakdown({ stories, tasks });
    setDone(total);
  }, []);

  const pct = Math.min(1, done / target);
  const R = 34;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - pct);
  const reached = done >= target;

  const subtitle = reached
    ? "Tuyệt vời — giữ chuỗi nhé!"
    : breakdown.tasks > 0
    ? `${breakdown.tasks} task · ${breakdown.stories} truyện — cần thêm ${target - done} nữa.`
    : `Tạo thêm ${target - done} hoạt động để hoàn thành.`;

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-surface border border-[rgba(255,255,255,0.07)] p-4">
      <div className="relative shrink-0" style={{ width: 80, height: 80 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" role="img" aria-label={`Mục tiêu hôm nay: ${done} trên ${target}`}>
          <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="7" />
          <circle
            cx="40" cy="40" r={R} fill="none"
            stroke={reached ? "var(--gold)" : "var(--red)"}
            strokeWidth="7" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={offset}
            transform="rotate(-90 40 40)"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-lg font-bold">
          {reached ? "✅" : `${done}/${target}`}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold">{reached ? "Đạt mục tiêu hôm nay! 🎉" : "Mục tiêu hôm nay"}</p>
        <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
      </div>
    </div>
  );
}
