import './load-env.mjs';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const API_KEY = process.env.GEMINI_API_KEY || (() => { throw new Error('Set GEMINI_API_KEY'); })();
const MODEL = 'gemini-3.1-flash-image-preview';

const CAM = '50mm lens. 5200K neutral LED lighting. Photorealistic 4K.';
const IND = 'Indian female factory worker, orange safety vest, white helmet, safety glasses.';

// Targeted fixes for the 2 failing images
const IMAGES = [
  // FAIL: hallucinated company name "FLUTECH PACKAGING Ltd." on box
  // FIX: explicit "no brand names, no company names, no fictional text on packaging"
  ['public/infrastructure/machines/screen-printing-operation.jpg',
   `${CAM} ${IND} Lifting a freshly screen-printed blue PP corrugated twinwall flat sheet off a flatbed screen printer bed. Black barcode and generic geometric pattern printed on smooth matte blue plastic surface. No company names. No brand names. No fictional text on the plastic sheet. Screen printer machine frame visible in background. Clean factory floor.`],

  // FAIL: generated "Amada Hydraulic Shear" not guillotine, worker had no safety vest
  // FIX: very explicit guillotine description, mandatory orange vest and white helmet
  ['public/infrastructure/machines/guillotine-sheeter-operation.jpg',
   `${CAM} Indian male factory worker wearing orange safety vest and white helmet and safety glasses, standing at the back gauge ruler of a large hydraulic guillotine paper cutter machine. Machine has a vertical steel blade on top, white clamp bar, digital back gauge display, red emergency stop button. Stack of white coated FBB paper board sheets on the machine table. Machine labeled GUILLOTINE. Indian paper converting factory setting.`],
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
  await new Promise(r => setTimeout(r, 5000));
}
console.log(`\nDone: ${ok} ok, ${fail} failed.`);
