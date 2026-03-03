#!/usr/bin/env node
/**
 * Converts all JPG/JPEG/PNG images in public/blog/ to WebP at quality 82.
 * Keeps originals intact. Skips files that already have a .webp sibling.
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const BLOG_DIR = path.join(__dirname, "..", "public", "blog");
const QUALITY = 82;

const files = fs.readdirSync(BLOG_DIR).filter((f) =>
  /\.(jpe?g|png)$/i.test(f)
);

(async () => {
  for (const file of files) {
    const src = path.join(BLOG_DIR, file);
    const dest = path.join(BLOG_DIR, file.replace(/\.(jpe?g|png)$/i, ".webp"));
    if (fs.existsSync(dest)) {
      const srcSize = fs.statSync(src).size;
      const destSize = fs.statSync(dest).size;
      console.log(`skip  ${file}  →  already exists (${(destSize/1024).toFixed(0)} kB vs ${(srcSize/1024).toFixed(0)} kB original)`);
      continue;
    }
    const info = await sharp(src).webp({ quality: QUALITY }).toFile(dest);
    const srcSize = fs.statSync(src).size;
    const saving = (((srcSize - info.size) / srcSize) * 100).toFixed(0);
    console.log(`done  ${file}  →  ${info.width}×${info.height}  ${(srcSize/1024).toFixed(0)} kB → ${(info.size/1024).toFixed(0)} kB  (${saving}% smaller)`);
  }
  console.log("\nAll done. Update pgg-data.ts references from .jpg → .webp");
})();
