# Products Hero Animation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a minimal cream-stroke SVG process animation (Sheet → Die Cut → Box) to the right side of the Products page hero band.

**Architecture:** Inline SVG with CSS keyframe animations lives entirely inside `src/app/products/page.tsx`. The hero `<section>` becomes a flex row (text left, SVG right). Three CSS-animated stages cycle on a 9s loop. No external dependencies. Hidden on mobile.

**Tech Stack:** Next.js 15 / React, inline styles + `<style>` tag (existing pattern in this file), SVG, CSS animations.

---

### Task 1: Restructure hero band to flex row

**Files:**
- Modify: `src/app/products/page.tsx` (hero `<section>` block, lines ~211–235)

**Step 1: Add flex layout CSS to the existing `CSS` template string**

Inside the `CSS` const (around line 29), append:

```css
  /* ── Hero flex layout ─────────────────────────────── */
  .hero-band {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(2rem, 5vw, 4rem);
  }
  .hero-text { flex: 1; min-width: 0; }
  .hero-anim {
    flex-shrink: 0;
    width: 240px;
    opacity: 0.9;
  }
  @media (max-width: 680px) {
    .hero-anim { display: none; }
  }
```

**Step 2: Wrap hero section contents in `.hero-band` div**

Replace the inner `<div style={{ maxWidth: "800px" }}>` with:

```tsx
<div className="hero-band" style={{ maxWidth: "900px" }}>
  <div className="hero-text">
    {/* badge, h1, p — unchanged */}
  </div>
  <div className="hero-anim">
    {/* SVG goes here — Task 2 */}
  </div>
</div>
```

**Step 3: Verify build — no errors**

```bash
cd C:\cpio_db\puneglobalgroup-website && npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully` (or equivalent)

**Step 4: Commit**

```bash
git add src/app/products/page.tsx
git commit -m "feat: hero band flex layout for animation placeholder"
```

---

### Task 2: Add CSS keyframe animations for 3 stages

**Files:**
- Modify: `src/app/products/page.tsx` — CSS const

**Step 1: Append animation keyframes to the `CSS` const**

```css
  /* ── Process animation ────────────────────────────── */
  /* 9s loop: 0-33% sheet, 33-66% die-cut, 66-100% box */

  /* Stage 1 — flat sheet */
  @keyframes stg-sheet-in  { 0%{opacity:0;transform:translateX(-24px)} 8%{opacity:1;transform:translateX(0)} 30%{opacity:1} 36%{opacity:0} 100%{opacity:0} }
  .anim-sheet { animation: stg-sheet-in 9s linear infinite; }

  /* Stage 2 — die-cut outline */
  @keyframes stg-cut-in    { 0%,30%{opacity:0} 38%{opacity:1} 62%{opacity:1} 68%{opacity:0} 100%{opacity:0} }
  .anim-cut   { animation: stg-cut-in 9s linear infinite; }

  /* Stage 3 — finished box */
  @keyframes stg-box-in    { 0%,64%{opacity:0} 72%{opacity:1} 92%{opacity:1} 98%{opacity:0} 100%{opacity:0} }
  .anim-box   { animation: stg-box-in 9s linear infinite; }

  /* Stage dots */
  @keyframes dot-active { 0%{transform:scale(1)} 50%{transform:scale(1.5)} 100%{transform:scale(1)} }
  .dot-1 { animation: dot-active 9s linear infinite 0s; }
  .dot-2 { animation: dot-active 9s linear infinite 3s; }
  .dot-3 { animation: dot-active 9s linear infinite 6s; }
```

**Step 2: Verify build**

```bash
npm run build 2>&1 | tail -10
```

**Step 3: Commit**

```bash
git add src/app/products/page.tsx
git commit -m "feat: CSS keyframes for 3-stage process animation"
```

---

### Task 3: Build the SVG animation element

**Files:**
- Modify: `src/app/products/page.tsx` — `.hero-anim` div contents

**Step 1: Insert the SVG inside `.hero-anim`**

The SVG viewBox is `0 0 240 130`. All strokes use cream at two opacities:
- Passive: `rgba(250,247,242,0.35)`
- Active stroke: `rgba(250,247,242,0.70)`

Replace the `{/* SVG goes here */}` comment with:

