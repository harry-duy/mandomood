import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flashcard SRS ôn tập từ vựng | MandoMood",
  description:
    "Ôn tập từ vựng tiếng Trung với hệ thống thẻ nhớ SRS (Spaced Repetition) — chỉ ôn đúng từ sắp quên, hiệu quả tối đa với thời gian tối thiểu.",
  keywords: [
    "flashcard tiếng Trung", "spaced repetition tiếng Trung", "ôn tập từ vựng tiếng Trung",
    "SRS tiếng Trung", "thẻ nhớ tiếng Trung", "anki tiếng Trung",
  ],
  openGraph: {
    title: "Flashcard SRS ôn tập từ vựng | MandoMood",
    description: "Ôn từ vựng tiếng Trung với SRS — chỉ ôn đúng từ sắp quên, tối ưu thời gian.",
    url: "/flashcards",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Flashcards" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flashcard SRS ôn tập từ vựng | MandoMood",
    description: "Ôn từ vựng tiếng Trung với SRS — chỉ ôn đúng từ sắp quên, tối ưu thời gian.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/flashcards" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
