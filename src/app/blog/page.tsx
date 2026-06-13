/**
 * /blog — danh sách bài viết SEO (server component, static)
 */
import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Blog học tiếng Trung | MandoMood",
  description:
    "Mẹo học tiếng Trung cho người Việt: âm Hán Việt, chiết tự chữ Hán, lộ trình HSK, học qua truyện và C-drama.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog học tiếng Trung | MandoMood",
    description: "Mẹo học tiếng Trung cho người Việt: âm Hán Việt, chiết tự, lộ trình HSK.",
    type: "website",
  },
};

export default function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Blog MandoMood</h1>
      <p className="opacity-70 mb-8">
        Mẹo học tiếng Trung dành riêng cho người Việt — âm Hán Việt, chiết tự, lộ trình HSK.
      </p>
      <div className="space-y-4">
        {posts.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-2xl bg-white/5 hover:bg-white/10 transition p-5"
          >
            <div className="flex gap-2 mb-2 flex-wrap">
              {post.tags.map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-mm-red/20 text-mm-red">{t}</span>
              ))}
            </div>
            <h2 className="text-lg font-semibold leading-snug">{post.title}</h2>
            <p className="text-sm opacity-70 mt-1 line-clamp-2">{post.description}</p>
            <p className="text-xs opacity-50 mt-2">
              {new Date(post.date + "T00:00:00").toLocaleDateString("vi-VN")} · {post.readMinutes} phút đọc
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
