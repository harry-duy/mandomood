import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog học tiếng Trung",
  description: "Bài viết về phương pháp học tiếng Trung hiệu quả, thanh điệu, từ vựng cảm xúc, C-drama và văn hóa Trung Quốc — dành riêng cho người Việt.",
  openGraph: {
    title: "Blog học tiếng Trung | MandoMood",
    description: "Phương pháp học tiếng Trung hiệu quả nhất cho người Việt — khoa học, cảm xúc, không nhàm chán.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
