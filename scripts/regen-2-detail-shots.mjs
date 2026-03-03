import './load-env.mjs';
import fs from 'fs';
import sharp from 'sharp';

const API_KEY = process.env.GEMINI_API_KEY || (() => { throw new Error('Set GEMINI_API_KEY'); })();
const MODEL = 'gemini-3.1-flash-image-preview';

const IMAGES = [
  ['public/infrastructure/machines/flat-bed-punch-press-detail.jpg',
   `Macro industrial photography. 50mm macro lens. Bright clean studio LED lighting. Extreme close-up of a sharp steel cutting-rule die blade pressed cleanly into a flat grey polypropylene twin-wall corrugated plastic sheet on a flatbed press platen. The cut edge of the PP twinwall sheet shows perfect hollow rectangular flute channels in clean cross-section. The cut is precise and clean — no torn edges, no rough cuts. The blade is polished steel, clean and sharp. Bright even lighting. Pure professional macro industrial product photography. Ultra sharp. No people. No dark shadows. No grime.`],

  ['public/infrastructure/machines/ultrasonic-welder-detail.jpg',
   `Macro industrial photography. 50mm macro lens. Bright clean studio LED lighting. Close-up of a polished titanium ultrasonic welding sonotrode horn positioned just above a clean, neat corner weld seam joining two flat grey polypropylene twin-wall corrugated plastic panels at a perfect 90-degree corner. The weld seam is neat, smooth and clean — no oozing plastic, no messy bead. The hollow rectangular flute channels are clearly visible on the cut edges of the PP twinwall panels. Metal pop rivets visible on the panel face. Professional macro industrial photography. Bright, clean lighting. Ultra sharp. No people. No sparks. No molten plastic ooze.`],
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

for (const [out, prompt] of IMAGES) {
  process.stdout.write(`  ${out.split('/').pop()}... `);
  try {
    const b64 = await gen(prompt);
    const raw = Buffer.from(b64, 'base64');
    await sharp(raw).resize(1920, 1440, { fit: 'cover' }).jpeg({ quality: 92, mozjpeg: true }).toFile(out);
    console.log(`✓ ${Math.round(fs.statSync(out).size / 1024)} KB`);
  } catch (e) {
    console.log(`✗ ${e.message.slice(0, 80)}`);
  }
  await new Promise(r => setTimeout(r, 5000));
}
