const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const modelId = process.env.BEDROCK_MODEL_ID || 'apac.amazon.nova-micro-v1:0';

const SYSTEM_PROMPT = `You write concise WhatsApp replies for Pune Global Group, a Pune-based packaging supplier.
Verified facts you may use:
- Products include PP corrugated boxes, trays, bins, partitions and returnable packaging.
- Production completed in the last 12 months: 100 MT.
- Website: https://puneglobalgroup.in

Rules:
- Answer only general questions about these packaging capabilities.
- Never invent or state prices, lead times, certifications, customer names, technical compliance or guarantees.
- If details are missing, ask for the product/component, dimensions or a photo, expected monthly quantity and delivery location.
- Keep the reply under 70 words, professional and easy to read.
- End with "Reply STOP to opt out."`;

async function generateReply(message) {
  if (process.env.BEDROCK_AUTO_REPLY_ENABLED !== 'true') return null;
  const text = String(message || '').trim();
  if (!text) return null;

  const response = await client.send(new ConverseCommand({
    modelId,
    system: [{ text: SYSTEM_PROMPT }],
    messages: [{ role: 'user', content: [{ text: text.slice(0, 2000) }] }],
    inferenceConfig: { maxTokens: 180, temperature: 0.2, topP: 0.8 },
  }));
  return response.output?.message?.content?.find(item => item.text)?.text?.trim() || null;
}

module.exports = { generateReply };
