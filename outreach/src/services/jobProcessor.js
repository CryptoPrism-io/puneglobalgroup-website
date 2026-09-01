/**
 * Job Processor — central polling loop that executes all scheduled jobs.
 * Polls ScheduledJob table every 60 seconds for due jobs.
 */

const { executeStep } = require('./sequenceEngine');
const { executeCampaign } = require('./campaignRunner');
const { runDailySweeps, scheduleDailySweep } = require('./dailySweeps');
const { renderTemplate } = require('./templateEngine');
const { sendEmail } = require('./emailService');
const { sendMessage: sendWhatsApp, isConnected, assertCanReachOut } = require('./whatsappService');
const { changeStage } = require('./pipeline');
const { hasWhatsAppOptIn } = require('./whatsappConsent');

let processorInterval = null;

function isWithinSendWindow(now, windowStart, windowEnd, windowDays) {
  const start = windowStart ?? Number.parseInt(process.env.OUTREACH_WINDOW_START || '10', 10);
  const end = windowEnd ?? 18;
  const days = windowDays ?? '1,2,3,4,5';

  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const hour = istTime.getUTCHours();
  const dayOfWeek = istTime.getUTCDay();

  const allowedDays = days.split(',').map(Number);
  if (!allowedDays.includes(dayOfWeek)) return false;
  if (hour < start || hour >= end) return false;
  return true;
}

function nextOpenSlot(now, windowStart, windowEnd, windowDays) {
  const start = windowStart ?? Number.parseInt(process.env.OUTREACH_WINDOW_START || '10', 10);
  const days = windowDays ?? '1,2,3,4,5';
  const allowedDays = days.split(',').map(Number);

  const candidate = new Date(now);

  for (let i = 0; i < 8; i++) {
    candidate.setDate(candidate.getDate() + (i === 0 ? 0 : 1));
    const dayOfWeek = candidate.getDay();

    if (i === 0) {
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(candidate.getTime() + istOffset);
      const istHour = istTime.getUTCHours();
      if (istHour < start && allowedDays.includes(dayOfWeek)) {
        const result = new Date(candidate);
        const utcHour = start - 5;
        const utcMin = 30;
        result.setUTCHours(utcHour < 0 ? utcHour + 24 : utcHour, utcMin >= 60 ? utcMin - 60 : utcMin, 0, 0);
        return result;
      }
      continue;
    }

    if (allowedDays.includes(dayOfWeek)) {
      const result = new Date(candidate);
      const utcHour = start - 5;
      const utcMin = 30;
      result.setUTCHours(utcHour < 0 ? utcHour + 24 : utcHour, utcMin >= 60 ? utcMin - 60 : utcMin, 0, 0);
      return result;
    }
  }

  const fallback = new Date(now);
  fallback.setDate(fallback.getDate() + 1);
  fallback.setUTCHours(start - 5, 30, 0, 0);
  return fallback;
}

