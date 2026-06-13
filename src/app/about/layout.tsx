import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Về MandoMood | Học tiếng Trung qua cảm xúc",
  description: "MandoMood là app học tiếng Trung qua câu chuyện, cảm xúc và cuộc sống thật. Không nhàm chán, không cứng nhắc — chỉ có tình cảm và kỷ niệm.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
