#!/usr/bin/env python3
"""
Generate ITC PSPD paper/board product images using Gemini REST API.

Products (10 total):
  Virgin Boards: Cyber XLPac GC1, Cyber XLPac GC2, Cyber Premium,
                 PearlXL Packaging, Carte Lumina, Safire Graphik, Cyber Oak
  Recycled Boards: Eco Natura, Eco Blanca, NeoWhite Bliss

Images per product: hero, engineering, usecase  →  30 total
Output: public/products/paper/[slug]-[type].jpg
Model: gemini-3.1-flash-image-preview | Temp: 1 | top_p: 0.07
"""
import sys, os, json, base64, time, urllib.request, urllib.error

sys.stdout.reconfigure(line_buffering=True, encoding="utf-8")

MODEL = "gemini-3.1-flash-image-preview"

def _load_api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY", "")
    if key:
        return key
    env_file = os.path.join(os.path.dirname(__file__), "..", ".env.local")
    if os.path.exists(env_file):
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line.startswith("GEMINI_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    print("ERROR: GEMINI_API_KEY not set.")
    print("  Set it as an environment variable:  export GEMINI_API_KEY=your_key")
    print("  Or add it to .env.local:            GEMINI_API_KEY=your_key")
    sys.exit(1)

API_KEY = _load_api_key()

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "products", "paper")
os.makedirs(ROOT, exist_ok=True)

# ─── System prompt ──────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """Ultra-realistic 8K commercial paper/board product photography.

SUBJECT: Coated paperboard and folding box board (FBB) — premium industrial packaging substrate.

MATERIAL VISUAL PROPERTIES:
- Coated paperboard appears as a rigid, smooth sheet with a bright white or near-white surface.
- The coated face is smooth, slightly glossy to semi-matte depending on grade; no visible fibre texture.
- The back of the board varies: coated back = white and smooth; uncoated back = cream/manila/grey-brown.
- Cut edges reveal multiple compressed layers: white clay coating, mechanical or chemical pulp plies,
  sometimes a grey-brown recycled core, then back coating or uncoated back.
- Sheets stack cleanly with perfectly aligned edges.
- The material is rigid and flat — not flexible, not paper-thin.

