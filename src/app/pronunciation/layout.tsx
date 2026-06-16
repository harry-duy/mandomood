import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện phát âm tiếng Trung | MandoMood",
  description:
    "Luyện phát âm tiếng Trung với AI — nhận điểm tức thì, biết ngay chỗ sai. Luyện theo từng âm tiết, thanh điệu và câu hoàn chỉnh.",
  keywords: [
    "luyện phát âm tiếng Trung", "phát âm tiếng Trung chuẩn", "pronunciation tiếng Trung",
    "AI chấm phát âm tiếng Trung", "học phát âm tiếng Trung", "MandoMood pronunciation",
  ],
  openGraph: {
    title: "Luyện phát âm tiếng Trung | MandoMood",
    description: "Luyện phát âm tiếng Trung với AI — nhận điểm tức thì, biết ngay chỗ sai.",
    url: "/pronunciation",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Luyện phát âm" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luyện phát âm tiếng Trung | MandoMood",
    description: "Luyện phát âm tiếng Trung với AI — nhận điểm tức thì, biết ngay chỗ sai.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/pronunciation" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
