"""
PGG Product Shot Generator -- Imagen 4 Fast + Reference Images
- Model: imagen-4.0-fast-generate-001
- Output prefix: fast-shot-XX-name.png
- Each prompt accompanied by a real PP corrugated product reference image
"""

import time
import base64
from pathlib import Path
from google import genai
from google.genai import types

API_KEY = "AIzaSyDARq7WC2dqTWL0rEk1V1SH_PfHfJjBXtE"
OUT_DIR = Path("public/products")
REFS_DIR = Path("public/products/refs")

client = genai.Client(api_key=API_KEY)

def load_ref(filename):
    path = REFS_DIR / filename
    if not path.exists():
        print("  [WARN] ref not found: {}".format(filename))
        return None
    return path.read_bytes()


BASE_STYLE = (
    "High-end industrial product photography on clean white seamless studio background. "
    "Soft overhead diffused lighting with subtle drop shadow. Sharp focus. No people. No text overlays. 8K. "
    "The product is PP polypropylene twin-wall corrugated hollow-flute rigid plastic packaging -- "
    "smooth flat outer surfaces, parallel hollow rectangular channels on cut edges, slight plastic sheen. "
    "Sky blue or mid-grey color. PP plastic rivet fasteners at corners. "
    "Small saffron-orange 'PGG' screen-printed label on front face. "
    "Visually identical to the product in the REFERENCE IMAGE but with PGG branding and saffron-orange accent."
)

SHOTS = [
    {
        "id": "01",
        "name": "pp-foldable-box",
        "ref": "ref-nilkamal-box.jpg",
        "ref_note": "Nilkamal blue PP corrugated foldable box, open lid, riveted corners",
        "prompt": (
            BASE_STYLE +
            " Product: PP polypropylene twin-wall corrugated FOLDABLE BOX, lid open 90 degrees. "
            "Sky blue. 3/4 isometric angle, slight elevation. "
            "Smooth plastic walls, small black PP rivet fasteners at corners. "
            "Cut edge of lid panel clearly shows the parallel hollow rectangular flute channels. "
            "Saffron-orange PGG screen-printed label on front wall. ~600x400x300mm. "
            "Exactly like the reference image but PGG-branded."
        ),
    },
    {
        "id": "02",
        "name": "pp-automotive-tray",
        "ref": "ref-pptray.webp",
        "ref_note": "PP corrugated flat tray with grid divider strips inside",
        "prompt": (
            "High-end industrial product photography, white seamless background, soft lighting, no people, 8K. "
            "Product: PP polypropylene corrugated AUTOMOTIVE PARTS TRAY. "
            "Flat rectangular tray, low walls, interior has a 5x4 grid of interlocking PP corrugated divider strips. "
            "Top-down flat lay view. Grey color. "
            "Hollow flute channels visible on cut edges of divider strips. "
            "Small PGG adhesive label sticker in one corner. "
            "Used for automotive component returnable packaging. "
            "Exactly like the reference image but PGG-branded with grey color."
        ),
    },
    {
        "id": "03",
        "name": "pp-corrugated-sheets",
        "ref": "ref-ppbox.webp",
        "ref_note": "PP twin-wall corrugated plastic sheet/panel",
        "prompt": (
            "Professional industrial product photography, white seamless background, soft lighting, no people, 8K. "
            "Product: stack of 8 PP polypropylene HOLLOW CORRUGATED FLAT SHEETS, slightly fanned to show individual sheets. "
            "Side profile view at 20 degree angle. Natural white / light grey translucent plastic. "
            "The cut edge of each sheet CLEARLY shows the parallel hollow rectangular channels inside the twin-wall structure "
            "-- multiple small rectangular tunnels running the full length of the sheet. This is the key feature. "
            "Smooth flat surfaces top and bottom. Top sheet has small PGG adhesive label. "
            "These are Coroplast fluted polypropylene sheets, rigid plastic, not cardboard."
        ),
    },
    {
        "id": "04",
        "name": "pp-layer-pad",
        "ref": "ref-ppbox.webp",
        "ref_note": "PP corrugated flat sheet for reference of material appearance",
        "prompt": (
            "Professional product photography, white seamless background, soft lighting, no people, 8K. "
            "Product: 4 PP polypropylene corrugated LAYER PADS fanned out in a spread at 45 degrees. "
            "Light grey or natural white. Each pad is a flat rectangular sheet ~1200x1000mm, 4mm thick. "
            "Smooth flat top surface, cut edge shows parallel hollow flute channels. "
            "One pad has small saffron-orange PGG corner mark. "
            "Clean, minimal product shot. Used for pallet layer separation."
        ),
    },
    {
        "id": "05",
        "name": "pp-grid-separator",
        "ref": "ref-separator.webp",
        "ref_note": "PP corrugated grid insert / separator panel with interlocking strips",
        "prompt": (
            "Professional product photography, white seamless background, soft lighting, no people, 8K. "
            "Product: PP polypropylene corrugated GRID SEPARATOR / INSERT. "
            "Flat panel ~500x400mm with regular grid of rectangular cells. "
            "Made by interlocking vertical and horizontal PP corrugated strip dividers at 90 degrees. "
            "Grey color. 3/4 isometric top-down view showing the grid cell structure clearly. "
            "Hollow flute channels visible on cut edges of strips. "
            "Exactly like the reference image. Small PGG label on one corner strip. "
            "Used in automotive and electronics for anti-scratch part separation."
        ),
    },
    {
        "id": "06",
        "name": "pp-box-closed",
        "ref": "ref-ppbox.webp",
        "ref_note": "PP corrugated box closed",
        "prompt": (
            BASE_STYLE +
            " Product: PP polypropylene twin-wall corrugated BOX, fully closed with lid locked. "
            "Grey. Front 3/4 angle. ~500x350x250mm. "
            "Smooth plastic walls, black PP rivet fasteners at corners and fold lines. "
            "Saffron-orange PGG screen-printed text on front. "
            "Rigid returnable industrial plastic box."
        ),
    },
    {
        "id": "07",
        "name": "esd-pp-box",
        "ref": "ref-esd.webp",
        "ref_note": "Black ESD anti-static PP corrugated box",
        "prompt": (
            "Professional product photography, dark charcoal studio background, "
            "dramatic side lighting, sharp focus, no people, 8K. "
            "Product: ESD ANTI-STATIC PP polypropylene corrugated box, lid open. "
            "Very dark charcoal / black -- carbon-loaded conductive PP material. "
            "3/4 isometric view. Same twin-wall hollow flute structure but black conductive PP. "
            "Small yellow ESD triangle warning sticker on front. PGG label in saffron-orange. "
            "Interior shows black corrugated walls. "
            "Exactly like the reference image but with PGG branding. "
            "Anti-static electronics returnable packaging."
        ),
    },
    {
        "id": "08",
        "name": "export-pallet",
        "ref": "ref-nilkamal-box.jpg",
        "ref_note": "PP corrugated boxes for pallet reference",
        "prompt": (
            "Photorealistic industrial warehouse photography, warm directional lighting, "
            "shallow depth of field, no people, 8K. "
            "Wooden export pallet loaded with 12 GREY PP polypropylene corrugated boxes stacked 3x4. "
            "Each box has small saffron-orange PGG label on front. All closed and identical. "
            "Clear stretch shrink-wrap film tightly wrapped around entire pallet. "
            "Pallet on clean concrete warehouse floor. "
            "Blurred warehouse racking in background. Professional export logistics shot."
        ),
    },
    {
        "id": "09",
        "name": "product-family-flatlay",
        "ref": "ref-pptray.webp",
        "ref_note": "PP corrugated tray for material reference",
        "prompt": (
            "Top-down flat lay product photography, white seamless background, "
            "consistent overhead lighting, soft shadows, no people, 8K. "
            "Neatly arranged collection of PP polypropylene corrugated packaging products: "
            "1 open sky-blue foldable box (top-left), "
            "1 grey automotive grid tray (top-right), "
            "1 stack of white corrugated sheets (center-left), "
            "1 grey layer pad (center), "
            "1 grey grid separator panel (center-right), "
            "1 black ESD box (bottom-left), "
            "1 closed grey box (bottom-right). "
            "White card printed PUNE GLOBAL GROUP at center with pen prop. "
            "All rigid plastic twin-wall PP corrugated. Brand family flat lay."
        ),
    },
]


