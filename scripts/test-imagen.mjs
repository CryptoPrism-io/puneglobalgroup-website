const API_KEY = 'AIzaSyDIxpNqLTm_lEFiDyHvYiz-ba3GeK4vhbc';

// Try :predict endpoint with Imagen 4 body format
const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`;
const body = {
  instances: [{ prompt: "A flatbed die-cutting press machine in an industrial factory, photorealistic" }],
  parameters: {
    sampleCount: 1,
    aspectRatio: "4:3",
    safetyFilterLevel: "block_some",
    personGeneration: "allow_adult",
  }
};

const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
console.log('Status:', res.status);
const data = await res.json();
console.log('Response keys:', Object.keys(data));
if (data.predictions) {
  console.log('Prediction keys:', Object.keys(data.predictions[0]));
  const b64 = data.predictions[0].bytesBase64Encoded;
  if (b64) console.log('Got image bytes, length:', b64.length);
} else {
  console.log('Full response:', JSON.stringify(data).slice(0, 500));
}
