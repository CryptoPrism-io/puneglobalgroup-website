import { products, blogPosts } from "@/lib/pgg-data";
import { SITE, productPathFor } from "@/lib/seo";

export const dynamic = "force-static";

// /llms.txt — a plain-text map of the site for AI assistants (llmstxt.org format).
export function GET() {
  const pp = products.filter((p) => p.category === "PP Packaging");
  const paper = products.filter((p) => p.category !== "PP Packaging");
  const line = (title: string, path: string, note?: string) => `- [${title}](${SITE.url}${path})${note ? `: ${note}` : ""}`;
  const body = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    "Contact: +91 98233 83230 (phone and WhatsApp), Monday to Saturday, 9:30 to 18:30 IST.",
    "Office: 206 Gulmohar Center Point, Pune 411006. Plant: 108 BU Bhandari MIDC, Sanaswadi, Pune 412208.",
    `Quotes: ${SITE.url}/contact/`,
    "",
    "## PP corrugated packaging (manufactured)",
    ...pp.map((p) => line(p.name, productPathFor(p), p.tagline)),
    "",
    "## Paper and board grades (supplied)",
    ...paper.map((p) => line(p.name, productPathFor(p), p.tagline)),
    "",
    "## Guides",
    ...blogPosts.map((b) => line(b.title, `/blog/${b.slug}/`, b.answer ?? b.excerpt)),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
