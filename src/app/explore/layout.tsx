import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Khám phá công cụ",
  description:
    "Tất cả công cụ học tiếng Trung của MandoMood: AI Story, HSK, bộ thủ, phát âm, luyện viết, đề thi và nhiều hơn nữa.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
