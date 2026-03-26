/**
 * Event Emitter — matches events against AutomationTrigger rules and creates ScheduledJobs.
 */

function matchesFilter(filter, data) {
  if (!filter || typeof filter !== 'object') return true;
  for (const [key, value] of Object.entries(filter)) {
    if (typeof value === 'string' && value.startsWith('!')) {
      if (data[key] === value.slice(1)) return false;
    } else {
      if (data[key] !== value) return false;
    }
  }
  return true;
}

async function emitEvent(prisma, eventName, data) {
  try {
    const triggers = await prisma.automationTrigger.findMany({
      where: { event: eventName, isActive: true },
    });

    for (const trigger of triggers) {
      if (!matchesFilter(trigger.eventFilter, data)) continue;

      if (trigger.cooldownHours > 0 && data.leadId) {
        const cutoff = new Date(Date.now() - trigger.cooldownHours * 3600000);
        const recentJob = await prisma.scheduledJob.findFirst({
          where: {
            type: 'TRIGGER_ACTION',
            referenceId: trigger.id,
            referenceType: 'TRIGGER',
            createdAt: { gte: cutoff },
            payload: { path: ['leadId'], equals: data.leadId },
          },
        });
        if (recentJob) continue;
      }

      await prisma.scheduledJob.create({
        data: {
          type: 'TRIGGER_ACTION',
          scheduledFor: new Date(),
          referenceId: trigger.id,
          referenceType: 'TRIGGER',
          payload: {
            triggerId: trigger.id,
            actionType: trigger.actionType,
            actionConfig: trigger.actionConfig,
            leadId: data.leadId || null,
            contactId: data.contactId || null,
            eventData: data,
          },
        },
      });

      await prisma.automationTrigger.update({
        where: { id: trigger.id },
        data: { lastFiredAt: new Date() },
      });
    }
  } catch (err) {
    console.error(`[EventEmitter] Error processing event ${eventName}:`, err.message);
  }
}

module.exports = { emitEvent, matchesFilter };
