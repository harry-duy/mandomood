"use client";

/**
 * InstallAppMenuItem — nút "Cài app vào máy" đặt trong menu avatar (Navbar).
 * Thay cho banner popup cũ: KHÔNG tự hiện, chỉ cài khi người dùng chủ động bấm.
 * - Chrome/Edge/Android: gọi prompt cài đặt gốc.
 * - iOS Safari / trình duyệt khác: hiện hướng dẫn thêm vào màn hình chính.
 * - Đã cài (standalone): tự ẩn.
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isStandalone, promptInstall, subscribeInstall } from "@/lib/pwa-install";

export default function InstallAppMenuItem({ onDone }: { onDone?: () => void }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(isStandalone());
    return subscribeInstall(() => setHidden(isStandalone()));
  }, []);

  if (hidden) return null;

  const handleClick = async () => {
    const result = await promptInstall();
    if (result === "unavailable") {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      toast(
        isIOS
          ? "Trên iPhone/iPad: bấm nút Chia sẻ (⬆️) rồi chọn “Thêm vào MH chính”."
          : "Mở menu trình duyệt (⋮) và chọn “Cài đặt ứng dụng / Thêm vào màn hình chính”.",
        { duration: 6000 }
      );
    } else if (result === "accepted") {
      toast.success("Đã cài MandoMood vào máy 🎉");
    }
    onDone?.();
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-[#F5F0EB] hover:bg-surface2 transition-colors"
    >
      📲 Cài app vào máy
    </button>
  );
}
