"use client";
/**
 * TrialReminderBanner — nhắc khi trial sắp hết (≤3 ngày) hoặc đã hết.
 * Dismiss được, lưu theo ngày trong localStorage → mỗi ngày nhắc lại 1 lần.
 */
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";

const DISMISS_KEY = "mm_trial_banner_dismissed";

function dismissedToday(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === new Date().toISOString().slice(0, 10);
  } catch {
    return false;
  }
}

export default function TrialReminderBanner() {
  const { data: session } = useSession();
  const [hidden, setHidden] = useState(() =>
    typeof window !== "undefined" ? dismissedToday() : true
  );

  const u = session?.user as
    | { premiumSource?: "paid" | "trial" | null; trialDaysLeft?: number }
    | undefined;
  if (!u || hidden) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, new Date().toISOString().slice(0, 10)); } catch { /* noop */ }
    setHidden(true);
  };

  // Trial còn ≤3 ngày → nhắc trước khi hết
  if (u.premiumSource === "trial" && (u.trialDaysLeft ?? 0) <= 3) {
    return (
      <div className="flex items-center gap-3 p-3 mb-4 rounded-2xl border"
        style={{ background: "rgba(212,175,55,0.08)", borderColor: "rgba(212,175,55,0.35)" }}>
        <span className="text-lg">⏳</span>
        <p className="text-sm flex-1" style={{ color: "var(--mm-text)" }}>
          Dùng thử Premium còn <strong>{u.trialDaysLeft} ngày</strong>.{" "}
          <Link href="/pricing" className="underline font-medium" style={{ color: "#D4AF37" }}>
            Nâng cấp để giữ không giới hạn 👑
          </Link>
        </p>
        <button onClick={dismiss} aria-label="Đóng nhắc nhở" className="opacity-50 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Đã đăng nhập nhưng hết cả trial lẫn premium → mời nâng cấp (nhẹ nhàng, 1 lần/ngày)
  if (u.premiumSource === null) {
    return (
      <div className="flex items-center gap-3 p-3 mb-4 rounded-2xl border border-white/10 bg-white/5">
        <span className="text-lg">👑</span>
        <p className="text-sm flex-1" style={{ color: "var(--mm-text)" }}>
          Thời gian dùng thử đã hết — bạn đang ở gói Free (3 truyện + 10 tin AI/ngày).{" "}
          <Link href="/pricing" className="underline font-medium" style={{ color: "#D4AF37" }}>
            Mở lại không giới hạn
          </Link>
        </p>
        <button onClick={dismiss} aria-label="Đóng nhắc nhở" className="opacity-50 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return null;
}
