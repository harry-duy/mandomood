import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện viết tiếng Trung | MandoMood",
  description:
    "Luyện viết chữ Hán đúng nét bút — hướng dẫn thứ tự nét, nhận diện nét sai và phản hồi tức thì giúp viết đẹp hơn mỗi ngày.",
  keywords: [
    "luyện viết chữ Hán", "thứ tự nét bút tiếng Trung", "viết chữ Hán đúng thứ tự",
    "stroke order tiếng Trung", "luyện viết MandoMood",
  ],
  openGraph: {
    title: "Luyện viết tiếng Trung | MandoMood",
    description: "Luyện viết chữ Hán đúng nét bút — thứ tự nét và phản hồi tức thì.",
    url: "/luyen-viet",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Luyện viết" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luyện viết tiếng Trung | MandoMood",
    description: "Luyện viết chữ Hán đúng nét bút — thứ tự nét và phản hồi tức thì.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/luyen-viet" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
