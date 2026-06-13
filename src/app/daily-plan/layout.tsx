import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kế hoạch ngày | MandoMood",
  description: "Kế hoạch học tiếng Trung hôm nay, cá nhân hóa theo mục tiêu và cấp độ của bạn.",
};

export default function DailyPlanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
