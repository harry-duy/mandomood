import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ",
  description: "Xem tiến trình học, XP, chuỗi ngày học và câu đã lưu.",
  openGraph: {
    title: "Hồ sơ | MandoMood",
    description: "Xem tiến trình học, XP, chuỗi ngày học và câu đã lưu.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
