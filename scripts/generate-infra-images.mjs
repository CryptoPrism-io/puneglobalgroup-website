/**
 * Generate infrastructure page images using Imagen 4 via Gemini API
 * Run: node scripts/generate-infra-images.mjs
 */
import './load-env.mjs';
import fs from 'fs';
import path from 'path';

const API_KEY = process.env.GEMINI_API_KEY || (() => { throw new Error('Set GEMINI_API_KEY in .env.local'); })();
const MODEL   = 'imagen-4.0-generate-001';

const MDIR = 'public/infrastructure/machines';
const FDIR = 'public/infrastructure/facility';

// Each entry: [outputPath, prompt]
const IMAGES = [
  // ── Flat Bed Punch Press ─────────────────────────────────────────────────
  [`${MDIR}/flat-bed-punch-press-wide.jpg`,
   `Wide shot of a flatbed die-cutting press machine in a clean Indian manufacturing facility. The machine is large, orange and grey metal, with a flat table surface and a cutting platen. Bright factory lighting. Industrial photorealistic photo.`],
  [`${MDIR}/flat-bed-punch-press-detail.jpg`,
   `Close-up detail of a flatbed punch press die-cutting head on a PP corrugated plastic sheet. Sharp steel cutting rule, precise mechanical components, industrial macro photography, crisp focus.`],
  [`${MDIR}/flat-bed-punch-press-operation.jpg`,
   `Factory worker operating a flatbed die-cutting press machine, loading PP corrugated plastic sheets. Safety gear, clean factory floor, bright overhead lights. Candid industrial photography.`],

  // ── Plastic Ultrasonic Welder ─────────────────────────────────────────────
  [`${MDIR}/ultrasonic-welder-wide.jpg`,
   `Wide shot of an industrial plastic ultrasonic welding machine in a factory. Compact machine with a metal horn/sonotrode head, digital control panel, welding a grey PP plastic box. Clean manufacturing environment.`],
  [`${MDIR}/ultrasonic-welder-detail.jpg`,
   `Close-up of an ultrasonic welding horn pressing onto two pieces of PP corrugated plastic, fusing them together. Visible vibration, clean weld line, macro industrial photography.`],
  [`${MDIR}/ultrasonic-welder-operation.jpg`,
   `Technician operating an ultrasonic plastic welder, joining PP corrugated box parts. Factory setting, work table, finished boxes stacked in background.`],

  // ── Screen Printing Unit ──────────────────────────────────────────────────
  [`${MDIR}/screen-printing-wide.jpg`,
   `Wide shot of an industrial flatbed screen printing machine in a factory. Large frame with squeegee, printing onto PP corrugated plastic sheets in a clean print shop. Professional industrial photography.`],
  [`${MDIR}/screen-printing-detail.jpg`,
   `Close-up of screen printing squeegee applying dark ink through a mesh screen onto a PP corrugated plastic surface. Sharp detail of the mesh pattern and ink transfer.`],
  [`${MDIR}/screen-printing-operation.jpg`,
   `Worker operating a screen printing machine, printing labels and text onto corrugated plastic packaging boxes. Factory floor, proper lighting, professional industrial photo.`],

  // ── Guillotine Sheeter ────────────────────────────────────────────────────
  [`${MDIR}/guillotine-sheeter-wide.jpg`,
   `Wide shot of an industrial hydraulic guillotine paper and board cutter machine in a factory. Large metal machine with a top-down blade, electric controls panel, cutting stack of ITC board sheets.`],
  [`${MDIR}/guillotine-sheeter-detail.jpg`,
   `Close-up of a guillotine paper cutter blade cutting through a thick stack of white FBB board sheets with precision. Clean cut edge, industrial macro photo.`],
  [`${MDIR}/guillotine-sheeter-operation.jpg`,
   `Factory operator using a guillotine sheeter to cut large ITC PSPD board sheets to press-ready dimensions. Stack of cut sheets on the table, factory setting.`],

  // ── Synchro Sheeter ───────────────────────────────────────────────────────
  [`${MDIR}/synchro-sheeter-wide.jpg`,
   `Wide shot of a rotary synchro sheeter machine in a paper converting facility. The machine has infeed rollers, slitting blades and an outfeed conveyor. Converting large paper rolls to sheets.`],
  [`${MDIR}/synchro-sheeter-detail.jpg`,
   `Close-up of a synchro sheeter roller and blade mechanism cutting a continuous web of paper into precise sheets. Industrial mechanical detail photography.`],
  [`${MDIR}/synchro-sheeter-operation.jpg`,
   `Operator monitoring a synchro sheeter as it converts a large paper reel into stacked cut sheets. Factory floor, industrial lighting, professional photo.`],

  // ── Stretch Wrap & Forklift Despatch ─────────────────────────────────────
  [`${MDIR}/stretch-wrap-forklift-wide.jpg`,
   `Wide shot of a stretch wrap pallet wrapping machine next to a reach truck forklift in a warehouse despatch area. Fully wrapped pallets of corrugated boxes ready for shipping. Industrial warehouse photo.`],
  [`${MDIR}/stretch-wrap-forklift-detail.jpg`,
   `Close-up of stretch wrap film being applied to a pallet of corrugated packaging boxes. Tight clear film wrapping, industrial detail photography.`],
  [`${MDIR}/stretch-wrap-forklift-operation.jpg`,
   `Forklift operator moving a stretch-wrapped pallet of PP corrugated boxes in a despatch warehouse. Loading dock in background, industrial photography.`],

  // ── Facility shots ────────────────────────────────────────────────────────
  [`${FDIR}/converting-floor.jpg`,
   `Wide shot of a clean Indian industrial manufacturing floor with multiple machines — punch press, screen printer — workers in high-vis vests, overhead lighting, organised workspace. Modern factory interior photography.`],
  [`${FDIR}/storage-warehouse.jpg`,
   `Interior of a well-organised industrial warehouse with tall metal racking, pallets of corrugated boxes and board rolls, forklift aisle, bright lighting. Professional warehouse photography.`],
  [`${FDIR}/dispatch-area.jpg`,
   `Loading bay and despatch area of a factory with wrapped pallets of boxes ready to load onto trucks, roller doors open, forklift in background, daylight streaming in. Industrial logistics photography.`],
  [`${FDIR}/quality-control.jpg`,
   `Quality control inspector in a factory examining a PP corrugated plastic box with calipers for dimension accuracy. Clean well-lit QC station, industrial photography.`],
  [`${FDIR}/freight-lift.jpg`,
   `Industrial freight elevator inside a multi-story factory building, large metal cage lift with heavy-duty doors open, pallet inside, concrete walls. Industrial interior photography.`],
  [`${FDIR}/forklift.jpg`,
   `Yellow electric counterbalance forklift truck in a warehouse aisle, lifting a pallet of corrugated boxes, clean floor with yellow safety lines painted. Professional industrial photography.`],
];

async function generateImage(prompt, outputPath) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${API_KEY}`;
  const body = {
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: '4:3',
      safetyFilterLevel: 'block_some',
      personGeneration: 'allow_adult',
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;

  if (!b64) throw new Error(`No image bytes in response: ${JSON.stringify(data).slice(0, 300)}`);

  const buf = Buffer.from(b64, 'base64');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buf);
  return buf.length;
}

let ok = 0, fail = 0;
for (const [outPath, prompt] of IMAGES) {
  const label = path.basename(outPath);
  process.stdout.write(`  Generating ${label}... `);
  try {
    const bytes = await generateImage(prompt, outPath);
    console.log(`✓ ${(bytes/1024).toFixed(0)} KB`);
    ok++;
  } catch (e) {
    console.log(`✗ ${e.message}`);
    fail++;
  }
  // small delay to avoid rate limiting
  await new Promise(r => setTimeout(r, 800));
}

console.log(`\nDone: ${ok} generated, ${fail} failed.`);
