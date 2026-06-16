import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cộng đồng học tiếng Trung | MandoMood",
  description:
    "Chia sẻ câu tiếng Trung hay, bình luận và kết nối cùng cộng đồng học tiếng Trung Gen Z Việt Nam trên MandoMood.",
  keywords: [
    "cộng đồng học tiếng Trung", "chia sẻ câu tiếng Trung hay", "MandoMood community",
    "học tiếng Trung Gen Z", "câu nói tiếng Trung hay", "forum tiếng Trung",
  ],
  openGraph: {
    title: "Cộng đồng học tiếng Trung | MandoMood",
    description:
      "Chia sẻ câu tiếng Trung hay và kết nối cùng cộng đồng học tiếng Trung Gen Z Việt Nam.",
    url: "/community",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Cộng đồng" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cộng đồng học tiếng Trung | MandoMood",
    description: "Chia sẻ câu tiếng Trung hay và kết nối cùng cộng đồng Gen Z.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/community" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
