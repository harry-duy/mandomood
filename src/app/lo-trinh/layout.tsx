import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lộ trình HSK 1-6",
  description:
    "Hành trình học tiếng Trung từ HSK 1 đến HSK 6: học từ, luyện chính tả, quiz, ghép đôi và đề thi cho từng cấp độ — theo dõi tiến độ trực quan.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
