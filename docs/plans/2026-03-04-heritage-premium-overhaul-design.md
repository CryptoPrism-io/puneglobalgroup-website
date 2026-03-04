# Heritage Premium Overhaul — Design Document
**Date**: 2026-03-04
**Approach**: B — Heritage Premium
**Scope**: Homepage, Infrastructure page, Products page
**Agents involved**: UX Researcher (audit), UI Designer (execution), Reality Checker (QA), Sprint Prioritizer (sequencing)

---

## 1. Design Philosophy

Keep the "warm merchant" identity — cream, parchment, saffron — but elevate it to feel premium and authoritative. The upgrade is achieved through:
- Dramatic typographic scale (not size creep — clear hierarchy jumps)
- Full-bleed deep-warm sections that create bold section rhythm
- Gold gradient text on hero and key headings
- Textured parchment cards with saffron accent lines
- Consistent alternating section bands for visual breathing room

---

## 2. Color System

| Token         | Value              | Usage                                     |
|---------------|--------------------|-------------------------------------------|
| cream         | `#FAF7F2`          | Primary background, default sections      |
| parchment     | `#F0EAE0`          | Alternate sections, card backgrounds      |
| deep warm     | `#2C1810`          | Hero, stats band, CTA band (full-bleed)   |
| saffron       | `#F5A623`          | Primary accent, CTAs, icons, active state |
| saffron dark  | `#B8720D`          | Stat numbers, prices (WCAG AA on cream)   |
| gold gradient | `#F5A623 → #FFD166`| Hero H1 key word, section H2 accents      |
| charcoal      | `#1C1A17`          | Body text on light backgrounds            |
| taupe         | `#7A736D`          | Muted/secondary text                      |
| warm border   | `rgba(28,26,23,0.12)` | Card borders, dividers                 |

---

## 3. Typography Scale

| Level        | Font                         | Weight | Desktop | Mobile |
|--------------|------------------------------|--------|---------|--------|
| Hero H1      | Playfair Display             | 900    | 88px    | 44px   |
| Section H2   | Playfair Display             | 700    | 48px    | 32px   |
| Card H3      | Playfair Display             | 600    | 24px    | 20px   |
| Body         | DM Sans                      | 400    | 17px    | 16px   |
| Label/eyebrow| DM Sans                      | 500    | 11px    | 11px   |
| Pull quote   | Cormorant Garamond italic    | 400    | 22px    | 18px   |

**Line heights**: Body 1.7, Headings 1.1, Labels 1.4
**Letter spacing**: Labels/eyebrows 0.18em ALL CAPS

---

## 4. Global Design Tokens (CSS variables to add/update)

```css
:root {
  --deep-warm: #2C1810;
  --gold-start: #F5A623;
  --gold-end: #FFD166;
  /* existing tokens retained */
}

.gold-text {
  background: linear-gradient(135deg, var(--gold-start), var(--gold-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-band-dark {
  background: var(--deep-warm);
  color: #FAF7F2;
}

.card-heritage {
  background: #F0EAE0;
  border-bottom: 2px solid var(--gold-start);
  box-shadow: 0 2px 12px rgba(28,26,23,0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-heritage:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(28,26,23,0.14);
}
```

---

## 5. Section Band Alternation Pattern

Every page follows this rhythm:
```
[deep-warm]   → Hero / page intro
[cream]       → First content section
[parchment]   → Second content section
[deep-warm]   → Stats / numbers band
[cream]       → Cards / grid section
[parchment]   → CTA / contact section
```

---

## 6. Homepage Design

### Hero
- **Background**: `#2C1810` full-bleed
- **Eyebrow**: Saffron pill badge — "Est. 1995 · Pune, India"
- **H1**: "Pune Global Group" — "Group" rendered with `.gold-text` gradient class, 88px Playfair Display 900
- **Subhead**: Cormorant Garamond italic 22px taupe — 1–2 line brand positioning statement
- **CTAs**: Saffron filled ("Explore Products") + cream ghost border ("Contact Us")
- **Stat bar**: 3 key stats — gold number, cream label, saffron vertical separator
- **Clip-path transition**: `polygon(0 0, 100% 0, 100% 92%, 0 100%)` into cream section

