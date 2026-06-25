"use client";

/**
 * /notifications — Thông báo học tập của bạn
 * Tổng hợp các sự kiện học (badge mới, streak milestone, XP, daily-plan)
 * từ localStorage — không cần backend, hoạt động offline.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell, Trophy, Flame, Zap, CheckCircle2, Star, BookOpen,
  ArrowLeft, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { readJSON } from "@/lib/utils";
import { sumDailyXp } from "@/lib/dailyXp";
import { useProgress } from "@/hooks/useProgress";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  type: "badge" | "streak" | "xp" | "plan" | "test" | "general";
  title: string;
  body: string;
  icon: React.ReactNode;
  href?: string;
  time: string; // ISO
  read: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Hôm qua";
  return `${d} ngày trước`;
}

const TYPE_COLOR: Record<Notification["type"], string> = {
  badge: "bg-mm-gold/15 border-mm-gold/30",
  streak: "bg-orange-500/15 border-orange-500/30",
  xp: "bg-purple-500/15 border-purple-500/30",
  plan: "bg-emerald-500/15 border-emerald-500/30",
  test: "bg-blue-500/15 border-blue-500/30",
  general: "bg-surface2 border-[rgba(255,255,255,0.08)]",
};

// ─── Build notifications from localStorage ────────────────────────────────────

function buildNotifications(): Notification[] {
  const notifs: Notification[] = [];
  const now = new Date();
  const todayStr = now.toISOString();

  // 1. Badges earned
  const badges: string[] = readJSON<string[]>("mm_badges_earned", []);
  const BADGE_LABELS: Record<string, string> = {
    streak_3: "Chuỗi 3 ngày",
    streak_7: "Chuỗi 7 ngày",
    streak_30: "Chuỗi 30 ngày",
    stories_5: "5 câu chuyện",
    stories_20: "20 câu chuyện",
    perfect_quiz: "Quiz hoàn hảo",
    test_10: "Chiến binh phòng thi",
    test_perfect: "Tuyệt đối 💯",
  };
  badges.forEach((b, i) => {
    notifs.push({
      id: `badge_${b}`,
      type: "badge",
      title: `🏅 Huy hiệu mới: ${BADGE_LABELS[b] ?? b}`,
      body: "Bạn vừa mở khoá một huy hiệu mới. Xem tất cả huy hiệu trong Tiến độ.",
      icon: <Trophy size={18} className="text-mm-gold" />,
      href: "/progress",
      time: new Date(now.getTime() - i * 3600000).toISOString(),
      read: false,
    });
  });

  // 2. XP milestone — cộng tổng từ các khoá mm_xp_YYYY-MM-DD (khoá tổng mm_xp_total
  // không hề được ghi → trước đây luôn 0 → mốc XP không bao giờ hiện).
  const xpTotal: number = (() => {
    if (typeof localStorage === "undefined") return 0;
    try {
      const entries: [string, string | null][] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) entries.push([k, localStorage.getItem(k)]);
      }
      return sumDailyXp(entries);
    } catch { return 0; }
  })();
  const MILESTONES = [100, 500, 1000, 2500, 5000];
  for (const ms of MILESTONES) {
    if (xpTotal >= ms) {
      notifs.push({
        id: `xp_${ms}`,
        type: "xp",
        title: `⚡ Đạt ${ms} XP!`,
        body: `Bạn đã tích luỹ ${xpTotal} XP — tiếp tục học để lên cấp tiếp nhé.`,
        icon: <Zap size={18} className="text-purple-400" />,
        href: "/progress",
        time: new Date(now.getTime() - 7200000).toISOString(),
        read: false,
      });
      break; // chỉ show milestone cao nhất đạt được
    }
  }

  // 3. Streak
  const storyHist = readJSON<{ createdAt: string }[]>("mm_story_history", []);
  const streak = (() => {
    let s = 0;
    const d = new Date(now);
    while (true) {
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      const hasStory = storyHist.some(h => {
        const hd = new Date(h.createdAt);
        return `${hd.getFullYear()}-${String(hd.getMonth()+1).padStart(2,"0")}-${String(hd.getDate()).padStart(2,"0")}` === key;
      });
      const planKey = `mm_daily_plan_${d.getFullYear()}_${d.getMonth()+1}_${d.getDate()}`;
      const plan = readJSON<Record<string, boolean>>(planKey, {});
      const hasTask = Object.values(plan).some(Boolean);
      if (hasStory || hasTask) { s++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return s;
  })();
  if (streak >= 3) {
    notifs.push({
      id: `streak_${streak}`,
      type: "streak",
      title: `🔥 Chuỗi ${streak} ngày liên tiếp!`,
      body: streak >= 7
        ? "Tuyệt vời — bạn đang giữ streak ấn tượng. Đừng để nó đứt nhé!"
        : "Bạn đang học đều đặn — tiếp tục nhé!",
      icon: <Flame size={18} className="text-orange-400" />,
      href: "/progress",
      time: todayStr,
      read: false,
    });
  }

  // 4. Daily plan hôm nay
  const todayPlanKey = `mm_daily_plan_${now.getFullYear()}_${now.getMonth()+1}_${now.getDate()}`;
  const todayPlan = readJSON<Record<string, boolean>>(todayPlanKey, {});
  const tasksDone = Object.values(todayPlan).filter(Boolean).length;
  if (tasksDone > 0) {
    notifs.push({
      id: "plan_today",
      type: "plan",
      title: `✅ Đã hoàn thành ${tasksDone} nhiệm vụ hôm nay`,
      body: "Xem kế hoạch học hôm nay và hoàn thành thêm nhiệm vụ.",
      icon: <CheckCircle2 size={18} className="text-emerald-400" />,
      href: "/daily-plan",
      time: todayStr,
      read: false,
    });
  }

  // 5. Test history
  const testHist = readJSON<{ level: number; correct: number; total: number; date: string }[]>("mm_test_history", []);
  if (testHist.length > 0) {
    const last = testHist[0];
    const pct = Math.round((last.correct / last.total) * 100);
    notifs.push({
      id: `test_last`,
      type: "test",
      title: `📝 Đề thi HSK${last.level}: ${pct}% (${last.correct}/${last.total})`,
      body: pct >= 80
        ? "Xuất sắc! Thử cấp cao hơn hoặc xem bảng xếp hạng."
        : "Luyện thêm từ vựng HSK rồi thử lại — bạn sẽ làm được!",
      icon: <Star size={18} className="text-blue-400" />,
      href: "/test",
      time: last.date ?? todayStr,
      read: false,
    });
  }

  // 6. Fallback nếu chưa có gì
  if (notifs.length === 0) {
    notifs.push({
      id: "welcome",
      type: "general",
      title: "👋 Chào mừng đến MandoMood!",
      body: "Bắt đầu học hôm nay — mỗi câu chuyện bạn đọc, mỗi quiz bạn làm đều để lại thông báo tại đây.",
      icon: <Sparkles size={18} className="text-mm-gold" />,
      href: "/daily-plan",
      time: todayStr,
      read: false,
    });
  }

  // Sort: mới nhất trước
  return notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter();
  const { stats } = useProgress();
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifs(buildNotifications());
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors"
          aria-label="Quay lại"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-playfair text-xl font-bold">Thông báo</h1>
          <p className="text-xs text-[var(--text-muted)]">Các sự kiện học tập của bạn</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Bell size={13} /> {notifs.length}
        </span>
      </motion.div>

      {/* XP summary bar */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-4 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-surface p-3 flex items-center gap-3"
        >
          <Zap size={18} className="text-purple-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold">Tổng XP: {stats.xp}</p>
            <p className="text-[11px] text-[var(--text-muted)]">
              Cấp {stats.level} · {stats.streak_days} ngày streak 🔥
            </p>
          </div>
          <Link
            href="/progress"
            className="text-[11px] text-mm-red hover:underline shrink-0"
          >
            Xem tiến độ →
          </Link>
        </motion.div>
      )}

      {/* Notification list */}
      <div className="space-y-3">
        {notifs.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            {n.href ? (
              <Link
                href={n.href}
                className={`flex gap-3 p-4 rounded-2xl border transition-colors hover:brightness-110 ${TYPE_COLOR[n.type]}`}
              >
                <div className="shrink-0 w-9 h-9 rounded-full bg-[rgba(255,255,255,0.07)] flex items-center justify-center">
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-snug">{n.title}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1.5">{relativeTime(n.time)}</p>
                </div>
              </Link>
            ) : (
              <div className={`flex gap-3 p-4 rounded-2xl border ${TYPE_COLOR[n.type]}`}>
                <div className="shrink-0 w-9 h-9 rounded-full bg-[rgba(255,255,255,0.07)] flex items-center justify-center">
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-snug">{n.title}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1.5">{relativeTime(n.time)}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* CTA bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center"
      >
        <p className="text-xs text-[var(--text-muted)] mb-3">
          Học đều đặn để luôn có thông báo mới ✨
        </p>
        <Link
          href="/daily-plan"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-mm-red text-white text-sm font-semibold rounded-full hover:bg-mm-red/90 transition-colors"
        >
          <BookOpen size={15} /> Xem kế hoạch hôm nay
        </Link>
      </motion.div>
    </div>
  );
}
