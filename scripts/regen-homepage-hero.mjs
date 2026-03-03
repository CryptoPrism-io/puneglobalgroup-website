import './load-env.mjs';
import fs from 'fs';
import sharp from 'sharp';

const API_KEY = process.env.GEMINI_API_KEY || (() => { throw new Error('Set GEMINI_API_KEY'); })();
const MODEL = 'gemini-3-pro-image-preview'; // Nano Banana Pro — hero quality

const STYLE_HERO = 'Ultra high resolution photorealistic photography. Professional commercial photography. Cinematic quality. Highly detailed.';

const prompt = `${STYLE_HERO} Aerial drone photo of a large modern Indian industrial packaging manufacturing facility at golden hour sunset. Clean white painted steel building, large warehouse structure, loading bay with two trucks docked at roller shutter doors, green landscaping, palm trees, river in background, dramatic orange and pink sky. No text on building. No logos. No company names. No brand names on facade. No signage on building. Corporate architecture photography, India.`;

const OUT = 'public/hero-homepage-v2.jpg';

process.stdout.write(`Generating hero-homepage-v2.jpg... `);
try {
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
  const raw = Buffer.from(b64, 'base64');
  await sharp(raw).resize(1920, 1080, { fit: 'cover' }).jpeg({ quality: 92, mozjpeg: true }).toFile(OUT);
  console.log(`✓ ${Math.round(fs.statSync(OUT).size / 1024)} KB`);
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exit(1);
}
