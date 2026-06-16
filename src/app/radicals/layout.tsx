import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Học bộ thủ tiếng Trung | MandoMood",
  description:
    "Học 214 bộ thủ tiếng Trung qua hình ảnh, âm thanh và câu chuyện — nắm bộ thủ là nắm chìa khóa giải mã hàng nghìn chữ Hán.",
  keywords: [
    "bộ thủ tiếng Trung", "học bộ thủ chữ Hán", "214 bộ thủ", "kangxi radicals tiếng Việt",
    "học chữ Hán qua bộ thủ", "radicals MandoMood",
  ],
  openGraph: {
    title: "Học bộ thủ tiếng Trung | MandoMood",
    description: "Học 214 bộ thủ tiếng Trung — nắm bộ thủ là nắm chìa khóa giải mã chữ Hán.",
    url: "/radicals",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Bộ thủ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Học bộ thủ tiếng Trung | MandoMood",
    description: "Học 214 bộ thủ tiếng Trung — nắm bộ thủ là nắm chìa khóa giải mã chữ Hán.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/radicals" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
