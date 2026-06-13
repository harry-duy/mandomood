import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ghép câu",
  description: "Luyện ghép câu tiếng Trung từ HSK 1 đến HSK 5.",
  openGraph: {
    title: "Ghép câu | MandoMood",
    description: "Luyện ghép câu tiếng Trung từ HSK 1 đến HSK 5.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
