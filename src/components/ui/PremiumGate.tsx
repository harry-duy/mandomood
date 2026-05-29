"use client";

/**
 * PremiumGate — Wrapper component cho tính năng Premium
 * Nếu user chưa premium → hiện overlay lock + CTA upgrade
 * Nếu đã premium → render children bình thường
 *
 * Usage:
 *   <PremiumGate feature="AI Story Generator không giới hạn">
 *     <GenerateForm />
 *   </PremiumGate>
 */

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Crown, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: string;           // tên tính năng hiển thị
  freeLimit?: number;         // số lần free đã dùng
  freeMax?: number;           // giới hạn free (e.g. 5)
  className?: string;
  alwaysShow?: boolean;       // nếu true: vẫn render children nhưng thêm limit badge
}

export default function PremiumGate({
  children,
  feature = "tính năng này",
  freeLimit,
  freeMax,
  className,
  alwaysShow = false,
}: PremiumGateProps) {
  const { data: session } = useSession();
  const router = useRouter();

  // Check premium từ session (cần thêm premium vào session token)
  const isPremium = (session?.user as { premium?: boolean })?.premium ?? false;

  // Nếu premium → show children
  if (isPremium) return <>{children}</>;

  // Nếu alwaysShow → show children + limit indicator
  if (alwaysShow && freeLimit !== undefined && freeMax !== undefined) {
    const remaining = Math.max(0, freeMax - freeLimit);
    const isExhausted = remaining === 0;

    return (
      <div className={cn("relative", className)}>
        {!isExhausted && children}
        {isExhausted ? (
          <GateOverlay feature={feature} onUpgrade={() => router.push("/pricing")} />
        ) : (
          <div className="mt-2 flex items-center gap-2 text-xs opacity-60" style={{ color: "var(--mm-text)" }}>
            <Lock className="w-3 h-3" />
            Còn {remaining}/{freeMax} lần miễn phí hôm nay
            <button
              onClick={() => router.push("/pricing")}
              className="ml-auto text-yellow-500 font-semibold hover:underline"
            >
              Upgrade ↗
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default: gate hoàn toàn
  return (
    <div className={cn("relative", className)}>
      <div className="opacity-30 pointer-events-none select-none blur-[2px]">
        {children}
      </div>
      <GateOverlay feature={feature} onUpgrade={() => router.push("/pricing")} />
    </div>
  );
}

function GateOverlay({
  feature,
  onUpgrade,
}: {
  feature: string;
  onUpgrade: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl backdrop-blur-sm"
      style={{ background: "rgba(13,13,13,0.7)" }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #D4AF37, #E8504A)" }}
      >
        <Crown className="w-6 h-6 text-white" />
      </div>
      <div className="text-center px-4 space-y-1">
        <p className="font-bold text-sm" style={{ color: "var(--mm-text)" }}>
          Tính năng Premium
        </p>
        <p className="text-xs opacity-60 max-w-[200px]" style={{ color: "var(--mm-text)" }}>
          {feature} chỉ dành cho Premium. Nâng cấp để mở khóa!
        </p>
      </div>
      <button
        onClick={onUpgrade}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm text-white"
        style={{ background: "linear-gradient(135deg, #E8504A, #D4AF37)" }}
      >
        <Sparkles className="w-3.5 h-3.5" />
        Upgrade Premium
      </button>
    </motion.div>
  );
}
