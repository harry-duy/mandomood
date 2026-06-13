import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Đăng nhập MandoMood",
  description: "Đăng nhập để lưu tiến trình, streak và câu chuyện yêu thích.",
  openGraph: { title: "Đăng nhập MandoMood | MandoMood", description: "Đăng nhập để lưu tiến trình, streak và câu chuyện yêu thích." },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
