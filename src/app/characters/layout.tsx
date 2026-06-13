import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bộ sưu tập chữ Hán",
  description: "28 chữ Hán học qua cảm xúc — tình yêu, duyên phận, nỗi đau, bình yên.",
  openGraph: {
    title: "Bộ sưu tập chữ Hán | MandoMood",
    description: "28 chữ Hán học qua cảm xúc — tình yêu, duyên phận, nỗi đau, bình yên.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
