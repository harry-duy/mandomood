import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shadowing — Luyện nói tiếng Trung | MandoMood",
  description:
    "Luyện shadowing tiếng Trung: nghe người bản ngữ rồi nhái theo — phương pháp học nói hiệu quả nhất. Cải thiện phát âm, ngữ điệu và tốc độ nói.",
  keywords: [
    "shadowing tiếng Trung", "luyện nói tiếng Trung", "nghe và nhái tiếng Trung",
    "phương pháp shadowing", "học nói tiếng Trung như người bản ngữ", "MandoMood shadowing",
  ],
  openGraph: {
    title: "Shadowing — Luyện nói tiếng Trung | MandoMood",
    description: "Nghe người bản ngữ rồi nhái theo — phương pháp shadowing hiệu quả nhất để nói tiếng Trung tự nhiên.",
    url: "/shadowing",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Shadowing" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shadowing — Luyện nói tiếng Trung | MandoMood",
    description: "Nghe người bản ngữ rồi nhái theo — phương pháp shadowing hiệu quả nhất.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/shadowing" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