PHOTOGRAPHY STANDARDS:
Lighting: high-key neutral studio lighting, 5200K, multi-softbox, even diffusion, no harsh shadows.
Background: pure white seamless backdrop for hero and engineering shots.
Use-case: realistic converted packaging environment, professional product photography.
Camera: 50mm full-frame equivalent, accurate perspective, no distortion.
No branding, no logos, no watermarks, no text overlay unless specified in the prompt.
Export-grade commercial catalogue quality."""

# ─── Material shorthand ─────────────────────────────────────────────────────────
CROSS_SECTION = (
    "Where cross-section is visible at cut edges: multiple compressed plies are discernible — "
    "a thin bright white clay coating layer on top, then white/cream chemical pulp or mechanical pulp "
    "plies forming the bulk, then the back ply (white-coated back = white and smooth; "
    "manila back = cream/off-white uncoated; grey back = grey-brown recycled fibre)."
)

SHEET_STACK = (
    "The sheets are shown in a neat stack of 8–12 sheets, edges perfectly aligned, "
    "demonstrating the board's rigid flat caliper and crisp cut edges. "
    + CROSS_SECTION
)

# ─── Products ───────────────────────────────────────────────────────────────────
PRODUCTS = [

    # ── Cyber XLPac GC1 ─────────────────────────────────────────────────────────
    {
        "slug": "cyber-xlpac-gc1",
        "name": "Cyber XLPac GC1",
        "images": [
            (
                "cyber-xlpac-gc1-hero",
                (
                    "Ultra-realistic 8K commercial studio photography of a stack of premium ITC PSPD Cyber XLPac GC1 "
                    "folding box board (FBB). "
                    + SHEET_STACK +
                    " Grade specification: GC1 — both front and back are coated brilliant white. "
                    "Front face: smooth, high-brightness, slightly glossy clay-coated surface, uniformly white. "
                    "Back face: also smooth white coated. "
                    "Stack is photographed at a 30-degree angle showing the top face surface, one long edge, "
                    "and one short edge to reveal the multi-ply board cross-section. "
                    "GSM: 300 GSM, caliper approximately 0.42 mm. "
                    "White seamless studio background, 5200K diffused lighting, 50mm lens. "
                    "No branding, no text."
                )
            ),
            (
                "cyber-xlpac-gc1-engineering",
                (
                    "Ultra-clean technical cross-section diagram of GC1 Folding Box Board (FBB) construction. "
                    "White background, thin precise vector lines, no shading fills. "
                    "Show a layered cross-section view with clearly labelled plies from top to bottom: "
                    "1. Top coating (white clay coat, ~10 µm) — label in blue "
                    "2. Top chemical pulp ply (white, virgin fibre) — label in grey "
                    "3. Mechanical pulp bulk core (cream/light tan, multiple plies) — label in grey "
                    "4. Bottom chemical pulp ply (white, virgin fibre) — label in grey "
                    "5. Back coating (white clay coat) — label in blue "
                    "Dimension callouts: total caliper = 0.38–0.55 mm (for 240–400 GSM). "
                    "Title block lower right: 'Cyber XLPac GC1 / FBB GC1 / 200–400 GSM / ITC PSPD'. "
                    "Include a small legend: 'GC1 = Coated white back'. "
                    "Engineering documentation style, export-grade."
                )
            ),
            (
                "cyber-xlpac-gc1-usecase",
                (
                    "Ultra-realistic 8K commercial product photography of pharmaceutical and FMCG folding cartons "
                    "printed on premium white coated board. "
                    "Scene: 6–8 completed folding cartons arranged in an elegant flat-lay or slight 3D scatter. "
                    "Carton types: pharma medicine box, cosmetics carton, premium food carton — all converted from "
                    "GC1 coated board. Surfaces show high-quality offset printing — rich colours, sharp text. "
                    "Some cartons show hot-foil stamping accents. "
                    "Background: clean white surface with subtle studio gradient. "
                    "5200K, 50mm lens, overhead slight angle. Professional catalogue quality. No visible brand names."
                )
            ),
        ],
    },

    # ── Cyber XLPac GC2 ─────────────────────────────────────────────────────────
    {
        "slug": "cyber-xlpac-gc2",
        "name": "Cyber XLPac GC2",
        "images": [
            (
                "cyber-xlpac-gc2-hero",
                (
                    "Ultra-realistic 8K commercial studio photography of a stack of ITC PSPD Cyber XLPac GC2 "
                    "folding box board (FBB GC2). "
                    + SHEET_STACK +
                    " Grade specification: GC2 — coated white front, UNCOATED manila back. "
                    "Front face: smooth, high-brightness white clay-coated surface. "
                    "Back face: uncoated — natural cream/manila colour, slight paper texture visible. "
                    "Stack is photographed at 30-degree angle showing front face on top, "
                    "and the short edge cross-section clearly reveals white front coating, "
                    "multiple white/cream plies, and the uncoated cream manila back at bottom. "
                    "GSM: 280 GSM. White seamless studio background, 5200K, 50mm lens. No branding."
                )
            ),
            (
                "cyber-xlpac-gc2-engineering",
                (
                    "Ultra-clean technical cross-section diagram of GC2 Folding Box Board (FBB GC2). "
                    "White background, thin precise vector lines. "
                    "Layered cross-section from top to bottom: "
                    "1. Top coating (white clay coat) — labelled 'Coated front' "
                    "2. Top chemical pulp ply (white, virgin fibre) "
                    "3. Mechanical pulp bulk core (cream, multiple plies) "
                    "4. Bottom chemical pulp ply "
                    "5. Uncoated manila back (cream/off-white, no coating) — labelled 'Manila back (GC2)' "
                    "Dimension callout: caliper 0.35–0.55 mm. "
                    "Annotation box: 'GC2 = Uncoated manila back — higher bulk, better slip on filling lines'. "
                    "Title block: 'Cyber XLPac GC2 / FBB GC2 / 200–400 GSM / ITC PSPD'. "
                    "Engineering documentation style."
                )
            ),
            (
                "cyber-xlpac-gc2-usecase",
                (
                    "Ultra-realistic 8K commercial photography of liquor, spirits, and FMCG folding cartons "
                    "on a high-speed automated filling and packaging line. "
                    "Conveyor system with cartons being filled and closed at speed — motion slightly implied "
                    "in background. Foreground: 3–4 crisp white cartons with rich print quality, "
                    "some with embossed panels and foil accents. "
                    "One carton is shown partially open revealing the uncoated manila-cream interior back face. "
                    "Industrial packaging facility background, slightly defocused. "
                    "5200K neutral lighting, 50mm lens, three-quarter eye-level. No brand names."
                )
            ),
        ],
    },

    # ── Cyber Premium ────────────────────────────────────────────────────────────
    {
        "slug": "cyber-premium",
        "name": "Cyber Premium",
        "images": [
            (
                "cyber-premium-hero",
                (
                    "Ultra-realistic 8K luxury commercial studio photography of a stack of ITC PSPD Cyber Premium "
                    "premium folding box board. "
                    + SHEET_STACK +
                    " This is a top-tier premium FBB grade — highest brightness, exceptional surface smoothness, "
                    "superior print receptivity. "
                    "Front face: impeccably smooth, brilliant white, very high gloss clay coating — "
                    "almost mirror-like sheen visible where studio light reflects. "
                    "Back face: smooth white coated. "
                    "Stacked sheets show perfect caliper uniformity. "
                    "Set on a polished white acrylic surface for premium effect. "
                    "Hero lighting: one key softbox from 45 degrees to reveal the glossy surface sheen. "
                    "White seamless background, 5200K, 50mm lens. No branding."
                )
            ),
            (
                "cyber-premium-engineering",
                (
                    "Ultra-clean premium technical cross-section diagram of ITC PSPD Cyber Premium FBB board. "
                    "White background, precise vector lines, blue dimension annotations. "
                    "Cross-section layers from top to bottom: "
                    "1. Premium top coating — double-coat: base coat + top coat (smoother, higher brightness) "
                    "2. Top chemical pulp ply (highest purity, extra-white virgin fibre) "
                    "3. Mechanical pulp core (multiple high-bulk plies) "
                    "4. Bottom chemical pulp ply "
                    "5. White back coating "
                    "Callouts: 'ISO Brightness: 88–90 %', 'Smoothness: Bekk 600+ s', 'Double coat face'. "
                    "Title block: 'Cyber Premium / FBB Premium / 210–380 GSM / ITC PSPD'. "
                    "Engineering documentation style."
                )
            ),
            (
                "cyber-premium-usecase",
                (
                    "Ultra-realistic 8K luxury product photography of premium cosmetics, perfume, and gifting "
                    "folding cartons made from high-brightness premium coated board. "
                    "Scene: elegant display of 5–7 luxury cartons — perfume box, cosmetics carton, "
                    "premium chocolate box, premium gifting sleeve. "
                    "Surfaces show exceptional print quality — photographic images, gradient inks, "
                    "UV spot varnish on embossed panels, hot-foil gold and silver accents. "
                    "Arranged on a white marble surface with soft shadows. "
                    "Premium lifestyle photography aesthetic. 5200K, 50mm lens, three-quarter overhead. "
                    "No visible brand names."
                )
            ),
        ],
    },

    # ── PearlXL Packaging ────────────────────────────────────────────────────────
    {
        "slug": "pearlxl-packaging",
        "name": "PearlXL Packaging",
        "images": [
            (
                "pearlxl-packaging-hero",
                (
                    "Ultra-realistic 8K commercial studio photography of a stack of ITC PSPD PearlXL Packaging board. "
                    + SHEET_STACK +
                    " PearlXL is a premium coated board with a pearl-lustre surface finish — "
                    "the surface has a soft luminous sheen rather than a high-gloss finish, "
                    "similar to coated art board with pearl pigment in the top coat. "
                    "Front face: brilliant white, ultra-smooth, pearl-satin sheen — "
                    "studio light creates a soft even highlight across the surface. "
                    "The surface appears to glow with an even diffused lustre. "
                    "Back face: smooth white. "
                    "White seamless studio background, 5200K, two-softbox setup to capture the pearl sheen. "
                    "50mm lens, 30-degree angle. No branding."
                )
            ),
            (
                "pearlxl-packaging-engineering",
                (
                    "Ultra-clean technical cross-section diagram of ITC PSPD PearlXL Packaging board construction. "
                    "White background, vector lines, blue annotations. "
                    "Layers from top to bottom: "
                    "1. Pearl-effect top coat (special clay + pearl pigment) — labelled 'Pearl-lustre coat' "
                    "2. Base coat "
                    "3. Top chemical pulp ply (white virgin fibre) "
                    "4. Multi-ply bulk core "
                    "5. Bottom ply + back coating "
                    "Callout: 'Pearl-lustre surface — Bekk smoothness 800+ s', 'High bulk for yield'. "
                    "Title block: 'PearlXL Packaging / Premium Coated Board / ITC PSPD'. "
                    "Engineering documentation style."
                )
            ),
            (
                "pearlxl-packaging-usecase",
                (
                    "Ultra-realistic 8K commercial photography of premium FMCG and personal care packaging "
                    "converted from pearl-finish coated board. "
                    "Scene: 6 premium product cartons — hair care, skin care, premium food, supplements — "
                    "arranged in a clean product photography layout. "
                    "Carton surfaces have a pearl-satin finish that gives them a premium, tactile appearance. "
                    "Printing shows high fidelity — vivid colours, clean typography, foil accents on some. "
                    "White background with soft graduated shadows. Professional catalogue quality. "
                    "5200K, 50mm lens, overhead 30-degree angle. No brand names."
                )
            ),
        ],
    },

    # ── Carte Lumina ─────────────────────────────────────────────────────────────
    {
        "slug": "carte-lumina",
        "name": "Carte Lumina",
        "images": [
            (
                "carte-lumina-hero",
                (
                    "Ultra-realistic 8K luxury commercial studio photography of a stack of ITC PSPD Carte Lumina "
                    "premium coated board. "
                    + SHEET_STACK +
                    " Carte Lumina is positioned as a luminous luxury packaging board — "
                    "the surface has a silky-smooth high-gloss coating that appears to radiate brightness. "
                    "Front face: pristine white, very high gloss, luminous — "
                    "studio reflections visible as crisp bright highlights on the glossy surface. "
                    "Back face: coated white. "
                    "Stack is photographed on a polished surface with a single dramatic key light "
                    "from 30 degrees to maximise the glossy surface reflection. "
                    "Background: pure white seamless with very subtle gradient at base. "
                    "5200K, 50mm lens. No branding."
                )
            ),
            (
                "carte-lumina-engineering",
                (
                    "Ultra-clean technical diagram of Carte Lumina coated board cross-section. "
                    "White background, precise technical vector lines. "
                    "Layers from top to bottom: "
                    "1. High-gloss top coat (luminous coat, maximum smoothness) "
                    "2. Base coat "
                    "3. Premium white chemical pulp top ply "
                    "4. Multi-ply virgin fibre core "
                    "5. Chemical pulp bottom ply "
                    "6. White back coat "
                    "Callouts: 'Gloss (75°): 80+ GU', 'Brightness: 90+ ISO', 'Smoothness: Bekk 1000 s'. "
                    "Title block: 'Carte Lumina / Premium High-Gloss Coated Board / ITC PSPD'. "
                    "Engineering documentation style, export-grade."
                )
            ),
            (
                "carte-lumina-usecase",
                (
                    "Ultra-realistic 8K luxury product photography of high-end gifting, jewellery, "
                    "premium confectionery and cosmetics packaging boxes made from luminous high-gloss coated board. "
                    "Scene: 5 luxury packaging boxes and cartons displayed on a white marble surface. "
                    "Box surfaces catch light beautifully — ultra-glossy, vivid UV-printed graphics, "
                    "embossed logo panels with gold foil, debossed texture panels. "
                    "The high-gloss board surface is clearly visible as the packaging material. "
                    "Soft studio lighting creating beautiful highlight reflections on glossy surfaces. "
                    "5200K, 50mm lens, elegant 30-degree overhead angle. No brand names."
                )
            ),
        ],
    },

    # ── Safire Graphik ───────────────────────────────────────────────────────────
    {
        "slug": "safire-graphik",
        "name": "Safire Graphik",
        "images": [
            (
                "safire-graphik-hero",
                (
                    "Ultra-realistic 8K commercial studio photography of a stack of ITC PSPD Safire Graphik "
                    "board — a premium coated board optimised for high-impact graphic printing. "
                    + SHEET_STACK +
                    " Safire Graphik is designed for point-of-purchase displays, premium cartons, "
                    "and high-fidelity offset printing. "
                    "Front face: ultra-smooth, very high brightness (92+ ISO), matt-satin surface finish — "
                    "ideal for sharp 4-colour halftone print reproduction. "
                    "Surface is brilliant white, uniformly flat, with no texture variation. "
                    "Back face: coated white. "
                    "Stack at 30-degree angle showing top face and cross-section edge. "
                    "White seamless studio, 5200K, 50mm lens. No branding."
                )
            ),
            (
                "safire-graphik-engineering",
                (
                    "Ultra-clean technical cross-section diagram of Safire Graphik premium coated board. "
                    "White background, blue dimension annotations, grey callout lines. "
                    "Layers from top to bottom: "
                    "1. High-brightness graphic top coat (very high whiteness, smooth) "
                    "2. Pigment base coat "
                    "3. Premium white top pulp ply "
                    "4. Multi-ply core "
                    "5. Bottom ply + white back coat "
                    "Callouts: 'Brightness (ISO): 92+ %', 'Surface strength: IGT 1.5+ m/s', "
                    "'Ink hold-out: excellent for 4-colour offset'. "
                    "Title block: 'Safire Graphik / Premium Graphic Board / ITC PSPD'. "
                    "Engineering documentation style."
                )
            ),
            (
                "safire-graphik-usecase",
                (
                    "Ultra-realistic 8K commercial photography of premium point-of-purchase (POP) displays, "
                    "high-impact retail shelf-ready packaging, and premium printed cartons made from Safire Graphik board. "
                    "Scene: a retail display stand made from printed board with vivid full-colour graphics — "
                    "photographic images printed with exceptional sharpness and colour fidelity. "
                    "Next to it: 4–5 premium branded shelf cartons with bright, high-impact print. "
                    "The print quality demonstrates the board's graphic excellence — rich blacks, "
                    "vivid CMYK, precise halftone reproduction. "
                    "Retail environment background, slightly blurred. "
                    "5200K, 50mm lens. No specific brand names."
                )
            ),
        ],
    },

    # ── Cyber Oak ────────────────────────────────────────────────────────────────
    {
        "slug": "cyber-oak",
        "name": "Cyber Oak",
        "images": [
            (
                "cyber-oak-hero",
                (
                    "Ultra-realistic 8K commercial studio photography of a stack of ITC PSPD Cyber Oak "
                    "coated folding box board. "
                    + SHEET_STACK +
                    " Cyber Oak is a solid bleached board (SBS) / premium coated board known for "
                    "exceptional consistency, uniform caliper, and food-grade compliance. "
                    "Front face: brilliant white, smooth satin coating — very uniform, zero shade variation. "
                    "Back face: white coated. "
                    "The board has a notably consistent caliper — visible in the stack edges as "
                    "perfectly even sheet thickness. "
                    "Photographed at 30 degrees to show top face and cross-section. "
                    "White seamless studio, 5200K, 50mm lens. No branding."
                )
            ),
            (
                "cyber-oak-engineering",
                (
                    "Ultra-clean technical cross-section diagram of ITC PSPD Cyber Oak coated board. "
                    "White background, vector technical lines. "
                    "Layers from top to bottom: "
                    "1. White satin top coat "
                    "2. Pigment base coat "
                    "3. Premium bleached sulphate top ply (SBS — solid bleached) "
                    "4. Bleached sulphate core "
                    "5. Bottom ply + white coat "
                    "Callouts: 'Caliper uniformity: ±2 %', 'Moisture: 7–9 %', "
                    "'EU Food Contact Reg 1935/2004 compliant', 'FDA compliant'. "
                    "Title block: 'Cyber Oak / Coated Bleached Board / ITC PSPD'. "
                    "Engineering documentation style."
                )
            ),
            (
                "cyber-oak-usecase",
                (
                    "Ultra-realistic 8K commercial photography of food packaging, pharma, and consumer goods "
                    "cartons converted from premium coated board. "
                    "Scene: 6–8 packaging cartons across food-grade and pharma categories — "
                    "cereal box, milk carton, tablet blister outer carton, spice packaging, personal care. "
                    "All cartons show pristine white board with high-quality printing. "
                    "Some cartons are shown open or partially assembled to show the white interior board. "
                    "Clean white studio background. Professional catalogue photography. "
                    "5200K, 50mm lens, 30-degree overhead angle. No brand names."
                )
            ),
        ],
    },

    # ══ RECYCLED BOARDS ══════════════════════════════════════════════════════════

    # ── Eco Natura ───────────────────────────────────────────────────────────────
    {
        "slug": "eco-natura",
        "name": "Eco Natura",
        "images": [
            (
                "eco-natura-hero",
                (
                    "Ultra-realistic 8K commercial studio photography of a stack of ITC PSPD Eco Natura "
                    "coated recycled duplex board (greyback). "
                    + SHEET_STACK +
                    " Eco Natura is a coated recycled board with a grey back — made from recycled fibre. "
                    "Front face: smooth, white clay-coated surface — bright white, uniform coverage, "
                    "slightly less bright than virgin FBB. "
                    "Back face: GREY — unbleached recycled fibre back, characteristic grey-brown colour. "
                    "The cross-section at cut edges clearly reveals: white top coat, cream/tan recycled core "
                    "with visible grey-brown tones, grey uncoated back. "
                    "Stack photographed at 30-degree angle showing white top face and grey back at the bottom. "
                    "White seamless studio, 5200K, 50mm lens. No branding."
                )
            ),
            (
                "eco-natura-engineering",
                (
                    "Ultra-clean technical cross-section diagram of Eco Natura coated recycled duplex board. "
                    "White background, precise vector lines, annotated layers. "
                    "Layers from top to bottom: "
                    "1. Top coating (white clay coat) — labelled 'Coated white face' "
                    "2. White top pulp ply (small amount of white fibre for surface quality) "
                    "3. Recycled fibre core (grey-brown, bulk layer) — labelled 'Recycled fibre core (GD1)' "
                    "4. Grey uncoated back — labelled 'Grey back (uncoated recycled)' "
                    "Environmental callout box: 'Made from 100% recycled fibre — BIS IS 2617 compliant'. "
                    "Dimension: caliper 0.38–0.65 mm (for 200–450 GSM). "
                    "Title block: 'Eco Natura / Coated Recycled Duplex (Greyback) / ITC PSPD'. "
                    "Engineering documentation style."
                )
            ),
            (
                "eco-natura-usecase",
                (
                    "Ultra-realistic 8K commercial photography of FMCG folding cartons and retail packaging "
                    "made from Eco Natura coated recycled duplex board. "
                    "Scene: 6–8 folding cartons — detergent box, rice carton, FMCG food carton, "
                    "household product packaging. Cartons show: "
                    "Front surfaces: clean white background print with vivid CMYK graphics, "
                    "some with sustainability certification marks visible. "
                    "One carton is shown open — the grey back of the board is visible on the inside panels. "
                    "Green leaf or eco badge subtly visible on one carton: 'Made from Recycled Board'. "
                    "FMCG retail environment background, slightly blurred. "
                    "5200K, 50mm lens. No specific brand names."
                )
            ),
        ],
    },

    # ── Eco Blanca ───────────────────────────────────────────────────────────────
    {
        "slug": "eco-blanca",
        "name": "Eco Blanca",
        "images": [
            (
                "eco-blanca-hero",
                (
                    "Ultra-realistic 8K commercial studio photography of a stack of ITC PSPD Eco Blanca "
                    "coated recycled whiteback board. "
                    + SHEET_STACK +
                    " Eco Blanca is a coated recycled board with a WHITE back — an upgrade over grey-back duplex "
                    "for applications requiring a clean interior appearance. "
                    "Front face: smooth, bright white clay-coated surface. "
                    "Back face: WHITE — bleached white coating over recycled core — clean and bright. "
                    "Cross-section at cut edges reveals: white top coat, recycled grey-tan core, "
                    "white back coat on the rear. Both faces appear white; only the cut edge shows the grey core. "
                    "Stack photographed at 30-degree angle. "
                    "White seamless studio, 5200K, 50mm lens. No branding."
                )
            ),
            (
                "eco-blanca-engineering",
                (
                    "Ultra-clean technical cross-section diagram of Eco Blanca coated recycled whiteback board. "
                    "White background, vector lines, blue annotations. "
                    "Layers from top to bottom: "
                    "1. White top coating (clay coat) "
                    "2. Top white ply (white-dyed fibre for surface brightness) "
                    "3. Recycled fibre core (grey-tan bulk, recycled content) "
                    "4. White back ply + white back coat — labelled 'White back (coated)' "
                    "Callout: 'Whiteback = clean interior for premium FMCG and retail'. "
                    "Environmental note: 'Recycled core content — reduced carbon footprint'. "
                    "Title block: 'Eco Blanca / Coated Recycled Whiteback / ITC PSPD'. "
                    "Engineering documentation style."
                )
            ),
            (
                "eco-blanca-usecase",
                (
                    "Ultra-realistic 8K commercial photography of premium retail packaging and personal care "
                    "cartons made from coated recycled whiteback board. "
                    "Scene: 6 cartons — cosmetics carton, personal care product box, premium food carton, "
                    "pharmaceutical outer. Front surfaces: excellent print quality, vivid colours. "
                    "One carton is shown open — the WHITE interior back face is clearly visible — "
                    "demonstrating the clean white interior vs standard grey-back duplex. "
                    "The interior whiteback is clean and premium-looking. "
                    "Clean studio white background. Professional photography. "
                    "5200K, 50mm lens, 30-degree overhead angle. No brand names."
                )
            ),
        ],
    },

    # ── NeoWhite Bliss ───────────────────────────────────────────────────────────
    {
        "slug": "neowhite-bliss",
        "name": "NeoWhite Bliss",
        "images": [
            (
                "neowhite-bliss-hero",
                (
                    "Ultra-realistic 8K commercial studio photography of a stack of ITC PSPD NeoWhite Bliss "
                    "premium coated recycled whiteback board. "
                    + SHEET_STACK +
                    " NeoWhite Bliss is the premium tier of coated recycled whiteback board — "
                    "offering higher brightness and better surface quality than standard whiteback duplex. "
                    "Front face: very smooth, high-brightness white coating — approaching virgin board quality. "
                    "Back face: clean bright white. "
                    "The board has excellent caliper uniformity for a recycled product. "
                    "Photographed on a polished white acrylic plinth for a premium look. "
                    "Key lighting from 45 degrees to show the premium smooth surface. "
                    "White seamless studio, 5200K, 50mm lens. No branding."
                )
            ),
            (
                "neowhite-bliss-engineering",
                (
                    "Ultra-clean technical cross-section diagram of NeoWhite Bliss premium recycled whiteback board. "
                    "White background, precise vector lines. "
                    "Layers from top to bottom: "
                    "1. Premium top coating (high-brightness white, smooth) "
                    "2. White top ply (enhanced surface quality) "
                    "3. Recycled fibre core (optimised recycled content) "
                    "4. White back ply + premium white back coat "
                    "Callout: 'Brightness: 80+ ISO (face)', 'Caliper uniformity: ±3%'. "
                    "Performance comparison note: 'Premium whiteback — higher brightness than Eco Blanca'. "
                    "Environmental badge: 'Recycled fibre core — FSC certified available'. "
                    "Title block: 'NeoWhite Bliss / Premium Coated Recycled Whiteback / ITC PSPD'. "
                    "Engineering documentation style."
                )
            ),
            (
                "neowhite-bliss-usecase",
                (
                    "Ultra-realistic 8K commercial photography of premium folding cartons and packaging "
                    "made from NeoWhite Bliss premium recycled whiteback board — demonstrating that "
                    "recycled board can achieve near-virgin quality appearance. "
                    "Scene: 7 premium folding cartons across categories: premium cosmetics, personal care, "
                    "pharmaceutical, premium food. Front surfaces: excellent print quality, foil accents, "
                    "embossed panels — all on recycled board. "
                    "One carton open: pristine white interior back face. "
                    "A subtle recycled content badge on one carton. "
                    "Premium white background, soft shadow. "
                    "5200K, 50mm lens, overhead 30-degree angle. No brand names."
                )
            ),
        ],
    },
]

# ─── API call ────────────────────────────────────────────────────────────────────
def generate_image(prompt_text, output_path):
    full_prompt = SYSTEM_PROMPT + "\n\n" + prompt_text
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{MODEL}:generateContent?key={API_KEY}"
    )
    payload = {
        "contents": [{"parts": [{"text": full_prompt}]}],
        "generationConfig": {
            "responseModalities": ["image", "text"],
            "temperature": 1,
            "topP": 0.07,
        },
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        return False, f"HTTP {e.code}: {body[:300]}"
    except Exception as e:
        return False, str(e)

    try:
        for part in result["candidates"][0]["content"]["parts"]:
            if "inlineData" in part:
                img_bytes = base64.b64decode(part["inlineData"]["data"])
                with open(output_path, "wb") as f:
                    f.write(img_bytes)
                return True, f"{len(img_bytes) // 1024} KB"
        return False, "No image in response"
    except (KeyError, IndexError) as e:
        return False, f"Parse error: {e}"


# ─── Main ────────────────────────────────────────────────────────────────────────
def main():
    total   = sum(len(p["images"]) for p in PRODUCTS)
    done    = 0
    skipped = 0
    failed  = 0

    print(f"Model : {MODEL}")
    print(f"Output: {os.path.abspath(ROOT)}")
    print(f"Total : {total} images across {len(PRODUCTS)} products\n")

    for prod in PRODUCTS:
        print(f"── {prod['name']} ({prod['slug']}) ──")

        for filename_base, prompt in prod["images"]:
            filepath = os.path.join(ROOT, filename_base + ".jpg")
            label    = filename_base.split("-")[-1]  # hero / engineering / usecase

            if os.path.exists(filepath) and os.path.getsize(filepath) > 5000:
                print(f"  SKIP  {filename_base}.jpg  (exists)")
                skipped += 1
                done    += 1
                continue

            print(f"  [{done+1}/{total}]  {label}: {filename_base}.jpg ...", end=" ", flush=True)
            ok, msg = generate_image(prompt, filepath)
            if ok:
                print(f"OK ({msg})")
                done += 1
            else:
                print(f"FAIL — {msg}")
                failed += 1
                done   += 1

            time.sleep(2)  # rate-limit

        print()

    print(f"Done: {total - failed}/{total}  ({skipped} skipped, {failed} failed)")
    if failed == 0:
        print("\nAll images generated. Image paths to use in pgg-data.ts:")
        for prod in PRODUCTS:
            slug = prod["slug"]
            for filename_base, _ in prod["images"]:
                print(f"  /products/paper/{filename_base}.jpg")


if __name__ == "__main__":
    main()
