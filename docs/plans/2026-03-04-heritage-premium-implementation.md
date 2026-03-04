# Heritage Premium Visual Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Elevate the Pune Global Group website to "Heritage Premium" — deep-warm full-bleed hero, gold gradient headings, richer section band rhythm, upgraded card treatments, and stronger typographic scale across Homepage, Infrastructure, and Products pages.

**Architecture:** Each page uses inline CSS-in-JS (template literal constants `GLOBAL_CSS`/`CSS` injected via `<style>` tags) alongside per-component inline styles. No external CSS modules or Tailwind. Changes target: (1) `globals.css` for site-wide tokens and utility classes, (2) each page's `C` token object and `GLOBAL_CSS` string, (3) the JSX inline styles for hero/section/card elements.

**Tech Stack:** Next.js 15, TypeScript, static export (`npm run build` → `out/`). Run `npm run dev` to preview. No test suite — verify with build success + visual inspection at `localhost:3000`.

**Design Reference:** `docs/plans/2026-03-04-heritage-premium-overhaul-design.md`

---

## Task 1: globals.css — Add deep-warm token and gold-text utility class

**Files:**
- Modify: `src/app/globals.css:1-9`

**Step 1: Add new CSS variables to `:root`**

Open `src/app/globals.css`. After the existing `:root` block (after line 9, before the dark mode media query), add `--deep-warm` and `--gold-start`/`--gold-end` tokens:

```css
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --accent: #F5A623;
  --accent-dark: #d4891a;
  --muted: #6b7280;
  --border: #e5e7eb;
  --surface: #f9fafb;
  --deep-warm: #2C1810;
  --gold-start: #F5A623;
  --gold-end: #FFD166;
}
```

**Step 2: Add `.gold-text` and `.card-heritage` utility classes at end of globals.css**

Append after the last line of `globals.css`:

```css
/* ── Heritage Premium utilities ─────────────────────────────── */
.gold-text {
  background: linear-gradient(135deg, var(--gold-start) 0%, var(--gold-end) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-heritage {
  background: #F0EAE0;
  border-bottom: 2px solid var(--gold-start);
  box-shadow: 0 2px 12px rgba(28,26,23,0.07);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.card-heritage:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 36px rgba(28,26,23,0.13);
}

.section-dark {
  background: var(--deep-warm);
  color: #FAF7F2;
}
```

**Step 3: Verify build passes**

```bash
cd C:/cpio_db/puneglobalgroup-website
npm run build
```
Expected: Build completes with no errors. If you see CSS errors, check for missing semicolons.

**Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add Heritage Premium global tokens and utility classes"
```

---

## Task 2: Homepage — Upgrade C tokens and add new CSS classes

**Files:**
- Modify: `src/app/page.tsx:16-27` (C token object)
- Modify: `src/app/page.tsx:36-395` (GLOBAL_CSS string)

**Step 1: Add `deepWarm`, `goldStart`, `goldEnd` to the `C` token object**

Find the `C` object at line ~16 in `src/app/page.tsx`:

```typescript
const C = {
  cream:     "#FAF7F2",
  parchment: "#F0EAE0",
  charcoal:  "#1C1A17",
  warm:      "#4A4540",
  taupe:     "#7A736D",
  saffron:   "#F5A623",
  saffrondark: "#B8720D",
  dark:      "#141210",
  border:    "rgba(28,26,23,0.1)",
  borderMid: "rgba(28,26,23,0.16)",
};
```

Replace with:

```typescript
const C = {
  cream:     "#FAF7F2",
  parchment: "#F0EAE0",
  charcoal:  "#1C1A17",
  warm:      "#4A4540",
  taupe:     "#7A736D",
  saffron:   "#F5A623",
  saffrondark: "#B8720D",
  dark:      "#141210",
  deepWarm:  "#2C1810",
  goldStart: "#F5A623",
  goldEnd:   "#FFD166",
  border:    "rgba(28,26,23,0.1)",
  borderMid: "rgba(28,26,23,0.16)",
};
```

**Step 2: Add Heritage Premium CSS classes inside `GLOBAL_CSS`**

Inside the `GLOBAL_CSS` template literal (line ~36), find the `/* Buttons */` comment and BEFORE it, add:

```css
  /* ── Heritage Premium ───────────────────────────────────── */
  .gold-text {
    background: linear-gradient(135deg, ${C.goldStart} 0%, ${C.goldEnd} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline;
  }
  .section-dark {
    background: ${C.deepWarm};
    color: ${C.cream};
  }
  .card-heritage {
    background: ${C.parchment};
    border-bottom: 2px solid ${C.saffron};
    box-shadow: 0 2px 12px rgba(28,26,23,0.07);
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .card-heritage:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 36px rgba(28,26,23,0.13);
  }
  .saffron-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: ${C.saffron}; color: #fff;
    font-family: ${F.body}; font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.13em; text-transform: uppercase;
    padding: 5px 14px; border-radius: 20px;
  }
