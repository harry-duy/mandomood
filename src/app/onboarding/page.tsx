"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

// ─── Data ─────────────────────────────────────────────────────────────────────

const LEVELS = [
  { key: "beginner", label: "Mới bắt đầu",   emoji: "🌱", desc: "Chưa biết gì về tiếng Trung" },
  { key: "hsk1",     label: "HSK 1",          emoji: "🐣", desc: "Biết ~150 từ cơ bản" },
  { key: "hsk2",     label: "HSK 2",          emoji: "🐥", desc: "Biết ~300 từ, câu đơn giản" },
  { key: "hsk3",     label: "HSK 3",          emoji: "🦋", desc: "Biết ~600 từ, giao tiếp được" },
  { key: "hsk4",     label: "HSK 4+",         emoji: "🔥", desc: "Trình độ cao, xem phim được" },
];

const GOALS = [
  { key: "drama",    label: "Xem C-drama",    emoji: "🎬" },
  { key: "travel",   label: "Du lịch TQ",     emoji: "✈️" },
  { key: "business", label: "Công việc",      emoji: "💼" },
  { key: "culture",  label: "Văn hóa TQ",     emoji: "🏮" },
  { key: "fun",      label: "Học cho vui",    emoji: "🎵" },
];

const MOODS = [
  { key: "romantic",   label: "Lãng mạn",   emoji: "💕", color: "#E8634A" },
  { key: "motivation", label: "Động lực",   emoji: "⚡", color: "#E8A838" },
  { key: "healing",    label: "Chữa lành",  emoji: "🌸", color: "#A8C5A0" },
  { key: "aesthetic",  label: "Aesthetic",  emoji: "🌙", color: "#8A9DC9" },
  { key: "sad",        label: "Buồn đẹp",   emoji: "🌧", color: "#7A8FA0" },
  { key: "funny",      label: "Vui vẻ",     emoji: "😄", color: "#E8A838" },
];

