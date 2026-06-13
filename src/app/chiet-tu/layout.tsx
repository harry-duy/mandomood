import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Chiết tự chữ Hán",
  description: "Hiểu sâu chữ Hán qua chiết tự — phân tích thành phần, bộ thủ và câu chuyện nhớ chữ.",
  openGraph: {
    title: "Chiết tự chữ Hán | MandoMood",
    description: "Hiểu sâu chữ Hán qua chiết tự — phân tích thành phần, bộ thủ và câu chuyện nhớ chữ.",
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
