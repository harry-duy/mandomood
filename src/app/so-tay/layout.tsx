import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sổ tay từ vựng | MandoMood",
  description:
    "Những từ tiếng Trung bạn đã lưu khi đọc truyện — ôn nhanh, nghe phát âm, quản lý dễ dàng. Không cần tài khoản, lưu trên máy.",
  keywords: [
    "sổ tay từ vựng tiếng Trung", "từ đã lưu", "ôn từ tiếng Trung", "saved words tiếng Trung",
    "MandoMood sổ tay",
  ],
  openGraph: {
    title: "Sổ tay từ vựng | MandoMood",
    description: "Ôn nhanh các từ tiếng Trung đã lưu — nghe phát âm, xem nghĩa, quản lý dễ dàng.",
    url: "/so-tay",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Sổ tay từ vựng" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sổ tay từ vựng | MandoMood",
    description: "Ôn nhanh các từ tiếng Trung đã lưu — nghe phát âm, xem nghĩa, quản lý dễ dàng.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/so-tay" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
