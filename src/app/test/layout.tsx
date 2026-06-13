import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Đề thi HSK",
  description: "Luyện đề thi HSK 1-6 với câu hỏi trắc nghiệm, đếm giờ và phân tích kết quả chi tiết.",
  openGraph: {
    title: "Đề thi HSK | MandoMood",
    description: "Luyện đề thi HSK 1-6 với câu hỏi trắc nghiệm, đếm giờ và phân tích kết quả chi tiết.",
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
