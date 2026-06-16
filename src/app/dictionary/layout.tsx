import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Từ điển tiếng Trung theo cảm xúc | MandoMood",
  description:
    "Từ điển tiếng Trung theo chủ đề cảm xúc — tình yêu, bình yên, nỗi đau, hy vọng. Tra từ, nghe phát âm bản ngữ và lưu từ vào sổ tay.",
  keywords: [
    "từ điển tiếng Trung cảm xúc", "tra từ tiếng Trung", "từ vựng tiếng Trung theo chủ đề",
    "nghe phát âm tiếng Trung", "từ điển MandoMood", "emotional dictionary Chinese",
  ],
  openGraph: {
    title: "Từ điển tiếng Trung theo cảm xúc | MandoMood",
    description: "Tra từ tiếng Trung theo chủ đề cảm xúc — nghe phát âm, lưu vào sổ tay.",
    url: "/dictionary",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Từ điển cảm xúc" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Từ điển tiếng Trung theo cảm xúc | MandoMood",
    description: "Tra từ tiếng Trung theo chủ đề cảm xúc — nghe phát âm, lưu vào sổ tay.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/dictionary" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
