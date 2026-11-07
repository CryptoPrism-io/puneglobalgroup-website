import type { Metadata } from "next";
// Server component wrapper — required for generateStaticParams with output: 'export'
import { blogPosts } from "@/lib/pgg-data";
import BlogPostClient from "./BlogPostClient";

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
  return { title: p.title, description: p.excerpt, alternates: { canonical: `/blog/${p.slug}/` } };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}
