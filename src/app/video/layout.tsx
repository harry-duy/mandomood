import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video học tiếng Trung | MandoMood",
  description:
    "Học tiếng Trung qua video ngắn có phụ đề song ngữ — nghe, nhìn và cảm nhận ngôn ngữ theo cách tự nhiên nhất.",
  keywords: [
    "video học tiếng Trung", "video tiếng Trung phụ đề", "xem phim học tiếng Trung",
    "video ngắn tiếng Trung", "video MandoMood",
  ],
  openGraph: {
    title: "Video học tiếng Trung | MandoMood",
    description: "Video ngắn có phụ đề song ngữ — nghe và cảm nhận tiếng Trung tự nhiên nhất.",
    url: "/video",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Video" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Video học tiếng Trung | MandoMood",
    description: "Video ngắn có phụ đề song ngữ — nghe và cảm nhận tiếng Trung tự nhiên nhất.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/video" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
