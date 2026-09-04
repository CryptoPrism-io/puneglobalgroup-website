#!/usr/bin/env node
/**
 * Generates public/sitemap.xml for the static export build.
 * Run before `next build` or as part of the build pipeline.
 *
 * Real routes (match next.config output:export + generateStaticParams):
 *   /                              home
 *   /products                      product hub
 *   /products/pp-corrugated        PP category
 *   /products/paper-board          Paper & Board category
 *   /products/{category}/{slug}    each product detail page
 *   /infrastructure                facility + machinery
 *   /about                         company story
 *   /contact                       contact + quote form
 *   /blog                          blog index
 *   /blog/{slug}                   each blog post
 * Admin/login are auth-gated and intentionally omitted (Disallowed in robots.txt).
 */
const fs   = require("fs");
const path = require("path");

const BASE = "https://puneglobalgroup.in";
const NOW  = new Date().toISOString().split("T")[0];

const paperSlugs = [
  "cyber-xlpac-gc1", "cyber-xlpac-gc2", "cyber-premium", "pearlxl-packaging",
  "carte-lumina", "safire-graphik", "cyber-oak", "eco-natura", "eco-blanca",
  "neowhite-bliss",
];

const ppSlugs = [
  "pp-box-open-top-riveted", "pp-box-ultrasonic-weld", "pp-box-top-flap-interlock",
  "pp-box-detachable-lid", "pp-box-velcro-closure", "pp-box-collapsible",
  "pp-sep-cross-partition", "pp-sep-die-cut-insert", "pp-layer-pad-heavy-duty",
  "pp-tray-folded-corner", "pp-tray-stackable-interlock", "pp-tray-fixed-divider",
  "pp-tray-foam-laminated", "pp-tray-esd-antistatic", "pp-bin-scrap-open-top",
  "pp-bin-hopper-front", "pp-bin-nesting-tapered", "pp-picking-bin-open-front",
  "pp-flooring-protection-sheet",
];

const blogSlugs = [
  "gsm-guide-paper-board", "fbb-vs-duplex-board", "export-packaging-compliance-india",
  "pp-corrugated-returnable-packaging", "sheet-vs-reel-paper-supply",
  "itc-pspd-vs-imported-board", "pharma-packaging-board-specs",
  "india-paper-board-market-2026",
];

function url(loc, priority, freq) {
  return `  <url>\n    <loc>${BASE}${loc}</loc>\n    <lastmod>${NOW}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

const entries = [
  url("/",                        "1.0", "monthly"),
  url("/products",                "0.9", "monthly"),
  url("/products/pp-corrugated",  "0.9", "monthly"),
  url("/products/paper-board",    "0.9", "monthly"),
  url("/infrastructure",          "0.8", "yearly"),
  url("/about",                   "0.7", "yearly"),
  url("/contact",                 "0.7", "yearly"),
  url("/blog",                    "0.7", "weekly"),
  ...paperSlugs.map(s => url(`/products/paper-board/${s}`, "0.7", "monthly")),
  ...ppSlugs.map(s    => url(`/products/pp-corrugated/${s}`, "0.7", "monthly")),
  ...blogSlugs.map(s  => url(`/blog/${s}`, "0.6", "yearly")),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;

const out = path.join(__dirname, "..", "public", "sitemap.xml");
fs.writeFileSync(out, xml, "utf8");
console.log(`sitemap.xml written — ${entries.length} URLs`);