### Logo / Social Proof Strip
- Parchment band, existing marquee kept
- Increase vertical padding to 40px top/bottom
- Logo items: 48px tall (up from 36px)

### Business Lines / Services
- Cream section, 3-column grid
- Card: parchment bg, 24px Playfair H3, saffron bottom border rule, icon in saffron 40px circle
- Short 2-line descriptor, saffron arrow link with hover underline
- Hover: card lifts 4px

### Stats Band
- `#2C1810` full-bleed
- 4 stats: gold gradient number (64px Playfair 900), cream label below
- Saffron thin dividers between stats

### Industries Served
- Cream section
- Horizontal scroll carousel mobile, 4-col grid desktop
- Each industry: pill with icon + label, saffron active/hover state

### Contact Section
- Parchment bg, two-column: left = heading + address + phone/email, right = enquiry form
- Form: cream input bg, warm border, saffron focus outline
- Submit: saffron filled CTA button

---

## 7. Infrastructure Page Design

### Hero
- Same deep warm treatment as homepage hero
- H1: "Our Infrastructure" with gold gradient on "Infrastructure"
- Short 1-line subhead

### Capability Bar
- Parchment band below hero
- 4 icon + stat combos: warehouses count, sq ft, cities, years
- Saffron icons, charcoal number, taupe label

### Business Line Cards
- Alternating image-left / image-right layout
- Alternating cream / parchment section bg
- Large H2 (48px), 2–3 bullet capabilities, saffron CTA link with arrow
- Image: rounded 12px, subtle warm shadow

### CTA Callout
- Deep warm band: "Ready to partner?" headline + saffron CTA button

---

## 8. Products Page Design

### Hero
- Deep warm band, "Our Products" H1 with gold gradient
- Short positioning line

### Filter Pills
- Cream band: All | Auto | Pharma | FMCG | Tools
- Saffron filled = active, parchment ghost = inactive
- Smooth filter transition (CSS opacity/display)

### Product Grid
- 3-col desktop, 2-col tablet, 1-col mobile
- Card: parchment bg, product image in cream box (contained), H3 product name, saffron category badge, spec line in taupe, "Enquire" saffron ghost button
- Hover: lift 4px

### Catalogue CTA Band
- Deep warm full-bleed: "Request a Product Catalogue" + saffron CTA

---

## 9. Agents & Roles

| Agent               | Role in this overhaul                                              |
|---------------------|--------------------------------------------------------------------|
| UX Researcher       | Audit current pages for friction points before implementation      |
| UI Designer         | Produce final CSS classes, token updates, component styles         |
| UX Architect        | Define CSS system architecture, class naming, responsive breakpoints|
| Brand Guardian      | Verify all changes stay within the warm heritage brand envelope    |
| Reality Checker     | Post-implementation audit — verify all specs were actually applied |
| Sprint Prioritizer  | Sequence implementation into logical sprints                       |

---

## 10. Implementation Sequence (high level)

1. **Sprint 0** — Token updates: globals.css new variables, gold-text class, card-heritage class
2. **Sprint 1** — Homepage: hero → logos → business lines → stats → industries → contact
3. **Sprint 2** — Infrastructure page full redesign
4. **Sprint 3** — Products page full redesign + filter pills
5. **Sprint 4** — Reality Checker audit + fix pass
6. **Sprint 5** — Deploy to Firebase Hosting

---

## 11. Success Criteria

- Hero above-fold: single strong visual hierarchy, no visual ambiguity
- Section alternation: visually distinct bands, no two same-bg sections adjacent
- Card hover: every card has lift animation
- Mobile: all sections stack cleanly, no horizontal overflow
- Performance: Lighthouse score ≥ 90 after changes
- Brand: all colours within defined palette, no rogue greys or default blues
