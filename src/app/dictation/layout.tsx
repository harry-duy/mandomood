import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện chính tả",
  description:
    "Nghe phát âm tiếng Trung và gõ lại chữ Hán hoặc pinyin. Luyện nghe + viết cùng lúc, chấm điểm ngay, cộng XP.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
