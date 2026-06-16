import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nâng cấp thành công | MandoMood Premium",
  description: "Chào mừng bạn đến với MandoMood Premium! Tận hưởng AI Story không giới hạn, AI Tutor và Smart Lesson.",
  openGraph: {
    title: "Nâng cấp thành công | MandoMood Premium",
    description: "Chào mừng bạn đến với MandoMood Premium!",
    url: "/pricing/success",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood Premium" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nâng cấp thành công | MandoMood Premium",
    description: "Chào mừng bạn đến với MandoMood Premium!",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/pricing/success" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
