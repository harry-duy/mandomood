"use client";

/**
 * /progress — Bảng tiến trình CÁ NHÂN (tự cập nhật, không cần backend).
 *
 * Tổng hợp dữ liệu đã lưu trên máy:
 *  - Lịch sử truyện AI đã tạo (localStorage "mm_story_history").
 *  - Daily-plan tasks đã check (localStorage "mm_daily_plan_YYYY_M_D").
 * Hiển thị: tổng số truyện, số truyện 7 ngày qua, và biểu đồ hoạt động 14 ngày.
 * Triết lý: cho người học thấy hành trình của mình một cách nhẹ nhàng, tạo động lực.
 */

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Sparkles, Flame, BookOpen, ArrowRight, Layers, Bookmark, Zap, Star, TrendingUp } from "lucide-react";
import { readJSON } from "@/lib/utils";
import BadgeGrid from "@/components/ui/BadgeGrid";
import SkillRadar from "@/components/ui/SkillRadar";
import { getDecks, getDueCards } from "@/lib/customDecks";
import { getSavedWords } from "@/lib/savedWords";
import { getTestHistory, summarizeTests, pctOf, type TestResult } from "@/lib/testHistory";
import { useProgress } from "@/hooks/useProgress";
import { computeSkillScores, SKILL_LABELS, overallScore, weakestSkill } from "@/lib/skillScores";
import { getPersonalizedMilestones, getMotivationalMessage } from "@/lib/learningPath";

interface HistoryItem {
  id: string;
  createdAt: string;
}

/** Chỉ số ôn tập SRS/từ vựng — đọc localStorage, không cần backend. */
interface ReviewStats {
  savedWords: number;
  totalCards: number;
  dueCards: number;
  hskBest: Record<string, number>;
}

function loadReviewStats(): ReviewStats {
  const decks = getDecks();
  return {
    savedWords: getSavedWords().length,
    totalCards: decks.reduce((s, d) => s + d.cards.length, 0),
    dueCards: decks.reduce((s, d) => s + getDueCards(d).length, 0),
    hskBest: readJSON<Record<string, number>>("mm_hsk_quiz_best", {}),
  };
}

function loadHistory(): HistoryItem[] {
  return readJSON<HistoryItem[]>("mm_story_history", []);
}

/**
 * Đọc ngày nào có daily-plan task được check → thêm vào activity counts.
 * Key format: mm_daily_plan_YYYY_M_D → { checked: { taskId: boolean } }
 */
