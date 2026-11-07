import type { Metadata } from "next";
// Server component wrapper — required for generateStaticParams with output: 'export'
import { blogPosts } from "@/lib/pgg-data";
import BlogPostClient from "./BlogPostClient";
import JsonLd from "@/components/JsonLd";
import { blogPostingJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = blogPosts.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.answer ?? p.excerpt,
    alternates: { canonical: `/blog/${p.slug}/` },
    openGraph: { type: "article", title: p.title, description: p.answer ?? p.excerpt, images: p.coverImage ? [p.coverImage] : undefined },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const p = blogPosts.find((x) => x.slug === slug);
  return (
    <>
      {p && (
        <JsonLd data={[
          blogPostingJsonLd(p),
          ...(p.faqs?.length ? [faqJsonLd(p.faqs)] : []),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog/" },
            { name: p.title, path: `/blog/${p.slug}/` },
          ]),
        ]} />
      )}
      <BlogPostClient slug={slug} />
    </>
  );
}
