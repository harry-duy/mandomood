"use client";
/**
 * /admin/users — Thống kê người dùng đã đăng ký (chỉ admin).
 * Lấy số liệu từ /api/admin/users (API tự chặn 401 nếu không phải admin).
 */
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { RefreshCw, Users, Crown, Sparkles, UserPlus, Activity, ArrowLeft, Zap, Search, Download } from "lucide-react";

interface Stats {
  generatedAt: string;
  totals: {
    total: number; premiumActive: number; trialActive: number; free: number;
    newToday: number; new7d: number; new30d: number; active7d: number;
    totalXp: number; avgXp: number;
  };
  byLevel: { level: string; count: number }[];
  byProvider: { provider: string; count: number }[];
  topUsers: { name: string; email: string; xp: number; streak_days: number; level: string; premium: boolean; created_at: string | null }[];
  signupsByDay: { day: string; count: number }[];
}

interface FoundUser {
  name: string; email: string; xp: number; streak_days: number;
  level: string; premium: boolean; provider: string;
  created_at: string | null; last_active: string | null;
}

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Người mới", hsk1: "HSK 1", hsk2: "HSK 2", hsk3: "HSK 3",
  hsk4: "HSK 4", hsk5: "HSK 5", hsk6: "HSK 6",
};

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-surface p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={accent ?? "text-mm-red"}>{icon}</span>
        <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
    </div>
  );
}

