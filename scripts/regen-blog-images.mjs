import './load-env.mjs';
import fs from 'fs';
import sharp from 'sharp';

const API_KEY = process.env.GEMINI_API_KEY || (() => { throw new Error('Set GEMINI_API_KEY'); })();
const MODEL = 'gemini-3-pro-image-preview'; // Nano Banana Pro

const STYLE = 'Artistic origami paper craft photography. Kraft paper and cream paper tones. Warm natural paper textures. Soft diffused studio lighting with gentle shadows. Minimal clean background. No text. No words. No labels. No numbers. Ultra sharp editorial photography.';

const IMAGES = [
  // 1. GSM Guide — paper weight/thickness: layered paper fans showing depth
  ['public/blog/gsm-guide-paper-board.jpg',
   `${STYLE} A beautiful composition of paper sheets fanned and layered in graduating thickness — thinnest translucent sheet at top, progressively thicker kraft sheets below. Some sheets folded in precise origami accordion pleats. Overhead flat-lay on warm white surface. Shadows reveal the varying thickness of each layer. Elegant minimalist.`],

  // 2. FBB vs Duplex — two distinct origami forms from two paper types
  ['public/blog/fbb-vs-duplex-board.jpg',
   `${STYLE} Two elegant origami cranes placed side by side. LEFT crane: folded from bright white smooth coated paper, perfectly crisp sharp folds, brilliant surface. RIGHT crane: folded from natural grey-brown kraft board, softer texture visible, slightly different sheen. Both facing each other on a pale cream surface. Dramatic side lighting emphasising fold geometry.`],

  // 3. Export Compliance — origami cargo ship/container vessel
  ['public/blog/export-packaging-compliance-india.jpg',
   `${STYLE} An intricate origami cargo container ship sailing across a surface of unfolded kraft paper map. The ship crafted from layered brown kraft board with precise angular folds forming the hull, bridge, and deck containers. Surrounding it: small origami waves folded from cream paper. Warm golden side lighting. Top-down editorial angle.`],

  // 4. PP Corrugated Replacing Cardboard — structural strength origami
  ['public/blog/pp-corrugated-returnable-packaging.jpg',
   `${STYLE} A strong bold origami geometric cube/box form constructed from corrugated kraft paper — the corrugated ridges visible on the cut edges, showing the internal fluted structure. The box stands solid and upright beside a collapsed, crumpled flat sheet of plain paper — symbolising strength vs weakness. Dramatic single side light casting strong shadow. Dark moody background with warm kraft tones.`],

  // 5. Sheet vs Reel — origami spiral vs flat geometric
  ['public/blog/sheet-vs-reel-paper-supply.jpg',
   `${STYLE} Two paper sculptures side by side on cream surface. LEFT: a tightly wound paper scroll/reel — layers of cream paper wound into a perfect cylinder, cross-section visible. RIGHT: a neat stack of precisely cut flat square paper sheets in a perfect tower. Both cast long elegant shadows. Overhead 45-degree angle. Clean warm studio light.`],

  // 6. ITC vs Imported Board — precision paper geometry
  ['public/blog/itc-pspd-vs-imported-board.jpg',
   `${STYLE} Artistic composition: precision-folded origami geometric grid/lattice structure made from premium white coated board sheets — sharp clean fold lines, architectural geometry, precise right angles forming a modular grid pattern. Some panels catch the light, others in shadow. Shot from a low angle showing the three-dimensional depth of the structure. Warm studio lighting. Cream background.`],

  // 7. Pharma Board Specs — delicate origami medical/pure
  ['public/blog/pharma-packaging-board-specs.jpg',
   `${STYLE} Extremely delicate origami composition: a pristine white paper lotus flower in full bloom, each petal precisely folded from brilliant white coated paper, radiating from the centre. Around it, tiny origami capsule/tablet shapes folded from pale paper. On a clean white marble surface. Soft diffused light from above. Clinical purity. Ultra sharp macro.`],

  // 8. India Market 2026 — grand architectural paper city
  ['public/blog/india-paper-board-market-2026.jpg',
   `${STYLE} Wide dramatic editorial shot: an intricate origami cityscape skyline built from layered kraft paper and white paper — tall angular buildings with folded facades, varying heights, casting long dramatic shadows across a kraft paper landscape. Shot from ground level looking up at the skyline against a clean warm backdrop. Cinematic lighting. Grand scale implied through composition.`],
];

async function gen(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'], temperature: 1.0, topP: 0.97 },
      }),
    }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 150)}`);
  const data = await res.json();
  const b64 = data?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
  if (!b64) throw new Error(`No image: ${JSON.stringify(data).slice(0, 200)}`);
  return b64;
}

let ok = 0, fail = 0;
for (const [out, prompt] of IMAGES) {
  const label = out.split('/').pop();
  process.stdout.write(`  ${label}... `);
  try {
    const b64 = await gen(prompt);
    const raw = Buffer.from(b64, 'base64');
    await sharp(raw).resize(1280, 720, { fit: 'cover' }).jpeg({ quality: 92, mozjpeg: true }).toFile(out);
    console.log(`✓ ${Math.round(fs.statSync(out).size / 1024)} KB`);
    ok++;
  } catch (e) {
    console.log(`✗ ${e.message.slice(0, 80)}`);
    fail++;
  }
  await new Promise(r => setTimeout(r, 30000));
}
console.log(`\nDone: ${ok} ok, ${fail} failed.`);
