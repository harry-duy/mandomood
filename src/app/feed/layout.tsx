import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Học hôm nay",
  description: "Bài học tiếng Trung theo mood — lãng mạn, chữa lành, động lực.",
  openGraph: {
    title: "Học hôm nay | MandoMood",
    description: "Bài học tiếng Trung theo mood — lãng mạn, chữa lành, động lực.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
