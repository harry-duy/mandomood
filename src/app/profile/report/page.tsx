"use client";
/**
 * /profile/report — Weekly Learning Report
 * Tóm tắt 7 ngày: XP, streak, level progress, badges
 */
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Flame, Zap, Star, Trophy, TrendingUp, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Report {
  weekly_xp: number;
  total_xp: number;
  streak_days: number;
  level: string;
  level_progress: number;
  premium: boolean;
}

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Mới bắt đầu", hsk1: "HSK 1", hsk2: "HSK 2",
  hsk3: "HSK 3", hsk4: "HSK 4", hsk5: "HSK 5", hsk6: "HSK 6",
};

const LEVEL_NEXT: Record<string, string> = {
  beginner: "hsk1", hsk1: "hsk2", hsk2: "hsk3",
  hsk3: "hsk4", hsk4: "hsk5", hsk5: "hsk6", hsk6: "hsk6",
};

// XP milestones cho badge
const BADGES = [
  { id: "first_xp",  icon: "⚡", label: "Tia chớp đầu tiên", desc: "Kiếm XP đầu tiên",     req: (r: Report) => r.total_xp >= 1 },
  { id: "streak_3",  icon: "🔥", label: "3 ngày liền",       desc: "Học 3 ngày liên tiếp",  req: (r: Report) => r.streak_days >= 3 },
  { id: "xp_100",    icon: "💯", label: "100 XP",            desc: "Tích lũy 100 XP",       req: (r: Report) => r.total_xp >= 100 },
  { id: "streak_7",  icon: "🌟", label: "1 tuần",            desc: "Streak 7 ngày",         req: (r: Report) => r.streak_days >= 7 },
  { id: "xp_500",    icon: "🏆", label: "500 XP",            desc: "Tích lũy 500 XP",       req: (r: Report) => r.total_xp >= 500 },
  { id: "hsk2up",    icon: "📚", label: "Đạt HSK 2+",        desc: "Lên level HSK 2 trở lên", req: (r: Report) => ["hsk2","hsk3","hsk4","hsk5","hsk6"].includes(r.level) },
  { id: "streak_30", icon: "👑", label: "30 ngày",           desc: "Streak 30 ngày",        req: (r: Report) => r.streak_days >= 30 },
  { id: "xp_2000",   icon: "🌙", label: "2000 XP",           desc: "Tích lũy 2000 XP",      req: (r: Report) => r.total_xp >= 2000 },
];

// Số stat cards
const STATS = (r: Report) => [
  { icon: Zap,      label: "XP tuần này",   value: r.weekly_xp,    unit: "xp",   color: "#E8C94A" },
  { icon: Flame,    label: "Streak hiện tại", value: r.streak_days, unit: "ngày", color: "#E8504A" },
  { icon: TrendingUp, label: "Tổng XP",     value: r.total_xp,    unit: "xp",   color: "#8FAF8F" },
  { icon: BookOpen, label: "Cấp độ",        value: LEVEL_LABEL[r.level] ?? r.level, unit: "", color: "#7AB8D4" },
];

export default function WeeklyReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;

    fetch("/api/user/weekly-report")
      .then(r => r.json())
      .then((d: Report) => setReport(d))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [status, router]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#E8504A]/30 border-t-[#E8504A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) return null;

  const earnedBadges = BADGES.filter(b => b.req(report));
  const lockedBadges = BADGES.filter(b => !b.req(report));
  const stats = STATS(report);

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl bg-[#1A1A1A] hover:bg-[#222] transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Báo cáo học tập</h1>
          <p className="text-xs text-[var(--text-muted)]">
            {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Level progress */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Cấp độ hiện tại</p>
            <p className="text-2xl font-bold">{LEVEL_LABEL[report.level] ?? report.level}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)]">Tiếp theo</p>
            <p className="text-sm font-semibold text-[#7AB8D4]">
              {LEVEL_LABEL[LEVEL_NEXT[report.level]] ?? "Max"}
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#E8504A] to-[#E8C94A]"
            initial={{ width: 0 }}
            animate={{ width: `${report.level_progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-[var(--text-muted)] text-right">{report.level_progress}% đến level tiếp theo</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            className="card flex flex-col gap-2"
          >
            <s.icon size={18} style={{ color: s.color }} />
            <div>
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
              <p className="text-xl font-bold mt-0.5">
                {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
                {s.unit && <span className="text-xs font-normal text-[var(--text-muted)] ml-1">{s.unit}</span>}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Badges earned */}
      {earnedBadges.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card space-y-3">
          <div className="flex items-center gap-2">
            <Trophy size={15} className="text-[#E8C94A]" />
            <p className="text-sm font-semibold">Thành tích đã đạt ({earnedBadges.length})</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {earnedBadges.map(b => (
              <div key={b.id} className="flex flex-col items-center gap-1 text-center">
                <div className="text-2xl">{b.icon}</div>
                <p className="text-[10px] font-medium text-[#F5F0EB] leading-tight">{b.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Badges locked */}
      {lockedBadges.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card space-y-3">
          <div className="flex items-center gap-2">
            <Star size={15} className="text-[var(--text-muted)]" />
            <p className="text-sm font-semibold text-[var(--text-muted)]">Chưa mở khóa ({lockedBadges.length})</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {lockedBadges.map(b => (
              <div key={b.id} className="flex flex-col items-center gap-1 text-center opacity-30 grayscale">
                <div className="text-2xl">{b.icon}</div>
                <p className="text-[10px] leading-tight text-[var(--text-muted)]">{b.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Motivational footer */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-center py-4 space-y-1">
        <p className="text-2xl">
          {report.streak_days >= 7 ? "🔥" : report.streak_days >= 3 ? "💪" : "🌱"}
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          {report.streak_days >= 7
            ? `Streak ${report.streak_days} ngày! Bạn thật tuyệt vời 🌟`
            : report.streak_days >= 3
            ? `${report.streak_days} ngày liên tiếp — tiếp tục nhé!`
            : "Mỗi ngày một câu tiếng Trung — bắt đầu streak hôm nay!"}
        </p>
      </motion.div>
    </main>
  );
}
