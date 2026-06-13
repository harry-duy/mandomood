"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { useAppStore } from "@/store/useAppStore";
import AnalyticsTracker from "@/components/ui/AnalyticsTracker";

// ─── Onboarding Guard ─────────────────────────────────────────────────────────
function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const onboarding = useAppStore((s) => s.onboarding);

  useEffect(() => {
    // Cac trang khong can onboarding
    const SKIP_PATHS = ["/onboarding", "/login"];
    if (SKIP_PATHS.includes(pathname)) return;
    // Blog là trang SEO/marketing — khách mới từ TikTok/Google phải đọc được
    // ngay, không bị đẩy sang onboarding.
    if (pathname.startsWith("/blog")) return;

    // Neu chua onboard -> redirect
    if (!onboarding.completed) {
      router.replace("/onboarding");
    }
  }, [onboarding.completed, pathname, router]);

  return <>{children}</>;
}

// ─── Service Worker Registration ────────────────────────────────────────────────
// Đăng ký /sw.js để bật offline cache (PWA) + push notification.
// Trước đây SW không bao giờ được đăng ký → navigator.serviceWorker.ready treo.
function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // tránh cache khi dev
    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.error("[SW] register failed:", err));
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}

// ─── Providers ────────────────────────────────────────────────────────────────
interface ProvidersProps {
  children: React.ReactNode;
  session?: Session | null;
}

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ServiceWorkerRegister />
      <AnalyticsTracker />
      <OnboardingGuard>
        {children}
      </OnboardingGuard>
    </SessionProvider>
  );
}
