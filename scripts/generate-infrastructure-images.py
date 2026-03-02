#!/usr/bin/env python3
"""
Generate infrastructure images for Pune Global Group converting facility.
Covers: 6 machines × 3 shots + 6 facility shots = 24 images total.

Machine shots: wide (environment), detail (mechanical close-up), operation (in-use)
Facility shots: converting floor, storage, dispatch, quality control, lift, forklift

Model: gemini-3.1-flash-image-preview
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
    print("  Set it as env variable:  export GEMINI_API_KEY=your_key")
    print("  Or add to .env.local:    GEMINI_API_KEY=your_key")
    sys.exit(1)

API_KEY = _load_api_key()

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "infrastructure")
MACHINE_DIR  = os.path.join(ROOT, "machines")
FACILITY_DIR = os.path.join(ROOT, "facility")
os.makedirs(MACHINE_DIR,  exist_ok=True)
os.makedirs(FACILITY_DIR, exist_ok=True)

# ─── System prompt ──────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """Ultra-realistic professional industrial facility photography.

FACILITY CONTEXT:
A modern 10,000 sq ft paper and PP converting facility in Pune, Maharashtra, India.
Multi-floor layout with freight lift, forklift access, 4 production/storage rooms.
Clean, organised industrial environment — polished concrete floors, high-bay LED
lighting, steel-frame structure, safety markings on floors. ISO-standard cleanliness.

PHOTOGRAPHY STYLE:
- Commercial B2B facility photography — the kind used in capability brochures and
  investor decks. Not editorial/artistic. Not stock-photo generic.
- Each image should look like it was shot by a professional industrial photographer
  on a commissioned facility shoot.
- Lighting: high-bay industrial LED, 5000K neutral, no harsh shadows, slight depth of field.
- No watermarks, no logos, no text overlays. No people unless specified.
- Colour palette: steel grey, safety yellow, cream/white walls, kraft-coloured paper.
- Camera angles: slightly elevated for wide shots, eye-level for detail shots.
- Photorealistic, not illustrated or rendered. 8K quality.