```

**Step 3: Run dev server and check for JS/CSS errors**

```bash
npm run dev
```
Visit `http://localhost:3000` — no red error overlay should appear.

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: homepage — add Heritage Premium tokens and CSS classes"
```

---

## Task 3: Homepage Hero — Deep warm background + gold gradient headline

**Files:**
- Modify: `src/app/page.tsx:515-600` (Hero section JSX)

**Step 1: Change hero section background to deep warm**

Find the Hero section's outer `<section>` element (around line 516):

```typescript
    <section style={{
      minHeight: "100vh", background: C.cream,
```

Change `background: C.cream` to `background: C.deepWarm`:

```typescript
    <section style={{
      minHeight: "100vh", background: C.deepWarm,
```

**Step 2: Make hero eyebrow text cream-coloured for dark background**

Find the eyebrow `<span>` (line ~528-530):

```typescript
            <span className="hero-eyebrow-text" style={{ fontFamily: F.italic, fontStyle: "italic",
              fontSize: "1.15rem", color: C.taupe }}>
```

Change `color: C.taupe` to `color: "rgba(250,247,242,0.65)"` and wrap it in the saffron badge. Replace the entire eyebrow div (lines ~526-537) with:

```typescript
          <div className="hero-eyebrow-anim"
            style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "3rem" }}>
            <span className="saffron-badge">
              Est. 1995 · Pune, India
            </span>
            <div className="hero-eyebrow-divider" style={{ flex: 1, height: "1px", background: "rgba(250,247,242,0.15)" }} />
            <span className="hero-eyebrow-est" style={{ fontFamily: F.body, fontSize: "0.7rem", color: "rgba(250,247,242,0.45)",
              letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              PP · Board · Paper
            </span>
          </div>
```

**Step 3: Upgrade H1 — larger scale + gold gradient on key word**

Find the `<h1>` starting at line ~540:

```typescript
          <h1 className="hero-headline" style={{
            fontFamily: F.display, fontWeight: 700,
            fontSize: "clamp(2.8rem, 5vw, 5rem)",
            lineHeight: 1.08, color: C.charcoal,
            letterSpacing: "-0.02em", marginBottom: "0",
          }}>
            <span className="hero-h1-line1" style={{ display: "block" }}>
              Engineered for Industry.
            </span>
            <span className="hero-h1-line2" style={{
              display: "block", fontSize: "0.72em", fontWeight: 400,
              letterSpacing: "0em", color: C.charcoal, marginTop: "0.18em",
            }}>
              Trusted{" "}
              <span style={{
                background: C.charcoal, color: C.cream,
                fontWeight: 700, fontStyle: "normal",
                padding: "0 10px 2px", borderRadius: "2px",
                display: "inline-block",
              }}>Across India.</span>
            </span>
          </h1>
```

Replace with:

```typescript
          <h1 className="hero-headline" style={{
            fontFamily: F.display, fontWeight: 900,
            fontSize: "clamp(3.2rem, 6vw, 5.5rem)",
            lineHeight: 1.06, color: C.cream,
            letterSpacing: "-0.02em", marginBottom: "0",
          }}>
            <span className="hero-h1-line1" style={{ display: "block" }}>
              Engineered for{" "}
              <span className="gold-text">Industry.</span>
            </span>
            <span className="hero-h1-line2" style={{
              display: "block", fontSize: "0.72em", fontWeight: 400,
              letterSpacing: "0em", color: "rgba(250,247,242,0.75)", marginTop: "0.22em",
            }}>
              Trusted Across India.
            </span>
          </h1>
```

**Step 4: Update the divider rule colour for dark background**

Find line ~564 (the horizontal rule):

```typescript
          <div className="hero-rule-anim"
            style={{ height: "1px", background: C.borderMid, margin: "2.75rem 0" }} />
```

Change background to `"rgba(250,247,242,0.15)"`:

```typescript
          <div className="hero-rule-anim"
            style={{ height: "1px", background: "rgba(250,247,242,0.15)", margin: "2.75rem 0" }} />
```

**Step 5: Update body text and CTA colours for dark background**

Find the `<p>` body text (line ~569):

```typescript
            <p style={{ fontFamily: F.body, fontSize: "1.05rem", lineHeight: 1.85,
              color: C.taupe, marginBottom: "2.5rem", fontWeight: 300 }}>
```

Change `color: C.taupe` to `color: "rgba(250,247,242,0.72)"`.

Find the `btn-primary` button link (line ~577):

```typescript
              <Link href="/products" className="btn-primary" style={{ textDecoration: "none" }}>
```

No change needed (btn-primary is charcoal bg which reads fine on deep warm).

Find `btn-outline` (line ~580):

```typescript
              <button className="btn-outline" onClick={scrollToContact}>
```

Add style to override for dark bg — `style={{ color: C.cream, borderColor: "rgba(250,247,242,0.35)" }}`:

```typescript
              <button className="btn-outline" onClick={scrollToContact}
                style={{ color: C.cream, borderColor: "rgba(250,247,242,0.35)" }}>
```

**Step 6: Update stats text colours for dark background**

Find the `AnimatedStat` component (lines ~484-500). The stat number uses `C.saffrondark`. Change it to `C.goldEnd` (`#FFD166`) for better visibility on dark:

```typescript
      <div style={{ fontFamily: F.display, fontWeight: 700,
        fontSize: "2.2rem", color: C.goldEnd, lineHeight: 1,
```

The label below uses `C.charcoal` — change to `C.cream`:

```typescript
      <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: "0.7rem",
        color: C.cream, letterSpacing: "0.05em", textTransform: "uppercase" }}>
```

The note uses `C.taupe` — change to `"rgba(250,247,242,0.6)"`:

```typescript
      <div style={{ fontFamily: F.italic, fontStyle: "italic",
        fontSize: "1.15rem", color: "rgba(250,247,242,0.6)" }}>
```

Find the stat box border in Hero JSX (line ~590):

```typescript
                borderLeft: `1px solid ${C.borderMid}`,
                borderRight: i === stats.length - 1 ? `1px solid ${C.borderMid}` : "none",
```

Change to `"rgba(250,247,242,0.18)"`:

```typescript
                borderLeft: `1px solid rgba(250,247,242,0.18)`,
                borderRight: i === stats.length - 1 ? `1px solid rgba(250,247,242,0.18)` : "none",
```

**Step 7: Add clip-path diagonal transition to hero section**

Add `clipPath` to the hero's outer section style:

```typescript
    <section style={{
      minHeight: "100vh", background: C.deepWarm,
      display: "flex", flexDirection: "column", justifyContent: "center",
      padding: "clamp(50px, 8vh, 90px) clamp(1.5rem, 5vw, 4rem) clamp(48px, 8vh, 80px)",
      clipPath: "polygon(0 0, 100% 0, 100% 96%, 0 100%)",
      marginBottom: "-3rem",
      position: "relative", zIndex: 1,
    }}>
```

**Step 8: Verify visually**

```bash
npm run dev
```
Visit `http://localhost:3000`. The hero should now show:
- Deep espresso (`#2C1810`) background
- Saffron pill badge with "Est. 1995 · Pune, India"
- "Engineered for **Industry.**" with gold gradient on "Industry."
- Cream body text and stats
- Diagonal clip-path into next section

**Step 9: Build check**

```bash
npm run build
```
Expected: exits 0, no TypeScript errors.

**Step 10: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: homepage hero — deep warm bg, gold gradient H1, cream text"
```

---

## Task 4: Homepage — Business Lines cards upgrade

**Files:**
- Modify: `src/app/page.tsx` (BusinessLines/Services section JSX)

**Step 1: Find the Business Lines section**

Search for `.svc-card` in `page.tsx` — this is the services/business-lines section. Find the section background and update it from `C.cream` to `C.parchment` for alternating band contrast:

Find: `background: C.cream` in the services section outer `<section>` tag and change to `background: C.parchment`.

**Step 2: Apply `.card-heritage` class to each service card**

Find each `svc-card` element. Add `card-heritage` to the `className`:

Before:
```typescript
<div className="svc-card" style={{ background: C.parchment, ... }}>
```

After (remove background from inline style since card-heritage provides it):
```typescript
<div className="svc-card card-heritage" style={{ padding: "2.5rem 2rem", borderRadius: "2px" }}>
```

**Step 3: Add a saffron icon circle to each service card heading**

Inside each service card, wrap the icon element in a saffron circle container before the existing icon:

```typescript
<div style={{
  width: 48, height: 48, borderRadius: "50%",
  background: C.saffron, display: "flex", alignItems: "center", justifyContent: "center",
  marginBottom: "1.25rem",
}}>
  {/* existing icon here, size 22, color #fff */}
</div>
```

**Step 4: Increase section heading scale**

Find the section `<h2>` heading above the cards grid. Update:

```typescript
fontSize: "clamp(2rem, 3.5vw, 3rem)"
```

to:

```typescript
fontSize: "clamp(2.2rem, 4vw, 3.5rem)", fontWeight: 700,
```

And if the heading doesn't already use gold gradient on a key word, wrap the key word in `<span className="gold-text">`:

```typescript
<h2>Our <span className="gold-text">Business Lines</span></h2>
```

**Step 5: Verify and commit**

```bash
npm run dev
# Check http://localhost:3000 — cards should have parchment bg, saffron bottom border, lift on hover

npm run build
git add src/app/page.tsx
git commit -m "feat: homepage — Heritage Premium service card treatment"
```

---

## Task 5: Homepage — Stats band upgrade (deep warm full-bleed)

**Files:**
- Modify: `src/app/page.tsx` (infra metrics / stats band section)

**Step 1: Find the stats band section**

Search for `infra-metrics-grid` in `page.tsx`. This is the "key metrics" section. Find its outer section element.

**Step 2: Change stats band to deep warm**

Change the section background to `C.deepWarm` and text to cream:

```typescript
<section style={{
  background: C.deepWarm,
  padding: "clamp(4rem, 8vh, 7rem) clamp(1.5rem, 5vw, 4rem)",
}}>
```

**Step 3: Update stat numbers to gold gradient**

For each stat number in the metrics grid, add `className="gold-text"` to the number element and increase font size to `clamp(3rem, 5vw, 4rem)`:

```typescript
<div className="gold-text" style={{
  fontFamily: F.display, fontWeight: 900,
  fontSize: "clamp(3rem, 5vw, 4rem)", lineHeight: 1,
}}>
  {stat.value}
</div>
```

**Step 4: Update label text to cream**

Change stat label colour from `C.taupe` to `"rgba(250,247,242,0.7)"`.

**Step 5: Update section heading to cream with gold accent**

Find the H2 heading for this section and update:

```typescript
<h2 style={{ color: C.cream, fontFamily: F.display, fontWeight: 700 }}>
  Our <span className="gold-text">Scale</span>
</h2>
```

**Step 6: Verify and commit**

```bash
npm run dev
# Stats band should be deep espresso with gold numbers

npm run build
git add src/app/page.tsx
git commit -m "feat: homepage — Heritage Premium stats band dark section"
```

---

## Task 6: Homepage — Industries section and Contact section polish

**Files:**
- Modify: `src/app/page.tsx` (Industries and Contact sections)

**Step 1: Industries section — cream bg, upgrade tiles**

Find the industries section. Ensure its background is `C.cream` (alternating from parchment above).

Find `.industry-tile` CSS class in GLOBAL_CSS and upgrade:

```css
  .industry-tile {
    background: ${C.cream};
    border: 1px solid ${C.border};
    border-bottom: 2px solid transparent;
    padding: 2rem 1.75rem;
    border-radius: 2px;
    transition: border-color 0.22s, background 0.22s, transform 0.22s;
  }
  .industry-tile:hover {
    border-bottom-color: ${C.saffron};
    background: #fff;
    transform: translateY(-3px);
  }
```

**Step 2: Contact section — parchment background**

Find the contact section. Change its background to `C.parchment` (alternating band):

```typescript
<section id="contact" style={{ background: C.parchment, ... }}>
```

**Step 3: Contact form — saffron focus ring**

Find `.form-input` in GLOBAL_CSS and update the focus state:

```css
  .form-input:focus {
    border-color: ${C.saffron};
    box-shadow: 0 0 0 3px rgba(245,166,35,0.15);
  }
```

**Step 4: Contact submit button — saffron primary**

Find the submit button in the contact form JSX. Change from charcoal to saffron:

```typescript
<button type="submit" style={{
  background: C.saffron, color: "#fff",
  border: "none", padding: "13px 32px",
  fontFamily: F.body, fontWeight: 600,
  fontSize: "0.82rem", letterSpacing: "0.09em",
  textTransform: "uppercase", cursor: "pointer",
  borderRadius: "2px",
  transition: "background 0.2s, transform 0.15s",
}}>
  Send Message
</button>
```

**Step 5: Verify and commit**

```bash
npm run dev
npm run build
git add src/app/page.tsx
git commit -m "feat: homepage — industries tile upgrade + contact saffron polish"
```

---

## Task 7: Infrastructure page — Add Heritage Premium tokens and hero

**Files:**
- Modify: `src/app/infrastructure/page.tsx:32-42` (C tokens)
- Modify: `src/app/infrastructure/page.tsx:50-80` (GLOBAL_CSS)
- Modify: `src/app/infrastructure/page.tsx` (hero section JSX)

**Step 1: Add deepWarm and gold tokens to the `C` object**

Find the `C` object (line ~32):

```typescript
const C = {
  cream: "#FAF7F2",
  parchment: "#F0EAE0",
  charcoal: "#1C1A17",
  warm: "#4A4540",
  taupe: "#7A736D",
  saffron: "#F5A623",
  dark: "#141210",
  border: "rgba(28,26,23,0.1)",
  borderMid: "rgba(28,26,23,0.16)",
};
```

Replace with:

```typescript
const C = {
  cream: "#FAF7F2",
  parchment: "#F0EAE0",
  charcoal: "#1C1A17",
  warm: "#4A4540",
  taupe: "#7A736D",
  saffron: "#F5A623",
  deepWarm: "#2C1810",
  goldStart: "#F5A623",
  goldEnd: "#FFD166",
  dark: "#141210",
  border: "rgba(28,26,23,0.1)",
  borderMid: "rgba(28,26,23,0.16)",
};
```

**Step 2: Add Heritage Premium CSS classes to GLOBAL_CSS**

Inside the `GLOBAL_CSS` template literal, after the `.sr` class definition, add:

```css
  /* ── Heritage Premium ─────────────────────────────── */
  .gold-text {
    background: linear-gradient(135deg, ${C.goldStart} 0%, ${C.goldEnd} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline;
  }
  .saffron-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: ${C.saffron}; color: #fff;
    font-family: 'DM Sans', sans-serif; font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.13em; text-transform: uppercase;
    padding: 5px 14px; border-radius: 20px;
  }
  .card-heritage {
    background: ${C.parchment};
    border-bottom: 2px solid ${C.saffron};
    box-shadow: 0 2px 12px rgba(28,26,23,0.07);
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .card-heritage:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 36px rgba(28,26,23,0.13);
  }
```

**Step 3: Find and upgrade the infrastructure page hero section**

Search for the page's main hero `<section>` (it will have the page title "Our Infrastructure" or similar, with background `C.cream` or `C.parchment`).

Change the hero section background to `C.deepWarm`:

```typescript
<section style={{
  background: C.deepWarm,
  padding: "clamp(100px, 15vh, 140px) clamp(1.5rem, 5vw, 4rem) clamp(4rem, 8vh, 7rem)",
  clipPath: "polygon(0 0, 100% 0, 100% 94%, 0 100%)",
  marginBottom: "-2rem",
  position: "relative", zIndex: 1,
}}>
```

**Step 4: Update hero heading to gold gradient**

Find the `<h1>` in the infrastructure hero and change:
- `color: C.charcoal` → `color: C.cream`
- Wrap the key word in `<span className="gold-text">`
- Increase fontWeight to 900, fontSize to `"clamp(3rem, 6vw, 5rem)"`

Example:
```typescript
<h1 style={{ fontFamily: F.display, fontWeight: 900,
  fontSize: "clamp(3rem, 6vw, 5rem)", color: C.cream,
  lineHeight: 1.06, letterSpacing: "-0.02em" }}>
  Our <span className="gold-text">Infrastructure</span>
</h1>
```

**Step 5: Update hero eyebrow and subtext to cream**

Change any eyebrow or subtext colour from `C.taupe`/`C.charcoal` to cream variants:
- Eyebrow: use `.saffron-badge` class or `color: "rgba(250,247,242,0.65)"`
- Subtext: `color: "rgba(250,247,242,0.72)"`

**Step 6: Verify and commit**

```bash
npm run dev
# Visit http://localhost:3000/infrastructure
# Hero should be deep warm with gold gradient heading

npm run build
git add src/app/infrastructure/page.tsx
git commit -m "feat: infrastructure — Heritage Premium hero (dark bg + gold H1)"
```

---

## Task 8: Infrastructure page — Capability bar and machine/facility card upgrades

**Files:**
- Modify: `src/app/infrastructure/page.tsx` (stats/metrics section, machine cards)

**Step 1: Find the infrastructure metrics/capability section**

Search for metric values like "12,000 sq ft" or similar stats in the infrastructure page JSX.

**Step 2: Change capability bar section to parchment band**

Set the outer section to `background: C.parchment` and ensure it follows the hero section.

**Step 3: Update metric number styling**

For each metric number in the capability bar, increase scale and add saffron colour:

```typescript
<div style={{
  fontFamily: F.display, fontWeight: 900,
  fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
  color: C.saffron, lineHeight: 1,
}}>
  {metric.value}
</div>
```

**Step 4: Apply card-heritage class to machine cards**

Find the machine/facility cards in the page JSX. Add `className="card-heritage"` and adjust padding. Remove any inline `background` or `border` that would conflict.

**Step 5: Add a CTA callout band at the bottom of the page**

Before the closing tag of the main content, add a deep-warm CTA band:

```typescript
<section style={{
  background: C.deepWarm,
  padding: "clamp(3rem, 6vh, 5rem) clamp(1.5rem, 5vw, 4rem)",
  textAlign: "center",
}}>
  <p style={{ fontFamily: F.display, fontStyle: "italic",
    fontSize: "1.1rem", color: "rgba(250,247,242,0.65)", marginBottom: "1rem" }}>
    Ready to partner?
  </p>
  <h2 style={{ fontFamily: F.display, fontWeight: 700,
    fontSize: "clamp(2rem, 4vw, 3rem)", color: C.cream,
    marginBottom: "2rem", lineHeight: 1.1 }}>
    Let&apos;s build something together.
  </h2>
  <Link href="/#contact" style={{
    display: "inline-flex", alignItems: "center", gap: "8px",
    background: C.saffron, color: "#fff",
    fontFamily: F.body, fontWeight: 600, fontSize: "0.82rem",
    letterSpacing: "0.09em", textTransform: "uppercase",
    padding: "13px 32px", borderRadius: "2px", textDecoration: "none",
  }}>
    Contact Us <IconArrowRight size={14} />
  </Link>
</section>
```

Note: You'll need `import Link from "next/link"` and the relevant icon import if not already present.

**Step 6: Verify and commit**

```bash
npm run dev
npm run build
git add src/app/infrastructure/page.tsx
git commit -m "feat: infrastructure — capability bar, card-heritage treatment, CTA band"
```

---

## Task 9: Products page — Heritage Premium tokens and hero

**Files:**
- Modify: `src/app/products/page.tsx:5-21` (C and F tokens)
- Modify: `src/app/products/page.tsx:23-onward` (CSS constant)
- Modify: `src/app/products/page.tsx` (hero JSX)

**Step 1: Add missing saffron, deepWarm, gold tokens to `C`**

Find the `C` object (line ~5):

```typescript
const C = {
  cream:     "#FAF7F2",
  parchment: "#F0EAE0",
  charcoal:  "#1C1A17",
  warm:      "#4A4540",
  taupe:     "#7A736D",
  navy:      "#1A1A1A",
  navyMid:   "#242424",
  border:    "rgba(28,26,23,0.10)",
  borderMid: "rgba(28,26,23,0.16)",
};
```

Replace with:

```typescript
const C = {
  cream:     "#FAF7F2",
  parchment: "#F0EAE0",
  charcoal:  "#1C1A17",
  warm:      "#4A4540",
  taupe:     "#7A736D",
  saffron:   "#F5A623",
  deepWarm:  "#2C1810",
  goldStart: "#F5A623",
  goldEnd:   "#FFD166",
  navy:      "#1A1A1A",
  navyMid:   "#242424",
  border:    "rgba(28,26,23,0.10)",
  borderMid: "rgba(28,26,23,0.16)",
};
```

**Step 2: Add Heritage Premium CSS classes to the CSS constant**

Inside the CSS template literal (after the existing `.nav-link` styles), add:

```css
  /* ── Heritage Premium ─────────────────────────────── */
  .gold-text {
    background: linear-gradient(135deg, ${C.goldStart} 0%, ${C.goldEnd} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline;
  }
  .saffron-badge {
    display: inline-flex; align-items: center;
    background: ${C.saffron}; color: #fff;
    font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.13em; text-transform: uppercase;
    padding: 5px 14px; border-radius: 20px;
  }
  .card-heritage {
    background: ${C.parchment};
    border-bottom: 2px solid ${C.saffron};
    box-shadow: 0 2px 12px rgba(28,26,23,0.07);
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .card-heritage:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 36px rgba(28,26,23,0.13);
  }
```

**Step 3: Find and upgrade the products page hero**

The products page currently has a full-bleed category panel (`cat-row` with `cat-pp` and `cat-paper` cards). Find the page-level header/hero section ABOVE the categories row.

If there is a hero section, update it to deep warm with gold gradient H1.
If the category row IS the hero, add a dark header band above it:

```typescript
{/* Heritage hero band */}
<section style={{
  background: C.deepWarm,
  padding: "clamp(90px, 14vh, 130px) clamp(1.5rem, 5vw, 4rem) clamp(3rem, 6vh, 5rem)",
}}>
  <div style={{ maxWidth: "800px" }}>
    <span className="saffron-badge" style={{ marginBottom: "1.5rem", display: "inline-flex" }}>
      Packaging Solutions
    </span>
    <h1 style={{
      fontFamily: F.display, fontWeight: 900,
      fontSize: "clamp(3rem, 6vw, 5rem)", color: C.cream,
      lineHeight: 1.06, letterSpacing: "-0.02em",
      marginTop: "1rem", marginBottom: "1.25rem",
    }}>
      Our <span className="gold-text">Products</span>
    </h1>
    <p style={{
      fontFamily: F.italic, fontStyle: "italic",
      fontSize: "1.2rem", color: "rgba(250,247,242,0.65)",
      lineHeight: 1.6,
    }}>
      Precision-engineered packaging for automotive, pharma, FMCG and industrial sectors.
    </p>
  </div>
</section>
```

**Step 4: Verify and commit**

```bash
npm run dev
# Visit http://localhost:3000/products
# Deep warm hero with gold "Products" should appear above category cards

npm run build
git add src/app/products/page.tsx
git commit -m "feat: products — Heritage Premium tokens, CSS classes, dark hero"
```

---

## Task 10: Products page — Card upgrades and catalogue CTA band

**Files:**
- Modify: `src/app/products/page.tsx` (category cards, product grid cards)

**Step 1: Upgrade the category card overlay text**

In the `.cat-pp` and `.cat-paper` category cards, find the title text elements.

For `cat-pp` (dark card), the text is already light — verify it uses `C.cream`.

For `cat-paper` (warm card), change text from dark to charcoal with saffron accent underline on the title.

**Step 2: Upgrade the product detail cards**

Search for the product grid cards (they likely have a `product-card` className or inline border/background styles).

For each product card, add `card-heritage` class:

```typescript
<div className="card-heritage" style={{ padding: "1.5rem", borderRadius: "2px" }}>
```

Remove any inline `background`, `border-bottom`, or `box-shadow` that conflicts with `card-heritage`.

Add a saffron category badge above the product name:

```typescript
<span className="saffron-badge" style={{ marginBottom: "0.75rem", fontSize: "0.62rem" }}>
  {product.category}
</span>
```

**Step 3: Add "Request a Catalogue" CTA band at bottom**

At the bottom of the main products page content, add:

```typescript
<section style={{
  background: C.deepWarm,
  padding: "clamp(3rem, 6vh, 5rem) clamp(1.5rem, 5vw, 4rem)",
  textAlign: "center",
}}>
  <h2 style={{
    fontFamily: F.display, fontWeight: 700,
    fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
    color: C.cream, marginBottom: "1rem", lineHeight: 1.1,
  }}>
    Request a <span className="gold-text">Product Catalogue</span>
  </h2>
  <p style={{ fontFamily: F.body, fontSize: "1rem",
    color: "rgba(250,247,242,0.65)", marginBottom: "2rem" }}>
    Get our full range specifications delivered to your inbox.
  </p>
  <Link href="/#contact" style={{
    display: "inline-flex", alignItems: "center", gap: "8px",
    background: C.saffron, color: "#fff",
    fontFamily: F.body, fontWeight: 600, fontSize: "0.82rem",
    letterSpacing: "0.09em", textTransform: "uppercase",
    padding: "13px 32px", borderRadius: "2px", textDecoration: "none",
  }}>
    Contact Us
  </Link>
</section>
```

**Step 4: Verify and commit**

```bash
npm run dev
npm run build
git add src/app/products/page.tsx
git commit -m "feat: products — Heritage card treatment + catalogue CTA band"
```

---

## Task 11: Reality Checker audit pass

Now that all three pages are updated, run a systematic audit before deploying.

**Step 1: Build and check for errors**

```bash
npm run build
```
Expected: zero TypeScript errors, zero build failures. If errors appear, fix them before proceeding.

**Step 2: Visual audit checklist (run dev, open browser)**

```bash
npm run dev
```

Check each item:

**Homepage `http://localhost:3000`:**
- [ ] Hero: deep warm (`#2C1810`) background visible
- [ ] Hero: "Industry." renders in gold gradient (not plain text)
- [ ] Hero: saffron pill badge shows "Est. 1995 · Pune, India"
- [ ] Hero: stats numbers in gold/cream (not charcoal)
- [ ] Hero: diagonal clip-path visible transitioning into next section
- [ ] Business lines: cards have parchment bg + saffron bottom border + lift on hover
- [ ] Stats band: deep warm bg with gold gradient numbers
- [ ] Contact: saffron focus ring on form inputs
- [ ] Mobile (375px): no horizontal scroll, all sections stack

**Infrastructure `http://localhost:3000/infrastructure`:**
- [ ] Hero: deep warm bg, gold gradient "Infrastructure"
- [ ] Capability bar: parchment band with large saffron numbers
- [ ] Machine cards: card-heritage treatment (parchment + saffron bottom border)
- [ ] CTA band at bottom: deep warm with saffron button

**Products `http://localhost:3000/products`:**
- [ ] Hero band above categories: deep warm with gold "Products"
- [ ] Product cards: card-heritage treatment
- [ ] Catalogue CTA band: deep warm at page bottom

**Step 3: Fix any visual discrepancies found**

For each failed item, find the relevant JSX or CSS and correct it. Commit each fix:

```bash
git add src/app/<page>/page.tsx
git commit -m "fix: <description of what was corrected>"
```

**Step 4: Final build verification**

```bash
npm run build
```
Expected: clean build.

---

## Task 12: Deploy to Firebase Hosting

**Step 1: Push to master branch**

```bash
git push origin master
```

GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
1. Run lint
2. Build with Firebase env vars from secrets
3. Deploy to Firebase Hosting at `https://puneglobalgroup.in`

**Step 2: Monitor the GitHub Actions run**

Go to the GitHub repo → Actions tab → watch the workflow triggered by the push.

**Step 3: Verify on live site**

Once the workflow completes (green), visit `https://puneglobalgroup.in` and repeat the visual audit checklist from Task 11.

---

## Summary of Changes

| File | What changes |
|------|-------------|
| `src/app/globals.css` | Add `--deep-warm`, `--gold-start`, `--gold-end` vars; add `.gold-text`, `.card-heritage`, `.section-dark` utilities |
| `src/app/page.tsx` | C tokens + deepWarm/gold; GLOBAL_CSS classes; hero → deep warm + gold H1; business cards → card-heritage; stats band → dark; contact → saffron |
| `src/app/infrastructure/page.tsx` | C tokens; hero → deep warm + gold H1; capability bar; machine cards → card-heritage; bottom CTA band |
| `src/app/products/page.tsx` | C tokens + saffron/deepWarm; hero band added; product cards → card-heritage; catalogue CTA band |
