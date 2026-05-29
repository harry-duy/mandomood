"use client";

/**
 * /leaderboard — Bảng xếp hạng XP
 * Weekly (top tuần) và All-time
 * Gen Z vibe: gradient ranks, streak fire, avatar
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, Zap, Crown, Star, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface LeaderUser {
  rank: number;
  name: string;
  image: string | null;
  xp: number;
  weekly_xp: number;
  streak: number;
  level: string;
}

const LEVEL_EMOJI: Record<string, string> = {
  beginner: "🌱", hsk1: "🐣", hsk2: "🐥",
  hsk3: "🦋", hsk4: "🔥", hsk5: "⚡", hsk6: "👑",
};

// Demo data khi chưa có DB
const DEMO_USERS: LeaderUser[] = [
  { rank: 1, name: "Hana 花花", image: null, xp: 4820, weekly_xp: 840, streak: 47, level: "hsk4" },
  { rank: 2, name: "Minh Tuấn", image: null, xp: 3600, weekly_xp: 720, streak: 33, level: "hsk3" },
  { rank: 3, name: "Trà My 🌸", image: null, xp: 3100, weekly_xp: 690, streak: 28, level: "hsk3" },
  { rank: 4, name: "Kevin Hoàng", image: null, xp: 2750, weekly_xp: 540, streak: 14, level: "hsk2" },
  { rank: 5, name: "Ngọc Ánh", image: null, xp: 2400, weekly_xp: 480, streak: 21, level: "hsk2" },
  { rank: 6, name: "Ryan Phúc", image: null, xp: 2100, weekly_xp: 360, streak: 9, level: "hsk2" },
  { rank: 7, name: "Celine Nhi", image: null, xp: 1800, weekly_xp: 300, streak: 7, level: "hsk1" },
  { rank: 8, name: "Bảo Long", image: null, xp: 1500, weekly_xp: 240, streak: 5, level: "hsk1" },
  { rank: 9, name: "Phương Linh", image: null, xp: 1200, weekly_xp: 180, streak: 3, level: "hsk1" },
  { rank: 10, name: "Đức Anh", image: null, xp: 900, weekly_xp: 120, streak: 2, level: "beginner" },
];

function Avatar({ name, image, size = 44 }: { name: string; image: string | null; size?: number }) {
  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  // Initials avatar
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#E8504A","#D4AF37","#8FAF8F","#9B8BBF","#7AB8D4","#C9878A"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

function TopThreeCard({ user, period }: { user: LeaderUser; period: "weekly" | "alltime" }) {
  const medals = ["🥇","🥈","🥉"];
  const sizes = [64, 52, 52];
  const offsets = ["", "mt-6", "mt-6"];
  const glows = [
    "shadow-[0_0_24px_rgba(212,175,55,0.4)]",
    "shadow-[0_0_16px_rgba(192,192,192,0.3)]",
    "shadow-[0_0_16px_rgba(205,127,50,0.3)]",
  ];
  const xpToShow = period === "weekly" ? user.weekly_xp : user.xp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: user.rank * 0.1 }}
      className={cn("flex flex-col items-center gap-2 px-2", offsets[user.rank - 1])}
    >
      <div className={cn("rounded-full", glows[user.rank - 1])}>
        <Avatar name={user.name} image={user.image} size={sizes[user.rank - 1]} />
      </div>
      <span className="text-2xl">{medals[user.rank - 1]}</span>
      <p className="text-xs font-semibold text-center leading-tight max-w-[70px] truncate" style={{ color: "var(--mm-text)" }}>
        {user.name}
      </p>
      <div className="flex items-center gap-1 bg-yellow-500/10 rounded-full px-2 py-0.5">
        <Zap className="w-3 h-3 text-yellow-500" />
        <span className="text-xs font-bold text-yellow-500">{xpToShow.toLocaleString()}</span>
      </div>
      <span className="text-xs opacity-60">{LEVEL_EMOJI[user.level]} {user.level.toUpperCase()}</span>
    </motion.div>
  );
}

function RankRow({ user, period, isMe }: { user: LeaderUser; period: "weekly" | "alltime"; isMe?: boolean }) {
  const xpToShow = period === "weekly" ? user.weekly_xp : user.xp;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (user.rank - 3) * 0.06 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-2xl transition-all",
        isMe
          ? "bg-[var(--mm-red)]/10 border border-[var(--mm-red)]/30"
          : "bg-white/5 hover:bg-white/10"
      )}
    >
      {/* Rank */}
      <span className={cn(
        "w-7 text-center font-bold text-sm",
        user.rank <= 3 ? "text-yellow-500" : "opacity-50"
      )}>
        #{user.rank}
      </span>

      <Avatar name={user.name} image={user.image} size={36} />

      {/* Name + level */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: "var(--mm-text)" }}>
          {user.name}
          {isMe && <span className="ml-1 text-xs text-[var(--mm-red)]">(bạn)</span>}
        </p>
        <p className="text-xs opacity-50">{LEVEL_EMOJI[user.level]} {user.level.toUpperCase()}</p>
      </div>

      {/* Streak */}
      {user.streak > 0 && (
        <div className="flex items-center gap-0.5">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs font-medium text-orange-400">{user.streak}</span>
        </div>
      )}

      {/* XP */}
      <div className="flex items-center gap-1">
        <Zap className="w-3.5 h-3.5 text-yellow-500" />
        <span className="text-sm font-bold text-yellow-500">{xpToShow.toLocaleString()}</span>
      </div>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [period, setPeriod] = useState<"weekly" | "alltime">("weekly");
  const [users, setUsers] = useState<LeaderUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?period=${period}`);
        const data = await res.json() as { users?: LeaderUser[] };
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
        } else {
          setUsers(DEMO_USERS);
        }
      } catch {
        setUsers(DEMO_USERS);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [period]);

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);
  const myRank = session?.user?.email
    ? users.findIndex(u => u.name === session.user?.name) + 1
    : 0;

  return (
    <main className="min-h-screen pb-24" style={{ background: "var(--mm-bg)" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl border-b border-white/10 px-4 py-4"
        style={{ background: "var(--mm-bg)" }}>
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h1 className="text-xl font-bold" style={{ color: "var(--mm-text)" }}>Bảng Xếp Hạng</h1>
          <div className="ml-auto flex gap-1 bg-white/5 rounded-full p-1">
            {(["weekly","alltime"] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                  period === p
                    ? "bg-[var(--mm-red)] text-white"
                    : "text-[var(--mm-muted)] hover:text-[var(--mm-text)]"
                )}
              >
                {p === "weekly" ? "Tuần này" : "All-time"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">

        {/* My rank banner */}
        {session?.user && myRank > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--mm-red)]/40 bg-[var(--mm-red)]/10"
          >
            <Star className="w-4 h-4 text-[var(--mm-red)]" />
            <span className="text-sm font-medium" style={{ color: "var(--mm-text)" }}>
              Bạn đang ở vị trí <strong>#{myRank}</strong> — tiếp tục học để leo hạng! 🚀
            </span>
          </motion.div>
        )}

        {/* Top 3 podium */}
        {!loading && top3.length >= 3 && (
          <div className="flex justify-center items-end gap-4 py-4">
            {/* 2nd, 1st, 3rd */}
            <TopThreeCard user={top3[1]} period={period} />
            <TopThreeCard user={top3[0]} period={period} />
            <TopThreeCard user={top3[2]} period={period} />
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-14 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {/* Rank 4+ */}
        {!loading && (
          <AnimatePresence>
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-center gap-2 px-1 mb-3">
                <TrendingUp className="w-4 h-4 text-[var(--mm-red)]" />
                <span className="text-xs font-semibold uppercase tracking-wider opacity-60"
                  style={{ color: "var(--mm-text)" }}>
                  {period === "weekly" ? "XP tuần này" : "Tổng XP"}
                </span>
              </div>
              {rest.map(u => (
                <RankRow
                  key={u.rank}
                  user={u}
                  period={period}
                  isMe={u.name === session?.user?.name}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* CTA if not logged in */}
        {!session?.user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6 space-y-3"
          >
            <Crown className="w-10 h-10 mx-auto text-yellow-500 opacity-60" />
            <p className="text-sm opacity-60" style={{ color: "var(--mm-text)" }}>
              Đăng nhập để xuất hiện trên bảng xếp hạng!
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-2 rounded-full font-semibold text-sm text-white"
              style={{ background: "var(--mm-red)" }}
            >
              Đăng nhập ngay
            </a>
          </motion.div>
        )}

        {/* Weekly reset info */}
        <p className="text-center text-xs opacity-40 pb-4" style={{ color: "var(--mm-text)" }}>
          {period === "weekly" ? "🔄 Reset mỗi thứ Hai • " : ""}
          Top {users.length} người học tích cực nhất
        </p>
      </div>
    </main>
  );
}
