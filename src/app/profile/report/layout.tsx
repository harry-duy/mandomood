import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Báo cáo học tập | MandoMood",
  description: "Xem báo cáo chi tiết tiến trình học tiếng Trung — XP theo tuần, từ đã học và điểm mạnh/yếu.",
  openGraph: {
    title: "Báo cáo học tập | MandoMood",
    description: "Báo cáo chi tiết XP theo tuần, từ đã học và điểm mạnh/yếu.",
    url: "/profile/report",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Báo cáo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Báo cáo học tập | MandoMood",
    description: "Báo cáo chi tiết XP theo tuần, từ đã học và điểm mạnh/yếu.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/profile/report" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
