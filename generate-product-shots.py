# -*- coding: utf-8 -*-
"""
PGG Product Shot Generator -- Imagen 4
Corrected prompts based on actual PP corrugated packaging reference images.

PP corrugated (twin-wall / hollow flute polypropylene) characteristics:
- Material: rigid plastic, smooth flat outer surfaces, hollow flute channels inside
- Cut edge reveals parallel hollow rectangular channels (NOT paper corrugation)
- Colors: typically grey, sky blue, natural white, or black (ESD)
- Construction: die-cut sheets folded and joined with plastic PP rivets/staples at corners
- Branding: screen-printed text or adhesive label, NOT large painted panels
- Appearance: clean industrial plastic, slightly glossy, lightweight look
- NOT like cardboard boxes -- much more rigid, plastic sheen, precise corners

Output: public/products/shot-01-name.png ... shot-09-name.png
"""

import time
import base64
from pathlib import Path

API_KEY = "AIzaSyDARq7WC2dqTWL0rEk1V1SH_PfHfJjBXtE"

OUT_DIR = Path(__file__).parent / "public" / "products"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Delete old shots before regenerating
for f in OUT_DIR.glob("shot-*.png"):
    f.unlink()
    print("Deleted old: {}".format(f.name))

BASE_STYLE = (
    "Professional industrial product photography, clean white seamless studio background, "
    "soft diffused lighting, subtle drop shadow, sharp focus, no people, 8K resolution. "
    "The product is made from PP polypropylene twin-wall corrugated hollow flute sheet -- "
    "rigid plastic material with smooth flat outer surfaces, parallel hollow rectangular "
    "channels visible on any cut edges, plastic sheen, lightweight industrial appearance. "
    "Sky blue / mid grey color. Corners joined with small black or silver PP plastic rivets. "
    "Small 'PGG' screen-printed text label in saffron orange on the front face."
)

SHOTS = [
    {
        "id": "01",
        "name": "pp-foldable-box",
        "prompt": (
            BASE_STYLE +
            " Product: PP polypropylene twin-wall corrugated foldable box, lid open at 90 degrees showing interior. "
            "Sky blue color. 3/4 isometric angle. "
            "Smooth flat plastic walls, small black plastic PP rivets at corners, "
            "cut edge of lid showing hollow flute channels. "
            "Small saffron orange PGG screen-printed label on front wall. "
            "Dimensions approximately 600x400x300mm. Clean industrial returnable packaging."
        ),
    },
    {
        "id": "02",
        "name": "pp-automotive-tray",
        "prompt": (
            "Professional industrial product photography, clean white seamless studio background, "
            "soft lighting, sharp focus, no people, 8K. "
            "Product: PP polypropylene corrugated automotive parts tray, rectangular, flat with low walls, "
            "interior divided into a 5x4 grid by interlocking PP corrugated strip dividers. "
            "Top-down flat lay view. "
            "Grey color tray base, slightly lighter grey PP strip dividers forming uniform grid cells. "
            "Each cell sized to hold a small automotive component. "
            "Hollow flute channels visible on cut edges of divider strips. "
            "Small PGG label sticker on one corner. "
            "Looks exactly like automotive returnable packaging trays used by Maruti, Tata, Honda plants."
        ),
    },
    {
        "id": "03",
        "name": "pp-corrugated-sheets",
        "prompt": (
            "Professional industrial product photography, clean white seamless background, "
            "soft lighting, sharp focus, no people, 8K. "
            "Product: stack of 8 PP polypropylene hollow corrugated flat sheets, "
            "slightly fanned to show depth and individual sheets. "
            "Side profile view at 20 degree angle. "
            "Natural translucent white / very light grey color. "
            "CUT EDGE of each sheet clearly shows parallel hollow rectangular flute channels -- "
            "this is the key feature: the twin-wall hollow structure visible as multiple rectangular tunnels. "
            "Smooth flat top and bottom surfaces. "
            "Top sheet has small PGG adhesive label. "
            "These are Coroplast-style fluted polypropylene sheets, NOT cardboard."
        ),
    },
    {
        "id": "04",
        "name": "pp-layer-pad",
        "prompt": (
            "Professional industrial product photography, clean white seamless background, "
            "soft lighting, sharp focus, no people, 8K. "
            "Product: 4 PP polypropylene corrugated layer pads fanned out, "
            "showing graduated layered spread, 45 degree angle. "
            "Natural white / light grey smooth flat plastic surface. "
            "The pads are rectangular approximately 1200x1000mm, 4mm thick. "
            "Cut edge profile shows hollow twin-wall flute channels clearly. "
            "One pad has a small saffron orange PGG printed corner mark. "
            "Used for separating layers on pallets. Lightweight rigid plastic look."
        ),
    },
    {
        "id": "05",
        "name": "pp-separator-insert",
        "prompt": (
            "Professional industrial product photography, clean white seamless background, "
            "soft lighting, sharp focus, no people, 8K. "
            "Product: PP polypropylene corrugated grid separator / insert panel, "
            "flat rectangular panel approximately 500x400mm with a regular grid of "
            "rectangular cells created by interlocking vertical and horizontal PP corrugated strip dividers. "
            "The grid looks like a window or egg-crate structure made from plastic strips. "
            "Grey color, slots interlocked at right angles. "
            "3/4 isometric top-down view showing the grid cell structure clearly. "
            "Cut edges of strips show hollow flute channels. "
            "Used in automotive and electronics packaging as anti-scratch part separators."
        ),
    },
    {
        "id": "06",
        "name": "pp-corrugated-box-closed",
        "prompt": (
            BASE_STYLE +
            " Product: PP polypropylene twin-wall corrugated box, fully closed with lid on. "
            "Grey color. Front 3/4 angle. "
            "Rectangular box approximately 500x350x250mm. "
            "Smooth plastic walls, small black PP rivet fasteners at corners and along fold lines. "
            "Saffron orange PGG screen-printed text on front face, company name below. "
            "Clean industrial returnable plastic packaging box."
        ),
    },
    {
        "id": "07",
        "name": "esd-pp-box",
        "prompt": (
            "Professional industrial product photography, dark charcoal studio background, "
            "dramatic side lighting, sharp focus, no people, 8K. "
            "Product: ESD anti-static PP polypropylene corrugated box, lid open. "
            "Very dark charcoal / black color -- carbon-loaded conductive PP material. "
            "3/4 isometric view. "
            "Same twin-wall hollow flute structure but in black conductive PP. "
            "Small yellow ESD ground warning symbol sticker on front. "
            "Small PGG label in saffron orange. "
            "Interior visible showing black corrugated walls. "
            "Used for electronics/PCB component packaging. Anti-static returnable container."
        ),
    },
    {
        "id": "08",
        "name": "export-pallet",
        "prompt": (
            "Photorealistic industrial warehouse photography, warm directional lighting, "
            "shallow depth of field, no people, 8K. "
            "A wooden export pallet loaded with 12 grey PP polypropylene corrugated boxes "
            "stacked neatly 3x4, all closed and identical. "
            "Each box has a small saffron orange PGG label visible on front face. "
            "Clear transparent stretch shrink-wrap film tightly wrapped around the entire pallet stack. "
            "Pallet on clean concrete warehouse floor. "
            "Soft background blur showing industrial warehouse racking. "
            "Professional export logistics photography."
        ),
    },
    {
        "id": "09",
        "name": "product-family-flatlay",
        "prompt": (
            "Top-down flat lay product photography on white seamless background, "
            "consistent overhead lighting, soft shadows, no people, 8K. "
            "An arranged collection of PP polypropylene corrugated packaging products: "
            "1 open sky-blue foldable box (top-left), "
            "1 grey automotive grid tray (top-right), "
            "1 stack of white corrugated sheets fanned slightly (center-left), "
            "1 grey layer pad (center), "
            "1 grey PP separator insert panel (center-right), "
            "1 black ESD box (bottom-left), "
            "1 closed grey PP box (bottom-right). "
            "Small white card printed PUNE GLOBAL GROUP placed at center with pen. "
            "All products are rigid plastic twin-wall PP corrugated material. "
            "Brand family product photography. Clean, precise, editorial."
        ),
    },
]


