// Server component wrapper — required for generateStaticParams with output: 'export'
import { blogPosts } from "@/lib/pgg-data";
import BlogPostClient from "./BlogPostClient";

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}
