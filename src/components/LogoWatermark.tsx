import type { CSSProperties } from "react";

/**
 * SVG mask that reveals content only through the Turiya logo mark shape.
 * Use LOGO_MASK_STYLE on any absolute-fill layer to clip it to the logo paths.
 * Black = hidden, White = visible in the mask SVG.
 */
const maskSvg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
  `<rect width="100" height="100" fill="black"/>` +
  `<g transform="rotate(-45 50 50)">` +
  `<path d="M6 6 L38 6 Q44 6,44 12 L18 38 Q12 44,6 44 L6 6 Z" fill="white"/>` +
  `<path d="M56 6 L94 6 L94 38 Q94 44,88 44 L56 12 Q56 6,62 6 Z" fill="white"/>` +
  `<path d="M94 56 L94 94 L62 94 Q56 94,56 88 L82 62 Q88 56,94 56 Z" fill="white"/>` +
  `<circle cx="25" cy="75" r="12" fill="white"/>` +
  `<circle cx="25" cy="75" r="5" fill="white"/>` +
  `<circle cx="25" cy="75" r="1.8" fill="white"/>` +
  `</g></svg>`;

const maskUrl = `url("data:image/svg+xml,${encodeURIComponent(maskSvg)}")`;

export const LOGO_MASK_STYLE: CSSProperties = {
  WebkitMaskImage: maskUrl,
  WebkitMaskSize: "82% 82%",
  WebkitMaskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskImage: maskUrl,
  maskSize: "82% 82%",
  maskPosition: "center",
  maskRepeat: "no-repeat",
};
