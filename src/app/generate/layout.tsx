import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tạo câu chuyện tiếng Trung bằng AI | MandoMood",
  description:
    "Nhập chủ đề, cảm xúc hoặc từ khoá — AI của MandoMood tạo câu chuyện tiếng Trung ngắn kèm pinyin, dịch nghĩa và từ vựng cho bạn.",
  keywords: [
    "tạo câu chuyện tiếng Trung AI", "AI story tiếng Trung", "tạo truyện tiếng Trung",
    "generate story tiếng Trung", "AI MandoMood",
  ],
  openGraph: {
    title: "Tạo câu chuyện tiếng Trung bằng AI | MandoMood",
    description: "Nhập chủ đề — AI tạo câu chuyện tiếng Trung kèm pinyin, dịch và từ vựng.",
    url: "/generate",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — AI Story" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tạo câu chuyện tiếng Trung bằng AI | MandoMood",
    description: "Nhập chủ đề — AI tạo câu chuyện tiếng Trung kèm pinyin, dịch và từ vựng.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/generate" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
