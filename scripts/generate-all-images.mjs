/**
 * Generate ALL site images using Imagen 4
 * Run: node scripts/generate-all-images.mjs
 */
import './load-env.mjs';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const API_KEY = process.env.GEMINI_API_KEY || (() => { throw new Error('Set GEMINI_API_KEY in .env.local'); })();
const MODEL   = 'imagen-4.0-generate-001';

const IMAGES = [
  // ── HERO IMAGES ───────────────────────────────────────────────────────────
  ['public/hero-homepage-v2.jpg', '16:9',
   'Professional aerial wide-angle photo of a modern Indian industrial packaging factory exterior at golden hour, clean building facade, trucks in loading bay, green landscaping, dramatic sky. Photorealistic corporate photography.'],

  ['public/hero-industry.jpg', '16:9',
   'Inside a large Indian automotive assembly plant — rows of car body frames on a conveyor line, workers in blue uniforms, bright factory lighting, PP corrugated packaging trays and boxes visible on the production line. Photorealistic industrial photography.'],

  ['public/hero-infrastructure.jpg', '16:9',
   'Wide shot of a modern PP corrugated box manufacturing facility in India — multiple industrial machines including punch presses, screen printers, workers in safety vests, clean factory floor with yellow safety lines, bright overhead LED lighting. Photorealistic interior factory photography.'],

  ['public/hero-paper-family.jpg', '4:3',
   'Elegant flat-lay product photography of premium paper and board grades — stacked FBB folding boxboard sheets, duplex board, white kraft liner — on a clean white background with soft studio lighting. Professional packaging industry photography.'],

  ['public/hero-pp-family.jpg', '4:3',
   'Product family photography of PP corrugated plastic packaging — grey and black boxes, trays, layer pads, separators and bins arranged in a clean flat lay on white background, soft even studio lighting. Professional industrial product photography.'],

  // ── PRODUCT COMPOSITE BANNERS ─────────────────────────────────────────────
  ['public/products-pp-composite.jpg', '16:9',
   'Overhead flat lay of an assortment of PP corrugated plastic industrial packaging products — folding boxes, automotive trays, separators, layer pads and bins in grey and black — arranged on a white table with clean studio lighting. Industrial product photography.'],

  ['public/products-paper-composite.jpg', '16:9',
   'Flat lay of premium ITC PSPD paper and board packaging grades — folding boxboard FBB carton blanks, duplex board sheets, kraft liner rolls, test liner sheets — stacked neatly on a white background with soft shadow. Professional product photography.'],

  // ── BLOG COVER IMAGES ────────────────────────────────────────────────────
  ['public/blog/gsm-guide-paper-board.jpg', '16:9',
   'Close-up macro photography of paper and board sheets with a GSM weight measurement scale and calipers. Clean white FBB folding boxboard sheets stacked, with labels showing gram weights. Packaging industry editorial photography.'],

  ['public/blog/fbb-vs-duplex-board.jpg', '16:9',
   'Split comparison of two packaging board types — white FBB folding boxboard on the left and grey duplex board on the right — cross-section view showing layers, printed label samples on each. Clean studio product photography.'],

  ['public/blog/export-packaging-compliance-india.jpg', '16:9',
   'Photo of corrugated export packaging boxes with compliance markings, ISPM-15 stamp, and shipping labels, stacked on pallets in a warehouse ready for export. Professional industrial photography.'],

  ['public/blog/esd-antistatic-pp-corrugated.jpg', '16:9',
   'Black ESD anti-static PP corrugated packaging tray holding electronic components — circuit boards visible inside — on a workbench in an electronics assembly cleanroom. Professional product photography.'],

  ['public/blog/pp-corrugated-esg-sustainability.jpg', '16:9',
   'Eco-themed product photo showing PP corrugated returnable packaging boxes with a green leaf and recycling symbols, factory background visible, sustainability concept photo. Professional editorial photography.'],

  ['public/blog/pharma-packaging-board-specs.jpg', '16:9',
   'Pharmaceutical blister pack and medicine carton boxes printed on white FBB folding boxboard, arranged on a clean pharmaceutical factory production line. Professional packaging photography.'],

  ['public/blog/itc-pspd-vs-imported-board.jpg', '16:9',
   'Side by side comparison of Indian ITC PSPD board sheets versus imported paperboard, stacked in a warehouse setting with quality inspection labels. Editorial packaging industry photography.'],

  ['public/blog/india-paper-board-market-2026.jpg', '16:9',
   'Aerial panoramic view of a large Indian paper manufacturing mill with multiple production buildings, paper reels stacked in yard, industrial chimneys, sunrise lighting. Editorial industry photography.'],

  ['public/blog/fsc-certification-india-guide.jpg', '16:9',
   'FSC certified paper packaging boxes stacked in a warehouse, close-up of FSC certification label with forest background visible. Sustainability editorial photography.'],

  ['public/blog/cold-chain-board-packaging.jpg', '16:9',
   'Cold chain pharmaceutical packaging — insulated corrugated boxes with ice packs, temperature monitoring labels, being loaded into a refrigerated truck. Professional logistics photography.'],

  ['public/blog/pp-corrugated-returnable-packaging.jpg', '16:9',
   'Stack of grey PP corrugated returnable packaging bins and trays in an automotive factory, being used on an assembly line, worker handling the bins. Industrial photography.'],

  ['public/blog/pp-corrugated-specification-guide.jpg', '16:9',
   'Technical flat lay of PP corrugated sheet cross-sections at different thicknesses — 3mm, 5mm, 8mm — with a vernier caliper measuring the flute. White background, product specification photography.'],

  ['public/blog/pp-layer-pads-palletisation.jpg', '16:9',
   'PP corrugated layer pads separating tiers of products on a pallet in a warehouse. Forklift visible in background. Clean organised pallet stack with stretch wrap. Industrial logistics photography.'],

  ['public/blog/sheet-vs-reel-paper-supply.jpg', '16:9',
   'Side by side comparison of paper supply formats — large ITC paper reels on the left and pre-cut board sheets on the right — in a converting warehouse. Editorial packaging photography.'],

  // ── PP PRODUCT CATEGORY IMAGES ────────────────────────────────────────────
  ['public/products/pp/pp-foldable-boxes-1.jpg', '4:3',
   'Grey PP corrugated foldable box in open position, showing the hinge mechanism and flat folded view, clean white background, studio product photography.'],
  ['public/products/pp/pp-foldable-boxes-2.jpg', '4:3',
   'PP corrugated foldable box closed and locked, showing the secure latch, grey plastic surface texture detail, white background studio photography.'],
  ['public/products/pp/pp-foldable-boxes-3.jpg', '4:3',
   'Stack of three grey PP corrugated foldable boxes in an automotive factory, parts visible inside the top open box. Industrial use case photography.'],

  ['public/products/pp/pp-corrugated-sheets-1.jpg', '4:3',
   'Stack of white PP corrugated plastic sheets, cross-section visible showing flute structure, clean white background, product photography.'],
  ['public/products/pp/pp-corrugated-sheets-2.jpg', '4:3',
   'PP corrugated sheet close-up macro showing the single-flute internal structure and smooth outer surface, grey plastic, white background.'],
  ['public/products/pp/pp-corrugated-sheets-3.jpg', '4:3',
   'Multiple PP corrugated sheet sizes and colours stacked neatly in a warehouse setting — white, grey, black variants. Product photography.'],

  ['public/products/pp/pp-layer-pads-1.jpg', '4:3',
   'White PP corrugated layer pad lying flat, clean edges, slightly perforated surface for grip, product photography on white background.'],
  ['public/products/pp/pp-layer-pads-2.jpg', '4:3',
   'Layer pads stacked in use on a pallet between product tiers, close-up industrial photograph.'],
  ['public/products/pp/pp-layer-pads-3.jpg', '4:3',
   'PP corrugated layer pads being loaded onto a pallet by a worker in a warehouse, showing practical use case.'],

  ['public/products/pp/pp-corrugated-crates-1.jpg', '4:3',
   'Heavy-duty grey PP corrugated returnable crate with handles, open top, clean white background, product studio photography.'],
  ['public/products/pp/pp-corrugated-crates-2.jpg', '4:3',
   'PP corrugated crates stacked three high in a factory, parts visible inside, forklift in background. Industrial use photography.'],
  ['public/products/pp/pp-corrugated-crates-3.jpg', '4:3',
   'Close-up of PP corrugated crate corner joint and handle detail showing robust construction. White background macro photography.'],

  ['public/products/pp/pp-esd-packaging-1.jpg', '4:3',
   'Black carbon-loaded ESD anti-static PP corrugated box with electronics components inside, on a workbench. Product photography.'],
  ['public/products/pp/pp-esd-packaging-2.jpg', '4:3',
   'ESD PP corrugated tray holding PCB circuit boards in slots, clean electronics factory background. Industrial product photography.'],
  ['public/products/pp/pp-esd-packaging-3.jpg', '4:3',
   'Close-up of black ESD PP corrugated surface showing anti-static texture and carbon properties. White background macro photography.'],

  // ── PAPER PRODUCT CATEGORY IMAGES ────────────────────────────────────────
  ['public/products/paper/fbb-board.jpg', '4:3',
   'Premium white FBB folding boxboard sheets stacked neatly, showing clean white coated surface and strong board structure. White background product photography.'],
  ['public/products/paper/fbb-board-2.jpg', '4:3',
   'Close-up cross-section of FBB folding boxboard showing multi-layer construction — white coated top, mechanical pulp middle, bleached back. Macro product photography.'],
  ['public/products/paper/fbb-board-3.jpg', '4:3',
   'FBB board carton blanks being fed through a printing press. Industrial process photography.'],

  ['public/products/paper/duplex-board.jpg', '4:3',
   'Grey duplex board sheets stacked in a converting facility. Clean industrial product photography with white background.'],
  ['public/products/paper/duplex-board-2.jpg', '4:3',
   'Duplex board cross-section showing grey unbleached back and white coated top surface. Macro photography.'],
  ['public/products/paper/duplex-board-3.jpg', '4:3',
   'Printed duplex board carton box blanks stacked on pallet in a packaging facility.'],

  ['public/products/paper/kraft-liner.jpg', '4:3',
   'Brown kraft liner paper rolls in a warehouse on heavy-duty reel holders. Industrial photography.'],
  ['public/products/paper/kraft-liner-2.jpg', '4:3',
   'Close-up of kraft liner paper surface texture showing natural brown fibres. Macro photography white background.'],
  ['public/products/paper/kraft-liner-3.jpg', '4:3',
   'Kraft liner sheets cut to size stacked in a paper converting facility. Product photography.'],

  ['public/products/paper/test-liner.jpg', '4:3',
   'Test liner paper board sheets in a warehouse, semi-chemical brown surface. Product photography white background.'],
  ['public/products/paper/test-liner-2.jpg', '4:3',
   'Close-up surface texture of test liner showing semi-chemical pulp construction. Macro white background.'],
  ['public/products/paper/test-liner-3.jpg', '4:3',
   'Test liner corrugated medium sheets on a pallet in a storage facility. Industrial photography.'],
];