def generate_image(shot, client):
    out_path = OUT_DIR / "shot-{}-{}.png".format(shot["id"], shot["name"])
    if out_path.exists():
        print("  [SKIP] {} already exists".format(out_path.name))
        return True

    print("  [GEN]  Shot {} - {} ...".format(shot["id"], shot["name"]))
    try:
        response = client.models.generate_images(
            model="imagen-4.0-generate-001",
            prompt=shot["prompt"],
            config={
                "number_of_images": 1,
                "aspect_ratio": "4:3",
                "safety_filter_level": "block_low_and_above",
                "person_generation": "dont_allow",
            },
        )

        if response.generated_images:
            img_data = response.generated_images[0].image.image_bytes
            out_path.write_bytes(img_data)
            size_kb = len(img_data) // 1024
            print("  [OK]   Saved -> {} ({} KB)".format(out_path.name, size_kb))
            return True

        print("  [WARN] No image returned for shot {}".format(shot["id"]))
        return False

    except Exception as e:
        print("  [ERR]  Shot {} failed: {}".format(shot["id"], e))
        return False


def main():
    print("=" * 60)
    print("PGG Product Shot Generator -- Imagen 4 (v2 corrected)")
    print("Output: {}".format(OUT_DIR))
    print("=" * 60)

    try:
        from google import genai
        client = genai.Client(api_key=API_KEY)
        print("[OK] Gemini client initialised\n")
    except ImportError:
        print("[ERR] google-genai not installed. Run: pip install google-genai")
        return

    ok = 0
    for i, shot in enumerate(SHOTS):
        success = generate_image(shot, client)
        if success:
            ok += 1
        if i < len(SHOTS) - 1:
            print("      (waiting 5s...)")
            time.sleep(5)

    print()
    print("=" * 60)
    print("Done. {}/{} images generated -> public/products/".format(ok, len(SHOTS)))
    print("=" * 60)


if __name__ == "__main__":
    main()
