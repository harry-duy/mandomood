import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ hanzi: string }> }
): Promise<Metadata> {
  const { hanzi: raw } = await params;
  const hanzi = decodeURIComponent(raw);
  const title = `Chữ ${hanzi} | MandoMood`;
  const description = `Học chữ Hán ${hanzi}: nguồn gốc, bộ thủ, cách viết nét, pinyin, thanh điệu và câu ví dụ cảm xúc trên MandoMood.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `MandoMood — Chữ ${hanzi}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
    alternates: { canonical: `/character/${encodeURIComponent(hanzi)}` },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
