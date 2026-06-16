import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog-data";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mandomood.vercel.app";

// Cac trang cong khai nen duoc index (bo qua admin/api/onboarding/pricing-success
// va cac route dong nhu lesson/[id], character/[hanzi]).
const PUBLIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/feed", priority: 0.9, changeFrequency: "daily" },
  { path: "/explore", priority: 0.8, changeFrequency: "weekly" },
  { path: "/dictation", priority: 0.7, changeFrequency: "weekly" },
  { path: "/my-decks", priority: 0.6, changeFrequency: "weekly" },
  { path: "/lo-trinh", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.7, changeFrequency: "monthly" },
  { path: "/login", priority: 0.4, changeFrequency: "yearly" },
  { path: "/generate", priority: 0.7, changeFrequency: "weekly" },
  { path: "/smart-lesson", priority: 0.7, changeFrequency: "weekly" },
  { path: "/ai-tutor", priority: 0.7, changeFrequency: "weekly" },
  { path: "/flashcards", priority: 0.7, changeFrequency: "weekly" },
  { path: "/practice", priority: 0.6, changeFrequency: "weekly" },
  { path: "/review", priority: 0.6, changeFrequency: "weekly" },
  { path: "/reading", priority: 0.6, changeFrequency: "weekly" },
  { path: "/characters", priority: 0.8, changeFrequency: "weekly" },
  { path: "/chiet-tu", priority: 0.8, changeFrequency: "weekly" },
  { path: "/radicals", priority: 0.7, changeFrequency: "weekly" },
  { path: "/sodo", priority: 0.6, changeFrequency: "weekly" },
  { path: "/grammar", priority: 0.7, changeFrequency: "weekly" },
  { path: "/dictionary", priority: 0.8, changeFrequency: "weekly" },
  { path: "/hsk", priority: 0.8, changeFrequency: "weekly" },
  { path: "/test", priority: 0.7, changeFrequency: "weekly" },
  { path: "/challenge", priority: 0.6, changeFrequency: "daily" },
  { path: "/progress", priority: 0.5, changeFrequency: "daily" },
  { path: "/so-tay", priority: 0.5, changeFrequency: "weekly" },
  { path: "/pronunciation", priority: 0.6, changeFrequency: "weekly" },
  { path: "/luyen-viet", priority: 0.6, changeFrequency: "weekly" },
  { path: "/luyen-viet/online", priority: 0.6, changeFrequency: "weekly" },
  { path: "/shadowing", priority: 0.6, changeFrequency: "weekly" },
  { path: "/video", priority: 0.6, changeFrequency: "weekly" },
  { path: "/tones", priority: 0.6, changeFrequency: "weekly" },
  { path: "/community", priority: 0.7, changeFrequency: "daily" },
  { path: "/leaderboard", priority: 0.6, changeFrequency: "daily" },
  { path: "/search", priority: 0.5, changeFrequency: "weekly" },
  { path: "/viet-tay", priority: 0.6, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
  { path: "/daily-plan", priority: 0.7, changeFrequency: "daily" },
  { path: "/karaoke", priority: 0.7, changeFrequency: "weekly" },
  { path: "/practice-sheet", priority: 0.6, changeFrequency: "monthly" },
  { path: "/mandomood-vs-duolingo", priority: 0.7, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = PUBLIC_ROUTES.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
  const blogRoutes = BLOG_POSTS.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date + "T00:00:00Z"),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...staticRoutes, ...blogRoutes];
}