export default function AdminUsersPage() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [tier, setTier] = useState("");
  const [level, setLevel] = useState("");
  const [results, setResults] = useState<FoundUser[] | null>(null);
  const [searching, setSearching] = useState(false);

  const term = q.trim();
  const filterActive = term.length >= 2 || tier !== "" || level !== "";

  // Tìm kiếm/lọc user (tên-email ≥2 ký tự, hoặc gói, hoặc cấp) — debounce 350ms
  useEffect(() => {
    if (!filterActive) { setResults(null); return; }
    setSearching(true);
    const params = new URLSearchParams();
    if (term.length >= 2) params.set("q", term);
    if (tier) params.set("tier", tier);
    if (level) params.set("level", level);
    const id = setTimeout(() => {
      fetch(`/api/admin/users?${params.toString()}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { search?: FoundUser[] } | null) => setResults(d?.search ?? []))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 350);
    return () => clearTimeout(id);
  }, [term, tier, level, filterActive]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 401) { setError("Bạn không có quyền xem trang này."); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json() as Stats);
    } catch {
      setError("Không tải được số liệu. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const maxSignup = Math.max(1, ...(data?.signupsByDay.map((d) => d.count) ?? [1]));
  const t = data?.totals;

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-mm-red transition-colors mb-1">
            <ArrowLeft size={13} /> Admin
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-mm-red" /> Thống kê người dùng
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={(() => {
              const p = new URLSearchParams();
              if (term.length >= 2) p.set("q", term);
              if (tier) p.set("tier", tier);
              if (level) p.set("level", level);
              const qs = p.toString();
              return `/api/admin/users/export${qs ? `?${qs}` : ""}`;
            })()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface2 text-xs font-medium text-[var(--text)] hover:bg-mm-red/15 hover:text-mm-red transition-colors"
            title={filterActive ? "Xuất CSV theo bộ lọc hiện tại" : "Xuất CSV toàn bộ user"}
          >
            <Download className="w-3.5 h-3.5" /> CSV{filterActive ? " (lọc)" : ""}
          </a>
          <button
            onClick={() => void load()}
            disabled={loading}
            aria-label="Tải lại số liệu"
            className="p-2 rounded-lg bg-surface2 hover:bg-mm-red/15 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tìm kiếm + lọc user */}
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm người dùng theo tên hoặc email…"
          aria-label="Tìm người dùng"
          className="w-full rounded-xl border border-[var(--border)] bg-surface pl-10 pr-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-mm-red/40"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          aria-label="Lọc theo gói"
          className="rounded-lg border border-[var(--border)] bg-surface px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-mm-red/40"
        >
          <option value="">Mọi gói</option>
          <option value="premium">Premium</option>
          <option value="trial">Dùng thử</option>
          <option value="free">Miễn phí</option>
        </select>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          aria-label="Lọc theo cấp độ"
          className="rounded-lg border border-[var(--border)] bg-surface px-3 py-1.5 text-xs text-[var(--text)] outline-none focus:border-mm-red/40"
        >
          <option value="">Mọi cấp độ</option>
          {Object.entries(LEVEL_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        {filterActive && (
          <button
            onClick={() => { setQ(""); setTier(""); setLevel(""); }}
            className="text-xs text-[var(--text-muted)] hover:text-mm-red transition-colors px-2 py-1.5"
          >
            Xóa lọc
          </button>
        )}
      </div>

      {/* Kết quả tìm kiếm/lọc */}
      {filterActive && (
        <section className="rounded-2xl border border-[var(--border)] bg-surface overflow-hidden mb-6">
          <h2 className="text-sm font-semibold px-4 py-3 border-b border-[var(--border)] text-[var(--text)]">
            {searching ? "Đang tìm…" : `Kết quả: ${results?.length ?? 0}`}
          </h2>
          {results && results.length > 0 && (
            <div className="divide-y divide-[var(--border)] max-h-80 overflow-y-auto">
              {results.map((u, i) => (
                <div key={u.email || i} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate flex items-center gap-1.5">
                      {u.name}
                      {u.premium && <Crown size={12} className="text-mm-gold shrink-0" />}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">{u.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-mm-gold">{u.xp.toLocaleString()} XP</p>
                    <p className="text-[10px] text-[var(--text-muted)]">🔥 {u.streak_days} · {LEVEL_LABEL[u.level] ?? u.level}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {results && results.length === 0 && !searching && (
            <p className="px-4 py-3 text-xs text-[var(--text-muted)]">Không tìm thấy người dùng phù hợp.</p>
          )}
        </section>
      )}

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {t && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<Users size={15} />} label="Tổng người dùng" value={t.total.toLocaleString()} />
            <StatCard icon={<Crown size={15} />} label="Premium" value={t.premiumActive.toLocaleString()} accent="text-mm-gold" />
            <StatCard icon={<Sparkles size={15} />} label="Đang dùng thử" value={t.trialActive.toLocaleString()} accent="text-mm-sage" />
            <StatCard icon={<Users size={15} />} label="Miễn phí" value={t.free.toLocaleString()} accent="text-[var(--text-muted)]" />
            <StatCard icon={<UserPlus size={15} />} label="Mới hôm nay" value={t.newToday.toLocaleString()} />
            <StatCard icon={<UserPlus size={15} />} label="Mới 7 ngày" value={t.new7d.toLocaleString()} />
            <StatCard icon={<Activity size={15} />} label="Hoạt động 7 ngày" value={t.active7d.toLocaleString()} accent="text-mm-sage" />
            <StatCard icon={<Zap size={15} />} label="XP trung bình" value={t.avgXp.toLocaleString()} accent="text-mm-gold" />
            <StatCard
              icon={<Crown size={15} />}
              label="Tỷ lệ Premium"
              value={`${t.total > 0 ? ((t.premiumActive / t.total) * 100).toFixed(1) : "0"}%`}
              accent="text-mm-gold"
            />
          </div>

          {/* Signups by day */}
          <section className="rounded-2xl border border-[var(--border)] bg-surface p-4">
            <h2 className="text-sm font-semibold mb-3 text-[var(--text)]">Đăng ký mới (30 ngày) · tổng {t.new30d}</h2>
            {data!.signupsByDay.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">Chưa có đăng ký trong 30 ngày.</p>
            ) : (
              <div className="flex items-end gap-1 h-28">
                {data!.signupsByDay.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center justify-end group" title={`${d.day}: ${d.count}`}>
                    <div
                      className="w-full rounded-t bg-mm-red/70 group-hover:bg-mm-red transition-colors"
                      style={{ height: `${(d.count / maxSignup) * 100}%`, minHeight: d.count > 0 ? 3 : 0 }}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Breakdown by level + provider */}
          <div className="grid sm:grid-cols-2 gap-3">
            <section className="rounded-2xl border border-[var(--border)] bg-surface p-4">
              <h2 className="text-sm font-semibold mb-3 text-[var(--text)]">Theo cấp độ</h2>
              <div className="space-y-2">
                {data!.byLevel.sort((a, b) => b.count - a.count).map((l) => (
                  <div key={l.level} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">{LEVEL_LABEL[l.level] ?? l.level}</span>
                    <span className="font-semibold text-[var(--text)]">{l.count}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-[var(--border)] bg-surface p-4">
              <h2 className="text-sm font-semibold mb-3 text-[var(--text)]">Theo nguồn đăng nhập</h2>
              <div className="space-y-2">
                {data!.byProvider.sort((a, b) => b.count - a.count).map((p) => (
                  <div key={p.provider} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">{p.provider === "google" ? "Google" : "Email"}</span>
                    <span className="font-semibold text-[var(--text)]">{p.count}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Top users */}
          <section className="rounded-2xl border border-[var(--border)] bg-surface overflow-hidden">
            <h2 className="text-sm font-semibold px-4 py-3 border-b border-[var(--border)] text-[var(--text)]">Top người dùng theo XP</h2>
            <div className="divide-y divide-[var(--border)]">
              {data!.topUsers.map((u, i) => (
                <div key={u.email || i} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-5 text-xs font-bold text-[var(--text-muted)]">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate flex items-center gap-1.5">
                      {u.name}
                      {u.premium && <Crown size={12} className="text-mm-gold shrink-0" />}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">{u.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-mm-gold">{u.xp.toLocaleString()} XP</p>
                    <p className="text-[10px] text-[var(--text-muted)]">🔥 {u.streak_days} · {LEVEL_LABEL[u.level] ?? u.level}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <p className="text-[10px] text-[var(--text-muted)] text-center">
            Cập nhật: {new Date(data!.generatedAt).toLocaleString("vi-VN")}
          </p>
        </div>
      )}
    </div>
  );
}
