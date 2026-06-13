import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vẽ tay tra chữ Hán — Viết là ra nghĩa",
  description:
    "Không biết chữ Hán đọc thế nào? Vẽ tay chữ đó trên màn hình, MandoMood nhận dạng và gợi ý các chữ gần đúng kèm pinyin, nghĩa và phát âm.",
  alternates: { canonical: "/viet-tay" },
  openGraph: {
    title: "Vẽ tay tra chữ Hán | MandoMood",
    description: "Vẽ chữ Hán bằng tay → nhận dạng tức thì kèm pinyin & nghĩa.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
