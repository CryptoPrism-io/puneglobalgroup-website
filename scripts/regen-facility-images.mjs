/**
 * Regenerate facility images with Indian workers (diverse, including female)
 * Run: node scripts/regen-facility-images.mjs
 */
import fs from 'fs';
import sharp from 'sharp';

const API_KEY = 'AIzaSyDIxpNqLTm_lEFiDyHvYiz-ba3GeK4vhbc';
const MODEL   = 'imagen-4.0-generate-001';
const DIR     = 'public/infrastructure/facility';

const STYLE = 'Photorealistic industrial photography in an Indian factory. Diverse Indian workers including women in safety vests and helmets. Professional, candid workplace photography.';

const IMAGES = [
  [`${DIR}/converting-floor.jpg`,
   `${STYLE} Wide shot of a clean Indian PP corrugated box manufacturing floor. Indian female worker and male worker operating punch press and screen printing machines. Bright LED overhead lighting. Yellow safety floor markings. Modern industrial interior.`],

  [`${DIR}/storage-warehouse.jpg`,
   `${STYLE} Interior of an organised Indian industrial warehouse with tall metal racking, pallets of corrugated boxes and board rolls. Indian female warehouse worker with a clipboard doing inventory. Forklift aisle visible. Bright lighting.`],

  [`${DIR}/dispatch-area.jpg`,
   `${STYLE} Loading bay and despatch area of an Indian factory. Indian female logistics worker and male worker loading stretch-wrapped pallets of boxes onto a truck. Roller shutter doors open. Daylight. Busy realistic warehouse scene.`],

  [`${DIR}/quality-control.jpg`,
   `${STYLE} Indian female quality control inspector in a factory wearing safety glasses and blue uniform, carefully measuring a PP corrugated plastic box with digital calipers at a QC inspection table. Clean well-lit QC station.`],

  [`${DIR}/freight-lift.jpg`,
   `${STYLE} Indian factory worker (female) operating a large industrial freight elevator inside a multi-story manufacturing building. Heavy-duty metal cage lift with doors open, pallet of corrugated boxes inside. Concrete walls.`],

  [`${DIR}/forklift.jpg`,
   `${STYLE} Indian female forklift operator driving a yellow electric counterbalance forklift truck in a warehouse aisle, lifting a pallet of grey PP corrugated boxes. Clean factory floor with yellow safety lines. Realistic candid photo.`],
];

async function gen(outputPath, prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: '4:3', safetyFilterLevel: 'block_some', personGeneration: 'allow_adult' },
      }),
    }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 150)}`);
  const data = await res.json();
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error('No bytes');
  const raw = Buffer.from(b64, 'base64');
  await sharp(raw).resize(900, 675, { fit: 'cover' }).jpeg({ quality: 84, mozjpeg: true }).toFile(outputPath);
  return fs.statSync(outputPath).size;
}

let ok = 0, fail = 0;
for (const [out, prompt] of IMAGES) {
  const label = out.split('/').pop();
  process.stdout.write(`  ${label}... `);
  try {
    const bytes = await gen(out, prompt);
    console.log(`✓ ${(bytes/1024).toFixed(0)} KB`);
    ok++;
  } catch (e) {
    console.log(`✗ ${e.message}`);
    fail++;
  }
  await new Promise(r => setTimeout(r, 800));
}
console.log(`\nDone: ${ok} generated, ${fail} failed.`);
