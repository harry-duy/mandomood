"use client";

/**
 * SyncMenuItem — mục "☁️ Đồng bộ ngay" trong menu avatar (Navbar).
 * Hiện chấm đỏ khi có thay đổi chưa sync. Chỉ render khi đã đăng nhập
 * (Navbar truyền điều kiện). Sync xong toast kết quả + đóng menu.
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { syncNow, hasUnsyncedChanges } from "@/lib/cloudSync";

export default function SyncMenuItem({ onDone }: { onDone?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDirty(hasUnsyncedChanges());
  }, []);

  const handle = async () => {
    if (busy) return;
    setBusy(true);
    const r = await syncNow();
    setBusy(false);
    if (r.ok) {
      setDirty(false);
      toast.success(`☁️ Đã đồng bộ: ${r.stats?.words ?? 0} từ · ${r.stats?.decks ?? 0} bộ thẻ`);
    } else if (r.reason === "unauthenticated") {
      toast("Đăng nhập để đồng bộ giữa các thiết bị");
    } else if (r.reason === "rate_limited") {
      toast("Đồng bộ quá nhanh — thử lại sau 1 phút");
    } else {
      toast.error("Không đồng bộ được (mạng?). Dữ liệu trên máy vẫn an toàn.");
    }
    onDone?.();
  };

  return (
    <button
      onClick={handle}
      disabled={busy}
      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-[#F5F0EB] hover:bg-[#242424] transition-colors disabled:opacity-60"
      aria-label={dirty ? "Đồng bộ ngay (có thay đổi chưa đồng bộ)" : "Đồng bộ ngay"}
    >
      <span className="relative">
        ☁️
        {dirty && !busy && (
          <span
            className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#E8634A]"
            aria-hidden="true"
          />
        )}
      </span>
      {busy ? "Đang đồng bộ…" : "Đồng bộ ngay"}
    </button>
  );
}
