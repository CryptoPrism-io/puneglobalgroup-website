#!/usr/bin/env python3
"""
Generate PP corrugated Bins + Flooring product images using Gemini REST API.
Products: BIN-01, BIN-02, BIN-03, PKG-01, FLR-01
Images per product: hero, engineering, usecase  →  15 total
Model: gemini-3.1-flash-image-preview | Temp: 1 | top_p: 0.07

MATERIAL: Single-flute PP corrugated sheet.
CONSTRUCTION: Riveted vertical corner seams (NOT autolocking — these are heavy-duty bins).
"""
import sys, os, json, base64, time, urllib.request, urllib.error

sys.stdout.reconfigure(line_buffering=True, encoding="utf-8")

MODEL = "gemini-3.1-flash-image-preview"

def _load_api_key() -> str:
    # 1. Prefer environment variable
    key = os.environ.get("GEMINI_API_KEY", "")
    if key:
        return key
    # 2. Fallback: read from .env.local in project root
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

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "products", "pp")
DIRS = {
    "bins":         os.path.join(ROOT, "bins"),
    "picking-bins": os.path.join(ROOT, "picking-bins"),
    "flooring":     os.path.join(ROOT, "flooring"),
}
for d in DIRS.values():
    os.makedirs(d, exist_ok=True)

# ─── System prompt ──────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """Ultra-realistic 8K industrial product photography.

CRITICAL MATERIAL SPECIFICATION — SINGLE-FLUTE PP CORRUGATED SHEET:
The product material is single-flute polypropylene corrugated sheet — a rigid, lightweight plastic
sheet consisting of two thin polypropylene face skins connected by a single layer of corrugated
flute ribs running between them. This is NOT twin-wall hollow channel sheet. Key visual properties:
- The external surfaces are smooth, flat, and matte.
- The cut edges reveal a single row of triangular or sinusoidal flute corrugations between two
  thin flat PP skin layers — similar in cross-section to corrugated cardboard but made from plastic.
- The material is semi-rigid, lightweight, and has a slightly waxy matte surface texture.
- NOT injection-moulded. NOT solid plastic. NOT twin-wall hollow channel board.

CONSTRUCTION METHOD — RIVETED:
Products are cut and folded from single-flute PP corrugated sheet. Corner seams are fastened
with small round polypropylene or aluminium pop-rivets, typically 4–6 mm diameter, placed at
80–100 mm intervals along every vertical corner seam.
- Rivets ARE visible. They are small, neat, flush-set round fasteners.
- Rivet line is straight and evenly spaced.
- Corners show the two sheet edges meeting at a right angle, held by the rivet line.
- This is the correct, accurate representation of how these bins are made.

Export-grade commercial catalogue quality.

Lighting: high-key white industrial studio lighting, 5200K neutral colour temperature,
evenly diffused multi-softbox setup, no dramatic shadows, no underexposure, no overexposure.

Background: clean white seamless backdrop. For use-case shots: realistic industrial
factory / warehouse environment, slightly defocused background.

Camera: 50mm full-frame equivalent lens, natural perspective, no wide-angle distortion.

Exposure: evenly balanced highlights and midtones, crisp edge definition.

Surface realism: matte single-flute PP corrugated texture, slightly waxy sheen, accurate
colour rendering. Cut edges show single-flute corrugation profile between two thin PP skins.

Structural realism: correct wall thickness (5 mm), accurate proportions, real-world physics.
Riveted seams clearly visible — small neat round rivets at regular intervals on every corner.

Colour accuracy: neutral white balance, true-to-life industrial colour reproduction.

Rendering style: professional manufacturing catalogue photography, not artistic, not stylised.
Must look like real single-flute PP corrugated sheet products with riveted corner construction.

