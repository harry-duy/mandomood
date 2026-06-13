import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ngữ pháp",
  description: "12 cấu trúc ngữ pháp tiếng Trung quan trọng nhất HSK 1-4.",
  openGraph: {
    title: "Ngữ pháp | MandoMood",
    description: "12 cấu trúc ngữ pháp tiếng Trung quan trọng nhất HSK 1-4.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
