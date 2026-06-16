import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feed câu chuyện tiếng Trung | MandoMood",
  description:
    "Cuộn qua feed câu chuyện tiếng Trung ngắn hàng ngày — học từ vựng và cảm xúc qua những khoảnh khắc đời thường bằng tiếng Trung.",
  keywords: [
    "feed học tiếng Trung", "câu chuyện tiếng Trung ngắn", "scroll học tiếng Trung",
    "học tiếng Trung hàng ngày", "feed MandoMood",
  ],
  openGraph: {
    title: "Feed câu chuyện tiếng Trung | MandoMood",
    description: "Cuộn qua feed câu chuyện tiếng Trung ngắn hàng ngày — học từ vựng qua cảm xúc.",
    url: "/feed",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Feed" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Feed câu chuyện tiếng Trung | MandoMood",
    description: "Cuộn qua feed câu chuyện tiếng Trung ngắn hàng ngày — học từ vựng qua cảm xúc.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/feed" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
