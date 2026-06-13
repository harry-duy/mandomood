import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ôn tập",
  description: "Ôn từ vựng tiếng Trung với hệ thống thẻ nhớ SRS.",
  openGraph: {
    title: "Ôn tập | MandoMood",
    description: "Ôn từ vựng tiếng Trung với hệ thống thẻ nhớ SRS.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
