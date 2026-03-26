/**
 * Daily Sweeps — stale lead detection and quote expiry checks.
 * Run once daily at 8am IST via a self-scheduling ScheduledJob.
 */

const { emitEvent } = require('./eventEmitter');

async function runDailySweeps(prisma) {
  console.log('[DailySweeps] Running daily checks...');

  const staleCutoff = new Date();
  staleCutoff.setDate(staleCutoff.getDate() - 14);

  const staleLeads = await prisma.lead.findMany({
    where: {
      stageChangedAt: { lt: staleCutoff },
      stage: { notIn: ['WON', 'LOST', 'DORMANT'] },
      isArchived: false,
    },
  });

  for (const lead of staleLeads) {
    const daysSince = Math.floor((Date.now() - new Date(lead.stageChangedAt).getTime()) / (1000 * 60 * 60 * 24));
    await emitEvent(prisma, 'LEAD_STALE', { leadId: lead.id, daysSinceActivity: daysSince });
  }
  console.log(`[DailySweeps] Found ${staleLeads.length} stale leads`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiredQuotes = await prisma.quote.findMany({
    where: {
      validUntil: { lt: today },
      status: 'SENT',
    },
  });

  for (const quote of expiredQuotes) {
    await emitEvent(prisma, 'QUOTE_EXPIRED', { quoteId: quote.id, leadId: quote.leadId });
  }
  console.log(`[DailySweeps] Found ${expiredQuotes.length} expired quotes`);

  return { staleLeads: staleLeads.length, expiredQuotes: expiredQuotes.length };
}

async function scheduleDailySweep(prisma) {
  const existing = await prisma.scheduledJob.findFirst({
    where: { type: 'DAILY_SWEEP', status: { in: ['PENDING', 'DEFERRED'] } },
  });
  if (existing) return;

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(2, 30, 0, 0); // 8am IST = 2:30am UTC

  await prisma.scheduledJob.create({
    data: {
      type: 'DAILY_SWEEP',
      scheduledFor: tomorrow,
      status: 'PENDING',
    },
  });
  console.log(`[DailySweeps] Next sweep scheduled for ${tomorrow.toISOString()}`);
}

module.exports = { runDailySweeps, scheduleDailySweep };
