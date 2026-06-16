import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kiểm tra trình độ tiếng Trung | MandoMood",
  description:
    "Làm bài kiểm tra trình độ tiếng Trung: từ vựng, ngữ pháp, nghe, đọc — kết quả tức thì kèm gợi ý lộ trình học phù hợp.",
  keywords: [
    "kiểm tra trình độ tiếng Trung", "test tiếng Trung HSK", "placement test tiếng Trung",
    "trắc nghiệm tiếng Trung", "test MandoMood",
  ],
  openGraph: {
    title: "Kiểm tra trình độ tiếng Trung | MandoMood",
    description: "Kiểm tra từ vựng, ngữ pháp, nghe, đọc — kết quả tức thì kèm lộ trình học.",
    url: "/test",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Kiểm tra trình độ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kiểm tra trình độ tiếng Trung | MandoMood",
    description: "Kiểm tra từ vựng, ngữ pháp, nghe, đọc — kết quả tức thì kèm lộ trình học.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/test" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
