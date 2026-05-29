/**
 * useProgress hook — gửi XP + streak lên server
 * Dùng trong lesson page, quiz, character page
 *
 * Usage:
 *   const { awardXP, stats } = useProgress()
 *   await awardXP(20, "complete_lesson")
 */

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

interface ProgressStats {
  xp: number;
  streak_days: number;
  level: string;
}

interface AwardResult {
  xp_earned: number;
  bonus_xp: number;
  streak: number;
  level_up: boolean;
  streak_milestone: number | null;
}

export function useProgress() {
  const { data: session } = useSession();
  const { user, setUser } = useAppStore();
  const [stats, setStats] = useState<ProgressStats>({
    xp: user?.xp ?? 0,
    streak_days: user?.streak_days ?? 0,
    level: user?.level ?? "beginner",
  });
  const [loading, setLoading] = useState(false);

  // Fetch stats khi mount nếu đã đăng nhập
  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/progress")
        .then((r) => r.json())
        .then((data) => {
          if (!data.error) {
            setStats({
              xp: data.xp ?? 0,
              streak_days: data.streak_days ?? 0,
              level: data.level ?? "beginner",
            });
          }
        })
        .catch(() => {/* ignore */});
    }
  }, [session]);

  /**
   * Gửi XP lên server
   * @param xp - Số XP cần cộng
   * @param action - Loại hành động
   * @returns AwardResult hoặc null nếu lỗi
   */
  const awardXP = async (
    xp: number,
    action: string = "complete_lesson"
  ): Promise<AwardResult | null> => {
    // Nếu chưa login — chỉ update local store
    if (!session?.user) {
      setStats((s) => ({ ...s, xp: s.xp + xp }));
      return null;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xp, action }),
      });

      if (!res.ok) throw new Error("API error");

      const result: AwardResult & { user: ProgressStats } = await res.json();

      // Update local state
      setStats({
        xp: result.user.xp,
        streak_days: result.streak,
        level: result.level_up ? result.user.level : stats.level,
      });

      // Update Zustand store
      if (user) {
        setUser({
          ...user,
          xp: result.user.xp,
          streak_days: result.streak,
          level: result.user.level,
        });
      }

      // Hiện thông báo đặc biệt
      if (result.level_up) {
        toast(`🎉 Lên cấp! Bạn đạt ${result.user.level.toUpperCase()}!`, {
          duration: 3000,
        });
      }
      if (result.streak_milestone) {
        toast(`🔥 ${result.streak_milestone} ngày streak! +${result.bonus_xp} XP bonus!`, {
          duration: 3000,
        });
      }

      return result;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { stats, awardXP, loading, isLoggedIn: !!session?.user };
}
