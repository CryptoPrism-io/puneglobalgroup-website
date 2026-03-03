import './load-env.mjs';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const API_KEY = process.env.GEMINI_API_KEY || (() => { throw new Error('Set GEMINI_API_KEY'); })();
const MODEL = 'gemini-3.1-flash-image-preview'; // Nano Banana 2

const PP = 'MATERIAL: All packaging is rigid polypropylene (PP) twin-wall corrugated plastic sheet — hollow single-flute, flat smooth panels, metal rivets at corners, fold lines visible. NOT cardboard. NOT injection moulded. NOT kraft. NOT ribbed moulded bins.';
const IND = 'Indian female factory worker, orange safety vest, white helmet, safety glasses.';
const CAM = '50mm lens. 5200K neutral LED lighting. Photorealistic 4K.';

const MDIR = 'public/infrastructure/machines';
const SDIR = 'public/infrastructure/support';

const IMAGES = [
  [`${MDIR}/flat-bed-punch-press-wide.jpg`,
   `${CAM} Flat-bed die cutting punch press machine in Indian PP corrugated factory. Machine cutting blue and grey PP corrugated twinwall sheets. Die board on upper platen. Finished die-cut PP box panels stacked nearby. No people.`],
  [`${MDIR}/flat-bed-punch-press-detail.jpg`,
   `${CAM} Macro: steel cutting rule die pressing into grey 5mm single-flute PP corrugated twinwall sheet. Hollow rectangular flute cross-section clearly visible on cut edge. Clean cut. No people.`],
  [`${MDIR}/flat-bed-punch-press-operation.jpg`,
   `${CAM} ${IND} Loading grey PP corrugated twinwall sheet into flat-bed punch press. Stack of finished open-top PP corrugated box blanks with fold lines beside machine.`],
  [`${MDIR}/ultrasonic-welder-wide.jpg`,
   `${CAM} Industrial ultrasonic plastic welding machine. Vertical column frame, pneumatic actuator, cylindrical titanium sonotrode horn, flat metal anvil table, digital frequency control, foot pedal. Blue and grey PP corrugated twinwall panels on worktable, hollow flute channels on edges. No people. No sparks. No arc welding.`],
  [`${MDIR}/ultrasonic-welder-detail.jpg`,
   `${CAM} Macro: titanium sonotrode horn pressing onto corner seam joint of two grey PP corrugated twinwall panels meeting at 90 degrees. Hollow rectangular flute channels visible on cut edges. Metal rivets visible. Clean fusion weld. No sparks. No flame.`],
  [`${MDIR}/ultrasonic-welder-operation.jpg`,
   `${CAM} ${IND} Operating vertical ultrasonic welding machine, joining corner seam of blue PP corrugated twinwall bin. Hollow flute structure visible on panel edges. Finished PP corrugated bins behind. No arc welding. No sparks.`],
  [`${MDIR}/screen-printing-wide.jpg`,
   `${CAM} Industrial flat-bed screen printing machine in factory. Squeegee arm, mesh screen, flat print bed. Blue PP corrugated twinwall sheets on print table. Stack of printed PP sheets on drying rack. No people.`],
  [`${MDIR}/screen-printing-detail.jpg`,
   `${CAM} Macro: rubber squeegee applying black ink through mesh screen onto blue PP corrugated twinwall sheet surface. Barcode pattern visible. Ink detail sharp. No people.`],
  [`${MDIR}/screen-printing-operation.jpg`,
   `${CAM} ${IND} Lifting freshly printed blue PP corrugated twinwall box from screen printer bed. Black printed text visible on smooth matte plastic surface.`],
  [`${MDIR}/guillotine-sheeter-wide.jpg`,
   `${CAM} Hydraulic guillotine sheeter cutting white coated FBB paper board sheets. Tall grey metal machine with top-mounted blade, digital display, red emergency stop. Stack of trimmed sheets beside. No people.`],
  [`${MDIR}/guillotine-sheeter-detail.jpg`,
   `${CAM} Macro: guillotine blade slicing through stack of white coated FBB board sheets. Clean straight cut edge showing multiple paper layers in cross-section. No people.`],
  [`${MDIR}/guillotine-sheeter-operation.jpg`,
   `${CAM} Indian male worker adjusting back gauge of hydraulic guillotine sheeter. White paper board stacks on machine table. Factory setting.`],
  [`${MDIR}/synchro-sheeter-wide.jpg`,
   `${CAM} Rotary synchro sheeter converting paper board rolls into cut sheets. Infeed reel stand, rotating cutting drum, outfeed conveyor stacking sheets. No people.`],
  [`${MDIR}/synchro-sheeter-detail.jpg`,
   `${CAM} Macro: rotating cutting drum slicing continuous web of white coated paper board into sheets. Mechanical components, blade, timing belt. No people.`],
  [`${MDIR}/synchro-sheeter-operation.jpg`,
   `${CAM} ${IND} Checking cut sheet dimensions at synchro sheeter output using ruler. Sheets stacking at output.`],
  [`${MDIR}/stretch-wrap-forklift-wide.jpg`,
   `${CAM} Pallet stretch wrap machine wrapping pallet of grey PP corrugated twinwall boxes and trays. Yellow electric forklift in background. Clean warehouse dispatch bay.`],
  [`${MDIR}/stretch-wrap-forklift-detail.jpg`,
   `${CAM} Macro: clear stretch film tightly wound around grey PP corrugated twinwall boxes on pallet. Film tension lines. Hollow flute channels visible on box edges. No people.`],
  [`${MDIR}/stretch-wrap-forklift-operation.jpg`,
   `${CAM} ${IND} Driving yellow electric forklift moving stretch-wrapped pallet of grey PP corrugated twinwall boxes toward loading dock.`],
  [`${SDIR}/full-product-lineup.jpg`,
   `${PP} ${CAM} Wide factory floor. Full PP corrugated twinwall product lineup on pallets: grey open-top boxes with metal corner rivets, blue hopper-front boxes, black stackable trays, white flat layer pads. All flat-panel fold-line construction.`],
  [`${SDIR}/die-cut-blank-stack.jpg`,
   `${PP} ${CAM} Stack of flat die-cut polypropylene twinwall sheet blanks beside punch press. Smooth flat grey plastic top surface. Cut edge shows hollow rectangular flute channels inside the plastic sheet. No cardboard.`],
  [`${SDIR}/assembly-table.jpg`,
   `${PP} ${CAM} Factory assembly workbench. Grey and blue flat PP corrugated twinwall panels laid out. Rivet gun and metal rivets on table. Partially assembled grey PP corrugated open-top box showing fold lines and corner rivet holes. Blue finished box beside it.`],
  [`${SDIR}/finished-goods-stack.jpg`,
   `${PP} ${CAM} Warehouse. Finished grey PP corrugated twinwall open-top boxes stacked on pallets — flat smooth sides, sharp fold lines at corners, metal rivet heads. Blue PP corrugated boxes on adjacent pallet. White flat PP twinwall layer pads between stacks. NOT injection moulded.`],
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
  const label = out.replace('public/infrastructure/', '');
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
  await new Promise(r => setTimeout(r, 4000));
}
console.log(`\nDone: ${ok} ok, ${fail} failed.`);
