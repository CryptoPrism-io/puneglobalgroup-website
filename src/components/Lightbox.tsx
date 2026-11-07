/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { optSrc, optSrcSet } from "@/lib/img";

/**
 * Full-screen image viewer. Only mounted while open, so the large
 * version of an image is downloaded only when someone opens it.
 */
export default function Lightbox({
  images, start, alt, onClose,
}: { images: string[]; start: number; alt: string; onClose: () => void }) {
  const [i, setI] = useState(start);
  const n = images.length;
  const go = (d: number) => setI((c) => (c + d + n) % n);
  const touchX = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const src = images[i];
  const btn: React.CSSProperties = {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    width: 44, height: 44, borderRadius: "50%", border: "none", cursor: "pointer",
    background: "rgba(250,247,242,0.12)", color: "#FAF7F2", fontSize: 20,
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={alt} onClick={onClose}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(12,11,10,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "clamp(12px, 4vw, 48px)",
      }}>
      <img
        key={src}
        src={optSrc(src, 1600)}
        srcSet={optSrcSet(src)}
        sizes="100vw"
        alt={`${alt} — view ${i + 1}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 4, cursor: "default" }}
      />
      <button aria-label="Close" onClick={onClose}
        style={{ ...btn, top: 20, right: 20, transform: "none" }}>×</button>
      {n > 1 && (
        <>
          <button aria-label="Previous image" onClick={(e) => { e.stopPropagation(); go(-1); }} style={{ ...btn, left: 16 }}>‹</button>
          <button aria-label="Next image" onClick={(e) => { e.stopPropagation(); go(1); }} style={{ ...btn, right: 16 }}>›</button>
          <span style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", color: "rgba(250,247,242,0.7)", fontSize: 13 }}>
            {i + 1} / {n}
          </span>
        </>
      )}
    </div>
  );
}
