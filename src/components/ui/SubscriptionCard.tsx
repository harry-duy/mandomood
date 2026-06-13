"use client";
/**
 * SubscriptionCard — thẻ "Gói của bạn" ở /profile:
 * 👑 Premium (đến ngày X / vĩnh viễn) · 🎁 Trial (còn N ngày) · Free + nút nâng cấp.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown } from "lucide-react";

interface Quota {
  loggedIn: boolean;
  source: "paid" | "trial" | null;
  trialDaysLeft: number;
  premiumUntil?: string | null; // ISO; null = lifetime
  trialUntil?: string | null;
  story: { used: number; max: number };
  chat: { used: number; max: number };
}

function fmtDate(iso?: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
}

export default function SubscriptionCard() {
  const [q, setQ] = useState<Quota | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // Mở Stripe Customer Portal (đổi thẻ / hóa đơn / hủy gói). Chưa có customer → về /pricing.
  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const d = await res.json() as { url?: string };
      if (res.ok && d.url) {
        window.location.href = d.url;
        return;
      }
      window.location.href = "/pricing";
    } catch {
      window.location.href = "/pricing";
    } finally {
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/quota")
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (!cancelled && d) setQ(d as Quota); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!q || !q.loggedIn) return null;

  return (
    <div className="rounded-2xl p-4 mb-6 border"
      style={{
        background: q.source ? "rgba(212,175,55,0.07)" : "rgba(255,255,255,0.04)",
        borderColor: q.source ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.08)",
      }}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider opacity-50 mb-1"
            style={{ color: "var(--mm-text)" }}>
            Gói của bạn
          </p>
          {q.source === "paid" && (
            <>
              <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: "#D4AF37" }}>
                <Crown className="w-4 h-4" /> Premium
              </p>
              <p className="text-xs opacity-60 mt-0.5" style={{ color: "var(--mm-text)" }}>
                {q.premiumUntil ? `Hiệu lực đến ${fmtDate(q.premiumUntil)}` : "Vĩnh viễn (Lifetime)"}
              </p>
            </>
          )}
          {q.source === "trial" && (
            <>
              <p className="text-sm font-semibold" style={{ color: "#D4AF37" }}>
                🎁 Dùng thử Premium
              </p>
              <p className="text-xs opacity-60 mt-0.5" style={{ color: "var(--mm-text)" }}>
                Còn {q.trialDaysLeft} ngày{q.trialUntil ? ` (đến ${fmtDate(q.trialUntil)})` : ""} — sau đó về gói Free
              </p>
            </>
          )}
          {q.source === null && (
            <>
              <p className="text-sm font-semibold" style={{ color: "var(--mm-text)" }}>Free</p>
              <p className="text-xs opacity-60 mt-0.5" style={{ color: "var(--mm-text)" }}>
                Hôm nay còn {Math.max(0, q.story.max - q.story.used)}/{q.story.max} truyện AI ·{" "}
                {Math.max(0, q.chat.max - q.chat.used)}/{q.chat.max} tin AI Tutor
              </p>
            </>
          )}
        </div>
        {q.source === "paid" ? (
          <button
            onClick={() => void openPortal()}
            disabled={portalLoading}
            className="shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-opacity hover:opacity-85 disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.08)", color: "var(--mm-text)" }}
          >
            {portalLoading ? "Đang mở..." : "Quản lý gói"}
          </button>
        ) : (
          <Link
            href="/pricing"
            className="shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-opacity hover:opacity-85"
            style={{ background: "#D4AF37", color: "#0D0D0D" }}
          >
            Nâng cấp 👑
          </Link>
        )}
      </div>
    </div>
  );
}
