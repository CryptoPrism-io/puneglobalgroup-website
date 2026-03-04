#!/usr/bin/env python3
"""
Regenerate the infrastructure hero image (synchro-sheeter-wide.jpg)
with a hero-optimised prompt — cinematic, full-bleed, ultra-HD.

Usage:
  python scripts/generate-infra-hero.py
"""
import sys, os, json, base64, urllib.request, urllib.error

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
    print("  Set env variable:  export GEMINI_API_KEY=your_key")
    print("  Or add to .env.local: GEMINI_API_KEY=your_key")
    sys.exit(1)

API_KEY = _load_api_key()

OUTPUT_PATH = os.path.join(
    os.path.dirname(__file__), "..", "public",
    "infrastructure", "machines", "synchro-sheeter-wide.jpg"
)

# ─── System prompt ───────────────────────────────────────────────────────────
SYSTEM = """Ultra-realistic, ultra-high-definition professional industrial photography.
Render quality: 8K photorealistic. Absolutely zero illustration, painting or CGI artifacts.
Every image must look like a RAW file from a Phase One medium-format camera with a
Schneider-Kreuznach lens. Bokeh, depth of field, lens compression, ambient light scatter —
all physically accurate."""

# ─── Hero-specific prompt ────────────────────────────────────────────────────
PROMPT = """
HERO BANNER PHOTOGRAPH — full-bleed 16:9 cinematic industrial interior.

Subject: A large, modern synchro sheeter machine inside a premium Indian paper converting facility.

COMPOSITION (critical — this is a website hero):
- Camera positioned at a dramatic low 3/4 angle looking along the length of the machine.
- The machine fills the RIGHT two-thirds of the frame.
- LEFT third: slightly open negative space of clean facility background (for text overlay).
- Strong diagonal leading lines from the machine's steel frame draw the eye right-to-left.
- Foreground: polished concrete floor with subtle reflection of the machine.

MACHINE DETAIL:
- High-specification synchro sheeter, working width ~1800mm.
- Industrial grey/charcoal frame with precision-machined chrome rolls.
- Advanced 15-inch colour HMI touchscreen panel glowing with a blue interface.
- Safety yellow guards visible on the cutting section.
- Stacked output sheets of premium white FBB board — crisp, tight, perfectly aligned.
- Register sensors (small red LED sensors) visible near the cutting head.

LIGHTING (make this cinematic):
- Primary: overhead high-bay LED array (5500K) casting clean, even light from above.
- Accent: subtle warm LED strip light at machine base level reflecting off polished floor.
- The HMI screen adds a cool blue fill on the machine's right-hand side.
- Slight volumetric haze at the far end of the facility — depth, atmosphere, scale.
- No harsh shadows. Soft, controlled industrial light.

ENVIRONMENT:
- Background: large facility floor fading into soft bokeh — other machines barely visible.
- Ceiling: steel truss structure with LEDs at ~8m height.
- Floor: polished grey industrial concrete with faint yellow safety line.
- Air quality: absolutely clean — this is a premium converting facility, not a warehouse.
- Colour temperature: cool-neutral overall, warm accent glow from floor lighting.

QUALITY REQUIREMENTS:
- Photorealistic at 8K. Every bolt, machined surface and chrome roll must read with clarity.
- Zero noise, zero motion blur (machine is at rest, ready to run).
- DSLR depth of field: machine sharp, background facility softly out of focus.
- No watermarks, logos, text, people.
- Wide 16:9 or wider aspect ratio — suitable for full-bleed website hero section.
"""

# ─── API call ────────────────────────────────────────────────────────────────
def generate_image(prompt_text: str, output_path: str):
    full_prompt = SYSTEM + "\n\n" + prompt_text
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
    req  = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        return False, f"HTTP {e.code}: {body[:500]}"
    except Exception as e:
        return False, str(e)
    try:
        for part in result["candidates"][0]["content"]["parts"]:
            if "inlineData" in part:
                img_bytes = base64.b64decode(part["inlineData"]["data"])
                with open(output_path, "wb") as f:
                    f.write(img_bytes)
                return True, f"{len(img_bytes) // 1024} KB"
        return False, "No image in response — check model availability"
    except (KeyError, IndexError) as e:
        return False, f"Parse error: {e}"

# ─── Main ────────────────────────────────────────────────────────────────────
def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    if os.path.exists(OUTPUT_PATH):
        size_kb = os.path.getsize(OUTPUT_PATH) // 1024
        print(f"Existing file: {OUTPUT_PATH} ({size_kb} KB) — will overwrite.")

    print(f"\nGenerating hero image...")
    print(f"  Model : {MODEL}")
    print(f"  Output: {OUTPUT_PATH}")
    print(f"  Prompt: {len(PROMPT)} chars\n")

    ok, msg = generate_image(PROMPT, OUTPUT_PATH)
    if ok:
        print(f"\n  SUCCESS — {msg} written to {OUTPUT_PATH}")
    else:
        print(f"\n  FAILED — {msg}")
        sys.exit(1)

if __name__ == "__main__":
    main()
