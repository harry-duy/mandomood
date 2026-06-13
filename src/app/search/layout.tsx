import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tìm kiếm",
  description: "Tìm kiếm câu tiếng Trung, bài học theo mood hoặc cấp độ HSK.",
  openGraph: {
    title: "Tìm kiếm | MandoMood",
    description: "Tìm kiếm câu tiếng Trung, bài học theo mood hoặc cấp độ HSK.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
