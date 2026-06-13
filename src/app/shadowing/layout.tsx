import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shadowing — Học nói tiếng Trung",
  description: "Luyện shadowing: nghe người bản ngữ rồi nhái theo — phương pháp học nói hiệu quả nhất.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
