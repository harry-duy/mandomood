import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Từ vựng HSK",
  description: "Từ vựng chuẩn HSK 1-6. Học với ví dụ thực tế và phát âm bản ngữ.",
  openGraph: {
    title: "Từ vựng HSK | MandoMood",
    description: "Từ vựng chuẩn HSK 1-6. Học với ví dụ thực tế và phát âm bản ngữ.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
