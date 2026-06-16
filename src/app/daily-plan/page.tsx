"use client";

/**
 * /daily-plan — Kế hoạch học hôm nay
 * Cá nhân hóa theo onboarding (level + goal + dailyGoal + favMoods).
 * Hiển thị checklist học + tip + link tới đúng công cụ.
 * Trạng thái lưu localStorage "mm_daily_plan_[date]" — reset mỗi ngày.
 */

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, Flame, Clock, Sparkles, ChevronRight,
  BookOpen, Mic, Wand2, MessageCircle, Brain, Trophy, Star, Zap, RotateCcw, Layers, Music,
  BellRing, X,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { readJSON, writeJSON } from "@/lib/utils";
import { usePushNotification } from "@/hooks/usePushNotification";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  icon: React.ElementType;
  minutes: number;
  xpReward: number;
  color: string;
}

// ─── Mapping mục tiêu → công cụ ưu tiên ──────────────────────────────────────

const GOAL_TASKS: Record<string, Task[]> = {
  drama: [
    { id: "karaoke", label: "Karaoke tiếng Trung", sublabel: "Nghe · nhái theo · chép chính tả", href: "/karaoke", icon: Mic, minutes: 8, xpReward: 25, color: "#E8504A" },
    { id: "shadowing", label: "Shadowing câu thoại", sublabel: "Nghe · ghi âm · tự chấm sao", href: "/shadowing", icon: Music, minutes: 8, xpReward: 20, color: "#C9878A" },
    { id: "generate", label: "Tạo câu chuyện AI", sublabel: "Học từ trong ngữ cảnh", href: "/generate", icon: Wand2, minutes: 5, xpReward: 25, color: "#D4AF37" },
    { id: "pronunciation", label: "Luyện phát âm", sublabel: "Nói đúng câu hội thoại", href: "/pronunciation", icon: Mic, minutes: 5, xpReward: 20, color: "#8FAF8F" },
  ],
  travel: [
    { id: "hsk", label: "Từ vựng HSK", sublabel: "Học từ thực dụng mỗi ngày", href: "/hsk", icon: BookOpen, minutes: 5, xpReward: 20, color: "#7AB8D4" },
    { id: "tones", label: "Luyện thanh điệu", sublabel: "Nghe đúng thanh — nói đúng giọng", href: "/tones", icon: Music, minutes: 5, xpReward: 20, color: "#8FAF8F" },
    { id: "ai-tutor", label: "Chat với AI Gia sư", sublabel: "Tập hội thoại mua sắm, hỏi đường", href: "/ai-tutor", icon: MessageCircle, minutes: 5, xpReward: 15, color: "#E8504A" },
    { id: "challenge", label: "Thử thách hôm nay", sublabel: "6 câu, giữ streak", href: "/challenge", icon: Flame, minutes: 3, xpReward: 30, color: "#E8A838" },
  ],
  business: [
    { id: "hsk", label: "Từ vựng chuyên ngành", sublabel: "Từ HSK4-5 dùng trong công việc", href: "/hsk", icon: BookOpen, minutes: 7, xpReward: 20, color: "#7AB8D4" },
    { id: "grammar", label: "Ngữ pháp nâng cao", sublabel: "Cấu trúc câu chính thức", href: "/grammar", icon: Brain, minutes: 5, xpReward: 20, color: "#C9878A" },
    { id: "practice", label: "Ghép câu tiếng Trung", sublabel: "Sắp xếp từ thành câu đúng", href: "/practice", icon: Layers, minutes: 5, xpReward: 20, color: "#D4AF37" },
    { id: "flashcards", label: "Ôn thẻ SRS", sublabel: "Ôn từ đến hạn", href: "/flashcards", icon: Zap, minutes: 5, xpReward: 25, color: "#8FAF8F" },
  ],
  culture: [
    { id: "generate", label: "Đọc câu chuyện AI", sublabel: "Truyện ngắn + văn hóa Trung Hoa", href: "/generate", icon: Wand2, minutes: 7, xpReward: 25, color: "#D4AF37" },
    { id: "chiet-tu", label: "Chiết tự chữ Hán", sublabel: "Hiểu nguồn gốc từng chữ", href: "/chiet-tu", icon: Sparkles, minutes: 5, xpReward: 15, color: "#E8A838" },
    { id: "characters", label: "Khám phá chữ cảm xúc", sublabel: "Browse chữ Hán theo cảm xúc", href: "/characters", icon: Layers, minutes: 5, xpReward: 10, color: "#C9878A" },
    { id: "reading", label: "Đọc hiểu tiếng Trung", sublabel: "Đoạn văn có ghi chú văn hóa", href: "/reading", icon: BookOpen, minutes: 7, xpReward: 20, color: "#7AB8D4" },
  ],
  fun: [
    { id: "karaoke", label: "Karaoke bài yêu thích", sublabel: "Chọn bài, nghe rồi nhái theo", href: "/karaoke", icon: Mic, minutes: 8, xpReward: 25, color: "#E8504A" },
    { id: "challenge", label: "Thử thách hôm nay", sublabel: "Nhanh, vui, kiếm XP", href: "/challenge", icon: Flame, minutes: 3, xpReward: 30, color: "#E8A838" },
    { id: "generate", label: "Tạo câu chuyện theo mood", sublabel: "Tự chọn chủ đề thích", href: "/generate", icon: Wand2, minutes: 5, xpReward: 25, color: "#D4AF37" },
    { id: "ai-tutor", label: "Chat với AI vui nhộn", sublabel: "Chọn nhân vật 哈哈 hay 星星", href: "/ai-tutor", icon: MessageCircle, minutes: 5, xpReward: 15, color: "#8FAF8F" },
  ],
};

