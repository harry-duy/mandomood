import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện chính tả tiếng Trung | MandoMood",
  description:
    "Luyện chính tả tiếng Trung qua karaoke — nghe câu, chép lại đúng từng chữ. Cải thiện khả năng nghe và viết tiếng Trung cùng lúc.",
  keywords: [
    "luyện chính tả tiếng Trung", "nghe và viết tiếng Trung", "dictation tiếng Trung",
    "luyện nghe tiếng Trung", "chép chính tả tiếng Trung", "MandoMood dictation",
  ],
  openGraph: {
    title: "Luyện chính tả tiếng Trung | MandoMood",
    description: "Nghe câu tiếng Trung, chép lại đúng từng chữ — luyện nghe và viết cùng lúc.",
    url: "/dictation",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Chính tả" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luyện chính tả tiếng Trung | MandoMood",
    description: "Nghe câu tiếng Trung, chép lại đúng từng chữ — luyện nghe và viết cùng lúc.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/dictation" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
