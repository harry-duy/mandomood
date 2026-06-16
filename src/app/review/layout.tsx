import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tổng hợp học tập | MandoMood",
  description:
    "Xem lại toàn bộ từ đã học, câu đã lưu, thống kê XP và xuất file ôn tập. Theo dõi tiến độ học tiếng Trung của bạn trên MandoMood.",
  keywords: [
    "tổng hợp học tiếng Trung", "tiến độ học tiếng Trung", "thống kê MandoMood",
    "từ vựng đã học", "xuất file học tiếng Trung", "review MandoMood",
  ],
  openGraph: {
    title: "Tổng hợp học tập | MandoMood",
    description: "Xem lại từ đã học, câu đã lưu và thống kê XP — theo dõi tiến độ học tiếng Trung.",
    url: "/review",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Tổng hợp học tập" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tổng hợp học tập | MandoMood",
    description: "Xem lại từ đã học, câu đã lưu và thống kê XP — theo dõi tiến độ học tiếng Trung.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/review" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
