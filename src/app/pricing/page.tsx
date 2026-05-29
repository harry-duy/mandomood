"use client";

/**
 * /pricing — Trang Premium Subscription
 * Plans: Free / Monthly $5.99 / Yearly $49.99 / Lifetime $149.99
 * Stripe Checkout khi user bấm upgrade
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Sparkles, Star, Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    key: "monthly",
    label: "Monthly",
    price: "$5.99",
    period: "/tháng",
    priceVN: "~150k/tháng",
    highlight: false,
    badge: null,
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ?? "price_monthly",
  },
  {
    key: "yearly",
    label: "Yearly",
    price: "$49.99",
    period: "/năm",
    priceVN: "~1.25 triệu/năm",
    highlight: true,
    badge: "Tiết kiệm 30%",
    priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID ?? "price_yearly",
  },
  {
    key: "lifetime",
    label: "Lifetime",
    price: "$149.99",
    period: " một lần",
    priceVN: "~3.75 triệu, vĩnh viễn",
    highlight: false,
    badge: "Best value",
    priceId: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID ?? "price_lifetime",
  },
] as const;

const FREE_FEATURES = [
  "5 bài học / ngày",
  "Daily Quote",
  "AI Tutor (10 tin/ngày)",
  "Flashcards cơ bản",
  "Leaderboard",
];

const PREMIUM_FEATURES = [
  "Bài học không giới hạn ♾️",
  "AI Story Generator không giới hạn",
  "AI Tutor không giới hạn + tất cả personas",
  "Smart Lesson (OCR upload)",
  "ElevenLabs TTS — giọng native speaker",
  "Offline mode (PWA)",
  "Badge Premium 👑 trên Leaderboard",
  "Xóa quảng cáo (khi có)",
  "Early access tính năng mới",
];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | "lifetime">("yearly");
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!session?.user) {
      router.push("/login?callbackUrl=/pricing");
      return;
    }

    setLoading(true);
    try {
      const plan = PLANS.find(p => p.key === selectedPlan)!;
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId, plan: plan.key }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Có lỗi xảy ra");
      }
    } catch {
      alert("Không kết nối được Stripe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pb-24" style={{ background: "var(--mm-bg)" }}>
      {/* Header */}
      <div className="pt-12 pb-8 px-4 text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #D4AF37, #E8504A)" }}
        >
          <Crown className="w-8 h-8 text-white" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
          style={{ color: "var(--mm-text)", fontFamily: "var(--font-display)" }}
        >
          MandoMood Premium
        </motion.h1>
        <p className="text-sm opacity-60 max-w-xs mx-auto" style={{ color: "var(--mm-text)" }}>
          Học tiếng Trung không giới hạn — không bài tập nhàm chán, chỉ cảm xúc và câu chuyện
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-6">

        {/* Plan selector */}
        <div className="space-y-3">
          {PLANS.map((plan) => (
            <motion.button
              key={plan.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedPlan(plan.key)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                selectedPlan === plan.key
                  ? "border-[var(--mm-red)] bg-[var(--mm-red)]/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              )}
            >
              {/* Radio */}
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                selectedPlan === plan.key ? "border-[var(--mm-red)]" : "border-white/30"
              )}>
                {selectedPlan === plan.key && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--mm-red)]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold" style={{ color: "var(--mm-text)" }}>
                    {plan.label}
                  </span>
                  {plan.badge && (
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      plan.highlight
                        ? "bg-[var(--mm-red)] text-white"
                        : "bg-yellow-500/20 text-yellow-500"
                    )}>
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-50 mt-0.5" style={{ color: "var(--mm-text)" }}>
                  {plan.priceVN}
                </p>
              </div>

              {/* Price */}
              <div className="text-right">
                <span className="text-xl font-bold" style={{ color: "var(--mm-text)" }}>
                  {plan.price}
                </span>
                <span className="text-xs opacity-50 block" style={{ color: "var(--mm-text)" }}>
                  {plan.period}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* CTA button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => void handleUpgrade()}
          disabled={loading}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2",
            "transition-all",
            loading ? "opacity-60 cursor-not-allowed" : "hover:brightness-110 active:scale-95"
          )}
          style={{ background: "linear-gradient(135deg, #E8504A, #D4AF37)" }}
        >
          {loading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {session?.user ? "Nâng cấp ngay" : "Đăng nhập để nâng cấp"}
            </>
          )}
        </motion.button>

        <p className="text-center text-xs opacity-40" style={{ color: "var(--mm-text)" }}>
          Thanh toán an toàn qua Stripe · Hủy bất kỳ lúc nào · Hoàn tiền 7 ngày
        </p>

        {/* Comparison table */}
        <div className="rounded-2xl overflow-hidden border border-white/10">
          {/* Header */}
          <div className="grid grid-cols-2 text-center py-3 bg-white/5">
            <div className="text-sm font-semibold opacity-60" style={{ color: "var(--mm-text)" }}>
              Free
            </div>
            <div className="text-sm font-bold flex items-center justify-center gap-1"
              style={{ color: "var(--mm-gold, #D4AF37)" }}>
              <Crown className="w-3.5 h-3.5" /> Premium
            </div>
          </div>

          {/* Free features */}
          <div className="p-4 border-b border-white/10 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-50 mb-3"
              style={{ color: "var(--mm-text)" }}>Miễn phí</p>
            {FREE_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <span className="text-xs" style={{ color: "var(--mm-text)" }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Premium features */}
          <div className="p-4 space-y-2" style={{ background: "rgba(212,175,55,0.05)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#D4AF37" }}>Premium 👑</p>
            {PREMIUM_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                <span className="text-xs font-medium" style={{ color: "var(--mm-text)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="text-center space-y-2 py-4">
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-sm italic opacity-70" style={{ color: "var(--mm-text)" }}>
            &ldquo;Lần đầu tiên học tiếng Trung mà tôi không bỏ sau 3 ngày&rdquo;
          </p>
          <p className="text-xs opacity-40" style={{ color: "var(--mm-text)" }}>— Minh Anh, 22 tuổi, TP.HCM</p>
        </div>

        {/* Lock notice for free features */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
          <Lock className="w-4 h-4 opacity-40 flex-shrink-0" style={{ color: "var(--mm-text)" }} />
          <p className="text-xs opacity-50" style={{ color: "var(--mm-text)" }}>
            Một số tính năng có giới hạn ở tài khoản Free. Upgrade để mở khóa toàn bộ.
          </p>
        </div>

        {/* XP bonus promo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 p-4 rounded-2xl border border-yellow-500/30"
          style={{ background: "rgba(212,175,55,0.08)" }}
        >
          <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-yellow-500">+500 XP Bonus khi upgrade!</p>
            <p className="text-xs opacity-60 mt-0.5" style={{ color: "var(--mm-text)" }}>
              Tặng ngay khi thanh toán thành công
            </p>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