MACHINERY CONTEXT:
All paper/board converting machinery. Steel-frame construction, typically painted
industrial blue, grey or cream. Digital control panels (touchscreen HMI). Safety
guards and emergency stops visible. Cleanliness consistent with food/pharma-adjacent
paper converting — no excess dust or debris.
"""

# ─── Machine image specs ────────────────────────────────────────────────────────
MACHINES = [
    {
        "name": "Rewinder",
        "dir": MACHINE_DIR,
        "images": [
            (
                "rewinder-wide",
                "Wide-angle shot of an industrial paper roll rewinder machine inside a clean converting facility. "
                "Large steel roll unwind stand on the left with a heavy paper master reel (1.5m diameter, 2500mm wide). "
                "Precision dancer rolls for tension control, automatic edge guide system, digital tension control panel "
                "on the right. Machine is painted industrial grey-blue. Polished concrete floor. High-bay LEDs overhead. "
                "Slight depth of field — machine sharp, background facility softly blurred. Professional B2B facility photo."
            ),
            (
                "rewinder-detail",
                "Close-up macro shot of industrial rewinder tension control section. Precision chrome dancer roll assembly, "
                "pneumatic actuators, edge guide sensor (white triangular sensor head), digital display showing tension reading "
                "in Newtons. Machined steel surfaces, hydraulic fittings. Crisp mechanical detail — technical precision "
                "evident in tight tolerances. Industrial blue painted frame visible at edges. Professional detail photography."
            ),
            (
                "rewinder-operation",
                "Industrial rewinder in full operation — large paper reel spinning at high speed, tight wound output reel "
                "growing on the rewind stand. Slight motion blur on the reel edges conveys 600 m/min speed. Operator in "
                "grey coveralls and safety glasses monitoring the control panel in the background. Converting facility "
                "environment visible. Dramatic depth of field. Action industrial photography."
            ),
        ],
    },
    {
        "name": "Sheeter",
        "dir": MACHINE_DIR,
        "images": [
            (
                "sheeter-wide",
                "Wide-angle view of a large industrial rotary sheeter machine in a paper converting facility. "
                "Heavy infeed roll stand holding a board reel (400 GSM duplex board), precision rotary cutting head in the "
                "centre (2400mm working width), automatic pile delivery section on the right building a neat stack of "
                "cut sheets. Machine is painted cream/off-white with safety yellow guards. Bright industrial LED lighting. "
                "Professional facility photography, 3/4 perspective."
            ),
            (
                "sheeter-detail",
                "Close-up of industrial rotary sheeter cutting head section — precision hardened steel cutting cylinders, "
                "paper sheet being cut passing through at high speed (slight motion blur on paper). Digital sheet counter "
                "display visible on HMI panel. Chrome-finished rolls, precision-machined gaps between cylinders. "
                "Technical industrial detail photography. Sharp mechanical precision evident."
            ),
            (
                "sheeter-operation",
                "Rotary sheeter in full production — continuous stream of cut sheets flowing onto the delivery stack. "
                "Neatly squared pile of 400 GSM board sheets growing on the stacking platform. Sheet size: 720x1020mm "
                "visible from the neat stack edge. Operator in background checking dimensions with a steel ruler. "
                "Professional industrial action photography."
            ),
        ],
    },
    {
        "name": "Synchro Sheeter",
        "dir": MACHINE_DIR,
        "images": [
            (
                "synchro-sheeter-wide",
                "Wide-angle view of a high-specification synchro sheeter machine in a premium converting facility. "
                "Larger and more sophisticated than a standard sheeter — visible register control sensors, multiple "
                "in-feed roll positions, advanced HMI touchscreen panel (15-inch screen visible). "
                "Machine working width 1800mm, painted industrial grey with yellow safety accents. "
                "Clean, well-lit facility background. Professional B2B facility photo, slight high angle."
            ),
            (
                "synchro-sheeter-detail",
                "Close-up of synchro sheeter register control system — precision optical register sensor (bright LED "
                "sensor visible), synchronised drive encoder, digital readout showing 0.1mm register tolerance. "
                "Premium quality machined components, servo motor visible. This is the precision heart of the machine. "
                "Technical detail photography."
            ),
            (
                "synchro-sheeter-operation",
                "Synchro sheeter running print-quality FBB sheets — operator in white coat (print-grade cleanliness) "
                "inspecting a freshly cut FBB sheet against a bright light panel for register quality. "
                "Perfect sheet stack building in the background with print-quality white FBB board. "
                "Clean room-adjacent environment. Professional commercial photography."
            ),
        ],
    },
    {
        "name": "Guillotine",
        "dir": MACHINE_DIR,
        "images": [
            (
                "guillotine-wide",
                "Wide-angle view of a large industrial paper guillotine cutter in a converting facility. "
                "1800mm cutting width — imposing machine with a heavy steel cutting beam overhead. "
                "Air-table surface (visible air holes in white table) for frictionless material handling. "
                "Programmable backstop control visible. Clear polycarbonate safety guards on sides. "
                "Digital programmable controller with touchscreen. Industrial facility background. "
                "Professional B2B machinery photography."
            ),
            (
                "guillotine-detail",
                "Close-up of industrial guillotine blade and cutting beam — hardened steel cutting blade "
                "(slightly reflective edge), precision machined cutting beam guide rails, heavy hydraulic cylinder "
                "visible at top. Micrometer-precise backstop mechanism in foreground. "
                "The engineering precision of ±0.3mm tolerance is visually evident. Detail photography."
            ),
            (
                "guillotine-operation",
                "Industrial guillotine in operation — operator loading a lift of duplex board onto the air table "
                "(boards floating on air cushion). Backstop positioned, ready to cut. "
                "Safety light curtain visible on the cutting zone. Neat pile of already-cut sheets in background. "
                "Operator wearing safety glasses. Professional industrial action photography."
            ),
        ],
    },
    {
        "name": "Shrink Wrap",
        "dir": MACHINE_DIR,
        "images": [
            (
                "shrink-wrap-wide",
                "Wide-angle view of an industrial heat shrink wrapping machine in a packaging area. "
                "Conveyor infeed section, film folding cradle, heat shrink tunnel (stainless steel housing), "
                "conveyor outfeed with neatly wrapped paper reams emerging. "
                "LDPE film roll holder visible on the side. Machine painted cream with blue trim. "
                "Clean, bright packaging area. Professional facility photography."
            ),
            (
                "shrink-wrap-detail",
                "Close-up of heat shrink tunnel exit — a perfectly wrapped ream of paper emerging from the tunnel. "
                "Tight, glossy clear LDPE shrink film conforms exactly to the ream edges. "
                "Crisp sharp corners, no wrinkles. Label window visible on front face. "
                "Warm air visible as slight heat shimmer at tunnel exit. Product quality detail photography."
            ),
            (
                "shrink-wrap-operation",
                "Heat shrink wrap machine in operation — operator loading 500-sheet reams onto infeed conveyor. "
                "Completed wrapped reams stacking on outfeed side, ready for palletising. "
                "Film roll almost depleted visible on side holder. Efficient, rhythmic production pace. "
                "Clean packaging area environment. Industrial action photography."
            ),
        ],
    },
    {
        "name": "Stretch Wrap",
        "dir": MACHINE_DIR,
        "images": [
            (
                "stretch-wrap-wide",
                "Wide-angle view of a semi-automatic pallet stretch wrapping machine in a dispatch area. "
                "Rotary arm type: tall vertical mast with rotating arm carrying the stretch film carriage. "
                "A completed pallet of wrapped reams on the floor — 1200x1000mm pallet, uniformly wrapped "
                "in clear stretch film. Machine arm at mid-height, wrapping cycle visible. "
                "Dispatch area background with more pallets. Safety yellow machine frame. Professional photography."
            ),
            (
                "stretch-wrap-detail",
                "Close-up of stretch wrap film carriage and pre-stretch rollers — clear LLDPE stretch film being "
                "pulled through precision pre-stretch rollers (250% pre-stretch ratio mechanism visible). "
                "Film dispensing smoothly with tension. Mechanical precision of the carriage drive system. "
                "Technical detail photography."
            ),
            (
                "stretch-wrap-operation",
                "Stretch wrapper completing a pallet wrap cycle — film carriage at top of mast, rotating arm "
                "making final top pass. Below: a fully wrapped pallet of neatly stacked shrink-wrapped paper "
                "reams — tight, secure, transit-ready. Integrated pallet weigh scale display visible. "
                "Dispatch area with loading bay doors in background. Action photography."
            ),
        ],
    },
]

# ─── Facility shots ─────────────────────────────────────────────────────────────
FACILITY_SHOTS = [
    (
        os.path.join(FACILITY_DIR, "converting-floor.jpg"),
        "Wide panoramic shot of a 10,000 sq ft paper converting facility main production floor. "
        "Multiple converting machines visible: rewinder, sheeter and guillotine arranged in production "
        "flow sequence. Polished concrete floor with yellow safety lane markings. High-bay LED lighting "
        "at 8m ceiling height. Steel mezzanine visible on far wall. Clean, organised, modern Indian "
        "manufacturing facility. Professional architectural/facility photography, wide angle lens."
    ),
    (
        os.path.join(FACILITY_DIR, "storage-warehouse.jpg"),
        "Interior view of paper reel storage area in a converting facility. "
        "Large paper master reels stored vertically in A-frame reel cradles — 800mm to 1800mm diameter reels "
        "of FBB, duplex board and kraft liner. Labels on each reel showing grade and GSM. "
        "Clean concrete floor, efficient FIFO storage layout. Forklift access aisle visible. "
        "High-bay storage racking with cut-to-size sheet pallets on upper levels. "
        "Professional warehouse photography."
    ),
    (
        os.path.join(FACILITY_DIR, "dispatch-area.jpg"),
        "Dispatch and loading area of a paper converting facility. "
        "Multiple pallets of heat-shrink-wrapped paper reams, neatly stretch-wrapped and labelled, "
        "staged for collection. Pallet tags with GSM, grade and customer info visible (not readable). "
        "Loading bay doors open, daylight entering. One pallet on a hand pallet truck. "
        "Clean, organised dispatch floor. Professional commercial photography."
    ),
    (
        os.path.join(FACILITY_DIR, "quality-control.jpg"),
        "Quality control area inside a paper converting facility. "
        "Operator in white lab coat and safety glasses at a large light table, holding a cut sheet "
        "of FBB board up to the backlit surface, inspecting for register accuracy and surface defects. "
        "Caliper gauge and GSM weight scale on the workbench. Sample sheets in a neat stack. "
        "Clean, well-lit QC environment — professional, methodical quality process. "
        "Commercial photography."
    ),
    (
        os.path.join(FACILITY_DIR, "freight-lift.jpg"),
        "Industrial goods freight lift (cargo elevator) inside a multi-floor manufacturing facility. "
        "Heavy-duty steel cage lift, painted safety yellow, open wire-mesh gate in open position. "
        "Interior: polished steel floor, control panel with floor buttons, maximum load placard (2000kg). "
        "Lift is loaded with a hand pallet of paper reams being transported between floors. "
        "Concrete lift shaft walls, functional industrial design. Professional facility photography."
    ),
    (
        os.path.join(FACILITY_DIR, "forklift.jpg"),
        "A compact electric counterbalance forklift inside a paper converting warehouse. "
        "Forklift lifting a large paper reel (1200mm diameter, 2400mm wide) on a reel clamp attachment. "
        "Operator in hi-vis vest seated in forklift cab. Clean warehouse aisle with paper reels "
        "stored vertically in background. Safety-marked floor. Blue/white electric forklift. "
        "Professional industrial action photography, wide angle."
    ),
]

# ─── API call ───────────────────────────────────────────────────────────────────
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
    req  = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
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

# ─── Main ───────────────────────────────────────────────────────────────────────
def main():
    # Build full task list
    tasks = []
    for machine in MACHINES:
        for filename_base, prompt in machine["images"]:
            filepath = os.path.join(machine["dir"], filename_base + ".jpg")
            label    = f"{machine['name']} / {filename_base.split('-')[-1]}"
            tasks.append((label, filepath, prompt))
    for filepath, prompt in FACILITY_SHOTS:
        label = "Facility / " + os.path.basename(filepath).replace(".jpg", "")
        tasks.append((label, filepath, prompt))

    total   = len(tasks)
    done    = 0
    skipped = 0
    failed  = 0

    print(f"\nPune Global Group — Infrastructure Image Generation")
    print(f"Model : {MODEL}")
    print(f"Total : {total} images  ({len(MACHINES)} machines x3 + {len(FACILITY_SHOTS)} facility shots)")
    print(f"Output: {ROOT}\n")

    for label, filepath, prompt in tasks:
        if os.path.exists(filepath):
            print(f"  [skip]  {label}")
            skipped += 1
            done    += 1
            continue

        print(f"  [{done+1}/{total}]  {label} ...", end=" ", flush=True)
        ok, msg = generate_image(prompt, filepath)
        if ok:
            print(f"OK ({msg})")
        else:
            print(f"FAIL -- {msg}")
            failed += 1
        done += 1
        if done < total:
            time.sleep(3)  # respect rate limits

    print(f"\nDone: {done - failed - skipped} generated, {skipped} skipped, {failed} failed  (total {total})")

if __name__ == "__main__":
    main()
