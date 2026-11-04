#!/usr/bin/env node
/**
 * Generates responsive WebP variants for every JPG/PNG in public/.
 *
 *   public/products/pp/boxes/box-01-hero.jpg
 *     -> public/_opt/products/pp/boxes/box-01-hero-400.webp
 *     -> public/_opt/products/pp/boxes/box-01-hero-800.webp
 *     -> public/_opt/products/pp/boxes/box-01-hero-1600.webp
 *
 * Output is gitignored and regenerated on `npm run dev` / `npm run build`.
 * Incremental: a variant is skipped if it's newer than its source.
 * Keep WIDTHS in sync with src/lib/img.ts.
 */
import { readdir, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

export const WIDTHS = [400, 800, 1600];
const QUALITY = 72;
const ROOT = path.resolve("public");
const OUT = path.join(ROOT, "_opt");
const SKIP_DIRS = new Set(["_opt", "refs"]);

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (dir === ROOT && SKIP_DIRS.has(e.name)) continue;
      yield* walk(p);
    } else if (/\.(jpe?g|png)$/i.test(e.name)) {
      yield p;
    }
  }
}

async function mtime(p) {
  try { return (await stat(p)).mtimeMs; } catch { return 0; }
}

async function processFile(src) {
  const rel = path.relative(ROOT, src).replace(/\.(jpe?g|png)$/i, "");
  const srcTime = await mtime(src);
  let made = 0;
  for (const w of WIDTHS) {
    const dest = path.join(OUT, `${rel}-${w}.webp`);
    if ((await mtime(dest)) > srcTime) continue;
    await mkdir(path.dirname(dest), { recursive: true });
    await sharp(src)
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(dest);
    made++;
  }
  return made;
}

const files = [];
for await (const f of walk(ROOT)) files.push(f);

const t0 = Date.now();
let made = 0;
let i = 0;
const workers = Array.from({ length: Math.max(2, os.cpus().length) }, async () => {
  while (i < files.length) {
    const f = files[i++];
    try { const n = await processFile(f); made += n; }
    catch (err) { console.warn(`[optimize-images] skipped ${f}: ${err.message}`); }
  }
});
await Promise.all(workers);
console.log(`[optimize-images] ${files.length} images, ${made} variants written in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
