import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bộ thẻ của tôi",
  description:
    "Tự tạo bộ flashcard riêng và học bằng spaced repetition (SM-2). Như Quizlet nhưng miễn phí, hoạt động cả offline.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
