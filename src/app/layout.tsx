import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import Providers from "./providers";
import TextSelectionTooltip from "@/components/ui/TextSelectionTooltip";
import FeedbackWidget from "@/components/ui/FeedbackWidget";
// Force all pages to SSR — tránh MongoDB connection hang khi static generation
export const dynamic = "force-dynamic";


export const metadata: Metadata = {
  title: {
    default: "MandoMood — Học tiếng Trung qua cảm xúc",
    template: "%s | MandoMood",
  },
  description: "Học tiếng Trung qua câu chuyện, cảm xúc và cuộc sống thật. AI cá nhân hóa mỗi ngày. Miễn phí, không nhàm chán.",
  keywords: [
    "học tiếng Trung", "học mandarin", "tiếng Trung online", "HSK", "học tiếng Trung miễn phí",
    "AI học ngoại ngữ", "MandoMood", "học tiếng Trung Gen Z", "câu tiếng Trung hay",
    "bộ thủ Hán tự", "thanh điệu tiếng Trung",
  ],
  authors: [{ name: "MandoMood", url: "https://mandomood.vercel.app" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://mandomood.vercel.app"),
  alternates: { canonical: "/" },
  icons: {
    icon: "/favicon.png",
    apple: "/icons/icon-192.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "MandoMood — Học tiếng Trung qua cảm xúc",
    description: "Học tiếng Trung qua câu chuyện, cảm xúc và cuộc sống thật. AI cá nhân hóa mỗi ngày.",
    type: "website",
    url: "/",
    locale: "vi_VN",
    siteName: "MandoMood",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MandoMood — Học tiếng Trung qua cảm xúc",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MandoMood — Học tiếng Trung qua cảm xúc",
    description: "Học tiếng Trung qua câu chuyện & cảm xúc. AI cá nhân hóa mỗi ngày.",
    images: ["/og-image.png"],
    creator: "@mandomood",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
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
  themeColor: "#0D0D0D",
};

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mandomood.vercel.app";

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "EducationalOrganization"],
      "@id": `${BASE_URL}/#organization`,
      name: "MandoMood",
      url: BASE_URL,
      logo: `${BASE_URL}/icons/icon-192.png`,
      description: "Học tiếng Trung qua câu chuyện, cảm xúc và cuộc sống thật.",
    },
    {
      "@type": "Course",
      "@id": `${BASE_URL}/#course`,
      name: "Học tiếng Trung qua cảm xúc & câu chuyện (HSK 1–6)",
      description:
        "Lộ trình học tiếng Trung từ HSK 1 đến HSK 6 qua câu chuyện, câu nói hay, thơ cổ và luyện phát âm — cá nhân hóa bằng AI.",
      inLanguage: "vi-VN",
      teaches: "Tiếng Trung (Mandarin), HSK 1-6, phát âm, Hán tự",
      provider: { "@id": `${BASE_URL}/#organization` },
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        category: "Freemium",
        price: "0",
        priceCurrency: "VND",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "MandoMood",
      inLanguage: "vi-VN",
      publisher: { "@id": `${BASE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/search?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <head>
        {/* Anti-FOUC: đặt data-theme trước khi render để không nháy nền */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mm_theme');if(t==='light'){document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&family=Noto+Serif+SC:wght@400;700&display=swap"
        />
      </head>
      <body className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB] font-inter antialiased overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
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
          <FeedbackWidget />
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
