/**
 * /lo-trinh — Lộ trình HSK 1→6 trực quan (cảm hứng JLPT roadmap của nhaikanji).
 * Mỗi cấp độ: mô tả, tiến độ (điểm quiz tốt nhất, lưu localStorage) và
 * lối tắt tới các công cụ luyện cho đúng cấp đó.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Sparkles, Target } from "lucide-react";
import { cn, readJSON } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import SkillRadar from "@/components/ui/SkillRadar";
import { computeSkillScores, SKILL_LABELS, overallScore, weakestSkill, strongestSkill, levelFromScore } from "@/lib/skillScores";
import type { SkillScores } from "@/lib/skillScores";
import { getPersonalizedMilestones, getMotivationalMessage } from "@/lib/learningPath";

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
  const [skillScores, setSkillScores] = useState<SkillScores>({ vocab: 0, listening: 0, speaking: 0, reading: 0, writing: 0 });

  useEffect(() => {
    setBest(readJSON<Record<string, number>>("mm_hsk_quiz_best", {}));
    setSkillScores(computeSkillScores());
  }, []);

  // Cấp hiện tại suy từ onboarding (vd "hsk2" → 2)
  const currentLevel = (() => {
    const m = /hsk(\d)/.exec(onboarding.level ?? "");
    return m ? Number(m[1]) : 1;
  })();

  const overall = overallScore(skillScores);
  const hasSkillData = overall > 0;
  const milestones = getPersonalizedMilestones(skillScores);
  const weak = hasSkillData ? weakestSkill(skillScores) : null;
  const strong = hasSkillData ? strongestSkill(skillScores) : null;

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="font-playfair text-2xl font-bold mb-1">Lộ trình của bạn 🗺️</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Dựa trên dữ liệu học thực tế — lộ trình cá nhân hoá theo kỹ năng của bạn.
        </p>
      </motion.div>

      {/* ── Phần cá nhân hoá ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl bg-surface border border-[rgba(255,255,255,0.07)] p-4 mb-5"
      >
        {/* Radar + trình độ */}
        <div className="flex items-start gap-4 mb-4">
          <SkillRadar scores={skillScores} size={160} animated />
          <div className="flex-1 pt-2">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Trình độ tổng hợp</p>
            <p className="text-lg font-bold text-mm-gold mb-1">{levelFromScore(overall)}</p>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-3">
              {getMotivationalMessage(overall)}
            </p>
            {hasSkillData && strong && weak && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{strong.emoji}</span>
                  <span className="text-[10px] text-green-400">Mạnh: {strong.label} ({skillScores[strong.key]})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{weak.emoji}</span>
                  <span className="text-[10px] text-mm-red">Cần rèn: {weak.label} ({skillScores[weak.key]})</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Thanh kỹ năng */}
        <div className="space-y-1.5 mb-4">
          {SKILL_LABELS.map((sk) => {
            const s = skillScores[sk.key];
            return (
              <div key={sk.key} className="flex items-center gap-2">
                <span className="text-sm w-5 shrink-0">{sk.emoji}</span>
                <span className="text-[10px] w-14 shrink-0 text-[var(--text-muted)]">{sk.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-surface2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${s}%`, backgroundColor: sk.color }}
                  />
                </div>
                <span className="text-[10px] w-7 text-right" style={{ color: s > 0 ? sk.color : "rgba(255,255,255,0.25)" }}>
                  {s > 0 ? s : "—"}
                </span>
              </div>
            );
          })}
        </div>

        {/* 3 bước tiếp theo */}
        {milestones.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Target size={11} className="text-mm-gold" />
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
                {hasSkillData ? "3 bước tiếp theo của bạn" : "Bắt đầu từ đây nhé 👇"}
              </p>
            </div>
            <div className="space-y-1.5">
              {milestones.map((m, idx) => (
                <Link
                  key={m.id}
                  href={m.href}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface hover:bg-surface2 transition-colors group"
                >
                  <span className="text-base shrink-0">{m.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold leading-tight group-hover:text-mm-gold transition-colors truncate">
                      {m.title}
                    </p>
                    <p className="text-[9px] text-[var(--text-muted)] leading-tight mt-0.5 line-clamp-1">
                      {m.desc}
                    </p>
                  </div>
                  {idx === 0 && (
                    <span className="shrink-0 text-[8px] px-1.5 py-0.5 rounded-full bg-mm-red/20 text-mm-red font-bold">
                      #1
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {!hasSkillData && (
          <p className="text-xs text-center text-[var(--text-muted)] py-1">
            Học thử các chức năng để lộ trình tự cập nhật theo bạn ✨
          </p>
        )}
      </motion.div>

      {/* Divider */}
      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-4 text-center">
        — Lộ trình HSK chi tiết —
      </p>

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
