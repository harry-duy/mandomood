import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đọc hiểu",
  description: "Luyện đọc tiếng Trung qua đoạn văn ngắn có annotation.",
  openGraph: {
    title: "Đọc hiểu | MandoMood",
    description: "Luyện đọc tiếng Trung qua đoạn văn ngắn có annotation.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
