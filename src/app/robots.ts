import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export const dynamic = "force-static";

// Search engines and AI answer engines (GPTBot, PerplexityBot, ClaudeBot, Google-Extended…)
// are all allowed; only the private admin pages are blocked.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/login"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
