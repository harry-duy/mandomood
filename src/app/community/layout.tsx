import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cộng đồng",
  description: "Chia sẻ câu tiếng Trung hay cùng cộng đồng học tiếng Trung Gen Z.",
  openGraph: {
    title: "Cộng đồng | MandoMood",
    description: "Chia sẻ câu tiếng Trung hay cùng cộng đồng học tiếng Trung Gen Z.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
