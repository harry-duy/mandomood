import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện viết chữ Hán HSK — In & Tải PDF | MandoMood",
  description:
    "Tải file luyện viết chữ Hán theo cấp HSK 1-6 với ô 田字格 chuẩn. In ra giấy hoặc lưu PDF để luyện viết tay offline, ghi nhớ mặt chữ tốt hơn.",
  keywords: [
    "luyện viết chữ Hán", "file luyện viết tiếng Trung PDF", "ô điền chữ Hán 田字格",
    "tập viết HSK", "in vở luyện viết tiếng Trung", "luyện viết tay chữ Hán",
  ],
  openGraph: {
    title: "Luyện viết chữ Hán HSK — In & Tải PDF | MandoMood",
    description: "File luyện viết chữ Hán theo cấp HSK với ô 田字格 — in ra giấy hoặc lưu PDF luyện viết tay.",
    url: "/practice-sheet",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Luyện viết chữ Hán" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luyện viết chữ Hán HSK — In & Tải PDF | MandoMood",
    description: "File luyện viết chữ Hán theo cấp HSK với ô 田字格 — in hoặc lưu PDF.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/practice-sheet" },
};

export default function PracticeSheetLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
