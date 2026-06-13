import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Báo cáo học tập",
  description: "Tóm tắt 7 ngày học: XP, streak, level và huy hiệu đạt được.",
  openGraph: { title: "Báo cáo học tập | MandoMood", description: "Tóm tắt 7 ngày học: XP, streak, level và huy hiệu." },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
