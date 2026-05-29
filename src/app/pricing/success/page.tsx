"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Zap, Sparkles } from "lucide-react";
import Link from "next/link";

export default function PricingSuccessPage() {
  useEffect(() => {
    // Confetti effect bằng CSS animation
    document.title = "Premium Active 👑 — MandoMood";
  }, []);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6"
      style={{ background: "var(--mm-bg)" }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.6 }}
        className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto"
        style={{ background: "linear-gradient(135deg, #D4AF37, #E8504A)" }}
      >
        <Crown className="w-12 h-12 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h1 className="text-3xl font-bold" style={{ color: "var(--mm-text)", fontFamily: "var(--font-display)" }}>
          Chào mừng Premium! 🎉
        </h1>
        <p className="opacity-70 text-sm max-w-xs mx-auto" style={{ color: "var(--mm-text)" }}>
          Tài khoản của bạn đã được nâng cấp. Tận hưởng học tiếng Trung không giới hạn!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full"
        style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)" }}
      >
        <Zap className="w-4 h-4 text-yellow-500" />
        <span className="text-sm font-bold text-yellow-500">+500 XP đã được cộng vào tài khoản!</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <Link
          href="/feed"
          className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, #E8504A, #D4AF37)" }}
        >
          <Sparkles className="w-4 h-4" />
          Bắt đầu học ngay
        </Link>
        <Link
          href="/profile"
          className="py-3 rounded-2xl font-semibold text-sm border border-white/20 hover:bg-white/5 transition-colors"
          style={{ color: "var(--mm-text)" }}
        >
          Xem hồ sơ của tôi
        </Link>
      </motion.div>
    </main>
  );
}
