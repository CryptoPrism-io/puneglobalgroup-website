#!/usr/bin/env python3
"""
Generate 4 contextual hero composite images — one per site section.
Each replaces a single-product shot with a richer, story-telling visual.
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
PUBLIC = os.path.join(os.path.dirname(__file__), "..", "public")

IMAGES = [
    {
        "filename": "hero-homepage-v2.jpg",
        "prompt": (
            "Ultra-realistic commercial photography, 16:9 landscape. "
            "Split-world industrial composition inside a large Indian warehouse with high ceilings and natural skylights. "
            "LEFT half of frame: a neat pallet stack of grey-blue polypropylene corrugated boxes and open trays, neatly organised on a wooden pallet, clean concrete floor. "
            "RIGHT half of frame: a row of three large paper reels standing upright, cream-white paper, slightly warm-lit, casting long shadows on the concrete. "
            "A narrow strip of natural light divides the two halves subtly. "
            "Cinematic depth of field — sharp foreground, softly blurred industrial background. "
            "Muted, moody colour grade: desaturated greys and warm ivories, just a hint of industrial amber in the background. "
            "No text, no branding, no logos. Professional editorial photography."
        ),
    },
    {
        "filename": "hero-pp-family.jpg",
        "prompt": (
            "Ultra-realistic commercial product photography, 16:9 landscape, dark industrial setting. "
            "Five distinct polypropylene corrugated product families arranged together on a dark slate or charcoal concrete floor: "
            "CENTRE-FRONT: a large open-top PP corrugated tray (shallow rectangular, grey), "
            "BACK-LEFT: a tall heavy-duty PP corrugated bin (storage container, approx 60cm tall), "
            "BACK-RIGHT: a neat stack of three flat grey layer pads, "
            "FRONT-LEFT: a PP corrugated foldable box, half-folded showing the fluted internal wall structure, "
            "FRONT-RIGHT: a PP corrugated grid divider/separator panel leaning upright. "
            "All items semi-translucent light grey polypropylene, corrugated texture clearly visible. "
            "Dramatic low-angle studio lighting from the left, creating strong shadows and depth. "
            "Dark background gradient from slate to near-black. "
            "Shallow depth of field. No text, no labels, no branding."
        ),
    },
    {
        "filename": "hero-paper-family.jpg",
        "prompt": (
            "Ultra-realistic commercial product photography, 16:9 landscape, warm studio setting. "
            "Four large paper reels standing upright side by side in a row, each reel approximately 1.2m diameter, "
            "photographed from a low 3/4 angle showing their height and the paper wrapped around them. "
            "The reels vary in tone: two bright coated white, one warm ivory uncoated, one slightly off-white. "
            "Warm directional studio lighting from the right side — creates dramatic highlights on the curved paper surfaces and deep shadows between the reels. "
            "In the foreground, a few sheets of premium coated paper fanned out on the floor showing the smooth bright surface. "
            "Background: a warm cream/linen coloured studio wall, slightly out of focus. "
            "Colour grade: warm golden-ivory tones, high-key, bright and clean. "
            "No text, no labels, no branding. Professional packaging-industry photography."
        ),
    },
    {
        "filename": "hero-infrastructure.jpg",
        "prompt": (
            "Ultra-realistic industrial photography, 16:9 landscape, large Indian paper converting factory floor. "
            "Wide establishing shot of a busy but organised converting facility: "
            "FOREGROUND-LEFT: a large industrial paper rewinder machine (wide cylindrical rolls of paper feeding through), "
            "CENTRE: a high-speed sheeter/cutting machine with a stack of freshly cut sheets, "
            "BACKGROUND-RIGHT: a guillotine cutter, operator in PPE visible in middle-distance. "
            "Clean factory floor, good industrial lighting — overhead fluorescent tubes casting warm-cool light. "
            "Machines are grey-green industrial colour typical of Indian converting factories. "
            "A few paper reels stacked nearby, neat and orderly. "
            "Sense of scale — ceilings are high, machines are large. "
            "Cinematic colour grade: slightly desaturated industrial tones, hints of warm amber from high windows. "
            "No text, no branding. Professional industrial/architectural photography."
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
        url, data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read())
        except urllib.error.HTTPError as e:
            err = e.read().decode()
            print(f"  HTTP {e.code}: {err[:300]}")
            if attempt < 2:
                time.sleep(6)
                continue
            return False
        except Exception as e:
            print(f"  Error: {e}")
            if attempt < 2:
                time.sleep(6)
                continue
            return False

        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        for part in parts:
            if "inlineData" in part:
                img_bytes = base64.b64decode(part["inlineData"]["data"])
                with open(out_path, "wb") as f:
                    f.write(img_bytes)
                print(f"  OK — {os.path.basename(out_path)} ({len(img_bytes)//1024} KB)")
                return True

        text = " | ".join(p.get("text", "")[:120] for p in parts if "text" in p)
        print(f"  No image in response. Text: {text[:200]}")
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
            print(f"  FAILED")
        time.sleep(2)

    print(f"\nTotal: {ok}/{len(IMAGES)} OK")


if __name__ == "__main__":
    main()
