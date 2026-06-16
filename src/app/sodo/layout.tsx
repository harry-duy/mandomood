import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sơ đồ chữ Hán | MandoMood",
  description:
    "Khám phá mối liên hệ giữa các chữ Hán qua sơ đồ bộ thủ trực quan. Học 1 bộ thủ, hiểu hàng chục chữ — miễn phí.",
  keywords: [
    "sơ đồ chữ Hán", "bộ thủ chữ Hán", "gia phả chữ Hán", "học chữ Hán theo bộ thủ",
    "mối liên hệ chữ Hán", "character map tiếng Trung",
  ],
  openGraph: {
    title: "Sơ đồ chữ Hán | MandoMood",
    description: "Học 1 bộ thủ, hiểu hàng chục chữ — sơ đồ trực quan các gia đình chữ Hán.",
    url: "/sodo",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Sơ đồ chữ Hán" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sơ đồ chữ Hán | MandoMood",
    description: "Học 1 bộ thủ, hiểu hàng chục chữ — sơ đồ trực quan các gia đình chữ Hán.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/sodo" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
