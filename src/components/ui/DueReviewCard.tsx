"use client";

/**
 * DueReviewCard — Nhắc ôn tập spaced-repetition (SM-2) trên trang chủ.
 *
 * Cốt lõi giữ chân của các app học (Anki/Quizlet/OpenQuiz) là vòng lặp ôn hằng ngày.
 * MandoMood đã có engine SRS server-side (/api/user/vocabulary?filter=due) nhưng
 * trước đây KHÔNG surface ở trang chủ → người học quên ôn. Card này hiển thị số thẻ
 * đến hạn và dẫn thẳng tới /review.
 *
 * - Chỉ hiện cho user đã đăng nhập (SRS lưu theo user trên server).
 * - Không có thẻ đến hạn → ẩn hẳn để không gây nhiễu.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RotateCcw, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";

export default function DueReviewCard() {
  const { data: session } = useSession();
  const [due, setDue] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.user) { setDue(null); return; }
    let cancelled = false;
    const load = () => {
      fetch("/api/user/vocabulary?filter=due")
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { total?: number } | null) => {
          if (!cancelled && data && typeof data.total === "number") setDue(data.total);
        })
        .catch(() => { /* im lặng — không chặn trang chủ */ });
    };
    load();
    // Cập nhật lại khi nhận XP (vừa review xong) hoặc tab khác đổi dữ liệu
    window.addEventListener("mm:xp", load);
    return () => { cancelled = true; window.removeEventListener("mm:xp", load); };
  }, [session?.user]);

  if (!session?.user || !due || due <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3"
    >
      <Link
        href="/review"
        className="flex items-center gap-3 rounded-2xl border border-mm-red/25 bg-mm-red/10 p-3.5 hover:bg-mm-red/15 transition-colors"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mm-red/15">
          <RotateCcw size={18} className="text-mm-red" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text)]">
            {due} từ cần ôn hôm nay
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">
            Ôn đúng lúc giúp nhớ lâu — chỉ vài phút thôi!
          </p>
        </div>
        <ChevronRight size={18} className="text-mm-red shrink-0" />
      </Link>
    </motion.div>
  );
}
