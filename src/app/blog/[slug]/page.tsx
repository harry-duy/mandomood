/**
 * /blog/[slug] — bài viết SEO (static generate + JSON-LD Article)
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getPostBySlug } from "@/lib/blog-data";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mandomood.vercel.app";

export function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Không tìm thấy bài viết | MandoMood" };
  return {
    title: `${post.title} | MandoMood`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    inLanguage: "vi",
    author: { "@type": "Organization", name: "MandoMood" },
    publisher: { "@type": "Organization", name: "MandoMood", url: BASE_URL },
    mainEntityOfPage: `${BASE_URL}/blog/${post.slug}`,
  };

  return (
    <article className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/blog" className="text-sm opacity-60 hover:opacity-100">← Tất cả bài viết</Link>
      <h1 className="text-3xl font-bold mt-4 leading-tight">{post.title}</h1>
      <p className="text-sm opacity-50 mt-2 mb-8">
        {new Date(post.date + "T00:00:00").toLocaleDateString("vi-VN")} · {post.readMinutes} phút đọc
      </p>
      {post.sections.map(section => (
        <section key={section.heading} className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{section.heading}</h2>
          {section.paragraphs.map((p, i) => (
            <p key={i} className="opacity-85 leading-relaxed mb-3">{p}</p>
          ))}
        </section>
      ))}
      <div className="rounded-2xl bg-mm-red/10 border border-mm-red/30 p-5 mt-10">
        <p className="font-semibold mb-1">Bắt đầu học miễn phí</p>
        <p className="text-sm opacity-80 mb-3">
          Truyện AI theo tâm trạng · âm Hán Việt · flashcard SRS · luyện phát âm.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 rounded-xl bg-mm-red text-white text-sm font-medium hover:opacity-90"
        >
          Học thử MandoMood →
        </Link>
      </div>
    </article>
  );
}
