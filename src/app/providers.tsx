"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { useAppStore } from "@/store/useAppStore";

// ─── Onboarding Guard ─────────────────────────────────────────────────────────
function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const onboarding = useAppStore((s) => s.onboarding);

  useEffect(() => {
    // Cac trang khong can onboarding
    const SKIP_PATHS = ["/onboarding", "/login"];
    if (SKIP_PATHS.includes(pathname)) return;

    // Neu chua onboard -> redirect
    if (!onboarding.completed) {
      router.replace("/onboarding");
    }
  }, [onboarding.completed, pathname, router]);

  return <>{children}</>;
}

// ─── Providers ────────────────────────────────────────────────────────────────
interface ProvidersProps {
  children: React.ReactNode;
  session?: Session | null;
}

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <OnboardingGuard>
        {children}
      </OnboardingGuard>
    </SessionProvider>
  );
}
