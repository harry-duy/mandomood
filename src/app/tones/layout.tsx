import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thanh điệu",
  description: "Luyện 4 thanh điệu tiếng Trung — học qua cặp từ tối nghĩa và quiz.",
  openGraph: {
    title: "Thanh điệu | MandoMood",
    description: "Luyện 4 thanh điệu tiếng Trung — học qua cặp từ tối nghĩa và quiz.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
