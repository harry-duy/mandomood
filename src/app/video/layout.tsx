import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Video — Học tiếng Trung qua câu chuyện & bài hát",
  description: "Kho video tuyển chọn: học tiếng Trung qua câu chuyện nhỏ, bài hát, thơ ca và hội thoại đời thường — dễ ghi nhớ, không khô khan.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
