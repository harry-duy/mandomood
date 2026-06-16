import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thử thách ngày | MandoMood",
  description:
    "6 câu thử thách tiếng Trung mỗi ngày — từ vựng, ngữ pháp và câu nói hay. Kiếm XP, leo bảng xếp hạng và duy trì streak.",
  keywords: [
    "thử thách tiếng Trung hàng ngày", "daily challenge tiếng Trung", "quiz tiếng Trung",
    "học tiếng Trung mỗi ngày", "XP tiếng Trung", "streak tiếng Trung",
  ],
  openGraph: {
    title: "Thử thách ngày | MandoMood",
    description: "6 câu thử thách tiếng Trung mỗi ngày. Kiếm XP và leo hạng.",
    url: "/challenge",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Thử thách ngày" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Thử thách ngày | MandoMood",
    description: "6 câu thử thách tiếng Trung mỗi ngày. Kiếm XP và leo hạng.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/challenge" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
