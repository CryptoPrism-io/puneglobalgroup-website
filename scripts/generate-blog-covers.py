#!/usr/bin/env python3
"""
Generate editorial cover images for all blog posts.
Output: public/blog/<slug>.jpg (1280×720 landscape, magazine style)
"""
import sys, os, json, base64, urllib.request, urllib.error, time

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
    print("ERROR: GEMINI_API_KEY not set")
    sys.exit(1)

API_KEY = _load_api_key()
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "blog")
os.makedirs(OUT, exist_ok=True)

STYLE = (
    "Editorial magazine photography, 16:9 landscape. "
    "Professional commercial photography with intentional depth of field. "
    "Warm industrial colour palette — cream, charcoal, saffron accents. "
    "No text overlay, no logos, no watermarks. Clean, minimal, high production quality."
)

POSTS = [
    {
        "slug": "gsm-guide-paper-board",
        "prompt": (
            f"{STYLE} "
            "Overhead flat-lay of five stacked paper and board samples arranged in a fan pattern on a warm cream surface. "
            "Each sample is a different thickness — from thin white printing paper to thick rigid board. "
            "Cross-section edges face camera showing the different plies. "
            "One or two samples show the white-coated top side and grey back. "
            "Warm directional light from top-left. Shallow depth of field at edges."
        ),
    },
    {
        "slug": "fbb-vs-duplex-board",
        "prompt": (
            f"{STYLE} "
            "Two stacks of premium board side by side on a light grey concrete surface. "
            "Left stack: bright white premium FBB board, sharp edges, pristine surfaces. "
            "Right stack: duplex board showing the grey back distinctly. "
            "Cross-sections visible showing multi-ply construction. "
            "Dramatic side lighting creating depth between the stacks. "
            "Detail shot showing the tactile difference in surfaces."
        ),
    },
    {
        "slug": "export-packaging-compliance-india",
        "prompt": (
            f"{STYLE} "
            "Aerial view of a shipping export warehouse dock. "
            "Neatly stacked export cartons on wooden pallets wrapped in stretch film. "
            "A clipboard with a compliance checklist lies on top of one pallet. "
            "Fork lift partially visible in background. "
            "Muted warm tones — tan cardboard, grey concrete floor. "
            "Slight cinematic colour grade with industrial amber light from high skylights."
        ),
    },
    {
        "slug": "pp-corrugated-returnable-packaging",
        "prompt": (
            f"{STYLE} "
            "Inside an automotive component factory. "
            "A worker's hands are picking a machined metal component from a grey-blue PP corrugated tray with foam insert dividers. "
            "Behind: a neat stack of flat-folded PP corrugated boxes ready for return journey. "
            "Industrial factory floor setting — concrete, overhead lighting. "
            "Sharp focus on the tray and component, factory background softly blurred."
        ),
    },
    {
        "slug": "pp-corrugated-specification-guide",
        "prompt": (
            f"{STYLE} "
            "A technical workspace — a light grey desk with several PP corrugated samples in different thicknesses and flute profiles arranged in a neat row. "
            "A digital caliper measuring one sample's thickness. "
            "Next to it: a small cross-section cut showing the corrugated flute structure in detail. "
            "Clean, precise, minimal — like a quality control laboratory. "
            "Soft even lighting, shallow depth of field."
        ),
    },
    {
        "slug": "india-paper-board-market-2026",
        "prompt": (
            f"{STYLE} "
            "An Indian paper mill reel store — a vast high-ceilinged warehouse space filled with dozens of large white paper reels stored horizontally on racking. "
            "The reels recede into the distance creating a strong perspective. "
            "Warm ambient light filters through high windows. "
            "Clean, organised, industrial scale. Slightly desaturated cinematic grade."
        ),
    },
    {
        "slug": "esd-antistatic-pp-corrugated",
        "prompt": (
            f"{STYLE} "
            "A clean electronics assembly environment. "
            "Black anti-static PP corrugated trays holding multiple small green printed circuit boards (PCBs) neatly organised in a grid. "
            "Blue nitrile-gloved hands placing a PCB into a tray. "
            "Clean room setting with subtle blue-white lighting. "
            "Colour contrast: black tray, green PCBs, blue gloves. Crisp focus."
        ),
    },
    {
        "slug": "sheet-vs-reel-paper-supply",
        "prompt": (
            f"{STYLE} "
            "Split composition inside a paper converting facility. "
            "LEFT: a large paper reel mounted on a rewinder machine, paper web feeding through. "
            "RIGHT: neatly squared stack of freshly cut A1 sheets coming off a sheeter, perfect edges. "
            "Warm overhead factory lighting. Shallow depth of field creates separation between the two halves. "
            "No dividing line — the scene naturally separates the two processes."
        ),
    },
    {
        "slug": "cold-chain-board-packaging",
        "prompt": (
            f"{STYLE} "
            "A cold storage warehouse. "
            "White waxed corrugated board boxes stacked on pallets in a refrigerated environment — visible cold mist at floor level, icy blue light from the refrigeration units. "
            "A few boxes open at the top showing frozen food product inside. "
            "The boxes look pristine — no moisture damage despite the cold environment. "
            "Atmospheric, slightly blue-toned colour grade."
        ),
    },
    {
        "slug": "pp-layer-pads-palletisation",
        "prompt": (
            f"{STYLE} "
            "A logistics warehouse, eye-level view of a pallet being built. "
            "A worker in hi-vis vest places a flat grey PP corrugated layer pad between two layers of stacked products (boxes). "
            "The cross-section of the pallet in the foreground shows alternating product layers separated by pale grey PP sheets. "
            "Warehouse racking in background. Warm overhead industrial lighting. "
            "Focus on the layer pad placement, background softly blurred."
        ),
    },
    {
        "slug": "itc-pspd-vs-imported-board",
        "prompt": (
            f"{STYLE} "
            "Premium board quality inspection scene. "
            "A quality control engineer's hands (in a light-coloured coat) hold two board samples side by side, tilting them toward a window to compare surface brightness and coating. "
            "Behind: shelves with rolled board samples labelled with grade codes. "
            "Warm window light creating specular highlights on the coated board surfaces. "
            "Precise, professional, understated."
        ),
    },
    {
        "slug": "fsc-certification-india-guide",
        "prompt": (
            f"{STYLE} "
            "Atmospheric split composition. "
            "LEFT: dense green forest canopy photographed looking upward, sunlight filtering through leaves. "
            "RIGHT: premium white coated board sheets stacked neatly, bright and clean. "
            "The two halves blend softly in the centre with a shallow depth of field transition. "
            "Colour grade: lush greens on left, clean whites on right. No text, no logos."
        ),
    },
    {
        "slug": "pharma-packaging-board-specs",
        "prompt": (
            f"{STYLE} "
            "A pharmaceutical packaging production line. "
            "White folding cartons (secondary packaging) moving along a conveyor in a clean, well-lit GMP facility. "
            "A stack of unprinted premium white board in the background. "
            "Precise, clinical, ordered. Shallow depth of field on the cartons. "
            "High-key lighting, whites are clean and bright. "
            "No product names, no text visible on cartons."
        ),
    },
    {
        "slug": "pp-corrugated-esg-sustainability",
        "prompt": (
            f"{STYLE} "
            "Split environmental contrast composition. "
            "LEFT: a neat organised stack of durable grey PP corrugated returnable boxes in a clean factory — reusable, structured, ordered. "
            "RIGHT: a trolley of crushed single-use corrugated cardboard waste being collected for recycling — contrast with the left. "
            "The juxtaposition tells the sustainability story. "
            "Factory floor setting, warm industrial light. Clean, purposeful framing."
        ),
    },
]


