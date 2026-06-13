import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thử thách ngày",
  description: "6 câu thử thách tiếng Trung mỗi ngày. Kiếm XP và leo hạng.",
  openGraph: {
    title: "Thử thách ngày | MandoMood",
    description: "6 câu thử thách tiếng Trung mỗi ngày. Kiếm XP và leo hạng.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
