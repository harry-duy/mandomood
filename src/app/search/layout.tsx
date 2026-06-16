import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tìm kiếm | MandoMood",
  description:
    "Tìm từ, câu, chủ đề và bài học tiếng Trung trên MandoMood — tìm kiếm thông minh bằng pinyin, Hán tự hoặc tiếng Việt.",
  openGraph: {
    title: "Tìm kiếm | MandoMood",
    description: "Tìm từ, câu và bài học tiếng Trung bằng pinyin, Hán tự hoặc tiếng Việt.",
    url: "/search",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Tìm kiếm" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tìm kiếm | MandoMood",
    description: "Tìm từ, câu và bài học tiếng Trung bằng pinyin, Hán tự hoặc tiếng Việt.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/search" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
