import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Nâng cấp Premium — mở khóa AI không giới hạn và nhiều hơn nữa.",
  openGraph: {
    title: "Pricing | MandoMood",
    description: "Nâng cấp Premium — mở khóa AI không giới hạn và nhiều hơn nữa.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
