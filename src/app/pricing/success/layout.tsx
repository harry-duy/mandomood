import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Thanh toán thành công",
  description: "Chào mừng bạn đến với MandoMood Premium!",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
