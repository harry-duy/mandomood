import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Về MandoMood | Học tiếng Trung theo cảm xúc",
  description:
    "MandoMood là nền tảng học tiếng Trung dành cho Gen Z Việt Nam — học qua câu chuyện, cảm xúc và những câu nói hay thay vì bài tập cứng nhắc.",
  keywords: [
    "MandoMood là gì", "học tiếng Trung Gen Z", "về MandoMood", "ứng dụng học tiếng Trung Việt Nam",
    "học tiếng Trung qua câu chuyện", "phương pháp học tiếng Trung mới",
  ],
  openGraph: {
    title: "Về MandoMood | Học tiếng Trung theo cảm xúc",
    description:
      "MandoMood — học tiếng Trung qua câu chuyện và cảm xúc, không qua bài tập cứng nhắc.",
    url: "/about",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Về chúng tôi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Về MandoMood | Học tiếng Trung theo cảm xúc",
    description: "Học tiếng Trung qua câu chuyện và cảm xúc — không qua bài tập cứng nhắc.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/about" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
