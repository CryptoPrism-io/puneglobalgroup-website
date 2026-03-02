#!/usr/bin/env python3
"""
Generate 48 PP corrugated hollow sheet tray product images using Gemini REST API.
8 tray types x 6 images each.
Model: gemini-3.1-flash-image-preview | Temp: 1 | top_p: 0.07

MATERIAL: Twin-wall PP corrugated hollow sheet (Coroplast / Correx type).
CONSTRUCTION: Autolocking tab-and-slot joints — NO rivets, NO adhesive, NO welding.
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

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "products", "pp", "trays")
os.makedirs(OUT_DIR, exist_ok=True)

SYSTEM_PROMPT = """Ultra-realistic 8K industrial product photography.

CRITICAL MATERIAL SPECIFICATION — PP CORRUGATED HOLLOW SHEET:
The product material is PP corrugated hollow sheet (also known as Coroplast, Correx, Corflute, twin-wall polypropylene, or PP flute board). This is NOT solid injection-molded plastic. The material structure is:
- Two thin flat polypropylene skins (top and bottom faces) connected by parallel vertical ribs forming hollow rectangular channels/flutes between them.
- Total sheet thickness ranges from 2 mm to 6 mm.
- When viewed from the cut edge, the hollow parallel channels/flutes are clearly visible as a row of rectangular tubes.
- The flat surface shows subtle vertical linear texture from the internal flutes running beneath.
- The material is lightweight, semi-rigid, and looks similar to corrugated cardboard but made from polypropylene plastic.
- The material has a matte, slightly textured surface — NOT glossy, NOT smooth like injection-molded plastic.

CONSTRUCTION METHOD — AUTOLOCKING (NO RIVETS):
Products are die-cut from flat PP corrugated sheet and assembled by folding. Corners are joined using a flush autolocking mechanism — the tabs sit flush with the surface so the corners appear clean and seamless. The autolocking joint is subtle and nearly invisible from normal viewing distance.
- DO NOT show any rivets, pop-rivets, screws, staples, or metal fasteners.
- DO NOT show large protruding tabs or exaggerated interlocking features.
- Corners should look clean, neat, and professional — as if the walls simply meet at tight, flush joints.
- The construction detail is only visible on very close inspection.

Export-grade commercial catalogue quality.

Lighting: high-key white industrial studio lighting, 5200K neutral color temperature, evenly diffused multi-softbox setup, no dramatic shadows, no underexposure, no overexposure, no cinematic lighting.

Background: clean white seamless backdrop, smooth gradient-free surface, no texture unless explicitly specified.

Camera: 50mm full-frame equivalent lens, natural perspective, no wide-angle distortion, no fisheye, no exaggerated depth compression.

Exposure: evenly balanced highlights and midtones, crisp edge definition, realistic shadow softness directly beneath object.

Surface realism: matte twin-wall PP corrugated sheet texture, subtle vertical flute lines visible on surface, non-glossy, physically accurate material rendering showing the hollow flute structure at cut edges.

Structural realism: correct wall thickness showing twin-wall cross-section, accurate proportions, real-world physics, no floating objects. Clean flush corners with no visible fasteners — no rivets, no screws.

Color accuracy: neutral white balance, true-to-life industrial color reproduction, no oversaturation.

Rendering style: professional manufacturing catalogue photography, not artistic, not stylized, not CGI-looking, not toy-like. Must look like real PP corrugated hollow sheet products with clean seamless corners.

Resolution: ultra-high resolution 8K clarity with sharp focus across product surface.

