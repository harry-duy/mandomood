"use client";
/**
 * Theo dõi pageview theo route (App Router không tự bắn pageview khi điều hướng client).
 * Render null — gắn 1 lần trong Providers.
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageview } from "@/lib/analytics";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    trackPageview(pathname);
  }, [pathname]);

  return null;
}
