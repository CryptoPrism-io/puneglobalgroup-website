import type { MetadataRoute } from "next";
import { products, blogPosts } from "@/lib/pgg-data";
import { SITE, productPathFor } from "@/lib/seo";

export const dynamic = "force-static";

function monthToDate(m?: string): Date | undefined {
  if (!m) return undefined;
  const d = new Date(`1 ${m}`);
  return isNaN(d.getTime()) ? undefined : d;
}

// Built from the same data as the pages, so it never lists a page that doesn't exist.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, lastModified: Date = now) =>
    ({ url: `${SITE.url}${path}`, lastModified, priority });

  return [
    page("/", 1),
    page("/products/pp-corrugated/", 0.9),
    page("/products/paper-board/", 0.8),
    page("/products/", 0.7),
    page("/contact/", 0.8),
    page("/infrastructure/", 0.6),
    page("/about/", 0.5),
    page("/blog/", 0.7),
    ...products.map((p) => page(productPathFor(p), p.category === "PP Packaging" ? 0.8 : 0.6)),
    ...blogPosts.map((b) => page(`/blog/${b.slug}/`, 0.6, monthToDate(b.updated) ?? monthToDate(b.date) ?? now)),
  ];
}