def generate(prompt: str, out_path: str) -> bool:
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{MODEL}:generateContent?key={API_KEY}"
    )
    body = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
    }).encode()

    req = urllib.request.Request(
        url, data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                data = json.loads(r.read())
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code}: {e.read().decode()[:200]}")
            if attempt < 2:
                time.sleep(8)
                continue
            return False
        except Exception as e:
            print(f"  Err: {e}")
            if attempt < 2:
                time.sleep(8)
                continue
            return False

        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        for p in parts:
            if "inlineData" in p:
                b = base64.b64decode(p["inlineData"]["data"])
                with open(out_path, "wb") as f:
                    f.write(b)
                print(f"  OK {len(b)//1024} KB")
                return True

        txt = " | ".join(p.get("text","")[:80] for p in parts if "text" in p)
        print(f"  No image. Model: {txt[:160]}")
        return False

    return False


def main():
    ok = 0
    for i, post in enumerate(POSTS):
        slug = post["slug"]
        out = os.path.join(OUT, f"{slug}.jpg")
        print(f"[{i+1}/{len(POSTS)}] {slug}")
        if generate(post["prompt"], out):
            ok += 1
        time.sleep(2)

    print(f"\n{ok}/{len(POSTS)} generated → public/blog/")


if __name__ == "__main__":
    main()
