import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tạo câu chuyện AI",
  description: "Dùng AI tạo câu chuyện tiếng Trung theo mood và chủ đề bạn chọn.",
  openGraph: {
    title: "Tạo câu chuyện AI | MandoMood",
    description: "Dùng AI tạo câu chuyện tiếng Trung theo mood và chủ đề bạn chọn.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