// Task mặc định cho mọi người (luôn xuất hiện)
const COMMON_TASKS: Task[] = [
  { id: "daily-quote", label: "Đọc câu nói hôm nay", sublabel: "Câu nói hay xoay vòng mỗi ngày", href: "/", icon: Star, minutes: 1, xpReward: 5, color: "#D4AF37" },
  { id: "flashcards", label: "Ôn thẻ đến hạn", sublabel: "SRS — không bao giờ quên", href: "/flashcards", icon: Zap, minutes: 5, xpReward: 25, color: "#8FAF8F" },
];

// Tip của ngày theo giờ
function getDayTip(goal: string): string {
  const h = new Date().getHours();
  if (h < 9) return "Buổi sáng não hấp thụ từ mới tốt nhất. Học từ vựng ngay đi!";
  if (h < 12) return "Học đều đặn mỗi ngày quan trọng hơn học nhiều một lúc. Cố lên!";
  if (h < 15) return "Buổi trưa nghe Karaoke tiếng Trung — luyện tai trong khi thư giãn.";
  if (h < 18) return "Buổi chiều hợp để đọc truyện AI và ôn lại từ đã học.";
  if (h < 21) return "Tối là lúc tốt để chat với AI Gia sư — ôn lại ngày học.";
  return "Trước khi ngủ, đọc một câu nói hay bằng tiếng Trung. Não sẽ ghi nhớ qua đêm.";
}

