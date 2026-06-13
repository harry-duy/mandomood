import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Tutor",
  description: "Chat với 6 nhân vật AI tutor tiếng Trung khác nhau.",
  openGraph: {
    title: "AI Tutor | MandoMood",
    description: "Chat với 6 nhân vật AI tutor tiếng Trung khác nhau.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