async function executeTriggerAction(prisma, job) {
  const { actionType, actionConfig, leadId, contactId } = job.payload;

  if (actionType === 'SEND_TEMPLATE') {
    const template = await prisma.messageTemplate.findUnique({ where: { id: actionConfig.templateId } });
    if (!template) throw new Error('Template not found');

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error('Lead not found');

    let contact = null;
    if (contactId) {
      contact = await prisma.contact.findUnique({ where: { id: contactId } });
    }
    if (!contact) {
      contact = await prisma.contact.findFirst({
        where: { leadId, isPrimary: true },
      });
    }

    const channel = actionConfig.channel || template.channel;
    const renderedBody = renderTemplate(template.body, { lead, contact });
    const renderedSubject = template.subject ? renderTemplate(template.subject, { lead, contact }) : null;

    let status = 'QUEUED';
    let errorMessage = null;
    let resendEmailId = null;
    let sentAt = null;
    let trackingData = null;

    if (channel === 'EMAIL') {
      if (!contact?.email) throw new Error('No email for contact');
      const result = await sendEmail(contact.email, renderedSubject, renderedBody);
      if (result.error) throw new Error(result.error);
      resendEmailId = result.id;
      status = 'SENT';
      sentAt = new Date();
    } else if (channel === 'WHATSAPP') {
      if (!await isConnected()) throw new Error('WhatsApp not connected');
      const phone = contact?.whatsapp || contact?.phone;
      if (!phone) throw new Error('No phone for contact');
      if (!hasWhatsAppOptIn(contact)) throw new Error('WhatsApp opt-in is not recorded for this contact');
      await assertCanReachOut();
      const result = await sendWhatsApp(phone, renderedBody);
      trackingData = result?.id ? { wahaMessageId: result.id } : null;
      status = 'SENT';
      sentAt = new Date();
    }

    await prisma.outreachMessage.create({
      data: {
        leadId, contactId: contact?.id || null, channel,
        templateId: template.id, subject: renderedSubject, body: renderedBody,
        status, sentAt, errorMessage, resendEmailId, trackingData,
      },
    });

    if (status === 'SENT') {
      await prisma.activity.create({
        data: {
          leadId, contactId: contact?.id || null,
          type: channel === 'EMAIL' ? 'EMAIL_SENT' : 'WHATSAPP_SENT',
          subject: `Auto: ${template.name}`,
          body: renderedSubject || renderedBody.substring(0, 100),
        },
      });
    }
  } else if (actionType === 'ENROLL_SEQUENCE') {
    const { enrollLead } = require('./sequenceEngine');
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { contacts: { where: { isPrimary: true }, take: 1 } },
    });
    if (!lead) throw new Error('Lead not found');
    const contact = lead.contacts[0];
    if (!contact) throw new Error('Lead has no primary contact');
    await enrollLead(prisma, actionConfig.sequenceId, leadId, contact.id);
  } else if (actionType === 'CHANGE_STAGE') {
    await changeStage(prisma, leadId, actionConfig.toStage, 'Auto: trigger action');
  } else if (actionType === 'CREATE_ACTIVITY') {
    await prisma.activity.create({
      data: {
        leadId,
        type: actionConfig.activityType || 'NOTE',
        subject: actionConfig.subject || 'Automation triggered',
        body: actionConfig.body || null,
      },
    });
  }
}

function nextCronRun(cronStr, after) {
  const parts = cronStr.split(/\s+/);
  if (parts.length !== 5) return null;

  const [minute, hour, , , dayOfWeek] = parts;
  const targetMin = minute === '*' ? 0 : parseInt(minute);
  const targetHour = hour === '*' ? 0 : parseInt(hour);
  const targetDays = dayOfWeek === '*' ? [0, 1, 2, 3, 4, 5, 6] : dayOfWeek.split(',').map(Number);

  const candidate = new Date(after);
  candidate.setMinutes(0, 0, 0);

  for (let i = 1; i <= 8; i++) {
    candidate.setDate(candidate.getDate() + 1);
    if (targetDays.includes(candidate.getDay())) {
      // Convert IST target time to UTC
      let utcHour = targetHour - 5;
      let utcMin = targetMin - 30;
      if (utcMin < 0) { utcMin += 60; utcHour -= 1; }
      if (utcHour < 0) utcHour += 24;
      candidate.setUTCHours(utcHour, utcMin, 0, 0);
      return candidate;
    }
  }

  const fallback = new Date(after);
  fallback.setDate(fallback.getDate() + 1);
  let utcHour = targetHour - 5;
  let utcMin = targetMin - 30;
  if (utcMin < 0) { utcMin += 60; utcHour -= 1; }
  if (utcHour < 0) utcHour += 24;
  fallback.setUTCHours(utcHour, utcMin, 0, 0);
  return fallback;
}

