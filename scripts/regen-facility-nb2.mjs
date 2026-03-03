import './load-env.mjs';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const API_KEY = process.env.GEMINI_API_KEY || (() => { throw new Error('Set GEMINI_API_KEY'); })();
const MODEL = 'gemini-3.1-flash-image-preview';

const PP  = 'All packaging shown is rigid polypropylene (PP) twin-wall corrugated plastic sheet — flat smooth panels, hollow rectangular flute channels visible on cut edges, metal pop rivets at corners, fold lines visible. NOT cardboard. NOT injection-moulded bins. NOT kraft brown boxes. NOT ribbed moulded plastic.';
const CAM = '50mm lens. 5200K neutral LED lighting. Photorealistic 4K.';
const PPE = 'Indian factory worker, orange hi-vis safety vest, white hard hat helmet, safety glasses.';
const NO  = 'No company names. No brand names. No fictional logos or text on walls or boxes.';

const FDIR = 'public/infrastructure/facility';

const IMAGES = [
  [`${FDIR}/converting-floor.jpg`,
   `${CAM} ${NO} Wide interior shot of an Indian PP corrugated twinwall packaging manufacturing facility. ${PP} Indian female worker in orange safety vest and white helmet feeding flat grey PP twinwall sheets into a flat-bed punch press machine on the left. Indian male worker in orange vest assembling a grey PP twinwall open-top box using a rivet gun on a workbench in the foreground. Blue finished PP twinwall boxes stacked nearby. Yellow floor safety markings. Bright LED overhead lighting. Clean organised factory floor.`],

  [`${FDIR}/storage-warehouse.jpg`,
   `${CAM} ${NO} Interior of an organised Indian industrial warehouse. ${PP} Tall orange metal shelving racks stacked with pallets of grey PP corrugated twinwall open-top boxes — flat smooth panels with metal corner rivets. Blue PP twinwall boxes on adjacent pallet. White flat PP twinwall layer pads stacked between box rows. Indian female warehouse manager in orange vest and white helmet checking inventory on a tablet in the aisle. Forklift aisle visible. Bright LED overhead lighting. Clean concrete floor.`],

  [`${FDIR}/dispatch-area.jpg`,
   `${CAM} ${NO} Indian factory loading bay and despatch area. ${PP} Stretch-wrapped pallets of grey PP corrugated twinwall open-top boxes with metal corner rivets lined up on clean concrete floor. Indian female logistics worker in orange vest and white helmet with clipboard. Indian male worker in orange vest operating pallet jack moving a pallet of PP twinwall boxes toward open roller shutter loading dock doors. Two trucks visible outside dock. Daylight streaming in. ${NO}`],

  [`${FDIR}/quality-control.jpg`,
   `${CAM} ${NO} Indian female quality control inspector at a well-lit QC inspection table inside an Indian packaging factory. ${PP} She wears orange safety vest, white hard hat helmet, safety glasses, blue uniform. She uses digital vernier calipers to precisely measure the wall thickness of a grey PP corrugated twinwall box. Hollow rectangular flute channels clearly visible on the cut edge of the PP twinwall panel. Stack of grey PP twinwall boxes on table behind. Focused professional expression.`],

  [`${FDIR}/freight-lift.jpg`,
   `${CAM} ${NO} Inside a multi-storey Indian packaging manufacturing building. ${PPE} Indian female factory worker in orange safety vest and white helmet pressing the button panel of a large industrial freight elevator. Heavy-duty steel cage lift with open sliding metal gate doors. Inside the freight lift: a wooden pallet loaded with grey PP corrugated twinwall open-top boxes — flat smooth panels, metal corner rivets visible. Concrete walls, industrial lighting. ${NO}`],

  [`${FDIR}/forklift.jpg`,
   `${CAM} ${NO} Indian female forklift operator driving a yellow electric counterbalance forklift truck down a wide warehouse aisle. ${PP} Forklift forks raised, carrying a wooden pallet of grey PP corrugated twinwall open-top boxes — flat smooth panels with metal pop rivets at corners. Clean concrete floor with yellow painted safety aisle lines. Tall metal racking with more PP twinwall box pallets in background. Confident professional expression. Bright LED warehouse lighting. ${NO}`],
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
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 120)}`);
  const data = await res.json();
  const b64 = data?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
  if (!b64) throw new Error(`No image: ${JSON.stringify(data).slice(0, 150)}`);
  return b64;
}

let ok = 0, fail = 0;
for (const [out, prompt] of IMAGES) {
  const label = path.basename(out);
  process.stdout.write(`  ${label}... `);
  try {
    const b64 = await gen(prompt);
    const raw = Buffer.from(b64, 'base64');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await sharp(raw).resize(1920, 1440, { fit: 'cover' }).jpeg({ quality: 92, mozjpeg: true }).toFile(out);
    console.log(`✓ ${Math.round(fs.statSync(out).size / 1024)} KB`);
    ok++;
  } catch (e) {
    console.log(`✗ ${e.message.slice(0, 80)}`);
    fail++;
  }
  await new Promise(r => setTimeout(r, 5000));
}
console.log(`\nDone: ${ok} ok, ${fail} failed.`);