No branding, no logos, no watermark, no text overlay unless specified."""

# ─── Material shorthand ─────────────────────────────────────────────────────────
MAT = (
    "Made from single-flute PP corrugated sheet — two thin flat PP skins with a single "
    "corrugated flute layer between them, visible as a row of triangular/wave flutes at any cut edge. "
    "Corners fastened with small neat round pop-rivets at 80–100 mm intervals — rivets are visible "
    "and form a straight line down every vertical seam."
)

# ─── Products ───────────────────────────────────────────────────────────────────
PRODUCTS = [

    # ── BIN-01: Open Top Scrap Bin ────────────────────────────────────────────
    {
        "code":   "BIN-01",
        "name":   "Open Top Scrap Bin",
        "outdir": "bins",
        "images": [
            (
                "bin-01-hero",
                (
                    f"Ultra-realistic 8K industrial product photography of a polypropylene single-flute corrugated "
                    f"open-top industrial scrap bin. {MAT} "
                    f"Dimensions: 500 x 500 x 900 mm — notably TALL and narrow, height is 1.8x the width. "
                    f"Colour: bright industrial green matte. "
                    f"Open top — no lid. Four vertical walls, square plan. "
                    f"Riveted corner seams clearly visible down all four vertical edges — small neat round pop-rivets "
                    f"at 80–100 mm pitch. "
                    f"Reinforced folded top rim — the top edge is folded over to create a stiffened lip. "
                    f"White seamless studio background, 5200K, diffused softbox lighting. "
                    f"50mm lens, three-quarter front angle showing two faces and one corner. "
                    f"Realistic PP corrugated material texture, matte green surface. "
                    f"Shadow directly beneath on white floor. No branding."
                )
            ),
            (
                "bin-01-engineering",
                (
                    f"Ultra-clean technical CAD isometric line drawing of a polypropylene corrugated open-top "
                    f"industrial scrap bin. {MAT} "
                    f"Dimensions: 500 x 500 x 900 mm. Material: 5 mm single-flute PP corrugated sheet. "
                    f"Show: four vertical walls, open top, folded reinforced rim at top, "
                    f"rivet positions on all four vertical corner seams (dots at 80–100 mm pitch), "
                    f"dimension arrows for L=500, W=500, H=900, wall thickness callout = 5 mm. "
                    f"Title block lower right: 'BIN-01 / 5 mm single-flute PP / 500×500×900 mm'. "
                    f"White background, thin grey vector technical lines, no fill shading, "
                    f"dimension lines in blue, callout lines in grey. "
                    f"Export-grade engineering documentation style."
                )
            ),
            (
                "bin-01-usecase",
                (
                    f"Ultra-realistic 8K industrial factory floor photography of a polypropylene single-flute "
                    f"corrugated open-top scrap bin in active use. {MAT} "
                    f"Dimensions: 500 x 500 x 900 mm — notably tall, bright green matte finish, riveted corners. "
                    f"Bin is approximately 50% filled with lightweight plastic trim scrap / offcuts — irregular "
                    f"plastic pieces, loose, not compressed. "
                    f"Bin sits on a clean concrete factory floor. "
                    f"Manufacturing environment in background — slightly blurred machinery or workbenches. "
                    f"5200K neutral overhead fluorescent lighting. 50mm lens, eye-level perspective. "
                    f"Realistic industrial atmosphere. No branding."
                )
            ),
        ],
    },

    # ── BIN-02: Hopper Front Bin ──────────────────────────────────────────────
    {
        "code":   "BIN-02",
        "name":   "Hopper Front Bin",
        "outdir": "bins",
        "images": [
            (
                "bin-02-hero",
                (
                    f"Ultra-realistic 8K industrial studio photography of a polypropylene single-flute corrugated "
                    f"hopper-front bin. {MAT} "
                    f"Dimensions: 600 x 400 x 400 mm. Colour: industrial yellow matte. "
                    f"The FRONT wall is a shorter hopper wall — approximately half the height of the rear wall — "
                    f"creating a sloped-open front for easy parts picking. "
                    f"The three-quarter angle clearly shows the dropped front face and the hopper geometry. "
                    f"Rear wall is full 400 mm height. Side walls are trapezoidal — tall at back, short at front. "
                    f"Riveted corner seams visible on all vertical edges, small neat round rivets at regular pitch. "
                    f"White seamless studio background, 5200K diffused lighting, 50mm lens. "
                    f"Shadow beneath on white floor. No branding."
                )
            ),
            (
                "bin-02-engineering",
                (
                    f"Technical CAD isometric line drawing of a polypropylene corrugated hopper-front bin. {MAT} "
                    f"Dimensions: 600 x 400 x 400 mm. Material: 5 mm single-flute PP. "
                    f"Show: hopper front wall geometry (angled/shortened front face), rear wall full height, "
                    f"trapezoidal side walls, rivet dots on all vertical seams, "
                    f"dimension annotations for L=600, W=400, H=400, front drop height, taper angle. "
                    f"Wall thickness callout = 5 mm. "
                    f"Title block: 'BIN-02 / 5 mm single-flute PP / 600×400×400 mm / Hopper Front'. "
                    f"White background, thin grey vector lines, no shading."
                )
            ),
            (
                "bin-02-usecase",
                (
                    f"Ultra-realistic 8K industrial warehouse rack photography of a hopper-front PP corrugated bin "
                    f"mounted on a metal shelving rack. {MAT} "
                    f"600 x 400 x 400 mm, industrial yellow, riveted corners. "
                    f"Bin is filled with small machined aluminium components — bolts, spacers, brackets. "
                    f"A worker's gloved hand is reaching into the hopper front to pick a component. "
                    f"Metal warehouse shelving in background, slightly blurred. "
                    f"5200K neutral warehouse lighting, 50mm lens, three-quarter eye-level. No branding."
                )
            ),
        ],
    },

    # ── BIN-03: Nesting Tapered Bin ───────────────────────────────────────────
    {
        "code":   "BIN-03",
        "name":   "Nesting Tapered Bin",
        "outdir": "bins",
        "images": [
            (
                "bin-03-hero",
                (
                    f"Ultra-realistic 8K industrial studio photography of a polypropylene single-flute corrugated "
                    f"tapered nesting bin. {MAT} "
                    f"Dimensions: 600 x 450 x 400 mm. Colour: industrial blue matte. "
                    f"Walls have a VISIBLE INWARD TAPER — the bin is wider at the top than at the base, "
                    f"allowing bins to nest inside one another when empty. "
                    f"Taper angle approximately 5–8 degrees on each wall. "
                    f"Riveted vertical seams on all four corners, small neat round rivets. "
                    f"Single hero bin shown in three-quarter angle. "
                    f"White seamless studio background, 5200K, 50mm lens. No branding."
                )
            ),
            (
                "bin-03-engineering",
                (
                    f"Technical CAD isometric drawing of a tapered nesting PP corrugated bin. {MAT} "
                    f"Dimensions: 600 x 450 x 400 mm (top). Material: 5 mm single-flute PP. "
                    f"Show: taper angle callout on side walls, base dimensions (smaller than top), "
                    f"top dimensions, rivet positions on all vertical seams, wall thickness 5 mm. "
                    f"Include a secondary view showing two bins nested — the inner bin sits at a lower "
                    f"level inside the outer, showing the nesting depth saving. "
                    f"Title block: 'BIN-03 / 5 mm single-flute PP / 600×450×400 mm / Nesting Tapered'. "
                    f"White background, thin grey vector lines."
                )
            ),
            (
                "bin-03-usecase",
                (
                    f"Ultra-realistic 8K warehouse photography showing three PP corrugated tapered nesting bins. "
                    f"{MAT} Industrial blue, 5 mm, 600×450×400 mm. "
                    f"One bin is in the foreground, filled with packaging offcuts. "
                    f"Two empty bins are nested together behind it — their nesting is clearly visible, "
                    f"showing how they stack compactly inside one another. "
                    f"Clean warehouse floor. Slightly blurred racks in background. "
                    f"5200K, 50mm lens, three-quarter eye-level. No branding."
                )
            ),
        ],
    },

    # ── PKG-01: Stackable Open Front Picking Bin ──────────────────────────────
    {
        "code":   "PKG-01",
        "name":   "Stackable Open Front Picking Bin",
        "outdir": "picking-bins",
        "images": [
            (
                "pkgbin-01-hero",
                (
                    f"Ultra-realistic 8K industrial studio photography of a polypropylene single-flute corrugated "
                    f"stackable open-front picking bin. {MAT} "
                    f"Dimensions: 500 x 350 x 300 mm. Colour: industrial blue matte. "
                    f"The FRONT face is fully open — no front wall — for easy hand picking access. "
                    f"The top edge has a protruding stacking lip that interlocks with the base of the bin above. "
                    f"Rear and side walls are full height, riveted seams on rear corners. "
                    f"Interior visible through open front — clean empty interior showing corrugated side walls. "
                    f"Three-quarter angle showing open front and stacking lip. "
                    f"White seamless studio background, 5200K diffused lighting, 50mm lens. No branding."
                )
            ),
            (
                "pkgbin-01-engineering",
                (
                    f"Technical CAD isometric drawing of a stackable open-front PP corrugated picking bin. {MAT} "
                    f"500 x 350 x 300 mm. Material: 4 mm single-flute PP. "
                    f"Show: open front elevation, stacking lip detail (the lip that interlocks when stacked), "
                    f"rivet positions on rear corner seams, label slot on front face (80×40 mm window), "
                    f"dimension annotations L=500, W=350, H=300. "
                    f"Secondary view: two bins stacked, showing lip engagement. "
                    f"Title block: 'PKG-01 / 4 mm single-flute PP / 500×350×300 mm / Open Front Picking Bin'. "
                    f"White background, grey vector lines."
                )
            ),
            (
                "pkgbin-01-usecase",
                (
                    f"Ultra-realistic 8K warehouse aisle photography of stackable open-front PP corrugated picking "
                    f"bins on metal shelving racks. {MAT} "
                    f"Industrial blue, 4 mm, 500×350×300 mm. "
                    f"Three rows of bins on metal shelving, each bin filled with different packaged components. "
                    f"Front faces are open — component labels visible on bins. "
                    f"Warehouse aisle stretching into background, slightly blurred. "
                    f"5200K warehouse fluorescent lighting, 50mm lens, slight three-quarter angle. No branding."
                )
            ),
        ],
    },

    # ── FLR-01: Temporary Protection Flooring Sheet ───────────────────────────
    {
        "code":   "FLR-01",
        "name":   "Temporary Protection Sheet",
        "outdir": "flooring",
        "images": [
            (
                "flr-01-hero",
                (
                    f"Ultra-realistic 8K industrial studio photography of a large polypropylene single-flute "
                    f"corrugated flooring protection sheet laid flat. "
                    f"Material: 5 mm single-flute PP corrugated sheet, NOT hollow twin-wall — single flute layer "
                    f"between two PP skins. Dimensions: 2400 x 1200 mm — very large, full pallet size. "
                    f"Colour: light grey matte. "
                    f"Sheet is shown flat, photographed from a 30-degree elevated angle to show the full 2400×1200 mm "
                    f"surface and the 5 mm thickness at the edges — the cut edge clearly shows the single-flute "
                    f"corrugation profile between two thin PP skin layers. "
                    f"White seamless studio background, 5200K diffused lighting, 50mm lens equivalent. "
                    f"Clean soft shadow beneath. No branding, no text."
                )
            ),
            (
                "flr-01-engineering",
                (
                    f"Technical CAD isometric engineering drawing of a PP corrugated flooring protection sheet. "
                    f"Dimensions: 2400 x 1200 mm. Material: 5 mm single-flute PP corrugated. "
                    f"Show: top flat surface with flute direction arrow (indicating flute channel direction), "
                    f"cross-section detail at one corner showing the single-flute profile (two PP skins + one "
                    f"corrugated flute layer between), dimension annotations L=2400, W=1200, thickness=5 mm. "
                    f"Include a callout box: 'Flute direction: parallel to 1200 mm axis'. "
                    f"Title block: 'FLR-01 / 5 mm single-flute PP / 2400×1200 mm / Flooring Protection Sheet'. "
                    f"White background, thin grey technical lines, dimension lines in blue."
                )
            ),
            (
                "flr-01-usecase",
                (
                    f"Ultra-realistic 8K industrial warehouse photography of polypropylene corrugated flooring "
                    f"protection sheets laid flat on a warehouse concrete floor to protect the surface under a "
                    f"forklift aisle path. "
                    f"Material: 5 mm single-flute PP corrugated, light grey matte. Large sheets 2400×1200 mm. "
                    f"Multiple sheets are laid edge-to-edge covering a wide forklift travel lane. "
                    f"A yellow warehouse forklift is visible in the background driving over the sheets — "
                    f"the sheets lie flat showing their load-bearing capacity. "
                    f"The 5 mm cut edges of the sheets are slightly visible at the joints between sheets. "
                    f"Warehouse environment: concrete floor, racking in background, industrial overhead lighting. "
                    f"5200K lighting, 50mm lens, eye-level wide perspective. No branding."
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
        out_dir = DIRS[prod["outdir"]]
        print(f"── {prod['code']}  {prod['name']} ──")

        for filename_base, prompt in prod["images"]:
            filepath = os.path.join(out_dir, filename_base + ".jpg")
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
        print("\nAll images generated. Update pp-data.ts image paths to:")
        for prod in PRODUCTS:
            out_subdir = prod["outdir"]
            for filename_base, _ in prod["images"]:
                print(f"  /products/pp/{out_subdir}/{filename_base}.jpg")


if __name__ == "__main__":
    main()
