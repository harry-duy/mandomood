import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng giá Premium | MandoMood",
  description:
    "Nâng cấp MandoMood Premium — mở khóa AI Story không giới hạn, AI Tutor, Smart Lesson và nhiều công cụ học tiếng Trung nâng cao hơn.",
  keywords: [
    "MandoMood Premium", "giá MandoMood", "nâng cấp học tiếng Trung",
    "AI học tiếng Trung premium", "pricing MandoMood",
  ],
  openGraph: {
    title: "Bảng giá Premium | MandoMood",
    description: "Nâng cấp Premium — AI Story không giới hạn, AI Tutor và Smart Lesson.",
    url: "/pricing",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood Premium" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bảng giá Premium | MandoMood",
    description: "Nâng cấp Premium — AI Story không giới hạn, AI Tutor và Smart Lesson.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/pricing" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
