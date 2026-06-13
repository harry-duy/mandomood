"use client";

/**
 * BadgeGrid — lưới huy hiệu thành tích (gamification).
 * Nhận thống kê (số truyện, streak) → hiển thị huy hiệu đã đạt sáng rõ,
 * huy hiệu chưa đạt mờ kèm thanh tiến độ. Logic ở lib/achievements.ts (đã test).
 */

import { useEffect } from "react";
import { toast } from "sonner";
import {
  evaluateBadges, earnedIds, newlyUnlocked, EARNED_KEY,
  type AchievementStats,
} from "@/lib/achievements";
import { readJSON, writeJSON } from "@/lib/utils";

export default function BadgeGrid({ stats }: { stats: AchievementStats }) {
  const badges = evaluateBadges(stats);
  const earned = badges.filter((b) => b.isEarned).length;

  // Bắn toast khi vừa mở khóa huy hiệu mới (so với lần trước đã lưu).
  useEffect(() => {
    const prev = readJSON<string[]>(EARNED_KEY, []);
    const fresh = newlyUnlocked(stats, prev);
    if (fresh.length > 0) {
      for (const b of fresh) {
        toast(`🎉 Mở khóa huy hiệu: ${b.emoji} ${b.title}`, { description: b.desc });
      }
      writeJSON(EARNED_KEY, earnedIds(stats));
    } else if (prev.length === 0 && earned > 0) {
      // Lần đầu có dữ liệu: lưu mốc, không spam toast cho huy hiệu cũ.
      writeJSON(EARNED_KEY, earnedIds(stats));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.storiesCreated, stats.streak, stats.testsTaken, stats.bestTestPct]);

  return (
    <div className="rounded-2xl bg-surface border border-[rgba(255,255,255,0.07)] p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">
          Huy hiệu
        </p>
        <span className="text-xs text-mm-gold font-semibold">{earned}/{badges.length}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`rounded-xl border p-3 text-center transition-all ${
              b.isEarned
                ? "border-[rgba(232,168,56,0.4)] bg-[rgba(232,168,56,0.08)]"
                : "border-[rgba(255,255,255,0.06)] opacity-60"
            }`}
            title={b.desc}
          >
            <div className={`text-2xl mb-1 ${b.isEarned ? "" : "grayscale"}`} aria-hidden="true">
              {b.emoji}
            </div>
            <p className="text-[11px] font-semibold leading-tight">{b.title}</p>
            <p className="text-[9px] text-[var(--text-muted)] leading-snug mt-0.5">{b.desc}</p>
            {!b.isEarned && (
              <div className="mt-1.5 h-1 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
                <div className="h-full bg-mm-gold/60" style={{ width: `${b.pct}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
