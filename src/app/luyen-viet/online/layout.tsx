import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện viết tiếng Trung online | MandoMood",
  description:
    "Luyện viết chữ Hán trực tiếp trên trình duyệt — không cần cài đặt, nhận phản hồi nét bút tức thì.",
  openGraph: {
    title: "Luyện viết tiếng Trung online | MandoMood",
    description: "Luyện viết chữ Hán trực tiếp trên trình duyệt — phản hồi nét bút tức thì.",
    url: "/luyen-viet/online",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Luyện viết online" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luyện viết tiếng Trung online | MandoMood",
    description: "Luyện viết chữ Hán trực tiếp trên trình duyệt — phản hồi nét bút tức thì.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/luyen-viet/online" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
