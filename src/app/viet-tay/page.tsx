"use client";

/**
 * /viet-tay — Vẽ tay tra chữ Hán.
 *
 * Lấy cảm hứng từ "Vẽ Kanji" của nhaikanji.com, nhưng nhận dạng license-safe
 * bằng dữ liệu nét hanzi-writer (MIT) + thuật toán riêng (src/lib/handwriting).
 */

import Link from "next/link";
import { ArrowLeft, PenLine, Search } from "lucide-react";
import HandwritingPad from "@/components/ui/HandwritingPad";

export default function VietTayPage() {
  return (
    <div className="min-h-screen pb-28 px-4 pt-6 max-w-xl mx-auto">
      <Link
        href="/search"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-white mb-4"
      >
        <ArrowLeft size={16} /> Tìm kiếm
      </Link>

      <h1 className="text-2xl font-bold mb-1">Vẽ tay tra chữ Hán</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Gặp một chữ Hán lạ mà không biết gõ? Cứ vẽ nó ra đây — MandoMood sẽ đoán các chữ gần giống nhất kèm pinyin và nghĩa.
      </p>

      <HandwritingPad />

      <div className="mt-10 flex flex-wrap gap-3 justify-center text-sm">
        <Link
          href="/luyen-viet/online"
          className="inline-flex items-center gap-1.5 text-mm-red hover:underline"
        >
          <PenLine size={15} /> Luyện viết online
        </Link>
        <Link
          href="/dictionary"
          className="inline-flex items-center gap-1.5 text-[var(--text-muted)] hover:text-white"
        >
          <Search size={15} /> Từ điển cảm xúc
        </Link>
      </div>
    </div>
  );
}
