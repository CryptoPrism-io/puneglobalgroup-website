# PGG Product Shot Plan
**Brand:** Pune Global Group · Saffron `#F5A623` · Dark `#0f1218` · Cream `#F5F0E8`
**Style reference:** DS Smith product renders — clean studio, soft shadows, PGG logo on packaging

---

## Product Images (9 Shots)

| # | Product | Angle | Background | Branding Detail | Google Image Search Keywords |
|---|---------|-------|------------|-----------------|------------------------------|
| 1 | PP Foldable Collapsible Box | 3/4 isometric, slight elevation | Pure white, soft drop shadow | Saffron side panels, PGG logo embossed front face | `PP foldable collapsible box industrial packaging product render studio` |
| 2 | PP Automotive Part Tray (grid dividers) | Top-down flat lay | Light grey seamless | Grid divider in saffron, "PGG" debossed corner | `PP polypropylene automotive parts tray corrugated dividers top view` |
| 3 | PP Corrugated Sheet Stack | Side profile, slight angle | White, subtle gradient | Saffron edge stripe, PGG label on top sheet | `PP corrugated flute sheet stack side profile industrial packaging` |
| 4 | PP Honeycomb Separator / Layer Pad | 45° editorial tilt | Off-white, linen texture | Saffron perimeter border, PGG watermark center | `PP honeycomb separator layer pad packaging editorial product shot` |
| 5 | Heavy-Duty PP Corrugated Crate | Front 3/4, lid open | Dark charcoal gradient | Saffron latch detail, "PUNE GLOBAL GROUP" stencil side | `heavy duty PP polypropylene corrugated crate industrial returnable packaging` |
| 6 | PP Layer Pads (fanned stack) | 45° fan spread | Clean white | Saffron edge print, stacked height showing flute profile | `PP layer pad fan stack product photography packaging` |
| 7 | ESD Conductive PP Bin | 3/4 isometric | Dark studio, slight vignette | Black conductive finish, saffron ESD symbol, PGG label | `ESD conductive polypropylene bin anti-static packaging product render` |
| 8 | Export-Ready Pallet (PGG-branded boxes, shrink-wrapped) | Wide environmental shot | Warehouse floor, shallow DOF | Saffron boxes, "PUNE GLOBAL GROUP — EXPORT READY" label visible | `export pallet shrink wrapped branded packaging warehouse industrial photography` |
| 9 | Full Product Family Flat Lay | Top-down, styled flat lay | White seamless, consistent shadows | All products arranged, PGG logo card center | `industrial packaging product family flat lay top view studio photography` |

---

## Hero Video (30 sec — Veo 2)

| Segment | Duration | Content | Search Keywords |
|---------|----------|---------|-----------------|
| 1 — Factory Floor | 0–6s | Aerial tilt-down into PP sheet extruder line, warm industrial lighting | `PP polypropylene sheet extrusion factory floor aerial b-roll` |
| 2 — Forming | 6–12s | Close-up of tray being die-cut/formed, hands placing tray stack, satisfying motion | `corrugated tray forming machine close up industrial manufacturing b-roll` |
| 3 — Quality Check | 12–18s | Worker measuring tray with caliper, stacking finished boxes, clean gloves | `industrial packaging quality control inspection calipers manufacturing footage` |
| 4 — Branding / Label | 18–22s | PGG-branded saffron box sliding on conveyor, logo sharp in frame | `branded packaging conveyor belt product close up manufacturing b-roll` |
| 5 — Export Pallet | 22–28s | Forklift wrapping shrink-film around pallet of PGG boxes, wide warehouse | `forklift pallet wrap export warehouse industrial b-roll` |
| 6 — End card | 28–30s | Static: PGG logo on dark background, tagline "Manufactured to Export." | `logo reveal dark background minimal motion graphics` |

---

## Imagen 3 Prompt Template

Use this base prompt, swapping `[PRODUCT]`, `[ANGLE]`, `[DETAIL]`:

```
Photorealistic product render of a [PRODUCT], [ANGLE] view, clean white studio background,
soft directional lighting from upper left, subtle drop shadow. The packaging is saffron orange
(#F5A623) with dark charcoal (#0f1218) accents. "PGG" logo cleanly printed on the front panel.
[DETAIL]. High-end industrial packaging photography style, 8K, sharp focus, no people.
DS Smith product photography aesthetic.
```

### Per-product prompt additions

| # | `[PRODUCT]` | `[ANGLE]` | `[DETAIL]` |
|---|-------------|-----------|------------|
| 1 | PP foldable corrugated box, partially open | 3/4 isometric | Show the flute cross-section on cut edge, lid folded back |
| 2 | PP automotive parts tray with 6×4 grid dividers | top-down flat | Show individual cell compartments clearly, slight ruler in corner for scale |
| 3 | stack of 10 PP corrugated sheets | side profile 15° tilt | Show flute profile clearly on cut edges, slight fan spread |
| 4 | PP honeycomb separator panel | 45° editorial | Show hexagonal cell structure, translucent white PP material |
| 5 | heavy-duty PP corrugated crate with lid, lid open | front 3/4 | Show ribbed exterior walls, stacking lugs, interior visible |
| 6 | 5 PP layer pads fanned out | 45° fan | Show smooth surface and cut edge profile alternating |
| 7 | black ESD conductive PP bin with handle | 3/4 isometric | Show conductive carbon-black surface texture, yellow ESD ground symbol sticker |
| 8 | pallet of 12 branded PP boxes, clear shrink film over | wide environmental | Warehouse concrete floor, forklift in soft background blur |
| 9 | all 7 PP products arranged in flat lay | top-down | Small PGG logo card placed center, consistent shadows, props: caliper + spec sheet |

---

## Gemini API Setup

```bash
# Install
pip install google-generativeai pillow

# Set key
export GEMINI_API_KEY="your-key-here"

# Run generation script (to be created)
python generate-product-shots.py
```

**Models:**
- Images: `imagen-3.0-generate-002` (best quality, 1:1 and 16:9)
- Video: `veo-2.0-generate-001` (via Vertex AI, 720p, up to 30s)

**Output:** `public/products/shot-01.jpg` … `shot-09.jpg` + `public/hero-video.mp4`
