import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import Providers from "./providers";
import TextSelectionTooltip from "@/components/ui/TextSelectionTooltip";

export const metadata: Metadata = {
  title: {
    default: "MandoMood - Hoc tieng Trung qua cam xuc",
    template: "%s | MandoMood",
  },
  description: "Hoc tieng Trung qua cau chuyen, cam xuc va cuoc song that. AI ca nhan hoa moi ngay.",
  keywords: ["hoc tieng Trung", "mandarin", "language learning", "AI", "Gen Z", "HSK"],
  authors: [{ name: "MandoMood" }],
  icons: {
    icon: "/favicon.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: "MandoMood - Hoc tieng Trung qua cam xuc",
    description: "Hoc tieng Trung qua cau chuyen, cam xuc va cuoc song that. AI ca nhan hoa moi ngay.",
    type: "website",
    locale: "vi_VN",
    siteName: "MandoMood",
  },
  twitter: {
    card: "summary_large_image",
    title: "MandoMood",
    description: "Hoc tieng Trung qua cau chuyen & cam xuc",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MandoMood",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0D0D0D",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB] font-inter antialiased overflow-x-hidden">
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.35]"
          aria-hidden="true"
        />

        <Providers>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-16 pb-20">
              {children}
            </main>
            <BottomNav />
          </div>
          <TextSelectionTooltip />
        </Providers>

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1A1A1A",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#F5F0EB",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
