/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text -- alt is passed through ...rest */
"use client";

import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { optSrc, optSrcSet } from "@/lib/img";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  src: string;
  /** Rendered width hint for the browser, e.g. "(max-width: 768px) 100vw, 50vw". */
  sizes?: string;
  /** Above-the-fold image: load immediately with high priority. */
  priority?: boolean;
  /**
   * Set false to hold the download (e.g. a carousel slide not shown yet).
   * Once an image has loaded it stays loaded.
   */
  load?: boolean;
};

/**
 * <img> with responsive WebP srcset + lazy loading.
 * Falls back to a plain <img> for remote/SVG sources.
 */
export default function OptImg({
  src,
  sizes = "100vw",
  priority = false,
  load = true,
  loading,
  decoding,
  ...rest
}: Props) {
  const [armed, setArmed] = useState(load);
  useEffect(() => { if (load) setArmed(true); }, [load]);

  const srcSet = optSrcSet(src);
  const resolved = srcSet ? optSrc(src, 800) : src;

  return (
    <img
      {...rest}
      src={armed ? resolved : undefined}
      srcSet={armed ? srcSet : undefined}
      sizes={srcSet ? sizes : undefined}
      loading={loading ?? (priority ? "eager" : "lazy")}
      decoding={decoding ?? "async"}
      fetchPriority={priority ? "high" : rest.fetchPriority}
    />
  );
}

/**
 * For crossfading carousels: returns whether slide i should load yet.
 * Loads the current slide and the next one; keeps anything already shown.
 */
export function useSlideLoader(idx: number, count: number) {
  const seen = useRef<Set<number>>(new Set([0, count > 1 ? 1 : 0]));
  seen.current.add(idx);
  if (count > 1) seen.current.add((idx + 1) % count);
  return (i: number) => seen.current.has(i);
}
