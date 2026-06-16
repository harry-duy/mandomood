import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện đọc tiếng Trung | MandoMood",
  description:
    "Đọc câu chuyện ngắn tiếng Trung kèm pinyin và dịch nghĩa — luyện đọc tự nhiên từ sơ cấp đến trung cấp mà không cần ghi nhớ công thức.",
  keywords: [
    "luyện đọc tiếng Trung", "đọc truyện tiếng Trung kèm pinyin", "reading tiếng Trung",
    "câu chuyện tiếng Trung ngắn", "đọc hiểu tiếng Trung", "reading MandoMood",
  ],
  openGraph: {
    title: "Luyện đọc tiếng Trung | MandoMood",
    description: "Đọc câu chuyện ngắn tiếng Trung kèm pinyin — luyện đọc tự nhiên từ sơ cấp đến trung cấp.",
    url: "/reading",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Luyện đọc" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luyện đọc tiếng Trung | MandoMood",
    description: "Đọc câu chuyện ngắn tiếng Trung kèm pinyin — từ sơ cấp đến trung cấp.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/reading" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
