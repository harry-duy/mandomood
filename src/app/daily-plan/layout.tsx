import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kế hoạch học hôm nay | MandoMood",
  description:
    "Kế hoạch học tiếng Trung hôm nay, cá nhân hóa theo mục tiêu và cấp độ của bạn. Biết chính xác cần làm gì để đạt mục tiêu ngày hôm nay.",
  keywords: [
    "kế hoạch học tiếng Trung", "lịch học tiếng Trung hàng ngày", "daily plan MandoMood",
    "học tiếng Trung mỗi ngày", "lộ trình học tiếng Trung cá nhân hóa",
  ],
  openGraph: {
    title: "Kế hoạch học hôm nay | MandoMood",
    description: "Kế hoạch học tiếng Trung cá nhân hóa theo mục tiêu và cấp độ — biết chính xác cần làm gì hôm nay.",
    url: "/daily-plan",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Kế hoạch ngày" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kế hoạch học hôm nay | MandoMood",
    description: "Kế hoạch học tiếng Trung cá nhân hóa theo mục tiêu và cấp độ.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/daily-plan" },
};

export default function DailyPlanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
