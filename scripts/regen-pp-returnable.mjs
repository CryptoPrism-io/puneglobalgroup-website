import './load-env.mjs';
import fs from 'fs';
import sharp from 'sharp';

const API_KEY = process.env.GEMINI_API_KEY || (() => { throw new Error('Set GEMINI_API_KEY'); })();
const MODEL = 'gemini-3-pro-image-preview';

const STYLE = 'Artistic origami paper craft photography. Kraft paper and cream paper tones. Warm natural paper textures. Soft diffused studio lighting with gentle shadows. Minimal clean background. Absolutely NO text anywhere. NO words. NO labels. NO numbers. NO captions. NO annotations. Pure visual — only paper and shadow. Ultra sharp editorial photography.';

// Blog post: "Why PP Corrugated is Replacing Cardboard in Returnable Packaging"
// Story: PP corrugated = rigid, structured, reusable loop vs cardboard = single-use, collapses
const PROMPT = `${STYLE} A striking split-composition on warm cream surface.
LEFT HALF — STRENGTH: A tall, architecturally precise origami tower structure folded from stiff smooth cream-white paper — perfect crisp geometric folds, sharp edges, standing completely upright and rigid. The structure has a modular grid-like facade with repeated rectangular panels, implying strength and repeatability. It casts a long clean shadow.
RIGHT HALF — WEAKNESS: The same origami form but folded from soft brown kraft paper — collapsed, sagging, crumpled at the base, beginning to deform and lose its shape. One side bowing outward, the top corner crushed inward.
Both forms are placed side by side, the same size, but one triumphant and the other defeated. Dramatic directional light from the left illuminates the rigid white form brilliantly while the collapsed brown form sits in softer shadow. The contrast is stark and immediate. Overhead 35-degree angle shot. CRITICAL: absolutely no text, no words, no labels anywhere in the image. Pure photographic composition only.`;

process.stdout.write('  pp-corrugated-returnable-packaging.jpg... ');
try {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT }] }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'], temperature: 1.0, topP: 0.97 },
      }),
    }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 150)}`);
  const data = await res.json();
  const b64 = data?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
  if (!b64) throw new Error(`No image: ${JSON.stringify(data).slice(0, 200)}`);
  const raw = Buffer.from(b64, 'base64');
  const out = 'public/blog/pp-corrugated-returnable-packaging.jpg';
  await sharp(raw).resize(1280, 720, { fit: 'cover' }).jpeg({ quality: 92, mozjpeg: true }).toFile(out);
  console.log(`✓ ${Math.round(fs.statSync(out).size / 1024)} KB`);
} catch (e) {
  console.log(`✗ ${e.message.slice(0, 120)}`);
}
