import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Karaoke luyện nghe & nói | MandoMood",
  description: "Luyện nghe tiếng Trung theo kiểu karaoke — nghe câu, nhái lại, chép chính tả. Ba chế độ: Nghe · Shadowing · Chính tả.",
};

export default function KaraokeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