async function processJob(prisma, job) {
  await prisma.scheduledJob.update({
    where: { id: job.id },
    data: { status: 'PROCESSING', attempts: job.attempts + 1 },
  });

  try {
    if (job.type !== 'DAILY_SWEEP') {
      let winStart = Number.parseInt(process.env.OUTREACH_WINDOW_START || '10', 10);
      let winEnd = Number.parseInt(process.env.OUTREACH_WINDOW_END || '18', 10);
      let winDays = process.env.OUTREACH_WINDOW_DAYS || '1,2,3,4,5';
      if (job.referenceType === 'CAMPAIGN' && job.referenceId) {
        const campaign = await prisma.campaign.findUnique({ where: { id: job.referenceId } });
        if (campaign) {
          winStart = campaign.sendWindowStart ?? 9;
          winEnd = campaign.sendWindowEnd ?? 18;
          winDays = campaign.sendWindowDays ?? '1,2,3,4,5,6';
        }
      }

      if (!isWithinSendWindow(new Date(), winStart, winEnd, winDays)) {
        const nextSlot = nextOpenSlot(new Date(), winStart, winEnd, winDays);
        await prisma.scheduledJob.update({
          where: { id: job.id },
          data: { status: 'DEFERRED', scheduledFor: nextSlot, attempts: job.attempts },
        });
        console.log(`[JobProcessor] Job ${job.id} deferred to ${nextSlot.toISOString()} (outside send window)`);
        return;
      }
    }

    switch (job.type) {
      case 'SEQUENCE_STEP': {
        const { enrollmentId, stepOrder } = job.payload;
        await executeStep(prisma, enrollmentId, stepOrder);
        break;
      }
      case 'SCHEDULED_CAMPAIGN': {
        await executeCampaign(prisma, job.referenceId);
        break;
      }
      case 'RECURRING_CAMPAIGN': {
        const campaign = await prisma.campaign.findUnique({ where: { id: job.referenceId } });
        if (!campaign || !campaign.recurringCron) break;

        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'DRAFT', sentCount: 0, failedCount: 0, sentAt: null, completedAt: null },
        });
        await executeCampaign(prisma, campaign.id);
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { lastRunAt: new Date() },
        });

        const nextRun = nextCronRun(campaign.recurringCron, new Date());
        if (nextRun) {
          await prisma.scheduledJob.create({
            data: {
              type: 'RECURRING_CAMPAIGN',
              scheduledFor: nextRun,
              referenceId: campaign.id,
              referenceType: 'CAMPAIGN',
            },
          });
        }
        break;
      }
      case 'TRIGGER_ACTION': {
        await executeTriggerAction(prisma, job);
        break;
      }
      case 'DAILY_SWEEP': {
        await runDailySweeps(prisma);
        await scheduleDailySweep(prisma);
        break;
      }
      default:
        console.warn(`[JobProcessor] Unknown job type: ${job.type}`);
    }

    await prisma.scheduledJob.update({
      where: { id: job.id },
      data: { status: 'COMPLETED', processedAt: new Date() },
    });
  } catch (err) {
    console.error(`[JobProcessor] Job ${job.id} failed:`, err.message);
    if (err.code === 'WHATSAPP_DAILY_LIMIT' || /timelock|capping status/i.test(err.message)) {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const retryAt = nextOpenSlot(tomorrow, 10, 18, '1,2,3,4,5');
      await prisma.scheduledJob.update({
        where: { id: job.id },
        data: { status: 'DEFERRED', scheduledFor: retryAt, attempts: job.attempts, lastError: err.message },
      });
      return;
    }
    const newStatus = (job.attempts + 1) >= job.maxAttempts ? 'FAILED' : 'PENDING';
    const retryAt = new Date(Date.now() + (job.attempts + 1) * 15 * 60 * 1000);

    await prisma.scheduledJob.update({
      where: { id: job.id },
      data: {
        status: newStatus,
        lastError: err.message,
        scheduledFor: newStatus === 'PENDING' ? retryAt : job.scheduledFor,
      },
    });
  }
}

async function pollJobs(prisma) {
  try {
    const jobs = await prisma.scheduledJob.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: { lte: new Date() },
      },
      orderBy: { scheduledFor: 'asc' },
      take: 10,
    });

    for (const job of jobs) {
      await processJob(prisma, job);
    }
  } catch (err) {
    console.error('[JobProcessor] Poll error:', err.message);
  }
}

async function recoverStalledJobs(prisma) {
  const result = await prisma.scheduledJob.updateMany({
    where: { status: 'PROCESSING' },
    data: { status: 'PENDING' },
  });
  if (result.count > 0) {
    console.log(`[JobProcessor] Recovered ${result.count} stalled jobs`);
  }
}

async function startJobProcessor(prisma) {
  await recoverStalledJobs(prisma);
  await scheduleDailySweep(prisma);

  processorInterval = setInterval(() => pollJobs(prisma), 60000);
  console.log('[JobProcessor] Started — polling every 60s');

  await pollJobs(prisma);
}

function stopJobProcessor() {
  if (processorInterval) {
    clearInterval(processorInterval);
    processorInterval = null;
    console.log('[JobProcessor] Stopped');
  }
}

module.exports = { startJobProcessor, stopJobProcessor, isWithinSendWindow, nextOpenSlot, nextCronRun };
