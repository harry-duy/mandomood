import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ngữ pháp tiếng Trung HSK 1–4 | MandoMood",
  description:
    "12 cấu trúc ngữ pháp tiếng Trung quan trọng nhất HSK 1–4 — học qua ví dụ thực tế, quiz tương tác và giải thích dễ hiểu bằng tiếng Việt.",
  keywords: [
    "ngữ pháp tiếng Trung", "cấu trúc ngữ pháp HSK", "học ngữ pháp tiếng Trung",
    "grammar tiếng Trung", "ngữ pháp HSK 1 2 3 4", "MandoMood grammar",
  ],
  openGraph: {
    title: "Ngữ pháp tiếng Trung HSK 1–4 | MandoMood",
    description: "12 cấu trúc ngữ pháp tiếng Trung quan trọng nhất — học qua ví dụ và quiz tương tác.",
    url: "/grammar",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Ngữ pháp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ngữ pháp tiếng Trung HSK 1–4 | MandoMood",
    description: "12 cấu trúc ngữ pháp tiếng Trung quan trọng nhất — học qua ví dụ và quiz tương tác.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/grammar" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