function todayKey() {
  const d = new Date();
  return `mm_daily_plan_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DailyPlanPage() {
  const { onboarding } = useAppStore();
  const goal = onboarding.goal ?? "fun";
  const level = onboarding.level ?? "beginner";
  const dailyMinutes = onboarding.dailyGoal ?? 10;

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = readJSON<Record<string, boolean>>(todayKey(), {});
    setChecked(saved);
    setLoaded(true);
  }, []);

  const toggle = useCallback((id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { writeJSON(todayKey(), next); } catch {}
      return next;
    });
  }, []);

  const resetPlan = () => {
    setChecked({});
    try { localStorage.removeItem(todayKey()); } catch {}
  };

  // Xây task list theo goal
  const goalTasks = GOAL_TASKS[goal] ?? GOAL_TASKS.fun;
  const allTasks = [...COMMON_TASKS, ...goalTasks];

  // Tính tổng thời gian và XP
  const totalMinutes = allTasks.reduce((s, t) => s + t.minutes, 0);
  const totalXP = allTasks.reduce((s, t) => s + t.xpReward, 0);
  const doneCount = allTasks.filter((t) => checked[t.id]).length;
  const doneMinutes = allTasks.filter((t) => checked[t.id]).reduce((s, t) => s + t.minutes, 0);
  const doneXP = allTasks.filter((t) => checked[t.id]).reduce((s, t) => s + t.xpReward, 0);
  const progress = allTasks.length > 0 ? (doneCount / allTasks.length) * 100 : 0;
  const allDone = doneCount === allTasks.length;

  const GOAL_LABELS: Record<string, string> = {
    drama: "Xem C-drama", travel: "Du lịch", business: "Công việc",
    culture: "Văn hóa", fun: "Học cho vui",
  };
  const LEVEL_LABELS: Record<string, string> = {
    beginner: "Mới bắt đầu", hsk1: "HSK 1", hsk2: "HSK 2",
    hsk3: "HSK 3", hsk4: "HSK 4", hsk5: "HSK 5", hsk6: "HSK 6",
  };

  const tip = getDayTip(goal);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#E8504A] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto pb-24 pt-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
          {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="font-playfair text-2xl font-bold">Kế hoạch hôm nay</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {LEVEL_LABELS[level]} · Mục tiêu: {GOAL_LABELS[goal]} · {dailyMinutes} phút/ngày
        </p>
      </motion.div>

      {/* Progress bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
        <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1.5">
          <span>{doneCount}/{allTasks.length} nhiệm vụ</span>
          <span>{doneMinutes}/{totalMinutes} phút · +{doneXP} XP</span>
        </div>
        <div className="h-2 bg-[#1C1C1E] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#E8504A] to-[#D4AF37] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Tip của ngày */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-5 flex items-start gap-3 bg-[#1C1C1E] border border-[rgba(255,255,255,0.07)] rounded-xl p-3"
      >
        <Sparkles size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{tip}</p>
      </motion.div>

      {/* Mừng hoàn thành */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mb-5 p-4 bg-gradient-to-r from-[#E8504A]/15 to-[#D4AF37]/10 border border-[#E8504A]/30 rounded-xl text-center"
          >
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-semibold">Xuất sắc! Hoàn thành hôm nay!</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Bạn đã học {doneMinutes} phút và kiếm được +{doneXP} XP ngày hôm nay.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Danh sách nhiệm vụ */}
      <div className="space-y-3 mb-6">
        {allTasks.map((task, i) => {
          const Icon = task.icon;
          const done = !!checked[task.id];
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-4 transition-all",
                done
                  ? "bg-[#1A1A1A] border-[rgba(255,255,255,0.06)] opacity-70"
                  : "bg-[#161616] border-[rgba(255,255,255,0.09)] hover:border-[rgba(255,255,255,0.18)]"
              )}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggle(task.id)}
                aria-label={done ? "Bỏ đánh dấu" : "Đánh dấu hoàn thành"}
                className="shrink-0 transition-transform active:scale-90"
              >
                {done
                  ? <CheckCircle2 size={22} className="text-[#8FAF8F]" />
                  : <Circle size={22} className="text-[#3A3A3A]" />
                }
              </button>

              {/* Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${task.color}18`, border: `1px solid ${task.color}30` }}
              >
                <Icon size={16} style={{ color: task.color }} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", done && "line-through opacity-60")}>
                  {task.label}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">{task.sublabel}</p>
              </div>

              {/* Meta */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                  <Clock size={10} /> {task.minutes}p
                </span>
                <span className="text-[10px] text-[#D4AF37] font-medium">+{task.xpReward} XP</span>
              </div>

              {/* Link */}
              {!done && (
                <Link
                  href={task.href}
                  className="shrink-0 w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center text-[#8A8078] hover:text-white hover:bg-[#2A2A2A] transition-colors"
                  aria-label={`Đến ${task.label}`}
                >
                  <ChevronRight size={14} />
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Tổng kết + reset */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] border-t border-[rgba(255,255,255,0.06)] pt-4">
        <span>Tổng: {totalMinutes} phút · {totalXP} XP tối đa</span>
        <button
          onClick={resetPlan}
          className="flex items-center gap-1 text-[#5A5050] hover:text-[#8A8078] transition-colors"
        >
          <RotateCcw size={12} /> Làm lại
        </button>
      </div>

      {/* Link gợi ý thêm */}
      <div className="mt-6 rounded-xl bg-[#161616] border border-[rgba(255,255,255,0.07)] p-4">
        <p className="text-xs text-[var(--text-muted)] mb-3 uppercase tracking-widest">Khám phá thêm</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { href: "/lo-trinh", label: "Lộ trình HSK", emoji: "🗺️" },
            { href: "/explore", label: "Tất cả công cụ", emoji: "🧰" },
            { href: "/community", label: "Cộng đồng", emoji: "👥" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex flex-col items-center gap-1 p-3 bg-[#1A1A1A] rounded-xl hover:bg-[#242424] transition-colors text-center"
            >
              <span className="text-xl">{l.emoji}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{l.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Push notification prompt */}
      <PushPrompt />
    </main>
  );
}

// ─── PushPrompt — gợi ý bật thông báo nhắc học ───────────────────────────────

function PushPrompt() {
  const { supported, subscribed, loading, subscribe } = usePushNotification();
  const [dismissed, setDismissed] = useState(true); // bắt đầu ẩn để tránh flash
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Chỉ show khi chưa dismiss và chưa đăng ký
    const wasDismissed = localStorage.getItem("mm_notif_prompt_dismissed") === "1";
    setDismissed(wasDismissed);
  }, []);

  if (!supported || subscribed || dismissed || done) return null;

  const handleSubscribe = async () => {
    const ok = await subscribe();
    if (ok) setDone(true);
    else setDismissed(true); // permission denied → ẩn luôn
  };

  const handleDismiss = () => {
    localStorage.setItem("mm_notif_prompt_dismissed", "1");
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {!dismissed && !done && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="mt-4 rounded-2xl border border-[#E8504A]/25 bg-gradient-to-r from-[#E8504A]/10 to-[#D4AF37]/5 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8504A]/15 flex items-center justify-center shrink-0">
              <BellRing size={18} className="text-[#E8504A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold mb-0.5">Bật thông báo nhắc học? 🔔</p>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                MandoMood sẽ nhắc bạn học đúng giờ mỗi ngày và báo khi thẻ flashcard sắp quên.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-colors",
                    loading ? "bg-[#E8504A]/60" : "bg-[#E8504A] hover:bg-[#d43f39]"
                  )}
                >
                  {loading ? "Đang bật..." : "Bật thông báo"}
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 rounded-xl text-xs text-[var(--text-muted)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                >
                  Để sau
                </button>
              </div>
            </div>
            <button onClick={handleDismiss} aria-label="Đóng" className="text-[var(--text-muted)] hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
      {done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 rounded-2xl border border-green-500/30 bg-green-500/10 p-3 text-center text-sm text-green-300"
        >
          ✅ Đã bật thông báo — MandoMood sẽ nhắc bạn học mỗi ngày!
        </motion.div>
      )}
    </AnimatePresence>
  );
}
