"use client";

/**
 * NextLesson — gợi ý "học gì tiếp theo" CÁ NHÂN HÓA theo onboarding (level + goal).
 *
 * Không cần backend: đọc trực tiếp từ store (đã persist localStorage). Mỗi mục tiêu
 * (du lịch / C-drama / công việc / văn hóa / giải trí) map sang một lộ trình gợi ý
 * khác nhau, đúng tinh thần MandoMood: học qua truyện & cảm xúc, không cứng nhắc.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { readJSON } from "@/lib/utils";
import { buildRoadmap } from "@/lib/roadmap";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Mới bắt đầu",
  hsk1: "HSK 1", hsk2: "HSK 2", hsk3: "HSK 3",
  hsk4: "HSK 4", hsk5: "HSK 5", hsk6: "HSK 6",
};

const GOAL_LABEL: Record<string, string> = {
  travel: "Du lịch", drama: "C-drama & nhạc", business: "Công việc",
  culture: "Văn hóa", fun: "Giải trí",
};

/** Đếm streak ngày liên tiếp từ lịch sử truyện (mm_story_history). */
function computeStreak(dates: string[]): number {
  const days = new Set(dates.map((d) => d.slice(0, 10)));
  let streak = 0;
  const cur = new Date();
  // cho phép hôm nay HOẶC hôm qua là mốc bắt đầu (chưa học hôm nay vẫn giữ chuỗi)
  const today = cur.toISOString().slice(0, 10);
  if (!days.has(today)) cur.setDate(cur.getDate() - 1);
  for (;;) {
    const key = cur.toISOString().slice(0, 10);
    if (days.has(key)) { streak++; cur.setDate(cur.getDate() - 1); } else break;
  }
  return streak;
}

export default function NextLesson() {
  const onboarding = useAppStore((s) => s.onboarding);
  const goal = onboarding?.goal ?? "fun";
  const level = onboarding?.level ?? "beginner";

  const [stats, setStats] = useState({ storiesCreated: 0, streak: 0 });
  useEffect(() => {
    const hist = readJSON<{ createdAt?: string }[]>("mm_story_history", []);
    const dates = hist.map((h) => h.createdAt ?? "").filter(Boolean);
    setStats({ storiesCreated: hist.length, streak: computeStreak(dates) });
  }, []);

  const plan = buildRoadmap({ goal, level, ...stats });

  return (
    <section className="mb-6" aria-label="Gợi ý học tiếp theo">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-mm-gold" />
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">
          Dành riêng cho bạn · {LEVEL_LABEL[level] ?? level} · {GOAL_LABEL[goal] ?? "Giải trí"}
        </p>
      </div>
      <div className="space-y-2">
        {plan.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex items-center gap-3 rounded-2xl bg-surface border border-[rgba(255,255,255,0.07)] px-4 py-3 hover:border-[rgba(232,99,74,0.35)] transition-colors group"
          >
            <span className="text-xl shrink-0" aria-hidden="true">{s.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">{s.title}</p>
              <p className="text-xs text-[var(--text-muted)] leading-snug">{s.reason}</p>
            </div>
            <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-mm-red shrink-0 transition-colors" />
          </Link>
        ))}
      </div>
    </section>
  );
}
