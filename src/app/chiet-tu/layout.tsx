import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chiết tự chữ Hán | MandoMood",
  description:
    "Hiểu sâu chữ Hán qua chiết tự — phân tích thành phần, bộ thủ và câu chuyện nhớ chữ. Học 1 lần, nhớ mãi mãi.",
  keywords: [
    "chiết tự chữ Hán", "phân tích chữ Hán", "bộ thủ chữ Hán", "ý nghĩa chữ Hán",
    "học chữ Hán qua câu chuyện", "etymology tiếng Trung", "MandoMood chiết tự",
  ],
  openGraph: {
    title: "Chiết tự chữ Hán | MandoMood",
    description: "Phân tích thành phần và câu chuyện đằng sau mỗi chữ Hán — học 1 lần, nhớ mãi mãi.",
    url: "/chiet-tu",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Chiết tự" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chiết tự chữ Hán | MandoMood",
    description: "Phân tích thành phần và câu chuyện đằng sau mỗi chữ Hán — học 1 lần, nhớ mãi mãi.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/chiet-tu" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
