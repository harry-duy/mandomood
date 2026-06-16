import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lộ trình HSK 1–6 cá nhân hóa | MandoMood",
  description:
    "Lộ trình học tiếng Trung từ HSK 1 đến HSK 6, cá nhân hóa theo điểm kỹ năng và mục tiêu của bạn. Biết chính xác cần làm gì tiếp theo.",
  keywords: [
    "lộ trình học tiếng Trung", "lộ trình HSK", "học tiếng Trung từ đầu", "tiến trình HSK",
    "roadmap tiếng Trung", "kế hoạch học tiếng Trung", "MandoMood lộ trình",
  ],
  openGraph: {
    title: "Lộ trình HSK 1–6 cá nhân hóa | MandoMood",
    description: "Lộ trình học tiếng Trung từ HSK 1 đến HSK 6 — cá nhân hóa theo kỹ năng của bạn.",
    url: "/lo-trinh",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Lộ trình học" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lộ trình HSK 1–6 cá nhân hóa | MandoMood",
    description: "Lộ trình học tiếng Trung từ HSK 1 đến HSK 6 — cá nhân hóa theo kỹ năng của bạn.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/lo-trinh" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
