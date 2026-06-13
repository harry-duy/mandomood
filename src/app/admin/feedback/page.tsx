"use client";
/**
 * /admin/feedback — Xem tất cả feedback từ users
 * Protected bằng AdminLayout (session.user.is_admin)
 * Chỉ ngothanhduy04@gmail.com (và ADMIN_EMAILS trong .env) được vào
 */
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Bug, Lightbulb, MoreHorizontal, Star, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Feedback {
  _id: string;
  message: string;
  type: "bug" | "idea" | "other";
  page: string;
  user_email?: string;
  rating?: number;
  created_at: string;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  bug:   <Bug className="w-3.5 h-3.5 text-red-400" />,
  idea:  <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />,
  other: <MoreHorizontal className="w-3.5 h-3.5 text-blue-400" />,
};
const TYPE_COLOR: Record<string, string> = { bug: "#E8504A", idea: "#D4AF37", other: "#7AB8D4" };

function timeAgo(d: string) {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)}p trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h trước`;
  return `${Math.floor(diff / 86400)}d trước`;
}

export default function AdminFeedbackPage() {
  const { data: session } = useSession();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const typeParam = filter !== "all" ? `?type=${filter}` : "";
      const res = await fetch(`/api/feedback${typeParam}`);
      if (res.status === 401) { setError("Không có quyền truy cập"); return; }
      if (!res.ok) { setError("Lỗi server"); return; }
      const data = await res.json() as { feedbacks?: Feedback[] };
      setFeedbacks(data.feedbacks ?? []);
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void loadFeedback();
  }, [loadFeedback]);

  const filtered = filter === "all" ? feedbacks : feedbacks.filter(f => f.type === filter);
  const counts = {
    all:   feedbacks.length,
    bug:   feedbacks.filter(f => f.type === "bug").length,
    idea:  feedbacks.filter(f => f.type === "idea").length,
    other: feedbacks.filter(f => f.type === "other").length,
  };

  return (
    <main className="min-h-screen pb-10 bg-[#0D0D0D]">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#F5F0EB]">Feedback Dashboard</h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {counts.all} góp ý · {counts.bug} lỗi · {counts.idea} ý tưởng
            </p>
            <p className="text-[10px] text-[var(--text-muted)] opacity-50 mt-0.5">
              Đăng nhập với: {session?.user?.email}
            </p>
          </div>
          <button
            onClick={() => void loadFeedback()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] text-xs text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "bug", "idea", "other"] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                filter === t ? "text-white" : "bg-white/5 text-[var(--text-muted)] hover:text-white"
              )}
              style={filter === t ? { background: t === "all" ? "#E8504A" : TYPE_COLOR[t] } : {}}
            >
              {t === "all"
                ? `Tất cả (${counts.all})`
                : <span className="inline-flex items-center gap-1">
                    {TYPE_ICON[t]}
                    {t} ({counts[t]})
                  </span>
              }
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
            ⚠️ {error}
          </p>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)] opacity-40">
            Chưa có feedback nào
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((fb, i) => (
              <motion.div
                key={fb._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#1A1A1A]"
                style={{ borderLeft: `3px solid ${TYPE_COLOR[fb.type]}` }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">{TYPE_ICON[fb.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed text-[#F5F0EB]">{fb.message}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(fb.created_at)}
                      </span>
                      <span>· {fb.page}</span>
                      {fb.user_email && <span>· {fb.user_email}</span>}
                      {fb.rating && (
                        <span className="flex items-center gap-0.5">
                          · {fb.rating}
                          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
