#!/usr/bin/env python3
"""
Generate extra paper/board product images — reel shot + palletised stack.
2 new images × 10 products = 20 images total.
Output: public/products/paper/[slug]-reel.jpg
        public/products/paper/[slug]-stack.jpg
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
    sys.exit(1)

API_KEY = _load_api_key()
ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "products", "paper")
os.makedirs(ROOT, exist_ok=True)

SYSTEM_PROMPT = """Ultra-realistic 8K commercial paper/board industrial photography.

SUBJECT: Coated paperboard and folding box board (FBB) — premium industrial packaging substrate.

PHOTOGRAPHY STANDARDS:
- Lighting: 5200K neutral, multi-softbox or industrial warehouse overhead, no harsh shadows
- Camera: 50mm full-frame equivalent, accurate perspective
- No branding, no logos, no watermarks, no text unless specified
- Export-grade commercial catalogue quality"""

# ─── Per-product visual specs ─────────────────────────────────────────────────
# front_desc: how the coated front face looks
# back_desc:  how the back looks (for reel edge / stack edge)
# cross_desc: cut-edge cross-section appearance

SPECS = {
    "cyber-xlpac-gc1": {
        "name": "Cyber XLPac GC1",
        "gsm": "280 GSM",
        "front": "brilliant white smooth clay-coated surface — high brightness, slightly glossy",
        "back":  "white coated back — also smooth white",
        "cross": "white top coat, multiple white/cream virgin fibre plies, white back coat",
        "app":   "pharma cartons and FMCG folding cartons",
    },
    "cyber-xlpac-gc2": {
        "name": "Cyber XLPac GC2",
        "gsm": "280 GSM",
        "front": "brilliant white smooth clay-coated surface",
        "back":  "uncoated manila/cream back — natural cream colour, slight paper texture",
        "cross": "white top coat, white/cream virgin fibre plies, uncoated cream manila back",
        "app":   "liquor cartons and high-speed filling line packaging",
    },
    "cyber-premium": {
        "name": "Cyber Premium",
        "gsm": "300 GSM",
        "front": "brilliant white smooth clay-coated surface — high bulk, slightly heavier caliper",
        "back":  "uncoated manila back — cream coloured",
        "cross": "white top coat, thick high-bulk virgin fibre plies, cream uncoated back",
        "app":   "glass bottle outer cartons and liquor packaging",
    },
    "pearlxl-packaging": {
        "name": "PearlXL Packaging",
        "gsm": "260 GSM",
        "front": "smooth white coated surface with pearl-lustre satin sheen",
        "back":  "uncoated manila back — cream coloured",
        "cross": "pearl-pigment top coat, virgin fibre plies, cream back",
        "app":   "FMCG everyday cartons and pharma secondary packaging",
    },
    "carte-lumina": {
        "name": "Carte Lumina",
        "gsm": "300 GSM",
        "front": "brilliant white, ultra-smooth, very high gloss — light catches as a bright reflection",
        "back":  "white coated back — smooth white",
        "cross": "high-gloss top coat, premium white virgin fibre plies, white back coat",
        "app":   "luxury cosmetics, perfume and premium brand packaging",
    },
    "safire-graphik": {
        "name": "Safire Graphik",
        "gsm": "270 GSM",
        "front": "brilliant white, ultra-smooth, very high brightness — 100% bleached chemical pulp",
        "back":  "smooth white coated back",
        "cross": "bright white SBS (solid bleached sulphate) — uniformly white throughout all plies, no brown/grey core",
        "app":   "POP displays, greeting cards and personal care cartons",
    },
    "cyber-oak": {
        "name": "Cyber Oak",
        "gsm": "270 GSM",
        "front": "white smooth coated front surface",
        "back":  "natural brown unbleached back — warm brown colour, uncoated",
        "cross": "white top coat, white/cream virgin fibre plies, natural brown unbleached back",
        "app":   "eco-positioned FMCG brands and consumer electronics cartons",
    },
    "eco-natura": {
        "name": "Eco Natura",
        "gsm": "300 GSM",
        "front": "white clay-coated front — bright but slightly less brilliant than virgin FBB",
        "back":  "grey uncoated back — characteristic grey-brown recycled fibre colour",
        "cross": "white top coat, grey-tan recycled fibre core, grey uncoated back",
        "app":   "FMCG and general-purpose folding cartons, cereal boxes",
    },
    "eco-blanca": {
        "name": "Eco Blanca",
        "gsm": "280 GSM",
        "front": "white clay-coated front",
        "back":  "white coated back — clean white, not grey",
        "cross": "white top coat, grey-tan recycled core, white back coat",
        "app":   "hosiery, garment and fashion retail packaging",
    },
    "neowhite-bliss": {
        "name": "NeoWhite Bliss",
        "gsm": "260 GSM",
        "front": "high-brightness white coated front — premium quality for recycled board",
        "back":  "white coated back",
        "cross": "premium white top coat, recycled fibre core, white back coat",
        "app":   "pharmaceutical blister card backing",
    },
}

def reel_prompt(slug: str) -> str:
    s = SPECS[slug]
    return (
        f"Ultra-realistic 8K industrial photography of a large paper/board reel of {s['name']} "
        f"({s['gsm']}) on an industrial rewinder or pallet in a converting facility. "
        f"The reel is approximately 1200–1500 mm wide, 800–1000 mm diameter, wound tightly on a steel core. "
        f"The reel is shown at a 3/4 angle — the FRONT flat face of the wound board is clearly visible, "
        f"showing the {s['front']}. "
        f"The EDGE of the reel (the wound edge) reveals the board cross-section at scale: {s['cross']}. "
        f"The back side of the reel (visible as the outer wound layer) shows {s['back']}. "
        f"The reel sits on a wooden pallet or steel rewinder cradle in a clean industrial facility. "
        f"Background: warehouse or paper mill interior, industrial overhead 5200K lighting. "
        f"Depth of field: reel sharp, background slightly blurred. "
        f"50mm lens, eye-level 3/4 angle. No branding, no text."
    )

def stack_prompt(slug: str) -> str:
    s = SPECS[slug]
    return (
        f"Ultra-realistic 8K commercial photography of a palletised stack of cut sheets of "
        f"{s['name']} board ({s['gsm']}), press-ready for a printing facility. "
        f"The sheets are stacked in a neat, perfectly aligned block on a standard wooden pallet — "
        f"approximately 50–80 cm high stack of cut A1/SRA1 or 700×1000 mm sheets. "
        f"The TOP sheet shows the {s['front']} surface — pristine, flat, undamaged. "
        f"The EDGE of the stack (visible on the long side) reveals the individual sheet edges: "
        f"each sheet edge shows {s['cross']} — multiple compressed plies clearly visible. "
        f"The bottom sheets show the {s['back']}. "
        f"The pallet is in a clean warehouse or print shop receiving area. "
        f"Pallet wrap (transparent stretch film) is partially applied, showing the stack is ready for delivery. "
        f"Background: warehouse racks and industrial lighting, slightly blurred. "
        f"5200K, 50mm lens, 3/4 angle from slightly above to show top face and stack edge. "
        f"No branding, no text. Professional commercial photography."
    )

PRODUCTS = list(SPECS.keys())

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
    jobs = []
    for slug in PRODUCTS:
        jobs.append((slug, "reel",  f"{slug}-reel.jpg",  reel_prompt(slug)))
        jobs.append((slug, "stack", f"{slug}-stack.jpg", stack_prompt(slug)))

    total = len(jobs)
    done = skipped = failed = 0
    print(f"Model : {MODEL}")
    print(f"Output: {os.path.abspath(ROOT)}")
    print(f"Total : {total} images ({len(PRODUCTS)} products × 2)\n")

    for slug, kind, filename, prompt in jobs:
        filepath = os.path.join(ROOT, filename)
        name = SPECS[slug]["name"]
        if os.path.exists(filepath) and os.path.getsize(filepath) > 5000:
            print(f"  SKIP  {filename}  (exists)")
            skipped += 1; done += 1
            continue
        print(f"  [{done+1}/{total}]  {name} / {kind}: {filename} ...", end=" ", flush=True)
        ok, msg = generate_image(prompt, filepath)
        if ok:
            print(f"OK ({msg})")
            done += 1
        else:
            print(f"FAIL — {msg}")
            failed += 1; done += 1
        time.sleep(2)

    print(f"\nDone: {total - failed}/{total}  ({skipped} skipped, {failed} failed)")

if __name__ == "__main__":
    main()
