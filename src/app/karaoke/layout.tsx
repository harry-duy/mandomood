import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Karaoke luyện nghe & nói tiếng Trung | MandoMood",
  description:
    "Luyện nghe tiếng Trung theo kiểu karaoke — nghe câu, nhái lại, chép chính tả. Ba chế độ: Nghe · Shadowing · Chính tả. Cải thiện phát âm tự nhiên.",
  keywords: [
    "karaoke tiếng Trung", "luyện nghe tiếng Trung", "shadowing tiếng Trung",
    "luyện phát âm tiếng Trung", "chính tả tiếng Trung", "MandoMood karaoke",
  ],
  openGraph: {
    title: "Karaoke luyện nghe & nói tiếng Trung | MandoMood",
    description: "Luyện nghe tiếng Trung theo kiểu karaoke — Nghe · Shadowing · Chính tả.",
    url: "/karaoke",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Karaoke" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karaoke luyện nghe & nói tiếng Trung | MandoMood",
    description: "Luyện nghe tiếng Trung theo kiểu karaoke — Nghe · Shadowing · Chính tả.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/karaoke" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
