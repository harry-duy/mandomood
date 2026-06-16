import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog học tiếng Trung | MandoMood",
  description:
    "Bài viết về phương pháp học tiếng Trung hiệu quả, thanh điệu, từ vựng cảm xúc, C-drama và văn hóa Trung Quốc — dành riêng cho người Việt.",
  keywords: [
    "blog học tiếng Trung", "phương pháp học tiếng Trung", "học tiếng Trung qua C-drama",
    "văn hóa Trung Quốc", "thanh điệu tiếng Trung", "MandoMood blog",
  ],
  openGraph: {
    title: "Blog học tiếng Trung | MandoMood",
    description: "Phương pháp học tiếng Trung hiệu quả nhất cho người Việt — khoa học, cảm xúc, không nhàm chán.",
    url: "/blog",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog học tiếng Trung | MandoMood",
    description: "Phương pháp học tiếng Trung hiệu quả nhất cho người Việt — khoa học, cảm xúc.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/blog" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
