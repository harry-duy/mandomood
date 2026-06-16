import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ học tập | MandoMood",
  description:
    "Xem tiến trình học tiếng Trung của bạn: XP, chuỗi ngày học, câu đã lưu và huy hiệu thành tích trên MandoMood.",
  keywords: [
    "hồ sơ MandoMood", "tiến trình học tiếng Trung", "XP streak tiếng Trung",
    "thành tích học tiếng Trung", "profile MandoMood",
  ],
  openGraph: {
    title: "Hồ sơ học tập | MandoMood",
    description: "Xem XP, streak, câu đã lưu và huy hiệu thành tích học tiếng Trung của bạn.",
    url: "/profile",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Hồ sơ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hồ sơ học tập | MandoMood",
    description: "Xem XP, streak, câu đã lưu và huy hiệu thành tích học tiếng Trung của bạn.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/profile" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
