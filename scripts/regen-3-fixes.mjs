import './load-env.mjs';
import fs from 'fs';
import sharp from 'sharp';

const API_KEY = process.env.GEMINI_API_KEY || (() => { throw new Error('Set GEMINI_API_KEY'); })();
const MODEL = 'gemini-3.1-flash-image-preview';

const CAM = '50mm lens. 5200K neutral LED lighting. Photorealistic 4K.';
const IND = 'Indian female factory worker, orange hi-vis safety vest, white hard hat helmet, safety glasses.';

const IMAGES = [
  // screen-printing-operation: was 5/10, needs a clean professional shot
  ['public/infrastructure/machines/screen-printing-operation.jpg',
   `${CAM} ${IND} Standing at a flatbed screen printing machine, carefully sliding a flat blue polypropylene twin-wall corrugated plastic sheet onto the print bed under the mesh screen frame. The blue PP twinwall sheet is smooth and flat with flute channel structure visible on the cut edges. Screen printing machine frame and squeegee arm clearly visible. Black printed barcode pattern on a finished printed PP sheet nearby. Clean print shop factory floor. No company names. No brand names. No fictional text on panels.`],

  // synchro-sheeter-wide: brown reels need to be WHITE
  ['public/infrastructure/machines/synchro-sheeter-wide.jpg',
   `${CAM} Wide shot of an industrial rotary synchro sheeter machine in a paper board converting factory. Large infeed reel stand holding a WHITE coated paper board roll — bright white surface, not brown kraft. Rotating cutting drum in the centre. Outfeed delivery conveyor stacking cut white coated paper board sheets. Grey and blue steel machine body. Bright overhead LED lighting. No people. No brown kraft rolls. Only white coated board rolls.`],
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
