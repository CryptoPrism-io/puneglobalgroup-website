#!/usr/bin/env node
/**
 * Generates public/sitemap.xml for the static export build.
 * Run before `next build` or as part of the build pipeline.
 */
const fs   = require("fs");
const path = require("path");

const BASE = "https://puneglobalgroup.in";
const NOW  = new Date().toISOString().split("T")[0];

const productSlugs = [
  "itc-fbb-boards", "duplex-board", "kraft-liner", "test-liners-fluting",
  "white-top-kraft-liner", "pp-foldable-boxes", "pp-corrugated-sheets",
  "pp-layer-pads", "pp-corrugated-crates", "pp-box-open-top-riveted",
  "pp-box-ultrasonic-weld", "pp-box-top-flap-interlock", "pp-box-detachable-lid",
  "pp-box-velcro-closure", "pp-box-collapsible", "pp-sep-cross-partition",
  "pp-sep-die-cut-insert", "esd-packaging", "pp-layer-pad-heavy-duty",
  "pp-tray-folded-corner", "pp-tray-stackable-interlock", "pp-tray-fixed-divider",
  "pp-tray-foam-laminated", "pp-tray-esd-antistatic", "pp-bin-scrap-open-top",
  "pp-bin-hopper-front", "pp-bin-nesting-tapered", "pp-picking-bin-open-front",
  "pp-flooring-protection-sheet",
];

const blogSlugs = [
  "gsm-guide-paper-board", "fbb-vs-duplex-board",
  "export-packaging-compliance-india", "pp-corrugated-returnable-packaging",
];

function url(loc, priority, freq) {
  return `  <url>\n    <loc>${BASE}${loc}</loc>\n    <lastmod>${NOW}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

const entries = [
  url("/",                          "1.0", "monthly"),
  url("/products",                  "0.9", "monthly"),
  url("/products/pp-corrugated",    "0.9", "monthly"),
  url("/products/paper-board",      "0.9", "monthly"),
  url("/infrastructure",            "0.8", "yearly"),
  url("/blog",                      "0.7", "weekly"),
  ...productSlugs.map(s => url(`/products/${s}`, "0.7", "monthly")),
  ...blogSlugs.map(s   => url(`/blog/${s}`,      "0.6", "yearly")),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;

const out = path.join(__dirname, "..", "public", "sitemap.xml");
fs.writeFileSync(out, xml, "utf8");
console.log(`sitemap.xml written — ${entries.length} URLs`);