```tsx
<svg viewBox="0 0 240 130" width="240" height="130"
  xmlns="http://www.w3.org/2000/svg"
  style={{ display: "block", overflow: "visible" }}>

  {/* ── Stage 1: Flat Sheet ── */}
  <g className="anim-sheet">
    {/* sheet body */}
    <rect x="20" y="30" width="90" height="70"
      fill="none" stroke="rgba(250,247,242,0.65)" strokeWidth="1.2" rx="1"/>
    {/* score lines vertical */}
    <line x1="50" y1="30" x2="50" y2="100" stroke="rgba(250,247,242,0.25)" strokeWidth="0.8" strokeDasharray="4 3"/>
    <line x1="80" y1="30" x2="80" y2="100" stroke="rgba(250,247,242,0.25)" strokeWidth="0.8" strokeDasharray="4 3"/>
    {/* score lines horizontal */}
    <line x1="20" y1="58" x2="110" y2="58" stroke="rgba(250,247,242,0.25)" strokeWidth="0.8" strokeDasharray="4 3"/>
    <line x1="20" y1="78" x2="110" y2="78" stroke="rgba(250,247,242,0.25)" strokeWidth="0.8" strokeDasharray="4 3"/>
    {/* edge thickness hint */}
    <rect x="20" y="30" width="3" height="70" fill="rgba(250,247,242,0.18)"/>
  </g>

  {/* ── Stage 2: Die-Cut Cross ── */}
  <g className="anim-cut">
    {/* center panel */}
    <rect x="75" y="40" width="50" height="50"
      fill="none" stroke="rgba(250,247,242,0.70)" strokeWidth="1.2" strokeDasharray="5 3"/>
    {/* top flap */}
    <rect x="75" y="18" width="50" height="22"
      fill="none" stroke="rgba(250,247,242,0.35)" strokeWidth="1" strokeDasharray="5 3"/>
    {/* bottom flap */}
    <rect x="75" y="90" width="50" height="20"
      fill="none" stroke="rgba(250,247,242,0.35)" strokeWidth="1" strokeDasharray="5 3"/>
    {/* left flap */}
    <rect x="50" y="40" width="25" height="50"
      fill="none" stroke="rgba(250,247,242,0.35)" strokeWidth="1" strokeDasharray="5 3"/>
    {/* right flap */}
    <rect x="125" y="40" width="22" height="50"
      fill="none" stroke="rgba(250,247,242,0.35)" strokeWidth="1" strokeDasharray="5 3"/>
  </g>

  {/* ── Stage 3: Finished Box (isometric outline) ── */}
  <g className="anim-box">
    {/* front face */}
    <rect x="95" y="52" width="58" height="52"
      fill="none" stroke="rgba(250,247,242,0.70)" strokeWidth="1.4" rx="1"/>
    {/* top face */}
    <polygon points="95,52 153,52 168,38 110,38"
      fill="none" stroke="rgba(250,247,242,0.50)" strokeWidth="1.2"/>
    {/* right face */}
    <polygon points="153,52 168,38 168,90 153,104"
      fill="none" stroke="rgba(250,247,242,0.40)" strokeWidth="1.2"/>
    {/* checkmark */}
    <circle cx="124" cy="78" r="9"
      fill="none" stroke="rgba(250,247,242,0.45)" strokeWidth="1"/>
    <path d="M118,78 L122,83 L130,71"
      fill="none" stroke="rgba(250,247,242,0.80)" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round"/>
  </g>

  {/* ── Stage dots ── */}
  <g>
    <circle className="dot-1" cx="108" cy="122" r="2.5" fill="rgba(250,247,242,0.55)"/>
    <circle className="dot-2" cx="120" cy="122" r="2.5" fill="rgba(250,247,242,0.55)"/>
    <circle className="dot-3" cx="132" cy="122" r="2.5" fill="rgba(250,247,242,0.55)"/>
  </g>
</svg>
```

**Step 2: Verify build**

```bash
npm run build 2>&1 | tail -10
```

Expected: clean build, no JSX attribute errors (note: React uses `strokeWidth`, `strokeDasharray`, `strokeLinecap` etc — camelCase)

**Step 3: Check visually in dev server**

```bash
npm run dev
```

Open `http://localhost:3000/products` — confirm animation plays, text layout holds, mobile hides the SVG.

**Step 4: Commit**

```bash
git add src/app/products/page.tsx
git commit -m "feat: cream-stroke process animation in products hero"
```

---

### Task 4: Polish — timing & dot sync fix

**Files:**
- Modify: `src/app/products/page.tsx` — CSS keyframes only

**Context:** The dots use `animation-delay` to sync with stage timing. Verify visually that:
- Dot 1 pulses during sheet stage (0–3s)
- Dot 2 pulses during cut stage (3–6s)
- Dot 3 pulses during box stage (6–9s)

If dots feel off, adjust the `dot-active` keyframe — the active peak (scale 1.5) should land at ~50% of each 3s window. The current keyframe with 9s duration + 0/3/6s delay achieves this mathematically; confirm it looks right.

**Step 1: Visual QA checklist**

- [ ] Animation loops cleanly (no jump at 9s boundary)
- [ ] Sheet stage: rect + score lines visible, clean fade in/out
- [ ] Die-cut stage: cross outline with dashed border
- [ ] Box stage: isometric outline + checkmark
- [ ] Dots cycle in sync with stages
- [ ] Right side only — hero text is unaffected
- [ ] On mobile (< 680px): animation is hidden, layout unchanged

**Step 2: Final commit if adjustments were made**

```bash
git add src/app/products/page.tsx
git commit -m "polish: sync animation dots and timing"
```

---

## Notes

- All SVG attributes must be camelCase in JSX (`strokeWidth`, not `stroke-width`)
- The hero `maxWidth` changes from `800px` → `900px` to give room for the side SVG
- No new files, no new dependencies — everything inline in `page.tsx`
- The animation is purely decorative: no ARIA labels needed, `aria-hidden="true"` can be added to the SVG if desired
