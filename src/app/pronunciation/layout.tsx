import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện phát âm",
  description: "Luyện phát âm tiếng Trung với AI — nhận điểm tức thì, biết ngay chỗ sai.",
  openGraph: {
    title: "Luyện phát âm | MandoMood",
    description: "Luyện phát âm tiếng Trung với AI — nhận điểm tức thì, biết ngay chỗ sai.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
