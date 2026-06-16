import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện ghép câu tiếng Trung | MandoMood",
  description:
    "Luyện ghép câu tiếng Trung từ HSK 1 đến HSK 5 — sắp xếp từ thành câu đúng thứ tự, nhớ cấu trúc câu một cách tự nhiên.",
  keywords: [
    "ghép câu tiếng Trung", "sắp xếp câu tiếng Trung", "luyện cấu trúc câu tiếng Trung",
    "sentence building tiếng Trung", "practice tiếng Trung HSK",
  ],
  openGraph: {
    title: "Luyện ghép câu tiếng Trung | MandoMood",
    description: "Sắp xếp từ thành câu tiếng Trung đúng thứ tự — luyện cấu trúc câu từ HSK 1 đến HSK 5.",
    url: "/practice",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Ghép câu" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luyện ghép câu tiếng Trung | MandoMood",
    description: "Sắp xếp từ thành câu tiếng Trung đúng thứ tự — HSK 1 đến HSK 5.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/practice" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
