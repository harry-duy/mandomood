import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện viết chữ Hán — Tải file 田字格",
  description:
    "Tạo và in bảng luyện viết chữ Hán trên ô 田字格. Nhập chữ tùy ý hoặc chọn bộ chữ theo cảm xúc, có pinyin và nét mờ để đồ theo.",
  openGraph: {
    title: "Luyện viết chữ Hán | MandoMood",
    description:
      "Tạo bảng 田字格 in được để luyện viết chữ Hán — miễn phí, có pinyin và nét mờ đồ theo.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
