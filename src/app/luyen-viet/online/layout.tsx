import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện viết online — Tự viết chữ Hán trên màn hình",
  description:
    "Tự tô từng nét chữ Hán trên màn hình bằng chuột hoặc ngón tay, được chấm đúng/sai theo thời gian thực. Có gợi ý thứ tự nét và phát âm.",
  openGraph: {
    title: "Luyện viết online | MandoMood",
    description: "Tự viết chữ Hán trên màn hình, chấm nét theo thời gian thực — miễn phí.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
