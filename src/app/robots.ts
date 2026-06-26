import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mandomood.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Khong cho index cac route rieng tu / khong can SEO (gom ca trang tai khoan
        // can dang nhap -> tranh Google ton crawl budget vao trang redirect/rong).
        disallow: [
          "/admin", "/admin/", "/api/", "/pricing/success", "/onboarding",
          "/notifications", "/profile",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
