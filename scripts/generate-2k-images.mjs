/**
 * Generate 2K quality images using Imagen 4 Ultra
 * No downscaling — saves at native Imagen 4 Ultra resolution
 * Run: node scripts/generate-2k-images.mjs
 *
 * Learnings from previous prompts that worked well:
 * - Always end with "Photorealistic photography" or "professional industrial photography"
 * - State "No people. No animals." for machine-only shots
 * - For facility/workers: specify "Indian diverse workers, including female" + safety gear
 * - Specify exact machine colours/materials (orange-grey, yellow forklift, grey PP, etc.)
 * - Use "macro industrial photo" for detail shots
 * - Mention lighting: "bright LED overhead lighting" or "soft even studio lighting"
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const API_KEY = 'AIzaSyDIxpNqLTm_lEFiDyHvYiz-ba3GeK4vhbc';
const ULTRA   = 'imagen-4.0-ultra-generate-001';  // Best quality
const STD     = 'imagen-4.0-generate-001';         // Faster for batches

async function gen(outputPath, prompt, { model = STD, aspectRatio = '16:9', people = false } = {}) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio,
          safetyFilterLevel: 'block_some',
          personGeneration: people ? 'allow_adult' : 'dont_allow',
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0,150)}`);
  const data = await res.json();
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error('No bytes in response');
  const raw = Buffer.from(b64, 'base64');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  // Resize to 2K (1920px wide) — keep aspect ratio, high quality JPEG
  const [w, h] = aspectRatio === '16:9' ? [1920, 1080] : [1920, 1440];
  await sharp(raw)
    .resize(w, h, { fit: 'cover', withoutEnlargement: false })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(outputPath);
  return fs.statSync(outputPath).size;
}

const STYLE_MACHINE  = 'No people. No animals. No food. No nature scenery. Only industrial machines. Professional industrial product photography. Ultra sharp. 4K photorealistic.';
const STYLE_FACILITY = 'Photorealistic 4K photo. Indian manufacturing facility. Diverse Indian workers including women in orange safety vests and white helmets. Candid professional workplace photography. Bright LED lighting. Clean factory.';
const STYLE_HERO     = 'Ultra high resolution photorealistic photography. Professional commercial photography. Cinematic quality. Highly detailed.';

const IMAGES = [

  // ── HERO IMAGES — Imagen 4 Ultra, 16:9, 1920×1080 ────────────────────────
  ['public/hero-homepage-v2.jpg', ULTRA, '16:9', false,
   `${STYLE_HERO} Aerial wide-angle photo of a modern Indian industrial packaging factory at golden hour. Clean white building facade, company name on building, loading bay with trucks, green landscaping, dramatic orange sky. Corporate architecture photography.`],

  ['public/hero-industry.jpg', ULTRA, '16:9', true,
   `${STYLE_HERO} Inside a large modern Indian automotive assembly plant. Rows of car body frames on a lit production line. Indian workers in blue uniforms. Grey and black PP corrugated packaging trays and boxes visible on the line. Blue-white factory lighting. Cinematic wide shot.`],

  ['public/hero-infrastructure.jpg', ULTRA, '16:9', true,
   `${STYLE_HERO} ${STYLE_FACILITY} Wide panoramic shot of a PP corrugated box manufacturing facility. Multiple industrial machines — punch press, screen printer, sheeter — arranged on a factory floor. Indian female and male workers operating machines. Yellow floor safety markings. Very wide angle.`],

  ['public/hero-paper-family.jpg', ULTRA, '4:3', false,
   `${STYLE_HERO} Elegant flat-lay overhead product photography of premium paper and board grades. Stacked FBB folding boxboard sheets, white duplex board, cream kraft liner arranged in layers on a white marble surface. Soft even studio lighting with clean shadow. Minimalist, ultra sharp.`],

  // ── INFRASTRUCTURE MACHINE IMAGES — Std model, 4:3, no people ────────────
  ['public/infrastructure/machines/flat-bed-punch-press-wide.jpg', STD, '4:3', false,
   `${STYLE_MACHINE} Wide shot: large industrial flatbed die-cutting punch press machine, orange and grey painted steel body, heavy upper platen, polished guide rails, digital control panel with red emergency stop. Clean factory floor. Overhead LED lighting.`],

  ['public/infrastructure/machines/flat-bed-punch-press-detail.jpg', STD, '4:3', false,
   `${STYLE_MACHINE} Extreme close-up macro: sharp steel cutting-rule die pressed into a grey PP corrugated plastic sheet on a flatbed press platen. Clean cut edges, flute structure visible in cross-section. Ultra sharp macro industrial photography.`],

  ['public/infrastructure/machines/flat-bed-punch-press-operation.jpg', STD, '4:3', true,
   `${STYLE_FACILITY} Indian male factory worker loading grey PP corrugated plastic sheets into a flatbed die-cutting punch press machine. Machine in mid-cycle. Safety glasses. Factory floor. Realistic candid industrial photography.`],

  ['public/infrastructure/machines/ultrasonic-welder-wide.jpg', STD, '4:3', false,
   `${STYLE_MACHINE} Wide shot: compact industrial ultrasonic plastic welding machine on a metal workbench. Cylindrical titanium sonotrode horn at top, digital frequency display, foot pedal controller on floor. Grey metal casing. White background wall. LED workshop lighting.`],

  ['public/infrastructure/machines/ultrasonic-welder-detail.jpg', STD, '4:3', false,
   `${STYLE_MACHINE} Close-up macro: titanium ultrasonic welding horn pressing against the join of two grey PP corrugated plastic panels. Visible weld line, micro vibration rings. Extreme clarity. Industrial macro photography.`],

  ['public/infrastructure/machines/ultrasonic-welder-operation.jpg', STD, '4:3', true,
   `${STYLE_FACILITY} Indian female factory worker operating an ultrasonic plastic welding machine, holding a grey PP corrugated box under the welding horn. Safety glasses. Clean workbench. Indian manufacturing facility. Candid professional photo.`],

  ['public/infrastructure/machines/screen-printing-wide.jpg', STD, '4:3', false,
   `${STYLE_MACHINE} Wide shot: large industrial flatbed screen printing machine with metal frame, mesh screen, rubber squeegee arm, flat print table. Ink containers on side table. Print shop environment. Bright overhead lighting.`],

  ['public/infrastructure/machines/screen-printing-detail.jpg', STD, '4:3', false,
   `${STYLE_MACHINE} Close-up macro: screen printing rubber squeegee pressing black ink through a fine mesh stencil, printing a barcode pattern onto a white PP corrugated plastic sheet. Ink droplets visible. Ultra sharp macro.`],

  ['public/infrastructure/machines/screen-printing-operation.jpg', STD, '4:3', true,
   `${STYLE_FACILITY} Indian female worker operating a screen printing machine, lifting the printed PP corrugated sheet showing fresh black printed text and barcode. Print shop setting. Candid professional photo.`],

  ['public/infrastructure/machines/guillotine-sheeter-wide.jpg', STD, '4:3', false,
   `${STYLE_MACHINE} Wide shot: large industrial hydraulic guillotine paper cutter machine. Tall grey metal body, top-mounted steel blade, white clamp bar, back gauge ruler, digital display panel showing cut dimensions, red emergency stop button. Stack of white FBB board loaded.`],

  ['public/infrastructure/machines/guillotine-sheeter-detail.jpg', STD, '4:3', false,
   `${STYLE_MACHINE} Close-up macro: hydraulic guillotine blade slicing cleanly through a thick stack of white coated FBB paper board sheets. Perfect straight cut edge showing multiple paper layers in cross-section. Ultra sharp industrial macro photography.`],

  ['public/infrastructure/machines/guillotine-sheeter-operation.jpg', STD, '4:3', true,
   `${STYLE_FACILITY} Indian male worker setting the back gauge on a large hydraulic guillotine paper cutter, stacking white board sheets on the machine table. Focused professional. Indian factory setting.`],

  ['public/infrastructure/machines/synchro-sheeter-wide.jpg', STD, '4:3', false,
   `${STYLE_MACHINE} Wide shot: industrial rotary synchro sheeter machine in a paper converting factory. Large infeed reel stand, rotating cutting drum, outfeed delivery conveyor stacking cut sheets. Grey and blue steel machine. Overhead lighting.`],

  ['public/infrastructure/machines/synchro-sheeter-detail.jpg', STD, '4:3', false,
   `${STYLE_MACHINE} Close-up macro: rotary sheeter cutting drum and precision blade cutting a continuous web of white coated paper board into exact-size sheets. Mechanical gears, timing belt. Ultra sharp industrial macro.`],

  ['public/infrastructure/machines/synchro-sheeter-operation.jpg', STD, '4:3', true,
   `${STYLE_FACILITY} Indian female worker monitoring a running synchro sheeter machine, checking cut sheet dimensions with a ruler. Sheets stacking at output. Paper converting factory. Candid professional photo.`],

  ['public/infrastructure/machines/stretch-wrap-forklift-wide.jpg', STD, '4:3', true,
   `${STYLE_FACILITY} Wide shot: yellow electric counterbalance forklift truck parked next to a rotary arm pallet stretch wrap machine in an Indian warehouse despatch bay. Fully wrapped pallets of grey PP corrugated boxes on wooden pallets nearby. Roller shutter doors. Bright industrial lighting.`],

  ['public/infrastructure/machines/stretch-wrap-forklift-detail.jpg', STD, '4:3', false,
   `${STYLE_MACHINE} Close-up: transparent stretch wrap film tightly wound in multiple overlapping layers around a corrugated cardboard pallet. Film tension lines visible. Clean industrial detail photography.`],

  ['public/infrastructure/machines/stretch-wrap-forklift-operation.jpg', STD, '4:3', true,
   `${STYLE_FACILITY} Indian female forklift operator driving a yellow electric counterbalance forklift, placing a stretch-wrapped pallet of grey PP corrugated boxes near the loading bay. Candid action photo. Indian warehouse. Professional industrial photography.`],

  // ── FACILITY SHOTS — Std model, 4:3, Indian workers ──────────────────────
  ['public/infrastructure/facility/converting-floor.jpg', STD, '4:3', true,
   `${STYLE_FACILITY} Wide interior shot of an Indian PP corrugated box manufacturing facility. Indian female worker operating a punch press machine, male worker at screen printer in background. Bright LED overhead lighting, yellow safety floor markings. Clean organised factory. 4K photorealistic.`],

  ['public/infrastructure/facility/storage-warehouse.jpg', STD, '4:3', true,
   `${STYLE_FACILITY} Interior of an organised Indian industrial warehouse. Tall metal shelving racks with pallets of grey PP corrugated boxes and white board reels. Indian female warehouse manager with tablet doing inventory. Forklift aisle visible. Bright lighting. 4K photorealistic.`],

  ['public/infrastructure/facility/dispatch-area.jpg', STD, '4:3', true,
   `${STYLE_FACILITY} Indian factory loading bay and despatch area. Indian female logistics worker with clipboard and Indian male worker loading stretch-wrapped pallets of PP corrugated boxes onto a truck. Roller shutter doors open, daylight streaming in. Action shot. 4K photorealistic.`],

  ['public/infrastructure/facility/quality-control.jpg', STD, '4:3', true,
   `${STYLE_FACILITY} Indian female quality control inspector in an Indian factory, wearing safety glasses and blue uniform, using digital calipers to precisely measure a grey PP corrugated plastic box at a QC inspection table. Focused expression. Clean well-lit QC station. 4K photorealistic.`],

  ['public/infrastructure/facility/freight-lift.jpg', STD, '4:3', true,
   `${STYLE_FACILITY} Indian factory worker (female) pressing the button panel on a large industrial freight elevator inside a multi-story Indian manufacturing building. Heavy-duty metal cage lift with open steel doors, pallet of corrugated boxes inside. Concrete walls. 4K photorealistic.`],

  ['public/infrastructure/facility/forklift.jpg', STD, '4:3', true,
   `${STYLE_FACILITY} Indian female forklift operator driving a yellow electric counterbalance forklift truck down a warehouse aisle, lifting a pallet of grey PP corrugated boxes. Clean floor with yellow painted safety lines. Confident professional expression. 4K photorealistic action shot.`],
];

let ok = 0, fail = 0;
for (const [out, model, ratio, people, prompt] of IMAGES) {
  const label = out.replace('public/', '');
  process.stdout.write(`  [${model === ULTRA ? 'ULTRA' : 'STD  '}] ${label}... `);
  try {
    const bytes = await gen(out, prompt, { model, aspectRatio: ratio, people });
    console.log(`✓ ${(bytes/1024).toFixed(0)} KB`);
    ok++;
  } catch (e) {
    console.log(`✗ ${e.message}`);
    fail++;
  }
  await new Promise(r => setTimeout(r, 800));
}
console.log(`\nDone: ${ok} generated, ${fail} failed.`);
