import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Từ điển cảm xúc",
  description: "Từ điển tiếng Trung theo chủ đề cảm xúc. Tra từ, nghe phát âm.",
  openGraph: {
    title: "Từ điển cảm xúc | MandoMood",
    description: "Từ điển tiếng Trung theo chủ đề cảm xúc. Tra từ, nghe phát âm.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
