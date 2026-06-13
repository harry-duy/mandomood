import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ hanzi: string }> }
): Promise<Metadata> {
  const { hanzi: raw } = await params;
  const hanzi = decodeURIComponent(raw);
  const title = `Chữ ${hanzi}`;
  const description = `Học chữ Hán ${hanzi}: nguồn gốc, bộ thủ, cách viết nét, pinyin, thanh điệu và câu ví dụ cảm xúc trên MandoMood.`;
  return {
    title,
    description,
    openGraph: {
      title: `Chữ ${hanzi} | MandoMood`,
      description,
    },
    alternates: { canonical: `/character/${encodeURIComponent(hanzi)}` },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
