import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Tutor tiếng Trung | MandoMood",
  description:
    "Chat với 6 nhân vật AI tutor tiếng Trung khác nhau — từ thầy giáo nghiêm túc đến bạn thân Gen Z. Luyện hội thoại, hỏi ngữ pháp, học qua trò chuyện thật sự.",
  keywords: [
    "AI tutor tiếng Trung", "chat học tiếng Trung", "hội thoại tiếng Trung AI",
    "luyện tiếng Trung với AI", "chatbot tiếng Trung", "MandoMood AI tutor",
  ],
  openGraph: {
    title: "AI Tutor tiếng Trung | MandoMood",
    description: "Chat với 6 nhân vật AI tutor — luyện hội thoại, hỏi ngữ pháp, học tiếng Trung qua trò chuyện thật.",
    url: "/ai-tutor",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — AI Tutor" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tutor tiếng Trung | MandoMood",
    description: "Chat với 6 nhân vật AI tutor — luyện hội thoại tiếng Trung ngay hôm nay.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/ai-tutor" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
