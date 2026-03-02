#!/usr/bin/env python3
"""
Generate two composite product-family hero images for /products page:
  1. products-pp-composite.jpg   — all PP corrugated product types in one industrial shot
  2. products-paper-composite.jpg — paper/board reels, stacks, cut sheets in one catalogue shot
Uses Gemini gemini-3.1-flash-image-preview.
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
    print("ERROR: GEMINI_API_KEY not set in environment or .env.local")
    sys.exit(1)

API_KEY = _load_api_key()
PUBLIC = os.path.join(os.path.dirname(__file__), "..", "public")
os.makedirs(PUBLIC, exist_ok=True)

IMAGES = [
    {
        "filename": "products-pp-composite.jpg",
        "prompt": (
            "Ultra-realistic commercial product photography. "
            "A complete family of grey-blue polypropylene corrugated packaging products arranged together "
            "on a clean industrial concrete floor, photographed from a slightly elevated 3/4 angle. "
            "The arrangement includes: a large folded PP corrugated box open showing inside flutes, "
            "several smaller foldable boxes of varying sizes stacked in the background, "
            "a shallow open-top tray in the foreground, "
            "a tall heavy-duty bin on the left, "
            "a stack of flat layer pads to one side, "
            "and a grid divider/separator panel leaning against the bin. "
            "All items are the same material — semi-translucent light grey polypropylene with visible corrugated flute texture. "
            "Professional product photography lighting, soft shadows, shallow depth of field. "
            "No text, no labels, no branding. Landscape orientation 16:9."
        ),
    },
    {
        "filename": "products-paper-composite.jpg",
        "prompt": (
            "Ultra-realistic commercial product photography. "
            "A premium paper and paperboard product family arranged together in a clean studio setting "
            "on a white-to-warm-cream gradient background, photographed from a 3/4 angle. "
            "The arrangement includes: two large paper reels (one upright, one slightly tilted), "
            "a tall neat stack of premium white coated sheets, "
            "several cut B2 sheets fanned out showing smooth bright surfaces, "
            "a sample of duplex board showing the white-coated top and grey-back cross-section, "
            "and a small sheaf of folded box blanks. "
            "Warm studio lighting, soft shadows, high-key brightness, shallow depth of field. "
            "The paper tones range from bright white to warm ivory to natural kraft. "
            "No text, no labels, no branding. Landscape orientation 16:9."
        ),
    },
]

def generate_image(prompt: str, out_path: str) -> bool:
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{MODEL}:generateContent?key={API_KEY}"
    )
    body = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read())
        except urllib.error.HTTPError as e:
            err = e.read().decode()
            print(f"  HTTP {e.code}: {err[:200]}")
            if attempt < 2:
                time.sleep(5)
                continue
            return False
        except Exception as e:
            print(f"  Error: {e}")
            if attempt < 2:
                time.sleep(5)
                continue
            return False

        # Extract image bytes from response
        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        for part in parts:
            if "inlineData" in part:
                img_b64 = part["inlineData"]["data"]
                img_bytes = base64.b64decode(img_b64)
                with open(out_path, "wb") as f:
                    f.write(img_bytes)
                size_kb = len(img_bytes) // 1024
                print(f"  Saved {os.path.basename(out_path)} ({size_kb} KB)")
                return True

        # No image in response — print what we got
        print(f"  No image in response. Parts: {[list(p.keys()) for p in parts]}")
        text_parts = [p.get("text","") for p in parts if "text" in p]
        if text_parts:
            print(f"  Model said: {text_parts[0][:200]}")
        return False

    return False

def main():
    ok = 0
    for img in IMAGES:
        out = os.path.join(PUBLIC, img["filename"])
        print(f"\n[{img['filename']}]")
        if generate_image(img["prompt"], out):
            ok += 1
        else:
            print(f"  FAILED — {img['filename']}")
        time.sleep(2)

    print(f"\nDone: {ok}/{len(IMAGES)} OK")

if __name__ == "__main__":
    main()
