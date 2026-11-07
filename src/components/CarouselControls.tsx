"use client";

import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";

/**
 * Auto-advancing index with manual control.
 * - advances every `delay` ms while not paused
 * - any manual change (arrow, dot, swipe) restarts the timer, so the image
 *   you just picked stays on screen for a full interval
 */
export function useCarousel(count: number, { delay = 4000, paused = false } = {}) {
  const [idx, setIdx] = useState(0);
  const [tick, setTick] = useState(0); // bumps on manual change to restart the timer

  useEffect(() => {
    if (paused || count < 2) return;
    const t = setTimeout(() => setIdx((c) => (c + 1) % count), delay);
    return () => clearTimeout(t);
  }, [idx, tick, paused, count, delay]);

  const go = useCallback((i: number) => {
    setIdx(((i % count) + count) % count);
    setTick((t) => t + 1);
  }, [count]);

  const touchX = useRef(0);
  const swipe = {
    onTouchStart: (e: TouchEvent) => { touchX.current = e.touches[0].clientX; },
    onTouchEnd: (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 36) go(dx < 0 ? idx + 1 : idx - 1);
    },
  };

  return { idx, go, next: () => go(idx + 1), prev: () => go(idx - 1), swipe };
}

const CSS = `
  .cc-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 3;
    width: 40px; height: 40px; border-radius: 50%; border: none; cursor: pointer;
    background: rgba(15,20,30,0.7); color: #fff; display: flex; box-shadow: 0 2px 8px rgba(0,0,0,0.25); align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.2s, background 0.2s; }
  .cc-arrow:hover { background: rgba(15,20,30,0.85); }
  .cc-arrow:focus-visible { opacity: 1; outline: 2px solid #9CC3EA; outline-offset: 2px; }
  .cc-prev { left: 10px; } .cc-next { right: 10px; }
  .cc-host:hover .cc-arrow { opacity: 1; }
  @media (hover: none) { .cc-arrow { opacity: 0.9; width: 36px; height: 36px; } }
  .cc-dots { position: absolute; left: 50%; bottom: 8px; transform: translateX(-50%); z-index: 3;
    display: flex; align-items: center; padding: 0 6px; border-radius: 999px; background: rgba(15,20,30,0.55); }
  .cc-dot { width: 28px; height: 28px; border: none; background: none; padding: 0; cursor: pointer;
    display: flex; align-items: center; justify-content: center; }
  .cc-dot span { display: block; width: 10px; height: 10px; border-radius: 50%;
    background: rgba(255,255,255,0.5); transition: background 0.2s, transform 0.2s; }
  .cc-dot[aria-current="true"] span { background: #fff; transform: scale(1.2); }
  .cc-count { position: absolute; top: 10px; left: 10px; z-index: 3; font: 600 0.75rem 'DM Sans', system-ui, sans-serif;
    color: #fff; background: rgba(15,20,30,0.6); padding: 3px 8px; border-radius: 4px; }
`;

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
  </svg>
);

/**
 * Arrows + dots + "2 / 3" counter for an image carousel.
 * Put it inside a position:relative container that has className "cc-host".
 */
export default function CarouselControls({
  count, idx, go, label = "image", showCount = true,
}: { count: number; idx: number; go: (i: number) => void; label?: string; showCount?: boolean }) {
  if (count < 2) return null;
  // Controls often sit inside links/cards: don't let clicks navigate or open anything
  const act = (e: React.MouseEvent, i: number) => { e.preventDefault(); e.stopPropagation(); go(i); };
  return (
    <>
      <style>{CSS}</style>
      <button type="button" className="cc-arrow cc-prev" aria-label={`Previous ${label}`} onClick={(e) => act(e, idx - 1)}>
        <Chevron dir="left" />
      </button>
      <button type="button" className="cc-arrow cc-next" aria-label={`Next ${label}`} onClick={(e) => act(e, idx + 1)}>
        <Chevron dir="right" />
      </button>
      <div className="cc-dots">
        {Array.from({ length: count }, (_, i) => (
          <button key={i} type="button" className="cc-dot" aria-label={`Show ${label} ${i + 1} of ${count}`}
            aria-current={i === idx ? "true" : undefined} onClick={(e) => act(e, i)}>
            <span />
          </button>
        ))}
      </div>
      {showCount && <span className="cc-count" aria-hidden="true">{idx + 1} / {count}</span>}
    </>
  );
}
