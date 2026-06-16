import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Lesson — AI tạo bài học từ ảnh | MandoMood",
  description:
    "Upload ảnh hoặc dán văn bản tiếng Trung — AI phân tích và tạo bài học cá nhân hóa ngay lập tức, bao gồm từ vựng, ngữ pháp và bài tập có chấm điểm.",
  keywords: [
    "AI học tiếng Trung", "tạo bài học tiếng Trung tự động", "upload ảnh học tiếng Trung",
    "smart lesson", "AI tutor tiếng Trung", "bài tập tiếng Trung cá nhân hóa",
  ],
  openGraph: {
    title: "Smart Lesson — AI tạo bài học từ ảnh | MandoMood",
    description: "Upload ảnh tiếng Trung → AI tạo từ vựng, ngữ pháp và bài tập có chấm điểm ngay lập tức.",
    url: "/smart-lesson",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Smart Lesson" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Lesson — AI tạo bài học từ ảnh | MandoMood",
    description: "Upload ảnh tiếng Trung → AI tạo bài học cá nhân hóa ngay lập tức.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/smart-lesson" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
