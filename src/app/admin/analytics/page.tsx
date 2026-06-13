"use client";
/**
 * /admin/analytics — Dashboard số liệu 30 ngày (pageview, khách, kênh UTM)
 * Chỉ ADMIN_EMAILS xem được (API tự chặn 401).
 */
import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Eye, Users, TrendingUp, Megaphone } from "lucide-react";

interface Summary {
  days: number;
  totals: { views: number; visitors: number };
  byDay: { day: string; views: number; visitors: number }[];
  topPages: { path: string; views: number }[];
  bySource: { source: string; events: number; visitors: number }[];
  topEvents: { name: string; count: number }[];
  funnel: { step: string; visitors: number }[];
}

const FUNNEL_LABEL: Record<string, string> = {
  pageview: "Ghé thăm",
  onboarding_completed: "Hoàn thành onboarding",
  login_click: "Bấm đăng nhập",
  story_generated: "Tạo truyện AI",
  share_card_download: "Tải ảnh chia sẻ",
  premium_checkout_click: "Bấm mua Premium",
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analytics?days=30");
      if (res.status === 401) { setError("Bạn không có quyền xem trang này."); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json() as Summary);
    } catch {
      setError("Không tải được số liệu. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const maxViews = Math.max(1, ...(data?.byDay.map(d => d.views) ?? [1]));

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-mm-red" /> Analytics 30 ngày
        </h1>
        <button
          onClick={() => void load()}
          disabled={loading}
          aria-label="Tải lại số liệu"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {data && (
        <>
          {/* Tổng quan */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-xl bg-white/5 p-4">
              <div className="flex items-center gap-2 text-sm opacity-70"><Eye className="w-4 h-4" /> Lượt xem</div>
              <div className="text-3xl font-bold mt-1">{data.totals.views.toLocaleString("vi-VN")}</div>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <div className="flex items-center gap-2 text-sm opacity-70"><Users className="w-4 h-4" /> Khách (anon)</div>
              <div className="text-3xl font-bold mt-1">{data.totals.visitors.toLocaleString("vi-VN")}</div>
            </div>
          </div>

          {/* Biểu đồ theo ngày */}
          <h2 className="font-semibold mb-2">Lượt xem theo ngày</h2>
          <div className="flex items-end gap-1 h-32 rounded-xl bg-white/5 p-3 mb-6 overflow-x-auto">
            {data.byDay.length === 0 && <p className="text-sm opacity-60">Chưa có dữ liệu — deploy lên production để bắt đầu đếm.</p>}
            {data.byDay.map(d => (
              <div key={d.day} className="flex flex-col items-center gap-1 min-w-[18px]" title={`${d.day}: ${d.views} view / ${d.visitors} khách`}>
                <div
                  className="w-3 rounded-t bg-mm-red/80"
                  style={{ height: `${Math.max(4, (d.views / maxViews) * 96)}px` }}
                />
                <span className="text-[9px] opacity-50 rotate-0">{d.day.slice(8)}</span>
              </div>
            ))}
          </div>

          {/* Top trang */}
          <h2 className="font-semibold mb-2">Top trang</h2>
          <div className="rounded-xl bg-white/5 divide-y divide-white/5 mb-6">
            {data.topPages.length === 0 && <p className="text-sm opacity-60 p-3">Chưa có dữ liệu.</p>}
            {data.topPages.map(p => (
              <div key={p.path} className="flex justify-between px-4 py-2 text-sm">
                <span className="truncate mr-2">{p.path}</span>
                <span className="opacity-70 shrink-0">{p.views.toLocaleString("vi-VN")}</span>
              </div>
            ))}
          </div>

          {/* Phễu chuyển đổi */}
          <h2 className="font-semibold mb-2">Phễu chuyển đổi (khách duy nhất)</h2>
          <div className="rounded-xl bg-white/5 p-4 mb-6 space-y-2">
            {(() => {
              const base = Math.max(1, data.funnel[0]?.visitors ?? 1);
              return data.funnel.map((f, i) => {
                const pct = Math.round((f.visitors / base) * 100);
                const prev = i > 0 ? data.funnel[i - 1].visitors : f.visitors;
                const stepPct = prev > 0 ? Math.round((f.visitors / prev) * 100) : 0;
                return (
                  <div key={f.step}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span>{FUNNEL_LABEL[f.step] ?? f.step}</span>
                      <span className="opacity-70">
                        {f.visitors.toLocaleString("vi-VN")} ({pct}%{i > 0 ? ` · giữ ${stepPct}%` : ""})
                      </span>
                    </div>
                    <div className="h-3 rounded bg-white/10 overflow-hidden">
                      <div className="h-full bg-mm-red/80 rounded" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              });
            })()}
            {data.funnel.every(f => f.visitors === 0) && (
              <p className="text-sm opacity-60">Chưa có dữ liệu phễu — cần traffic production.</p>
            )}
          </div>

          {/* Kênh UTM */}
          <h2 className="font-semibold mb-2 flex items-center gap-2"><Megaphone className="w-4 h-4" /> Kênh (utm_source)</h2>
          <div className="rounded-xl bg-white/5 divide-y divide-white/5 mb-6">
            {data.bySource.length === 0 && (
              <p className="text-sm opacity-60 p-3">
                Chưa có traffic UTM. Dùng link dạng /?utm_source=tiktok&utm_campaign=chiettu khi đăng video.
              </p>
            )}
            {data.bySource.map(s => (
              <div key={s.source} className="flex justify-between px-4 py-2 text-sm">
                <span>{s.source}</span>
                <span className="opacity-70">{s.visitors} khách · {s.events} sự kiện</span>
              </div>
            ))}
          </div>

          {/* Sự kiện */}
          <h2 className="font-semibold mb-2">Sự kiện</h2>
          <div className="rounded-xl bg-white/5 divide-y divide-white/5">
            {data.topEvents.length === 0 && <p className="text-sm opacity-60 p-3">Chưa có sự kiện tùy ý (trackEvent).</p>}
            {data.topEvents.map(ev => (
              <div key={ev.name} className="flex justify-between px-4 py-2 text-sm">
                <span>{ev.name}</span>
                <span className="opacity-70">{ev.count.toLocaleString("vi-VN")}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