No branding, no logos, no watermark, no text overlay unless specified."""

# Material + construction description to prepend to every prompt
MAT = "Made from PP corrugated hollow sheet (twin-wall polypropylene, Coroplast-type) — two flat PP skins with parallel hollow flutes visible at cut edges. Clean flush clean seamless corners — no rivets, no screws, no adhesive, no welding. Corners appear neat and seamless with the locking mechanism flush and subtle."

# --- 48 Prompts organized by tray type ---
TRAYS = [
    {
        "slug": "folded-corner",
        "name": "Folded Corner Tray (Shallow)",
        "prompts": [
            ("hero", f"Ultra-realistic high-key industrial product photography of a shallow folded-corner tray made from PP corrugated hollow sheet. {MAT} Material: 4 mm twin-wall PP corrugated. Size: 600 x 400 x 120 mm. Color: industrial neutral grey matte. Die-cut from a single flat blank — corners folded up with clean flush joints — no rivets, no fasteners, seamless corner construction. Hollow flute channels visible at the top cut edges. Flute direction vertical on side walls. Studio: white seamless background, 5200K, diffused softbox lighting. Camera: 50mm, three-quarter angle. Surface: matte PP with subtle vertical flute lines. No branding."),
            ("alt", f"Ultra-realistic studio shot of a shallow folded-corner tray, 4 mm twin-wall PP corrugated hollow sheet, 600x400x120 mm, neutral grey. {MAT} Low 20-degree angle to show the clean flush corner joints and hollow flute channels at edges. No rivets or fasteners visible — corners appear neat and seamless. White seamless, 5200K, 50mm lens."),
            ("usecase1", f"Ultra-realistic industrial photo of a folded-corner PP corrugated hollow sheet tray (600x400x120 mm, 4 mm twin-wall) on a metal workbench holding machined components in an assembly station. {MAT} Neutral grey tray with clean flush corners, no rivets. Assembly line background slightly blurred. 5200K, 50mm, eye-level."),
            ("usecase2", f"Ultra-realistic industrial photo of multiple folded-corner PP corrugated hollow sheet trays stacked on a metal trolley between workstations. {MAT} Trays partially filled with parts, neutral grey, clean flush corners, no rivets visible. Warehouse corridor background, 5200K, 50mm, three-quarter angle."),
            ("cad", f"Technical isometric engineering drawing of a folded-corner PP corrugated hollow sheet tray. {MAT} Overall: 600x400x120 mm, 4 mm twin-wall PP. Show: die-cut blank layout with fold lines, twin-wall flute cross-section detail callout, dimension annotations (L, W, H). Title block with material spec '4 mm twin-wall PP corrugated'. White background, thin technical lines. No rivets or fasteners."),
            ("section", f"Technical sectional/exploded drawing of a PP corrugated hollow sheet tray showing corner construction and material cross-section. {MAT} Show: twin-wall structure cross-section (two PP skins + hollow flutes), flush corner fold detail, fold reinforcement. Callouts: sheet thickness 4 mm, flute pitch, skin thickness, fold geometry. Clean white background, thin technical lines."),
        ]
    },
    {
        "slug": "stackable-interlocking",
        "name": "Stackable Tray with Interlocking Lip",
        "prompts": [
            ("hero", f"Ultra-realistic studio photography of a stackable tray with reinforced folded-over interlocking top lip, made from PP corrugated hollow sheet. {MAT} Material: 5 mm twin-wall PP corrugated. Size: 600 x 400 x 120 mm. Color: industrial blue matte. The top edge has a folded-over lip for stacking interlock. Clean seamless joints at corners (no rivets). Hollow flute channels visible at cut edges. White seamless, 5200K, 50mm, three-quarter angle."),
            ("alt", f"Ultra-realistic studio shot showing two PP corrugated hollow sheet stackable trays stacked with interlocking lips engaged. {MAT} 5 mm twin-wall PP, blue. Low angle to show lip mating and hollow flute edges. Clean seamless corners, no rivets. White background, 5200K."),
            ("usecase1", f"Warehouse photo of multiple stackable PP corrugated hollow sheet trays loaded with parts and stacked on a pallet. {MAT} 5 mm twin-wall blue trays with interlocking lips. Clean seamless corners. Warehouse racks blurred behind. 5200K, 50mm, eye-level."),
            ("usecase2", f"Industrial photo of an operator lifting a stackable PP corrugated hollow sheet tray from a stack on an assembly line conveyor. {MAT} Blue twin-wall 5 mm trays, clean flush corners, no rivets, no rivets. 5200K, 50mm."),
            ("cad", f"Isometric engineering drawing of a stackable tray with interlocking lip, made from PP corrugated hollow sheet with clean seamless construction. {MAT} 600x400x120 mm, 5 mm twin-wall PP. Show: lip fold geometry, interlock groove detail, clean folded corner joint, twin-wall cross-section callout. Title block. No rivets anywhere."),
            ("section", f"Sectional drawing showing the interlocking lip engagement and clean seamless corner detail of a PP corrugated hollow sheet stackable tray. {MAT} Show: lip cross-section with twin-wall flute structure, folded lip reinforcement, clean folded corner joint mechanism, stacking load path. Callouts for lip thickness, twin-wall structure. No rivets."),
        ]
    },
    {
        "slug": "fixed-dividers",
        "name": "Tray with Fixed Dividers (Cross-partition grid)",
        "prompts": [
            ("hero", f"Ultra-realistic studio shot of a tray with fixed internal cross-partition grid dividers, all made from PP corrugated hollow sheet. {MAT} Material: 4 mm twin-wall PP. Size: 600x400x120 mm. Color: industrial yellow matte. Outer tray has clean flush corners, no rivets (no rivets). Inner dividers are slotted PP corrugated sheets interlocked in a grid pattern. Hollow flute channels visible at top edges. White seamless studio, 5200K, 50mm, three-quarter angle."),
            ("alt", f"Alternate studio angle looking down into the cross-partition grid compartments of a PP corrugated hollow sheet tray. {MAT} 4 mm twin-wall yellow tray with clean flush corners, no rivets. Slotted interlocking dividers forming the grid. Hollow flute structure visible at all cut edges. 5200K."),
            ("usecase1", f"Industrial photo of a PP corrugated hollow sheet tray with cross-partition grid dividers holding industrial parts for kitting — bearings, machined components, one per compartment. {MAT} Yellow 4 mm twin-wall tray, clean seamless corners, on a workbench. Assembly line blurred behind. 50mm, 5200K."),
            ("usecase2", f"Lab/inspection table photo showing an operator checking parts in compartments of a PP corrugated hollow sheet divider tray. {MAT} Yellow 4 mm twin-wall, clean seamless corners, cross-partition grid. 5200K, eye-level."),
            ("cad", f"Technical isometric engineering drawing of a tray with cross-partition grid dividers, all from PP corrugated hollow sheet. {MAT} Show: compartment sizes, slot detail where dividers interlock, clean seamless corner joints on outer tray, twin-wall cross-section callout, dimensions. Title block. No rivets."),
            ("section", f"Sectional drawing through a divider slot junction and corner seamless folded joint of a PP corrugated hollow sheet tray with grid dividers. {MAT} Show: slot cut through twin-wall sheet for divider interlocking, clean seamless at corner, flute profile, divider depth. Callouts for slot width, tab size, tolerances. No rivets."),
        ]
    },
    {
        "slug": "lid-compatible",
        "name": "Lid-Compatible Tray (Tray + Lid)",
        "prompts": [
            ("hero", f"Studio photo of a PP corrugated hollow sheet tray with a matching lid seated on top. {MAT} Tray: 4 mm twin-wall neutral grey, Lid: 3 mm twin-wall PP (same grey). Size: 600x400x120 mm. Lid overlaps tray walls. Both tray and lid have clean flush corners, no rivets (no rivets). Twin-wall flute edges visible. White background, 5200K, 50mm."),
            ("alt", f"PP corrugated hollow sheet tray with lid lifted 40-60 mm above to show fit alignment. {MAT} Neutral grey 4 mm twin-wall tray, 3 mm lid. Clean seamless corners on both pieces, no rivets. Hollow flute channels at all edges. White studio, 50mm, 5200K."),
            ("usecase1", f"Warehouse photo of multiple PP corrugated hollow sheet trays with lids stacked on a pallet for export. {MAT} Neutral grey twin-wall trays, lids seated, clean flush corners, no rivets, no rivets. Stacked neatly showing thin sheet edges. 5200K, eye-level."),
            ("usecase2", f"Clean-room bench photo of a PP corrugated hollow sheet tray with lid containing sterile-pack components. {MAT} Neutral grey twin-wall tray + lid, gloved hands nearby. Clean seamless corners. 5200K."),
            ("cad", f"Isometric engineering drawing of PP corrugated hollow sheet tray and lid with clean seamless construction. {MAT} Show: lid overlap depth, seamless folded joint details on both pieces, twin-wall cross-section of tray and lid, fold geometry, tolerances. Title block. No rivets."),
            ("section", f"Sectional drawing through the lid-tray overlap and clean seamless corner of PP corrugated hollow sheet construction. {MAT} Show: lid overlap, twin-wall flute profiles in both tray and lid, seamless corner interlocking mechanism, fold reinforcement. Callouts: tray 4 mm, lid 3 mm, tab dimensions. No rivets."),
        ]
    },
    {
        "slug": "heavy-duty",
        "name": "Heavy-Duty Reinforced Tray",
        "prompts": [
            ("hero", f"Studio photo of a heavy-duty reinforced tray made from PP corrugated hollow sheet with doubled-wall reinforcement. {MAT} Material: 6 mm twin-wall PP corrugated, with extra PP corrugated strips folded and locked inside walls for stiffness. Size: 700x500x160 mm. Color: industrial black matte. Clean seamless corners (no rivets). Reinforcement strips held by additional seamless folded joints. Flute edges visible. White background, 5200K, 50mm."),
            ("alt", f"Low-angle studio shot of a heavy-duty PP corrugated hollow sheet tray showing internal reinforcement ribs and clean flush corners, no rivets. {MAT} Black 6 mm twin-wall PP. Low angle to emphasize structural rigidity. No rivets — only seamless folded joints. Flute channels at edges. 5200K."),
            ("usecase1", f"Industrial photo of heavy-duty PP corrugated hollow sheet trays holding cast metal parts on a pallet in a manufacturing bay. {MAT} Black 6 mm twin-wall trays, clean flush corners, no rivets. 50mm, eye-level, 5200K."),
            ("usecase2", f"Warehouse photo of forklift carrying a pallet stacked with heavy-duty PP corrugated hollow sheet trays. {MAT} Black twin-wall trays, clean seamless construction, showing tray integrity under load. 5200K."),
            ("cad", f"Isometric engineering drawing of heavy-duty reinforced tray from PP corrugated hollow sheet with clean seamless construction. {MAT} Show: reinforcement strip layout (extra PP corrugated strips locked inside), corner seamless folded joint detail, twin-wall cross-section, rib spacing. Annotations. Title block. No rivets."),
            ("section", f"Sectional drawing of heavy-duty PP corrugated hollow sheet tray showing base reinforcement and clean seamless corner seamless folded joint. {MAT} Show: main 6 mm twin-wall cross-section, reinforcement strip interlocked to base, corner seamless assembly, flute profile, load path. Callouts for all thicknesses. No rivets."),
        ]
    },
    {
        "slug": "esd-antistatic",
        "name": "ESD / Anti-Static Tray",
        "prompts": [
            ("hero", f"Studio photo of an ESD-safe tray made from conductive PP corrugated hollow sheet with clean seamless construction. {MAT} Material: 4 mm conductive black twin-wall PP corrugated (carbon-loaded for ESD). Size: 450x350x50 mm. Color: matte black (ESD characteristic). Clean seamless corners, no rivets. Hollow flute at cut edges. Subtle ESD symbol. White background, 5200K, 50mm."),
            ("alt", f"ESD-safe PP corrugated hollow sheet tray holding green PCBs organized inside. {MAT} Black conductive 4 mm twin-wall PP, clean flush corners, no rivets, no rivets. Clean assembly bench blurred behind. Flute structure at edges. 5200K."),
            ("usecase1", f"Factory photo of ESD-safe PP corrugated hollow sheet trays on an SMT conveyor line carrying PCB assemblies. {MAT} Black conductive twin-wall trays, clean seamless construction. Technicians in background. 5200K, eye-level."),
            ("usecase2", f"Clean packaging area photo of ESD-safe PP corrugated hollow sheet trays being packed into outer cartons for shipping. {MAT} Black conductive twin-wall trays, clean flush corners, no rivets, stacked. 5200K."),
            ("cad", f"Technical isometric drawing of ESD-safe tray from conductive PP corrugated hollow sheet with clean seamless joints. {MAT} Show: tray with internal PCB divisions, pocket spacing dimensions, clean seamless corner detail, twin-wall cross-section with conductivity callout (surface resistivity ohm/sq). Title block with ESD spec. No rivets."),
            ("section", f"Sectional drawing of ESD conductive PP corrugated hollow sheet tray showing twin-wall structure and clean seamless corner. {MAT} Show: conductive carbon-loaded PP skins in cross-section, flute profile, clean seamless joint mechanism, optional grounding strap point. Conductivity callouts. No rivets."),
        ]
    },
    {
        "slug": "collapsible",
        "name": "Collapsible / Fold-Flat Tray",
        "prompts": [
            ("hero", f"Studio photo showing a collapsible PP corrugated hollow sheet tray in both erected and collapsed (flat) states side by side. {MAT} Material: 4 mm twin-wall PP, 600x400x120 mm erected. Color: industrial green matte. Clean seamless corners that lock when erected and release when flattened. Scored hinge lines for folding. No rivets. White studio, 5200K, 50mm."),
            ("alt", f"Studio shot of a collapsible PP corrugated hollow sheet tray mid-fold, showing the hinge mechanics and clean seamless joints engaging as walls fold up. {MAT} 4 mm green twin-wall PP. Flute channels at edges. No rivets. 5200K."),
            ("usecase1", f"Warehouse photo of collapsed PP corrugated hollow sheet trays stacked flat on a pallet for return shipment. {MAT} 4 mm green twin-wall PP, clean seamless design. Shows how thin the collapsed trays stack. 50mm, 5200K."),
            ("usecase2", f"Field service van interior showing collapsed PP corrugated hollow sheet trays stored flat; one erected on bench with components inside. {MAT} Green 4 mm twin-wall, clean flush corners, no rivets. 5200K, eye-level."),
            ("cad", f"Isometric engineering drawing of collapsible PP corrugated hollow sheet tray showing both erected and collapsed views, with clean seamless construction. {MAT} Show: die-cut blank with fold lines, tab positions, slot positions, score lines, hinge scoring depth (partial through one skin), collapsed vs erected dimensions. Title block. No rivets."),
            ("section", f"Sectional drawing showing hinge scoring and clean seamless joint detail of collapsible PP corrugated hollow sheet tray. {MAT} Show: score line cutting one PP skin for hinge, seamless engagement mechanism at corner, flute profile, scoring depth %. Reinforcement strategies (edge doubling). No rivets."),
        ]
    },
    {
        "slug": "foam-laminated",
        "name": "Foam-Laminated Protective Tray",
        "prompts": [
            ("hero", f"Studio photo of a foam-laminated tray with PP corrugated hollow sheet base and clean flush corners, no rivets. {MAT} Base: 4 mm twin-wall PP corrugated, top: 3 mm black EVA foam heat-laminated. Size: 500x400x80 mm. Die-cut contour cavities through foam and PP for holding delicate parts. Clean seamless corners, no rivets. Twin-wall flute at side edges. White studio, 5200K, 50mm."),
            ("alt", f"Close studio angle showing cavity walls and foam edge cut on a foam-laminated PP corrugated hollow sheet tray. {MAT} 4 mm twin-wall PP base with hollow flutes visible at edge, 3 mm black foam on top. Clean seamless corner visible. 5200K."),
            ("usecase1", f"Clean-room photo of a foam-laminated PP corrugated hollow sheet tray holding optical lens assemblies in die-cut foam cavities, gloved hands placing a component. {MAT} Twin-wall PP base + foam, clean flush corners, no rivets. 5200K, eye-level."),
            ("usecase2", f"Warehouse packing station photo of foam-laminated PP corrugated hollow sheet trays being nested into outer cartons for air freight. {MAT} Twin-wall PP base + foam, clean flush corners, no rivets. 5200K."),
            ("cad", f"Isometric engineering drawing of foam-laminated tray on PP corrugated hollow sheet base with clean seamless construction. {MAT} Show: foam layer 3 mm, twin-wall PP 4 mm with flute cross-section, die-cut cavity dimensions, clean seamless corner detail, lamination boundary. Title block. No rivets."),
            ("section", f"Section drawing showing cross-section of foam bonded to PP corrugated hollow sheet, plus clean seamless corner joint. {MAT} Show: twin-wall PP (two skins + flutes), adhesive/heat-bond layer, EVA foam, die-cut cavity depth, seamless corner mechanism. Callouts: foam 3 mm, PP 4 mm, flute pitch, tab dimensions. No rivets."),
        ]
    },
]

IMAGE_LABELS = {
    "hero": "Hero",
    "alt": "Alternate angle",
    "usecase1": "Use Case 1",
    "usecase2": "Use Case 2",
    "cad": "CAD isometric",
    "section": "Sectional/Exploded",
}

def generate_image(prompt_text, output_path, model=MODEL):
    """Call Gemini REST API and save the image."""
    full_prompt = SYSTEM_PROMPT + "\n\n" + prompt_text

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"

    payload = {
        "contents": [{"parts": [{"text": full_prompt}]}],
        "generationConfig": {
            "responseModalities": ["image", "text"],
            "temperature": 1,
            "topP": 0.07,
        }
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        return False, f"{e.code} {e.reason}. {body[:200]}"
    except Exception as e:
        return False, str(e)

    # Extract image from response
    try:
        parts = result["candidates"][0]["content"]["parts"]
        for part in parts:
            if "inlineData" in part:
                img_data = base64.b64decode(part["inlineData"]["data"])
                with open(output_path, "wb") as f:
                    f.write(img_data)
                return True, f"{len(img_data)//1024} KB"
        return False, "No image in response"
    except (KeyError, IndexError) as e:
        return False, f"Parse error: {e}"


def main():
    total = sum(len(t["prompts"]) for t in TRAYS)
    done = 0
    skipped = 0
    failed = 0

    print(f"Output directory: {os.path.abspath(OUT_DIR)}")
    print(f"Model: {MODEL}")
    print(f"Generating {total} PP corrugated hollow sheet AUTOLOCKING tray images...\n")

    for tray in TRAYS:
        slug = tray["slug"]
        print(f"--- {tray['name']} ({slug}) ---")

        for img_key, prompt in tray["prompts"]:
            filename = f"tray-{slug}-{img_key}.jpg"
            filepath = os.path.join(OUT_DIR, filename)
            label = IMAGE_LABELS.get(img_key, img_key)

            # Skip if already exists
            if os.path.exists(filepath) and os.path.getsize(filepath) > 5000:
                print(f"  SKIP (exists): {filename}")
                skipped += 1
                done += 1
                continue

            print(f"  [{done+1}/{total}] {label}: {filename} ...", end=" ", flush=True)

            ok, msg = generate_image(prompt, filepath)
            if ok:
                print(f"OK ({msg})")
                done += 1
            else:
                print(f"FAIL: {msg}")
                failed += 1
                done += 1

            # Rate limit: ~2 sec between requests
            time.sleep(2)

        print()

    print(f"\nDone: {total - failed}/{total} images generated ({skipped} skipped, {failed} failed).")


if __name__ == "__main__":
    main()
