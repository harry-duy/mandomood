import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | MandoMood",
  description:
    "Đăng nhập MandoMood để lưu tiến trình, streak, câu chuyện yêu thích và đồng bộ trên mọi thiết bị.",
  openGraph: {
    title: "Đăng nhập | MandoMood",
    description: "Đăng nhập để lưu tiến trình, streak và câu chuyện yêu thích.",
    url: "/login",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Đăng nhập" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Đăng nhập | MandoMood",
    description: "Đăng nhập để lưu tiến trình, streak và câu chuyện yêu thích.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/login" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
