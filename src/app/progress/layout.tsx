import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tiến trình",
  description: "Theo dõi hành trình học tiếng Trung của bạn: truyện đã tạo, streak và hoạt động mỗi ngày.",
  openGraph: {
    title: "Tiến trình | MandoMood",
    description: "Theo dõi hành trình học tiếng Trung của bạn.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
