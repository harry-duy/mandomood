"use client";

/**
 * Error Boundary — MandoMood
 * Hiện ra khi một trang gặp lỗi runtime không lường trước.
 * Cho phép user thử lại hoặc về trang chủ thay vì thấy màn hình lỗi mặc định.
 */

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log để theo dõi (Vercel sẽ thu thập ở server logs / browser console)
    console.error("[MandoMood] Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6 text-center">
      {/* Decorative hanzi */}
      <div className="relative mb-6">
        <span
          className="text-[120px] font-bold select-none"
          style={{
            background: "linear-gradient(135deg, #E8504A22, #D4AF3722)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1,
          }}
        >
          误
        </span>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-[#E8504A]">
          !
        </span>
      </div>

      {/* Message */}
      <h1 className="text-xl font-bold text-[#F5F0EB] mb-2">Đã có lỗi xảy ra</h1>
      <p className="text-sm text-[#8A8078] max-w-xs leading-relaxed mb-1">
        Có gì đó trục trặc rồi… 出错了
      </p>
      <p className="text-xs text-[#5A5450] italic mb-8">chū cuò le — gặp lỗi</p>

      {error?.digest && (
        <p className="text-[10px] text-[#3A3A3A] mb-6 font-mono">Mã lỗi: {error.digest}</p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#E8504A] text-white font-semibold text-sm hover:bg-[#d43f39] transition-colors"
        >
          <RotateCcw size={16} />
          Thử lại
        </button>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-[rgba(255,255,255,0.08)] text-[#8A8078] text-sm hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
        >
          <Home size={16} />
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
