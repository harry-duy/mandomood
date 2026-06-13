import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Lesson",
  description: "Upload ảnh hoặc văn bản — AI tạo bài học tiếng Trung cá nhân hóa.",
  openGraph: {
    title: "Smart Lesson | MandoMood",
    description: "Upload ảnh hoặc văn bản — AI tạo bài học tiếng Trung cá nhân hóa.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
