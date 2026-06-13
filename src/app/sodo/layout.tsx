import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Sơ đồ chữ Hán",
  description: "Khám phá mối liên hệ giữa các chữ Hán qua sơ đồ bộ thủ trực quan.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
