function startOfIstDay(now = new Date()) {
  const offsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + offsetMs);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - offsetMs);
}

async function assertDailyLimit(prisma, requested = 1, now = new Date()) {
  const limit = Number.parseInt(process.env.WHATSAPP_DAILY_LIMIT || '10', 10);
  const sent = await prisma.outreachMessage.count({
    where: { channel: 'WHATSAPP', sentAt: { gte: startOfIstDay(now) }, status: { in: ['SENT', 'DELIVERED', 'READ'] } },
  });
  if (sent + requested > limit) {
    const error = new Error(`Daily WhatsApp outreach limit reached (${limit})`);
    error.code = 'WHATSAPP_DAILY_LIMIT';
    throw error;
  }
  return { sent, requested, limit };
}

function randomSequenceDelayMs() {
  const min = Number.parseInt(process.env.WHATSAPP_MIN_DELAY_MS || '180000', 10);
  const max = Number.parseInt(process.env.WHATSAPP_MAX_DELAY_MS || '480000', 10);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = { startOfIstDay, assertDailyLimit, randomSequenceDelayMs };
