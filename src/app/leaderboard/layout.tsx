import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng xếp hạng",
  description: "Top người học tiếng Trung tích cực nhất tuần này.",
  openGraph: {
    title: "Bảng xếp hạng | MandoMood",
    description: "Top người học tiếng Trung tích cực nhất tuần này.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
