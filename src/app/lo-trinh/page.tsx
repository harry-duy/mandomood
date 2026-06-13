/**
 * /lo-trinh — Lộ trình HSK 1→6 trực quan (cảm hứng JLPT roadmap của nhaikanji).
 * Mỗi cấp độ: mô tả, tiến độ (điểm quiz tốt nhất, lưu localStorage) và
 * lối tắt tới các công cụ luyện cho đúng cấp đó.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { readJSON } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const LEVELS = [
  { level: 1, label: "HSK 1", words: 150, desc: "Chào hỏi, giới thiệu bản thân, sinh hoạt cơ bản", color: "from-green-500 to-emerald-400", est: "1–2 tháng" },
  { level: 2, label: "HSK 2", words: 300, desc: "Giao tiếp đơn giản hằng ngày, mua sắm, hỏi đường", color: "from-teal-500 to-cyan-400", est: "2–3 tháng" },
  { level: 3, label: "HSK 3", words: 600, desc: "Trò chuyện về công việc, học tập, du lịch", color: "from-blue-500 to-indigo-400", est: "3–4 tháng" },
  { level: 4, label: "HSK 4", words: 1200, desc: "Thảo luận chủ đề trừu tượng, đọc báo cơ bản", color: "from-violet-500 to-purple-400", est: "4–6 tháng" },
  { level: 5, label: "HSK 5", words: 2500, desc: "Đọc tiểu thuyết, xem phim không phụ đề", color: "from-pink-500 to-rose-400", est: "6–9 tháng" },
  { level: 6, label: "HSK 6", words: 5000, desc: "Diễn đạt như người bản địa, văn chương & học thuật", color: "from-red-500 to-orange-400", est: "9–12 tháng" },
];

export default function RoadmapPage() {
  const { onboarding } = useAppStore();
  const [best, setBest] = useState<Record<string, number>>({});

  useEffect(() => {
    setBest(readJSON<Record<string, number>>("mm_hsk_quiz_best", {}));
  }, []);

  // Cấp hiện tại suy từ onboarding (vd "hsk2" → 2)
  const currentLevel = (() => {
    const m = /hsk(\d)/.exec(onboarding.level ?? "");
    return m ? Number(m[1]) : 1;
  })();

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-playfair text-2xl font-bold mb-1">Lộ trình HSK 🗺️</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Hành trình từ con số 0 đến thành thạo — mỗi cấp có đủ công cụ luyện.
          Đạt quiz ≥ 80% để &ldquo;hoàn thành&rdquo; một chặng.
        </p>
      </motion.div>

      <div className="relative pb-16">
        {/* Đường nối dọc */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-[rgba(255,255,255,0.08)]" aria-hidden="true" />

        <div className="space-y-4">
          {LEVELS.map((lv, i) => {
            const score = best[lv.level] ?? 0;
            const done = score >= 80;
            const isCurrent = lv.level === currentLevel;
            return (
              <motion.div
                key={lv.level}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="relative pl-12"
              >
                {/* Mốc */}
                <span className="absolute left-2 top-4 z-10 bg-[var(--bg)] rounded-full">
                  {done ? (
                    <CheckCircle2 size={22} className="text-green-400" />
                  ) : (
                    <Circle size={22} className={isCurrent ? "text-mm-gold" : "text-[var(--text-muted)]"} />
                  )}
                </span>

                <div
                  className={cn(
                    "rounded-2xl border bg-surface p-4",
                    isCurrent ? "border-mm-gold/50" : "border-[rgba(255,255,255,0.07)]"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className={cn("text-sm font-bold bg-gradient-to-r bg-clip-text text-transparent", lv.color)}>
                      {lv.label}
                      {isCurrent && <span className="ml-2 text-[10px] text-mm-gold">← bạn đang ở đây</span>}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">{lv.words} từ · ~{lv.est}</p>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mb-3">{lv.desc}</p>

                  {/* Tiến độ quiz */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-1.5 rounded-full bg-surface2 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full bg-gradient-to-r transition-all", lv.color)}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] w-16 text-right">
                      {score > 0 ? `Quiz ${score}%` : "Chưa quiz"}
                    </span>
                  </div>

                  {/* Lối tắt công cụ */}
                  <div className="flex flex-wrap gap-1.5">
                    <Link href={`/hsk?level=hsk${lv.level}`} className="text-[11px] px-2.5 py-1 rounded-full bg-surface2 text-[var(--text-muted)] hover:text-mm-gold transition-colors">
                      📚 Học từ vựng
                    </Link>
                    <Link href="/karaoke" className="text-[11px] px-2.5 py-1 rounded-full bg-surface2 text-[var(--text-muted)] hover:text-mm-gold transition-colors">
                      🎤 Karaoke
                    </Link>
                    <Link href="/practice" className="text-[11px] px-2.5 py-1 rounded-full bg-surface2 text-[var(--text-muted)] hover:text-mm-gold transition-colors">
                      🧩 Ghép câu
                    </Link>
                    <Link href="/pronunciation" className="text-[11px] px-2.5 py-1 rounded-full bg-surface2 text-[var(--text-muted)] hover:text-mm-gold transition-colors">
                      🎙️ Phát âm
                    </Link>
                    <Link href="/tones" className="text-[11px] px-2.5 py-1 rounded-full bg-surface2 text-[var(--text-muted)] hover:text-mm-gold transition-colors">
                      🎵 Thanh điệu
                    </Link>
                    <Link href="/shadowing" className="text-[11px] px-2.5 py-1 rounded-full bg-surface2 text-[var(--text-muted)] hover:text-mm-gold transition-colors">
                      🎭 Shadowing
                    </Link>
                    <Link href="/grammar" className="text-[11px] px-2.5 py-1 rounded-full bg-surface2 text-[var(--text-muted)] hover:text-mm-gold transition-colors">
                      📖 Ngữ pháp
                    </Link>
                    <Link href="/ai-tutor" className="text-[11px] px-2.5 py-1 rounded-full bg-surface2 text-[var(--text-muted)] hover:text-mm-gold transition-colors">
                      🤖 AI Tutor
                    </Link>
                    <Link href="/test" className="text-[11px] px-2.5 py-1 rounded-full bg-surface2 text-[var(--text-muted)] hover:text-mm-gold transition-colors">
                      🏁 Thi thử HSK
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Đích */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative pl-12 mt-4"
        >
          <span className="absolute left-2 top-1 z-10 bg-[var(--bg)] rounded-full">
            <Sparkles size={22} className="text-mm-gold" />
          </span>
          <p className="text-sm text-mm-gold font-semibold pt-1">
            Thành thạo tiếng Trung — 加油! 🎉
          </p>
        </motion.div>
      </div>
    </div>
  );
}
