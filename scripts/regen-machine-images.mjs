/**
 * Regenerate infrastructure machine images with tight, explicit industrial prompts.
 * Run: node scripts/regen-machine-images.mjs
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const API_KEY = 'AIzaSyDIxpNqLTm_lEFiDyHvYiz-ba3GeK4vhbc';
const MODEL   = 'imagen-4.0-generate-001';
const DIR     = 'public/infrastructure/machines';

const STYLE = 'Professional industrial product photography. No people. No animals. No food. No nature. Only machines and factory environment. Sharp focus. Clean background.';

const MACHINES = [
  // Flat Bed Punch Press
  [`${DIR}/flat-bed-punch-press-wide.jpg`,
   `${STYLE} Wide shot: large orange-and-grey flatbed die-cutting punch press machine in a factory. Heavy metal platen, guide rails, control panel on the side. Clean factory floor.`],
  [`${DIR}/flat-bed-punch-press-detail.jpg`,
   `${STYLE} Close-up: die-cutting steel cutting rule pressed into a grey PP corrugated plastic sheet on a flatbed punch press platen. Metal, plastic, precise industrial macro.`],
  [`${DIR}/flat-bed-punch-press-operation.jpg`,
   `${STYLE} Flatbed punch press machine mid-cycle — the upper platen pressing down on a PP corrugated sheet. Die-cut shapes partially punched out. Factory setting.`],

  // Plastic Ultrasonic Welder
  [`${DIR}/ultrasonic-welder-wide.jpg`,
   `${STYLE} Wide shot: compact grey industrial ultrasonic plastic welding machine on a factory workbench. Metal sonotrode horn at top, digital parameter display on front, power unit on side.`],
  [`${DIR}/ultrasonic-welder-detail.jpg`,
   `${STYLE} Close-up: ultrasonic welding horn/sonotrode pressing onto a grey PP corrugated plastic box corner joint, fusing the plastic. Clean weld line visible. Industrial macro.`],
  [`${DIR}/ultrasonic-welder-operation.jpg`,
   `${STYLE} Ultrasonic welder machine pressing a PP corrugated plastic sheet. The welding head is in contact with the plastic. Sparks of ultrasonic energy at joint. Factory floor.`],

  // Screen Printing Unit
  [`${DIR}/screen-printing-wide.jpg`,
   `${STYLE} Wide shot: industrial flatbed screen printing machine. Large rectangular metal frame holding a silk screen mesh, squeegee arm, flat print bed below, ink trays to the side.`],
  [`${DIR}/screen-printing-detail.jpg`,
   `${STYLE} Close-up: screen printing squeegee blade pushing black ink through a mesh screen, printing a grid pattern onto a white PP corrugated plastic sheet. Ink detail, mesh texture.`],
  [`${DIR}/screen-printing-operation.jpg`,
   `${STYLE} Screen printing machine printing text on a corrugated plastic sheet. Freshly printed black text visible on white plastic. Print shop environment with ink containers.`],

  // Guillotine Sheeter
  [`${DIR}/guillotine-sheeter-wide.jpg`,
   `${STYLE} Wide shot: large industrial hydraulic guillotine paper cutting machine. Tall machine with a top-mounted blade, paper clamp, back gauge, digital display, red emergency stop button. Grey metal.`],
  [`${DIR}/guillotine-sheeter-detail.jpg`,
   `${STYLE} Close-up: hydraulic guillotine paper cutter blade slicing through a thick stack of white FBB board sheets. Clean straight cut edge, paper layers visible in cross-section. Industrial macro.`],
  [`${DIR}/guillotine-sheeter-operation.jpg`,
   `${STYLE} Industrial hydraulic guillotine machine with a stack of white board sheets loaded, blade guard in position, digital counter showing cut settings. Paper cutting factory setting.`],

  // Synchro Sheeter
  [`${DIR}/synchro-sheeter-wide.jpg`,
   `${STYLE} Wide shot: rotary synchro sheeter machine in a paper converting factory. Infeed section with paper reel, slitting blades, rotary cutting drum, and outfeed stacker. Grey industrial machine.`],
  [`${DIR}/synchro-sheeter-detail.jpg`,
   `${STYLE} Close-up: rotary sheeter cutting drum and blade slicing a continuous web of white paper board into exact-length sheets. Mechanical gears, blade detail, paper visible. Industrial macro.`],
  [`${DIR}/synchro-sheeter-operation.jpg`,
   `${STYLE} Synchro sheeter machine running — paper reel feeding into the machine, cut sheets stacking at the output end. Roller mechanism visible. Converting factory environment.`],

  // Stretch Wrap & Forklift Despatch
  [`${DIR}/stretch-wrap-forklift-wide.jpg`,
   `${STYLE} Wide shot: yellow electric counterbalance forklift truck next to a rotary stretch wrap pallet wrapping machine in a warehouse. Fully wrapped pallets of boxes stacked nearby.`],
  [`${DIR}/stretch-wrap-forklift-detail.jpg`,
   `${STYLE} Close-up: clear stretch wrap film tightly wound around a brown corrugated cardboard pallet, multiple layers visible, securing boxes for shipping. Industrial close-up.`],
  [`${DIR}/stretch-wrap-forklift-operation.jpg`,
   `${STYLE} Pallet stretch wrap machine wrapping a stack of grey PP corrugated boxes. Film turntable rotating, film dispensing arm visible. Warehouse loading dock in background.`],
];

async function gen(outputPath, prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: '4:3', safetyFilterLevel: 'block_some', personGeneration: 'dont_allow' },
      }),
    }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 150)}`);
  const data = await res.json();
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error('No bytes in response');
  const raw = Buffer.from(b64, 'base64');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await sharp(raw).resize(900, 675, { fit: 'cover' }).jpeg({ quality: 84, mozjpeg: true }).toFile(outputPath);
  return fs.statSync(outputPath).size;
}

let ok = 0, fail = 0;
for (const [out, prompt] of MACHINES) {
  const label = path.basename(out);
  process.stdout.write(`  ${label}... `);
  try {
    const bytes = await gen(out, prompt);
    console.log(`✓ ${(bytes/1024).toFixed(0)} KB`);
    ok++;
  } catch (e) {
    console.log(`✗ ${e.message}`);
    fail++;
  }
  await new Promise(r => setTimeout(r, 700));
}
console.log(`\nDone: ${ok} generated, ${fail} failed.`);
