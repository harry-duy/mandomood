import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Bắt đầu học MandoMood",
  description: "Cá nhân hóa trải nghiệm học tiếng Trung theo mood và trình độ của bạn.",
  openGraph: { title: "Bắt đầu học MandoMood | MandoMood", description: "Cá nhân hóa trải nghiệm học tiếng Trung theo mood và trình độ của bạn." },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
