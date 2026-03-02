#!/usr/bin/env python3
"""
Regenerate -engineering.jpg for all 10 ITC PSPD paper grades.
Style: clean technical infographic — LEFT = cross-section layer diagram, RIGHT = top 3 differentiators.
Force-overwrites existing files.
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
    sys.exit(1)

API_KEY = _load_api_key()
ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "products", "paper")
os.makedirs(ROOT, exist_ok=True)

SYSTEM_PROMPT = """You are a precision technical product designer. Create clean, minimal flat-design specification diagrams for premium paper/board packaging materials.

HARD RULES:
- Pure white or very light warm grey (#F8F6F2) background only
- Flat graphic illustration — absolutely NO photography, NO gradients, NO drop shadows
- Think premium engineering spec sheet aesthetic — Muji meets Deutsche Werkbund
- Two-panel landscape layout: LEFT = cross-section cut diagram, RIGHT = 3 differentiator callouts
- Hairline rules, geometric callout lines, precise alignment
- No branding, no logos, no watermarks"""

SPECS = {
    "cyber-xlpac-gc1": {
        "name": "Cyber XLPac GC1",
        "gsm": "200–400 GSM",
        "accent": "#1A6B6B",
        "accent_name": "deep teal",
        "layers": [
            ("Top Clay Coat",     "brilliant white, smooth, slightly glossy — print surface"),
            ("Virgin Fibre Ply A","dense white/cream chemical + mechanical pulp"),
            ("Virgin Fibre Ply B","high-bulk structural mid-ply"),
            ("Virgin Fibre Ply C","dense lower virgin ply"),
            ("Back Clay Coat",    "smooth white coated reverse — GC1 class"),
        ],
        "diff": [
            ("Coated Both Sides (GC1)",  "White front + white back — premium inner-carton print surface"),
            ("FSC Virgin Fibre",          "Sustainably sourced — USFDA & BfR food-grade certified"),
            ("Superior Print Fidelity",   "Offset · Gravure · Digital · Foil stamping · Embossing"),
        ],
    },
    "cyber-xlpac-gc2": {
        "name": "Cyber XLPac GC2",
        "gsm": "200–400 GSM",
        "accent": "#C17A2A",
        "accent_name": "warm amber",
        "layers": [
            ("Top Clay Coat",       "brilliant white clay coating — smooth, glossy print face"),
            ("Virgin Fibre Ply A",  "dense white/cream virgin pulp"),
            ("Virgin Fibre Ply B",  "high-bulk structural mid-ply"),
            ("Virgin Fibre Ply C",  "dense lower ply"),
            ("Uncoated Manila Back","cream/manila — natural texture, uncoated — GC2 reverse"),
        ],
        "diff": [
            ("Higher Bulk than GC1",        "Better yield — fewer sheets per tonne, efficient conversion"),
            ("Manila Back for Filling Lines","Uncoated reverse = slip resistance on high-speed auto lines"),
            ("Back Printable",               "Barcode & text directly on uncoated manila — no coating needed"),
        ],
    },
    "cyber-premium": {
        "name": "Cyber Premium",
        "gsm": "200–400 GSM",
        "accent": "#7A1A2A",
        "accent_name": "deep burgundy",
        "layers": [
            ("Top Clay Coat",       "brilliant white clay coating — print surface"),
            ("Virgin Fibre Ply A",  "extra-thick high-bulk top ply"),
            ("Virgin Fibre Ply B",  "thickest structural mid-ply — maximum caliper"),
            ("Virgin Fibre Ply C",  "heavy lower ply — added stiffness"),
            ("Uncoated Manila Back","cream/manila uncoated reverse"),
        ],
        "diff": [
            ("Maximum Bulk & Caliper",    "Thickest ply structure — highest stiffness for glass bottle outers"),
            ("Liquor & Spirits Grade",    "Engineered for heavy outer cartons requiring top compression strength"),
            ("High Bulk-to-Weight Ratio", "Premium rigid feel without proportional weight penalty"),
        ],
    },
    "pearlxl-packaging": {
        "name": "PearlXL Packaging",
        "gsm": "200–400 GSM",
        "accent": "#7A9AAA",
        "accent_name": "steel silver",
        "layers": [
            ("Pearl Satin Top Coat", "pearl-pigment coating — lustrous silver-white satin sheen"),
            ("Virgin Fibre Ply A",   "white/cream virgin pulp"),
            ("Virgin Fibre Ply B",   "structural mid-ply"),
            ("Virgin Fibre Ply C",   "lower ply"),
            ("Uncoated Manila Back", "cream uncoated reverse"),
        ],
        "diff": [
            ("Built-in Pearl Lustre",    "Satin sheen in the coating — no separate pearl lamination required"),
            ("FMCG Shelf Standout",      "Distinctive surface appeal without added embellishment cost"),
            ("Full FBB Performance",     "All virgin fibre structural and print advantages retained"),
        ],
    },
    "carte-lumina": {
        "name": "Carte Lumina",
        "gsm": "200–400 GSM",
        "accent": "#BFA060",
        "accent_name": "gold",
        "layers": [
            ("Ultra-High Gloss Top Coat","mirror-finish clay coating — exceptional light reflection"),
            ("Premium Virgin Ply A",     "bright white premium virgin pulp"),
            ("Premium Virgin Ply B",     "structural mid-ply"),
            ("Premium Virgin Ply C",     "lower ply"),
            ("White Coated Back",        "smooth white coated reverse — GC1 class"),
        ],
        "diff": [
            ("Mirror-Gloss Surface",    "Highest gloss of all FBB grades — luxury cosmetics & perfume cartons"),
            ("Coated Both Sides",       "White coated back — ideal for full-wrap & inner box printing"),
            ("Maximum Print Brilliance","Peak ink density & colour saturation for premium brand packaging"),
        ],
    },
    "safire-graphik": {
        "name": "Safire Graphik",
        "gsm": "200–400 GSM",
        "accent": "#1A3A8A",
        "accent_name": "cobalt blue",
        "layers": [
            ("Bright White Top Coat", "ultra-smooth bright white SBS surface coating"),
            ("SBS Bleached Ply A",    "100% bleached chemical pulp — brilliant white, no grey"),
            ("SBS Bleached Ply B",    "bleached mid-ply — uniformly white throughout"),
            ("SBS Bleached Ply C",    "bleached lower ply — white to the very edge"),
            ("White Back Coat",       "smooth white coated reverse — SBS class"),
        ],
        "diff": [
            ("Solid Bleached Sulphate (SBS)","100% bleached pulp — NO grey core visible at cut edge"),
            ("Highest Brightness & Whiteness","Best ink holdout — vivid colour on POP displays & luxury cartons"),
            ("Pharma & Food Grade",           "Pure white cut edge — pharma blister backing & premium cartons"),
        ],
    },
    "cyber-oak": {
        "name": "Cyber Oak",
        "gsm": "200–400 GSM",
        "accent": "#2A5A2A",
        "accent_name": "forest green",
        "layers": [
            ("White Top Coat",            "smooth white clay coating — print-ready front"),
            ("Virgin Fibre Ply A",        "white/cream virgin pulp"),
            ("Virgin Fibre Ply B",        "structural mid-ply"),
            ("Virgin Fibre Ply C",        "lower virgin ply"),
            ("Natural Brown Unbleached Back","warm brown unbleached kraft reverse — uncoated, natural"),
        ],
        "diff": [
            ("Brown Back = Eco Signal",   "Natural unbleached reverse — visible sustainability cue on shelf"),
            ("Virgin Fibre Quality",      "Full FBB print & structural performance with eco-positioned aesthetic"),
            ("Consumer & Electronics Pack","Preferred by eco-brand packaging designers — FMCG & electronics"),
        ],
    },
    "eco-natura": {
        "name": "Eco Natura",
        "gsm": "230–400 GSM",
        "accent": "#6A7A2A",
        "accent_name": "olive",
        "layers": [
            ("White Top Coat",         "white clay coating — smooth print-ready front"),
            ("Recycled Core Ply A",    "grey-tan recycled fibre — upper core ply"),
            ("Recycled Core Ply B",    "grey-tan structural mid-ply"),
            ("Recycled Core Ply C",    "grey-tan lower recycled ply"),
            ("Grey Uncoated Back",     "characteristic grey-brown recycled reverse — uncoated"),
        ],
        "diff": [
            ("Best-in-Class Recycled Board","Consistent caliper — smooth, reliable auto filling line performance"),
            ("Recycled Content Signal",     "Grey back communicates recycled content — meets eco-brand specs"),
            ("FMCG & Cereal Box Grade",     "Proven in food cartons, cereal boxes, general folding carton"),
        ],
    },
    "eco-blanca": {
        "name": "Eco Blanca",
        "gsm": "230–400 GSM",
        "accent": "#8A3A5A",
        "accent_name": "rose",
        "layers": [
            ("White Top Coat",      "smooth white clay coating — print-ready front"),
            ("Recycled Core Ply A", "grey-tan recycled fibre — upper ply"),
            ("Recycled Core Ply B", "grey-tan structural mid-ply"),
            ("Recycled Core Ply C", "grey-tan lower recycled ply"),
            ("White Coated Back",   "clean white coated reverse — despite recycled core"),
        ],
        "diff": [
            ("White Back on Recycled",   "Coated white reverse — full printability for hosiery & garment packs"),
            ("Print-Ready Both Sides",   "White front AND white back — premium aesthetics on recycled board"),
            ("Sustainability + Aesthetics","Recycled core credentials without any visual compromise"),
        ],
    },
    "neowhite-bliss": {
        "name": "NeoWhite Bliss",
        "gsm": "230–400 GSM",
        "accent": "#2A5A8A",
        "accent_name": "pharma blue",
        "layers": [
            ("Premium White Top Coat", "high-brightness white coating — pharma-grade print surface"),
            ("Recycled Core Ply A",    "stabilised recycled fibre — upper ply"),
            ("Recycled Core Ply B",    "structural mid-ply"),
            ("Recycled Core Ply C",    "lower recycled ply"),
            ("White Coated Back",      "smooth white coated reverse — pharma compliant"),
        ],
        "diff": [
            ("Pharma Blister Backing",     "High-brightness white — suited for pharmaceutical blister card backing"),
            ("White Both Sides on Recycled","Highest-spec recycled board: coated white front AND back"),
            ("Virgin-Board Appearance",    "Premium brightness & consistency from a recycled substrate"),
        ],
    },
}


def engineering_prompt(slug: str) -> str:
    s = SPECS[slug]
    layer_lines = "\n".join(
        f"    {'TOP' if i == 0 else 'BOTTOM' if i == len(s['layers'])-1 else f'PLY {i}'}: {name} — {desc}"
        for i, (name, desc) in enumerate(s["layers"])
    )
    diff_lines = "\n".join(
        f"    {i+1:02d}. {title} — {desc}"
        for i, (title, desc) in enumerate(s["diff"])
    )

    return f"""Create a clean, precise TECHNICAL SPECIFICATION INFOGRAPHIC for {s['name']} ({s['gsm']}) paper/board.

FORMAT: Landscape rectangle (1792×1024 px equivalent). Pure white background.

═══ LEFT PANEL (55% width) — CROSS-SECTION LAYER DIAGRAM ═══
Draw a large, thick horizontal board cross-section (like a magnified cut-edge view).
The board is shown as a rectangular slab with the cut-face (edge) dominating the panel.
Each layer = a distinct horizontal band across the full width of the slab.
Layers from TOP to BOTTOM:
{layer_lines}

Visual treatment of layers:
- Top and back coat layers: thinner bands, rendered slightly lighter/brighter
- Core fibre plies: thicker bands, distinct shade per ply (slight variation to show ply stack)
- Thin hairline lines separating each layer
- Short callout leader lines extending right from each layer, ending in a small label zone
- Accent colour {s['accent']} ({s['accent_name']}) used for leader lines and layer borders

Style: flat, geometric, technical illustration — NOT photography, NOT 3D render.
Clean sharp edges. No rounding. No shadow. No gradients.

═══ RIGHT PANEL (45% width) — TOP 3 DIFFERENTIATORS ═══
Three stacked cards, equally spaced vertically, each containing:
  - Large bold number (01 / 02 / 03) in accent colour {s['accent']}
  - A short bold headline (all-caps or title case)
  - A brief supporting line in smaller text
  - Thin top border line in accent colour

The three differentiators:
{diff_lines}

Thin vertical dividing rule between left and right panels.
Bottom of right panel: product name "{s['name']}" and "{s['gsm']}" in small, refined caption type.

OVERALL AESTHETIC: Premium industrial spec sheet. Minimal. Precise. Confident.
Like a high-end material datasheet from a German engineering company.
Absolutely NO gradients, shadows, photography, or decorative imagery."""


def generate_image(prompt_text: str, output_path: str):
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
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code}: {e.read().decode('utf-8', errors='replace')[:300]}"
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


def main():
    products = list(SPECS.keys())
    total = len(products)
    done = failed = 0

    print(f"Model : {MODEL}")
    print(f"Output: {os.path.abspath(ROOT)}")
    print(f"Total : {total} engineering diagrams (force overwrite)\n")

    for slug in products:
        filename = f"{slug}-engineering.jpg"
        filepath = os.path.join(ROOT, filename)
        name = SPECS[slug]["name"]

        print(f"  [{done+1}/{total}]  {name}: {filename} ...", end=" ", flush=True)
        ok, msg = generate_image(engineering_prompt(slug), filepath)
        if ok:
            print(f"OK ({msg})")
            done += 1
        else:
            print(f"FAIL — {msg}")
            failed += 1
            done += 1
        time.sleep(2)

    print(f"\nDone: {total - failed}/{total}  ({failed} failed)")


if __name__ == "__main__":
    main()
