import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bộ sưu tập chữ Hán | MandoMood",
  description:
    "28 chữ Hán học qua cảm xúc — tình yêu, duyên phận, nỗi đau, bình yên. Mỗi chữ là một câu chuyện, một kỷ niệm để nhớ mãi.",
  keywords: [
    "chữ Hán đẹp", "học chữ Hán qua cảm xúc", "bộ sưu tập chữ Hán",
    "chữ Hán tình yêu", "ký tự tiếng Trung đẹp", "học Hán tự", "MandoMood characters",
  ],
  openGraph: {
    title: "Bộ sưu tập chữ Hán | MandoMood",
    description:
      "28 chữ Hán học qua cảm xúc — tình yêu, duyên phận, nỗi đau, bình yên. Mỗi chữ là một câu chuyện.",
    url: "/characters",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Bộ sưu tập chữ Hán" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bộ sưu tập chữ Hán | MandoMood",
    description: "28 chữ Hán học qua cảm xúc — tình yêu, duyên phận, nỗi đau, bình yên.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/characters" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