function loadDailyPlanDays(): string[] {
  const active: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) ?? "";
    if (!key.startsWith("mm_daily_plan_")) continue;
    // key = mm_daily_plan_YYYY_M_D
    const parts = key.replace("mm_daily_plan_", "").split("_");
    if (parts.length !== 3) continue;
    const [y, m, d] = parts;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    if (isNaN(date.getTime())) continue;
    const plan = readJSON<{ checked?: Record<string, boolean> }>(key, {});
    const hasAny = Object.values(plan.checked ?? {}).some(Boolean);
    if (hasAny) {
      // push as ISO date key YYYY-MM-DD
      active.push(
        `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      );
    }
  }
  return active;
}

/** Khoá ngày YYYY-MM-DD theo local time. */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Server trả về level theo ngưỡng XP: beginner → hsk1 → hsk2 → ... → hsk6
const LEVEL_LABELS: Record<string, string> = {
  beginner: "Mới bắt đầu",
  hsk1: "HSK 1 · 好奇",
  hsk2: "HSK 2 · 迷恋",
  hsk3: "HSK 3 · 心动",
  hsk4: "HSK 4 · 相知",
  hsk5: "HSK 5 · 深情",
  hsk6: "HSK 6 · 灵魂",
};

export default function ProgressPage() {
  const { stats: xpStats } = useProgress();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [review, setReview] = useState<ReviewStats | null>(null);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [planDays, setPlanDays] = useState<string[]>([]);
  const [skillScores, setSkillScores] = useState({ vocab: 0, listening: 0, speaking: 0, reading: 0, writing: 0 });

  useEffect(() => {
    setTests(getTestHistory());
    setHistory(loadHistory());
    setPlanDays(loadDailyPlanDays());
    setReview(loadReviewStats());
    setSkillScores(computeSkillScores());
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const counts: Record<string, number> = {};
    for (const h of history) {
      const d = new Date(h.createdAt);
      if (!isNaN(d.getTime())) counts[dayKey(d)] = (counts[dayKey(d)] ?? 0) + 1;
    }
    // Gộp ngày có daily-plan task (cộng thêm 1 điểm hoạt động/ngày)
    for (const dk of planDays) {
      counts[dk] = (counts[dk] ?? 0) + 1;
    }

    // 14 ngày gần nhất (cũ → mới)
    const days: { key: string; label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = dayKey(d);
      days.push({ key, label: String(d.getDate()), count: counts[key] ?? 0 });
    }

    const last7 = days.slice(7).reduce((s, d) => s + d.count, 0);

    // Streak: số ngày liên tiếp gần nhất có hoạt động (tính tới hôm nay/hôm qua)
    let streak = 0;
    for (let i = 0; ; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      if (counts[dayKey(d)]) streak++;
      else break;
    }

    // Kỷ lục streak (chuỗi ngày liên tiếp dài nhất trong toàn bộ lịch sử)
    const activeKeys = Object.keys(counts).sort();
    let bestStreak = 0;
    let run = 0;
    let prev: Date | null = null;
    for (const k of activeKeys) {
      const cur = new Date(k + "T00:00:00");
      if (prev && Math.round((cur.getTime() - prev.getTime()) / 86400000) === 1) {
        run++;
      } else {
        run = 1;
      }
      if (run > bestStreak) bestStreak = run;
      prev = cur;
    }

    // Tổng số ngày có hoạt động
    const activeDays = activeKeys.length;

    const max = Math.max(1, ...days.map((d) => d.count));
    return { total: history.length, last7, streak, days, max, bestStreak, activeDays };
  }, [history, planDays]);

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <div className="mb-6">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
          Hành trình của bạn
        </p>
        <h1 className="font-playfair text-2xl font-bold">Tiến trình học 📈</h1>
      </div>

      {/* XP + Level banner */}
      {xpStats.xp > 0 && (
        <div className="rounded-2xl mb-5 p-4 border border-mm-gold/25 bg-gradient-to-r from-mm-gold/10 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-mm-gold/20 flex items-center justify-center">
              <Zap size={18} className="text-mm-gold" />
            </div>
            <div>
              <p className="text-lg font-bold text-mm-gold">{xpStats.xp.toLocaleString()} XP</p>
              <p className="text-[11px] text-[var(--text-muted)]">Tổng điểm kinh nghiệm</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end mb-0.5">
              <Star size={12} className="text-mm-gold" />
              <p className="text-sm font-semibold capitalize">{LEVEL_LABELS[xpStats.level] ?? xpStats.level}</p>
            </div>
            <p className="text-[10px] text-[var(--text-muted)]">Cấp độ hiện tại</p>
          </div>
        </div>
      )}

      {/* ── Phân tích kỹ năng ── */}
      {(() => {
        const overall = overallScore(skillScores);
        const weak = weakestSkill(skillScores);
        const milestones = getPersonalizedMilestones(skillScores);
        const hasData = overall > 0;
        return (
          <div className="rounded-2xl bg-surface border border-[rgba(255,255,255,0.07)] p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-mm-red" />
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Phân tích kỹ năng</p>
            </div>

            <div className="flex flex-col items-center mb-4">
              <SkillRadar scores={skillScores} size={200} animated />
              <p className="mt-2 text-xs text-center text-[var(--text-muted)]">
                {getMotivationalMessage(overall)}
              </p>
            </div>

            {/* Thanh kỹ năng chi tiết */}
            <div className="space-y-2 mb-4">
              {SKILL_LABELS.map((sk) => {
                const s = skillScores[sk.key];
                return (
                  <div key={sk.key} className="flex items-center gap-2">
                    <span className="text-base w-6 shrink-0">{sk.emoji}</span>
                    <span className="text-[11px] w-16 shrink-0 text-[var(--text-muted)]">{sk.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-surface2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${s}%`, backgroundColor: sk.color }}
                      />
                    </div>
                    <span className="text-[11px] w-8 text-right" style={{ color: s > 0 ? sk.color : "var(--text-muted)" }}>
                      {s > 0 ? `${s}` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Gợi ý cá nhân hoá */}
            {hasData && milestones.length > 0 && (
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">
                  Bước tiếp theo của bạn
                </p>
                <div className="space-y-1.5">
                  {milestones.map((m) => (
                    <Link
                      key={m.id}
                      href={m.href}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface hover:bg-surface2 transition-colors group"
                    >
                      <span className="text-lg shrink-0 mt-0.5">{m.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold leading-tight group-hover:text-mm-gold transition-colors">
                          {m.title}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">
                          {m.desc}
                        </p>
                      </div>
                      {m.priority === "high" && (
                        <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-mm-red/20 text-mm-red font-semibold ml-auto">
                          ưu tiên
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!hasData && (
              <p className="text-xs text-center text-[var(--text-muted)] py-2">
                Học thêm một chút để thấy phân tích kỹ năng của bạn ✨
              </p>
            )}

            {hasData && (
              <Link href="/lo-trinh" className="mt-3 inline-flex items-center gap-1 text-xs text-mm-gold hover:underline">
                Xem lộ trình cá nhân hoá →
              </Link>
            )}
          </div>
        );
      })()}

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="rounded-2xl bg-surface border border-[rgba(255,255,255,0.07)] p-4 text-center">
          <BookOpen size={18} className="mx-auto mb-1 text-mm-red" />
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-[11px] text-[var(--text-muted)]">Truyện đã tạo</p>
        </div>
        <div className="rounded-2xl bg-surface border border-[rgba(255,255,255,0.07)] p-4 text-center">
          <Sparkles size={18} className="mx-auto mb-1 text-mm-gold" />
          <p className="text-2xl font-bold">{stats.last7}</p>
          <p className="text-[11px] text-[var(--text-muted)]">7 ngày qua</p>
        </div>
        <div className="rounded-2xl bg-surface border border-[rgba(255,255,255,0.07)] p-4 text-center">
          <Flame size={18} className="mx-auto mb-1 text-orange-400" />
          <p className="text-2xl font-bold">{stats.streak}</p>
          <p className="text-[11px] text-[var(--text-muted)]">Ngày liên tiếp</p>
        </div>
      </div>

      {/* Hàng chỉ số phụ: kỷ lục & tổng ngày học */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <div className="rounded-2xl bg-surface border border-[rgba(255,255,255,0.07)] p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">{stats.bestStreak}</p>
          <p className="text-[11px] text-[var(--text-muted)]">Kỷ lục streak (ngày)</p>
        </div>
        <div className="rounded-2xl bg-surface border border-[rgba(255,255,255,0.07)] p-4 text-center">
          <p className="text-2xl font-bold text-mm-gold">{stats.activeDays}</p>
          <p className="text-[11px] text-[var(--text-muted)]">Tổng ngày học</p>
        </div>
      </div>

      {/* 14-day activity chart */}
      <div className="rounded-2xl bg-surface border border-[rgba(255,255,255,0.07)] p-4 mb-6">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-4">
          Hoạt động 14 ngày
        </p>
        {stats.total === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-6">
            Chưa có dữ liệu. Hãy tạo câu chuyện đầu tiên!
          </p>
        ) : (
          <div className="flex items-end justify-between gap-1 h-28" role="img" aria-label="Biểu đồ hoạt động 14 ngày">
            {stats.days.map((d) => (
              <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-mm-red/70 transition-all"
                  style={{ height: `${(d.count / stats.max) * 100}%`, minHeight: d.count > 0 ? 6 : 2, opacity: d.count > 0 ? 1 : 0.25 }}
                  title={`${d.count} truyện`}
                />
                <span className="text-[9px] text-[var(--text-muted)]">{d.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tiến bộ điểm thi HSK */}
      {tests.length > 0 && (() => {
        const s = summarizeTests(tests, 12);
        return (
          <div className="rounded-2xl bg-surface border border-[rgba(255,255,255,0.07)] p-4 mb-6">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
              Tiến bộ điểm thi
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mb-4">
              {s.count} lần thi · trung bình {s.avg}% · cao nhất {s.best}%
            </p>
            <div className="flex items-end gap-1.5 h-24" role="img" aria-label="Biểu đồ điểm thi gần đây">
              {s.recent.map((r, i) => {
                const p = pctOf(r);
                return (
                  <div key={`${r.date}-${i}`} className="flex-1 flex flex-col items-center gap-1" title={`${r.level.toUpperCase()}: ${r.score}/${r.total} (${p}%)`}>
                    <div
                      className={p >= 80 ? "w-full rounded-t-md bg-green-500/80" : p >= 50 ? "w-full rounded-t-md bg-mm-gold/80" : "w-full rounded-t-md bg-mm-red/70"}
                      style={{ height: `${Math.max(6, p)}%` }}
                    />
                    <span className="text-[8px] text-[var(--text-muted)]">{r.level.replace("hsk", "H")}</span>
                  </div>
                );
              })}
            </div>
            <Link href="/test" className="mt-3 inline-flex items-center gap-1 text-xs text-mm-red hover:underline">
              Thi thử tiếp <ArrowRight size={12} />
            </Link>
          </div>
        );
      })()}

      {/* Ôn tập & từ vựng (SRS) */}
      {review && (review.savedWords > 0 || review.totalCards > 0) && (
        <div className="rounded-2xl bg-surface border border-[rgba(255,255,255,0.07)] p-4 mb-6">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
            Ôn tập &amp; từ vựng
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Link href="/my-decks" className="rounded-xl bg-surface2 p-3 text-center hover:brightness-110 transition-all">
              <Flame size={16} className={`mx-auto mb-1 ${review.dueCards > 0 ? "text-mm-red" : "text-[var(--text-muted)]"}`} />
              <p className="text-xl font-bold">{review.dueCards}</p>
              <p className="text-[10px] text-[var(--text-muted)]">Thẻ đến hạn ôn</p>
            </Link>
            <Link href="/my-decks" className="rounded-xl bg-surface2 p-3 text-center hover:brightness-110 transition-all">
              <Layers size={16} className="mx-auto mb-1 text-mm-gold" />
              <p className="text-xl font-bold">{review.totalCards}</p>
              <p className="text-[10px] text-[var(--text-muted)]">Thẻ flashcard</p>
            </Link>
            <Link href="/so-tay" className="rounded-xl bg-surface2 p-3 text-center hover:brightness-110 transition-all">
              <Bookmark size={16} className="mx-auto mb-1 text-mm-red" />
              <p className="text-xl font-bold">{review.savedWords}</p>
              <p className="text-[10px] text-[var(--text-muted)]">Từ trong sổ tay</p>
            </Link>
          </div>
          {review.dueCards > 0 && (
            <Link
              href="/my-decks"
              className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-mm-red hover:underline"
            >
              Ôn ngay {review.dueCards} thẻ đến hạn <ArrowRight size={12} />
            </Link>
          )}
        </div>
      )}

      {/* Chặng HSK (điểm quiz tốt nhất từng cấp) */}
      {review && Object.keys(review.hskBest).length > 0 && (
        <div className="rounded-2xl bg-surface border border-[rgba(255,255,255,0.07)] p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">
              Chặng HSK
            </p>
            <Link href="/lo-trinh" className="text-[11px] text-mm-gold hover:underline">
              Xem lộ trình →
            </Link>
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((lv) => {
              const pct = review.hskBest[lv] ?? 0;
              if (pct === 0) return null;
              return (
                <div key={lv} className="flex items-center gap-2">
                  <span className="text-[11px] w-12 shrink-0 text-[var(--text-muted)]">HSK {lv}</span>
                  <div
                    className="flex-1 h-2 rounded-full bg-surface2 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Điểm quiz tốt nhất HSK ${lv}: ${pct}%`}
                  >
                    <div
                      className={`h-full rounded-full ${pct >= 80 ? "bg-mm-gold" : "bg-mm-red/80"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-[11px] w-10 text-right ${pct >= 80 ? "text-mm-gold" : "text-[var(--text-muted)]"}`}>
                    {pct}%{pct >= 80 ? " ✓" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Huy hiệu thành tích */}
      <BadgeGrid stats={{
        storiesCreated: stats.total,
        streak: stats.streak,
        testsTaken: tests.length,
        bestTestPct: summarizeTests(tests).best,
      }} />

      <Link
        href="/generate"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl btn-primary font-semibold"
      >
        <Sparkles size={16} /> Tạo truyện hôm nay
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
