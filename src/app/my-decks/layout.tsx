import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bộ thẻ của tôi | MandoMood",
  description:
    "Tạo và quản lý bộ thẻ flashcard tiếng Trung cá nhân — offline, không cần tài khoản. Thêm từ khi đọc truyện, ôn tập bất cứ lúc nào.",
  keywords: [
    "bộ thẻ flashcard tiếng Trung", "flashcard tiếng Trung offline", "custom deck tiếng Trung",
    "tạo thẻ nhớ tiếng Trung", "my decks MandoMood",
  ],
  openGraph: {
    title: "Bộ thẻ của tôi | MandoMood",
    description: "Tạo bộ thẻ flashcard tiếng Trung cá nhân — offline, không cần tài khoản.",
    url: "/my-decks",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — My Decks" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bộ thẻ của tôi | MandoMood",
    description: "Tạo bộ thẻ flashcard tiếng Trung cá nhân — offline, không cần tài khoản.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/my-decks" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
