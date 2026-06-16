import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Khám phá công cụ học tiếng Trung | MandoMood",
  description:
    "Tất cả công cụ học tiếng Trung của MandoMood: AI Story, HSK 1–6, bộ thủ, phát âm, luyện viết, đề thi, karaoke và nhiều hơn nữa. Miễn phí.",
  keywords: [
    "công cụ học tiếng Trung", "app học tiếng Trung miễn phí", "MandoMood tính năng",
    "học tiếng Trung toàn diện", "explore MandoMood",
  ],
  openGraph: {
    title: "Khám phá công cụ học tiếng Trung | MandoMood",
    description: "AI Story, HSK 1–6, bộ thủ, phát âm, luyện viết, karaoke — tất cả miễn phí.",
    url: "/explore",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Explore" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khám phá công cụ học tiếng Trung | MandoMood",
    description: "AI Story, HSK 1–6, bộ thủ, phát âm, luyện viết, karaoke — tất cả miễn phí.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/explore" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