def generate(shot):
    out_path = OUT_DIR / "fast-shot-{}-{}.png".format(shot["id"], shot["name"])
    if out_path.exists():
        print("  [SKIP] {}".format(out_path.name))
        return True

    print("  [GEN]  fast-shot-{} -- {} ...".format(shot["id"], shot["name"]))
    print("         ref: {}".format(shot["ref_note"]))

    ref_bytes = load_ref(shot["ref"])

    try:
        if ref_bytes:
            # Build reference image config
            ref_image = types.ReferenceImage(
                reference_image=types.Image(image_bytes=ref_bytes),
                reference_id=1,
                config=types.ReferenceImageConfig(
                    reference_type="STYLE"
                ),
            )
            response = client.models.generate_images(
                model="imagen-4.0-fast-generate-001",
                prompt=shot["prompt"],
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    aspect_ratio="4:3",
                    safety_filter_level="block_low_and_above",
                    person_generation="dont_allow",
                    reference_images=[ref_image],
                ),
            )
        else:
            # No reference image fallback
            response = client.models.generate_images(
                model="imagen-4.0-fast-generate-001",
                prompt=shot["prompt"],
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    aspect_ratio="4:3",
                    safety_filter_level="block_low_and_above",
                    person_generation="dont_allow",
                ),
            )

        if response.generated_images:
            img_data = response.generated_images[0].image.image_bytes
            out_path.write_bytes(img_data)
            print("  [OK]   {} ({} KB)".format(out_path.name, len(img_data)//1024))
            return True

        print("  [WARN] No image returned")
        return False

    except Exception as e:
        err = str(e)
        if "reference_images" in err or "ReferenceImage" in err or "INVALID" in err:
            print("  [WARN] Reference image not supported, retrying without ref...")
            try:
                response = client.models.generate_images(
                    model="imagen-4.0-fast-generate-001",
                    prompt=shot["prompt"],
                    config=types.GenerateImagesConfig(
                        number_of_images=1,
                        aspect_ratio="4:3",
                        safety_filter_level="block_low_and_above",
                        person_generation="dont_allow",
                    ),
                )
                if response.generated_images:
                    img_data = response.generated_images[0].image.image_bytes
                    out_path.write_bytes(img_data)
                    print("  [OK]   {} ({} KB) [no ref]".format(out_path.name, len(img_data)//1024))
                    return True
            except Exception as e2:
                print("  [ERR]  Retry also failed: {}".format(str(e2)[:120]))
        else:
            print("  [ERR]  {}".format(err[:200]))
        return False


def main():
    print("=" * 60)
    print("PGG Product Shot Generator -- Imagen 4 FAST + Ref Images")
    print("Output: {}".format(OUT_DIR))
    print("=" * 60)
    print()

    ok = 0
    for i, shot in enumerate(SHOTS):
        success = generate(shot)
        if success:
            ok += 1
        if i < len(SHOTS) - 1:
            time.sleep(3)

    print()
    print("=" * 60)
    print("Done. {}/{} -> public/products/fast-shot-*.png".format(ok, len(SHOTS)))
    print("=" * 60)


if __name__ == "__main__":
    main()
