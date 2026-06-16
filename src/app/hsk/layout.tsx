import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Từ vựng HSK 1–6 | MandoMood",
  description:
    "Từ vựng tiếng Trung chuẩn HSK 1–6 với phát âm bản ngữ, ví dụ thực tế và ngữ pháp theo từng cấp độ. Miễn phí, không cần tài khoản.",
  keywords: [
    "từ vựng HSK", "HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6",
    "học từ vựng tiếng Trung", "danh sách từ HSK", "ôn thi HSK",
  ],
  openGraph: {
    title: "Từ vựng HSK 1–6 | MandoMood",
    description: "Từ vựng tiếng Trung chuẩn HSK 1–6 với phát âm bản ngữ và ví dụ thực tế. Miễn phí.",
    url: "/hsk",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — HSK Vocabulary" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Từ vựng HSK 1–6 | MandoMood",
    description: "Từ vựng tiếng Trung chuẩn HSK 1–6 với phát âm bản ngữ và ví dụ thực tế.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/hsk" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
