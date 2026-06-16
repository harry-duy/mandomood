import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tiến trình học tập | MandoMood",
  description:
    "Theo dõi tiến trình học tiếng Trung: XP, chuỗi ngày học, từ đã học, bài kiểm tra đã qua và mục tiêu tuần.",
  keywords: [
    "tiến trình học tiếng Trung", "streak học tiếng Trung", "XP MandoMood",
    "thống kê học tiếng Trung", "progress MandoMood",
  ],
  openGraph: {
    title: "Tiến trình học tập | MandoMood",
    description: "Theo dõi XP, chuỗi ngày học, từ đã học và mục tiêu tuần của bạn.",
    url: "/progress",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Tiến trình" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tiến trình học tập | MandoMood",
    description: "Theo dõi XP, chuỗi ngày học, từ đã học và mục tiêu tuần của bạn.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/progress" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
