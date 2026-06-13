import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sổ tay từ",
  description: "Những từ tiếng Trung bạn đã lưu khi đọc truyện — ôn nhanh, nghe phát âm, quản lý dễ dàng.",
  openGraph: {
    title: "Sổ tay từ | MandoMood",
    description: "Ôn nhanh các từ tiếng Trung bạn đã lưu.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
