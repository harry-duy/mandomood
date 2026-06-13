import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tổng hợp học tập ",
  description: " MandoMood|Xem lại toàn bộ từ đã học, câu đã lưu và xuất file ôn tập.",
  openGraph: { title: "Tổng hợp học tập  | MandoMood", description: " MandoMood|Xem lại toàn bộ từ đã học, câu đã lưu và xuất file ôn tập." },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
