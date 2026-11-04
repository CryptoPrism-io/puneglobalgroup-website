// Helpers for the build-time WebP variants made by scripts/optimize-images.mjs.
// Keep WIDTHS in sync with that script.
export const WIDTHS = [400, 800, 1600] as const;
export type ImgWidth = (typeof WIDTHS)[number];

const OPTIMIZABLE = /^\/(?!_opt\/|refs\/).+\.(jpe?g|png)$/i;

export function isOptimizable(src: string): boolean {
  return OPTIMIZABLE.test(src);
}

/** URL of one resized variant, e.g. optSrc("/a/b.jpg", 800) -> "/_opt/a/b-800.webp". */
export function optSrc(src: string, width: ImgWidth): string {
  if (!isOptimizable(src)) return src;
  return `/_opt${src.replace(/\.(jpe?g|png)$/i, "")}-${width}.webp`;
}

/** Full srcset string for a local image, or undefined for anything else. */
export function optSrcSet(src: string): string | undefined {
  if (!isOptimizable(src)) return undefined;
  return WIDTHS.map((w) => `${optSrc(src, w)} ${w}w`).join(", ");
}
