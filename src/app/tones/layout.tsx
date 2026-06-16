import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện 4 thanh điệu tiếng Trung | MandoMood",
  description:
    "Luyện 4 thanh điệu tiếng Trung — học qua cặp từ tối nghĩa, nghe và phân biệt thanh 1/2/3/4. Quiz tương tác giúp tai bạn nhạy cảm với thanh điệu.",
  keywords: [
    "thanh điệu tiếng Trung", "4 thanh tiếng Trung", "luyện thanh điệu tiếng Trung",
    "tones tiếng Trung", "phân biệt thanh điệu tiếng Trung", "thanh bằng thanh sắc",
  ],
  openGraph: {
    title: "Luyện 4 thanh điệu tiếng Trung | MandoMood",
    description: "Luyện 4 thanh điệu tiếng Trung qua cặp từ tối nghĩa và quiz tương tác.",
    url: "/tones",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Thanh điệu" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luyện 4 thanh điệu tiếng Trung | MandoMood",
    description: "Luyện 4 thanh điệu tiếng Trung qua cặp từ tối nghĩa và quiz tương tác.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/tones" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
