import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng xếp hạng người học | MandoMood",
  description:
    "Top người học tiếng Trung tích cực nhất tuần này trên MandoMood — xếp theo XP, streak và điểm thi. Bạn đang ở vị trí nào?",
  keywords: [
    "bảng xếp hạng học tiếng Trung", "leaderboard MandoMood", "XP tiếng Trung",
    "thi đua học tiếng Trung", "top học tiếng Trung",
  ],
  openGraph: {
    title: "Bảng xếp hạng người học | MandoMood",
    description: "Top người học tiếng Trung tích cực nhất — xếp theo XP, streak và điểm thi.",
    url: "/leaderboard",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Bảng xếp hạng" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bảng xếp hạng người học | MandoMood",
    description: "Top người học tiếng Trung tích cực nhất — xếp theo XP, streak và điểm thi.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/leaderboard" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
