"use client";

/**
 * SyncButton — nút "☁️ Đồng bộ" + dòng "lần cuối: ...".
 * Đặt ở /profile. Tự auto-sync 1 lần/phiên khi mount (đã đăng nhập mới render).
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Cloud, Loader2 } from "lucide-react";
import { syncNow, restoreFromCloud, getLastSync, autoSyncOncePerSession, hasUnsyncedChanges } from "@/lib/cloudSync";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

export default function SyncButton() {
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setLast(getLastSync());
    setDirty(hasUnsyncedChanges());
    // Kéo dữ liệu cloud về ngay khi vào trang (1 lần/phiên)
    autoSyncOncePerSession().then(() => {
      setLast(getLastSync());
      setDirty(hasUnsyncedChanges());
    });
  }, []);

  const handleSync = async () => {
    setBusy(true);
    const r = await syncNow();
    setBusy(false);
    if (r.ok) {
      setLast(getLastSync());
      setDirty(hasUnsyncedChanges());
      toast.success(
        `☁️ Đã đồng bộ: ${r.stats?.words ?? 0} từ · ${r.stats?.decks ?? 0} bộ thẻ · ${r.stats?.stories ?? 0} truyện`
      );
    } else if (r.reason === "unauthenticated") {
      toast("Đăng nhập để đồng bộ giữa các thiết bị");
    } else if (r.reason === "rate_limited") {
      toast("Đồng bộ quá nhanh — thử lại sau 1 phút");
    } else {
      toast.error("Không đồng bộ được (mạng?). Dữ liệu trên máy vẫn an toàn.");
    }
  };

  const handleRestore = async () => {
    if (!window.confirm("Khôi phục từ cloud sẽ GHI ĐÈ dữ liệu học trên máy này bằng bản cloud. Tiếp tục?")) return;
    setBusy(true);
    const r = await restoreFromCloud();
    setBusy(false);
    if (r.ok) {
      setLast(getLastSync());
      setDirty(hasUnsyncedChanges());
      toast.success(`📥 Đã khôi phục: ${r.stats?.words ?? 0} từ · ${r.stats?.decks ?? 0} bộ thẻ · ${r.stats?.stories ?? 0} truyện`);
    } else {
      toast.error("Không khôi phục được. Dữ liệu trên máy vẫn nguyên.");
    }
  };

  return (
    <div className="rounded-2xl bg-surface border border-[rgba(255,255,255,0.07)] p-4">
      <div className="flex items-center gap-3">
        <Cloud size={18} className="text-mm-gold shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Đồng bộ đám mây</p>
          <p className="text-[11px] text-[var(--text-muted)]">
            Sổ tay từ, bộ thẻ, truyện, điểm quiz — dùng được trên mọi thiết bị.
            {last && <> Lần cuối: {timeAgo(last)}.</>}
          </p>
        </div>
        <span className="relative shrink-0">
          {dirty && !busy && (
            <span
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-mm-red ring-2 ring-[var(--bg)]"
              aria-hidden="true"
              title="Có thay đổi chưa đồng bộ"
            />
          )}
          <button
            onClick={handleSync}
            disabled={busy}
            className="px-3 py-2 rounded-xl btn-primary text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60"
            aria-label={dirty ? "Đồng bộ dữ liệu học (có thay đổi chưa đồng bộ)" : "Đồng bộ dữ liệu học lên tài khoản"}
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Cloud size={13} />}
            {busy ? "Đang đồng bộ…" : "Đồng bộ"}
          </button>
        </span>
      </div>
      <button
        onClick={handleRestore}
        disabled={busy}
        className="mt-2 text-[11px] text-[var(--text-muted)] hover:text-mm-gold transition-colors disabled:opacity-60"
        aria-label="Khôi phục dữ liệu học từ cloud (chỉ kéo về, ghi đè máy này)"
      >
        📥 Máy mới? Khôi phục từ cloud (ghi đè dữ liệu máy này)
      </button>
    </div>
  );
}
