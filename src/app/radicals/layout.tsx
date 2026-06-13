import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bộ thủ Hán tự",
  description: "58 bộ thủ quan trọng nhất. Hiểu bộ thủ để giải mã hàng ngàn chữ Hán.",
  openGraph: {
    title: "Bộ thủ Hán tự | MandoMood",
    description: "58 bộ thủ quan trọng nhất. Hiểu bộ thủ để giải mã hàng ngàn chữ Hán.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