const DAILY_GOALS = [
  { value: 5,  label: "5 phút",  desc: "Học nhẹ nhàng mỗi ngày" },
  { value: 10, label: "10 phút", desc: "Tiến bộ đều đặn (Recommend)" },
  { value: 20, label: "20 phút", desc: "Học nghiêm túc" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const { setOnboarding, completeOnboarding } = useAppStore();

  const [step, setStep] = useState(0);
  const [level, setLevel]       = useState("beginner");
  const [goal, setGoal]         = useState("fun");
  const [favMoods, setFavMoods] = useState<string[]>(["romantic", "motivation"]);
  const [dailyGoal, setDailyGoal] = useState(10);

  const toggleMood = (key: string) => {
    setFavMoods((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  };

  const handleFinish = () => {
    setOnboarding({ level, goal, favMoods, dailyGoal });
    completeOnboarding();
    trackEvent("onboarding_completed");
    router.push("/feed");
  };

  const canNext = step === 2 ? favMoods.length > 0 : true;

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-between px-5 py-8 max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="w-full">
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-500",
                i <= step ? "bg-[#E8634A]" : "bg-[#242424]"
              )}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="w-full flex-1 flex flex-col"
        >
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="flex flex-col items-center text-center pt-8">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-7xl mb-6"
              >
                🐼
              </motion.div>
              <h1 className="font-playfair text-3xl font-bold mb-3">
                Chào mừng đến<br />
                <span className="text-[#E8634A]">MandoMood</span>!
              </h1>
              <p className="text-[#8A8078] text-sm leading-relaxed max-w-xs">
                Học tiếng Trung qua câu chuyện và cảm xúc — không nhàm chán, không cứng nhắc.
                Chỉ mất 2 phút để cá nhân hóa cho bạn 🌟
              </p>
              <div className="mt-8 bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] rounded-2xl px-5 py-4 w-full">
                <p className="text-sm text-[#8A8078] mb-1">Câu tiếng Trung hôm nay:</p>
                <p className="font-noto text-xl text-[#F5F0EB] mb-1">学如逆水行舟，不进则退</p>
                <p className="text-xs text-[#8A8078]">Học như chèo thuyền ngược nước, không tiến là lùi</p>
              </div>
            </div>
          )}

          {/* Step 1: Level */}
          {step === 1 && (
            <div>
              <h2 className="font-playfair text-2xl font-bold mb-2">Trình độ của bạn?</h2>
              <p className="text-[#8A8078] text-sm mb-6">Không cần chính xác — chọn gần nhất là được</p>
              <div className="flex flex-col gap-3">
                {LEVELS.map((l) => (
                  <button
                    key={l.key}
                    onClick={() => setLevel(l.key)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left",
                      level === l.key
                        ? "bg-[#E8634A]/10 border-[#E8634A]/50"
                        : "bg-[#1A1A1A] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]"
                    )}
                  >
                    <span className="text-2xl">{l.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{l.label}</p>
                      <p className="text-xs text-[#8A8078]">{l.desc}</p>
                    </div>
                    {level === l.key && (
                      <div className="w-5 h-5 rounded-full bg-[#E8634A] flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Moods */}
          {step === 2 && (
            <div>
              <h2 className="font-playfair text-2xl font-bold mb-2">Học về điều gì?</h2>
              <p className="text-[#8A8078] text-sm mb-6">Chọn những mood bạn thích (ít nhất 1)</p>
              <div className="grid grid-cols-2 gap-3">
                {MOODS.map((m) => {
                  const selected = favMoods.includes(m.key);
                  return (
                    <button
                      key={m.key}
                      onClick={() => toggleMood(m.key)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border transition-all duration-200",
                        selected
                          ? "border-2 scale-[0.97]"
                          : "bg-[#1A1A1A] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]"
                      )}
                      style={selected ? {
                        background: `${m.color}15`,
                        borderColor: `${m.color}60`,
                      } : {}}
                    >
                      <span className="text-3xl">{m.emoji}</span>
                      <span className="text-sm font-medium">{m.label}</span>
                      {selected && (
                        <div
                          className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: m.color }}
                        >
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Goal + Daily minutes */}
          {step === 3 && (
            <div>
              <h2 className="font-playfair text-2xl font-bold mb-2">Mục tiêu học</h2>
              <p className="text-[#8A8078] text-sm mb-5">Tại sao bạn muốn học tiếng Trung?</p>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {GOALS.map((g) => (
                  <button
                    key={g.key}
                    onClick={() => setGoal(g.key)}
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 text-left",
                      goal === g.key
                        ? "bg-[#E8634A]/10 border-[#E8634A]/50"
                        : "bg-[#1A1A1A] border-[rgba(255,255,255,0.08)]"
                    )}
                  >
                    <span className="text-xl">{g.emoji}</span>
                    <span className="text-sm font-medium">{g.label}</span>
                  </button>
                ))}
              </div>

              <p className="text-sm font-medium mb-3">Mỗi ngày học bao lâu?</p>
              <div className="flex gap-2">
                {DAILY_GOALS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDailyGoal(d.value)}
                    className={cn(
                      "flex-1 flex flex-col items-center py-3 rounded-xl border transition-all duration-200",
                      dailyGoal === d.value
                        ? "bg-[#E8634A]/10 border-[#E8634A]/50"
                        : "bg-[#1A1A1A] border-[rgba(255,255,255,0.08)]"
                    )}
                  >
                    <span className="font-bold text-sm">{d.label}</span>
                    <span className="text-[10px] text-[#8A8078] mt-0.5 text-center px-1">{d.desc}</span>
                  </button>
                ))}
              </div>

              {/* Finish summary */}
              <div className="mt-6 bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-[#E8634A]" />
                  <span className="text-xs font-semibold text-[#E8634A] uppercase tracking-wider">Hành trình của bạn</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    LEVELS.find((l) => l.key === level)?.label ?? level,
                    GOALS.find((g) => g.key === goal)?.label ?? goal,
                    ...favMoods.map((m) => MOODS.find((x) => x.key === m)?.label ?? m),
                  ].map((tag) => (
                    <span key={tag} className="text-xs bg-[#242424] text-[#F5F0EB] px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="w-full flex gap-3 pt-6">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#8A8078] hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
            className={cn(
              "flex-1 h-12 rounded-full flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-200",
              canNext
                ? "bg-[#E8634A] text-white hover:bg-[#d4532a] active:scale-95"
                : "bg-[#242424] text-[#8A8078] cursor-not-allowed"
            )}
          >
            {step === 0 ? "Bắt đầu thôi 🚀" : "Tiếp theo"}
            {step > 0 && <ChevronRight size={18} />}
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="flex-1 h-12 rounded-full bg-gradient-to-r from-[#E8634A] to-[#E8A838] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
          >
            <Sparkles size={16} />
            Khám phá MandoMood!
          </button>
        )}
      </div>

      {/* Skip */}
      {step === 0 && (
        <button
          onClick={handleFinish}
          className="mt-3 text-xs text-[#8A8078] hover:text-[var(--text)] transition-colors"
        >
          Bỏ qua
        </button>
      )}
    </div>
  );
}
