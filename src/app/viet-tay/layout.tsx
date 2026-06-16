import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vẽ tay tra chữ Hán — Viết là ra nghĩa | MandoMood",
  description:
    "Không biết chữ Hán đọc thế nào? Vẽ tay chữ đó trên màn hình, MandoMood nhận dạng và gợi ý các chữ gần đúng kèm pinyin, nghĩa và phát âm.",
  keywords: [
    "vẽ tay tra chữ Hán", "nhận dạng chữ Hán bằng tay", "tra chữ Hán viết tay",
    "handwriting recognition tiếng Trung", "vẽ chữ Hán", "tra từ điển tiếng Trung bằng tay",
  ],
  openGraph: {
    title: "Vẽ tay tra chữ Hán | MandoMood",
    description: "Vẽ chữ Hán bằng tay → nhận dạng tức thì kèm pinyin, nghĩa và phát âm.",
    url: "/viet-tay",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Vẽ tay tra chữ Hán" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vẽ tay tra chữ Hán | MandoMood",
    description: "Vẽ chữ Hán bằng tay → nhận dạng tức thì kèm pinyin & nghĩa.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/viet-tay" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