async function generateAndSave(outputPath, aspectRatio, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${API_KEY}`;
  const body = {
    instances: [{ prompt }],
    parameters: { sampleCount: 1, aspectRatio, safetyFilterLevel: 'block_some', personGeneration: 'allow_adult' },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error(`No image bytes. Response: ${JSON.stringify(data).slice(0, 200)}`);

  const raw = Buffer.from(b64, 'base64');
  const [w, h] = aspectRatio === '16:9' ? [1200, 675] : aspectRatio === '4:3' ? [900, 675] : [900, 675];
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await sharp(raw).resize(w, h, { fit: 'cover' }).jpeg({ quality: 82, mozjpeg: true }).toFile(outputPath);
  return fs.statSync(outputPath).size;
}

let ok = 0, fail = 0;
for (const [outPath, ratio, prompt] of IMAGES) {
  const label = outPath.replace('public/', '');
  process.stdout.write(`  ${label}... `);
  try {
    const bytes = await generateAndSave(outPath, ratio, prompt);
    console.log(`✓ ${(bytes / 1024).toFixed(0)} KB`);
    ok++;
  } catch (e) {
    console.log(`✗ ${e.message}`);
    fail++;
  }
  await new Promise(r => setTimeout(r, 600));
}
console.log(`\nDone: ${ok} generated, ${fail} failed.`);
