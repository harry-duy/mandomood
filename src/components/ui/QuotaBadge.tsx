"use client";
/**
 * QuotaBadge — chỉ báo lượt AI miễn phí còn lại hôm nay (TRƯỚC khi user bấm).
 * - Premium/trial: "👑 Không giới hạn" (trial kèm số ngày còn).
 * - Free đăng nhập: "Hôm nay còn N/M lượt" + link Nâng cấp.
 * - Chưa đăng nhập: mời đăng nhập nhận 30 ngày Premium.
 */
import { useEffect, useState } from "react";
import Link from "next/link";

interface Quota {
  loggedIn: boolean;
  source: "paid" | "trial" | null;
  trialDaysLeft: number;
  story: { used: number; max: number };
  chat: { used: number; max: number };
  upload?: { used: number; max: number };
}

export default function QuotaBadge({ feature }: { feature: "story" | "chat" | "upload" }) {
  const [quota, setQuota] = useState<Quota | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/quota")
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (!cancelled && d) setQuota(d as Quota); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!quota) return null;

  if (quota.source === "paid") {
    return <p className="text-xs text-center" style={{ color: "#D4AF37" }}>👑 Premium — không giới hạn</p>;
  }
  if (quota.source === "trial") {
    return (
      <p className="text-xs text-center" style={{ color: "#D4AF37" }}>
        🎁 Dùng thử Premium (còn {quota.trialDaysLeft} ngày) — không giới hạn
      </p>
    );
  }
  if (!quota.loggedIn) {
    return (
      <p className="text-xs text-center opacity-80" style={{ color: "var(--mm-text)" }}>
        <Link href="/login" className="underline" style={{ color: "#D4AF37" }}>
          Đăng nhập để nhận 30 ngày Premium miễn phí 🎁
        </Link>
      </p>
    );
  }
  const q = feature === "story" ? quota.story : feature === "chat" ? quota.chat : quota.upload;
  if (!q) return null; // upload có thể thiếu nếu API cũ
  const left = Math.max(0, q.max - q.used);
  return (
    <p className="text-xs text-center opacity-80" style={{ color: "var(--mm-text)" }}>
      Hôm nay còn <strong>{left}/{q.max}</strong> lượt miễn phí ·{" "}
      <Link href="/pricing" className="underline" style={{ color: "#D4AF37" }}>
        Nâng cấp không giới hạn 👑
      </Link>
    </p>
  );
}
