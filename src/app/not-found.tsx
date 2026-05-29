"use client";

/**
 * 404 Not Found — MandoMood
 * Hiện ra khi user vào URL không tồn tại
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

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
          迷
        </span>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-bold text-[#E8504A]">
          404
        </span>
      </div>

      {/* Message */}
      <h1 className="text-xl font-bold text-[#F5F0EB] mb-2">
        Trang không tìm thấy
      </h1>
      <p className="text-sm text-[#8A8078] max-w-xs leading-relaxed mb-1">
        Có vẻ bạn đang lạc đường… 迷路了
      </p>
      <p className="text-xs text-[#5A5450] italic mb-8">
        mílù le — bị lạc
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#E8504A] text-white font-semibold text-sm hover:bg-[#d43f39] transition-colors"
        >
          <Home size={16} />
          Về trang chủ
        </Link>
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-[rgba(255,255,255,0.08)] text-[#8A8078] text-sm hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>
      </div>
    </div>
  );
}
