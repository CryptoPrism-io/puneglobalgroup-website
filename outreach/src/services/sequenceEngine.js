/**
 * Sequence Engine — enroll leads, execute steps, check engagement, advance/stop.
 */

const fs = require('node:fs/promises');
const { renderTemplate } = require('./templateEngine');
const { sendEmail } = require('./emailService');
const { sendMessage: sendWhatsApp, sendMedia, isConnected, assertCanReachOut } = require('./whatsappService');
const { hasWhatsAppOptIn } = require('./whatsappConsent');
const { assertDailyLimit, randomSequenceDelayMs } = require('./whatsappPolicy');

async function nextSequenceSlot(prisma, earliest) {
  const horizon = new Date(earliest.getTime() + 8 * 60 * 60 * 1000);
  const latest = await prisma.scheduledJob.findFirst({
    where: {
      type: 'SEQUENCE_STEP',
      status: { in: ['PENDING', 'DEFERRED'] },
      scheduledFor: { gte: earliest, lte: horizon },
    },
    orderBy: { scheduledFor: 'desc' },
  });
  const anchor = latest?.scheduledFor > earliest ? latest.scheduledFor : earliest;
  return new Date(anchor.getTime() + randomSequenceDelayMs());
}

async function enrollLead(prisma, sequenceId, leadId, contactId) {
  const sequence = await prisma.sequence.findUnique({
    where: { id: sequenceId },
    include: { steps: { orderBy: { stepOrder: 'asc' } } },
  });
  if (!sequence || !sequence.isActive) {
    throw new Error('Sequence not found or inactive');
  }
  if (sequence.steps.length === 0) {
    throw new Error('Sequence has no steps');
  }

  const existing = await prisma.sequenceEnrollment.findUnique({
    where: { sequenceId_leadId: { sequenceId, leadId } },
  });
  if (existing && existing.status === 'ACTIVE') {
    throw new Error('Lead is already enrolled in this sequence');
  }

  if (existing) {
    await prisma.sequenceEnrollment.delete({ where: { id: existing.id } });
  }

  const enrollment = await prisma.sequenceEnrollment.create({
    data: { sequenceId, leadId, contactId, currentStep: 1, status: 'ACTIVE' },
  });

  const firstStep = sequence.steps[0];
  const scheduledFor = new Date();
  scheduledFor.setDate(scheduledFor.getDate() + firstStep.delayDays);
  scheduledFor.setHours(scheduledFor.getHours() + firstStep.delayHours);
  if (firstStep.channel === 'WHATSAPP') scheduledFor.setTime((await nextSequenceSlot(prisma, scheduledFor)).getTime());

  await prisma.scheduledJob.create({
    data: {
      type: 'SEQUENCE_STEP',
      scheduledFor,
      referenceId: enrollment.id,
      referenceType: 'ENROLLMENT',
      payload: { enrollmentId: enrollment.id, stepOrder: 1 },
    },
  });

  return enrollment;
}

async function hasEngaged(prisma, leadId, sinceDate) {
  const replyActivity = await prisma.activity.findFirst({
    where: {
      leadId,
      type: { in: ['EMAIL_REPLY', 'WHATSAPP_REPLY', 'REPLY'] },
      createdAt: { gte: sinceDate },
    },
  });
  if (replyActivity) return true;

  return false;
}

async function executeStep(prisma, enrollmentId, stepOrder) {
  const enrollment = await prisma.sequenceEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      sequence: { include: { steps: { orderBy: { stepOrder: 'asc' }, include: { template: true } } } },
      lead: true,
      contact: true,
    },
  });

  if (!enrollment) throw new Error('Enrollment not found');
  if (enrollment.status !== 'ACTIVE') return { skipped: true, reason: 'not active' };

  const engaged = await hasEngaged(prisma, enrollment.leadId, enrollment.createdAt);
  if (engaged) {
    await prisma.sequenceEnrollment.update({
      where: { id: enrollmentId },
      data: { status: 'STOPPED', stoppedReason: 'REPLIED', completedAt: new Date() },
    });
    return { skipped: true, reason: 'lead engaged' };
  }

  const step = enrollment.sequence.steps.find(s => s.stepOrder === stepOrder);
  if (!step) throw new Error(`Step ${stepOrder} not found in sequence`);

  const lead = enrollment.lead;
  const contact = enrollment.contact;
  const template = step.template;

  const renderedBody = renderTemplate(template.body, { lead, contact });
  const renderedSubject = template.subject
    ? renderTemplate(template.subject, { lead, contact })
    : null;

  let status = 'QUEUED';
  let errorMessage = null;
  let resendEmailId = null;
  let sentAt = null;
  let trackingData = null;

  if (step.channel === 'WHATSAPP') {
    if (!hasWhatsAppOptIn(contact)) throw new Error('WhatsApp opt-in is not recorded for this contact');
    await assertDailyLimit(prisma);
    await assertCanReachOut();
  }

  try {
    if (step.channel === 'EMAIL') {
      const email = contact.email;
      if (!email) throw new Error('No email for contact');
      const result = await sendEmail(email, renderedSubject, renderedBody);
      if (result.error) throw new Error(result.error);
      resendEmailId = result.id;
      status = 'SENT';
      sentAt = new Date();
    } else if (step.channel === 'WHATSAPP') {
      if (!await isConnected()) throw new Error('WhatsApp not connected');
      const phone = contact.whatsapp || contact.phone;
      if (!phone) throw new Error('No phone/WhatsApp for contact');
      const media = {
        PDF: [process.env.WHATSAPP_PDF_PATH || '/app/private/pp-brochure.pdf', 'application/pdf', 'Pune_Global_Group_PP_Company_Introduction.pdf'],
        IMAGE: [process.env.WHATSAPP_IMAGE_PATH || '/app/private/pp-product-showcase.jpg', 'image/jpeg', 'Pune_Global_Group_PP_Product_Showcase.jpg'],
        VIDEO: [process.env.WHATSAPP_VIDEO_PATH || '/app/private/pp-product-reel.mp4', 'video/mp4', 'Pune_Global_Group_PP_Product_Reel.mp4'],
      }[template.attachmentType];
      const result = media
        ? await sendMedia(phone, await fs.readFile(media[0]), media[1], media[2], renderedBody)
        : await sendWhatsApp(phone, renderedBody);
      trackingData = result?.id ? { wahaMessageId: result.id } : null;
      status = 'SENT';
      sentAt = new Date();
    }
  } catch (err) {
    status = 'FAILED';
    errorMessage = err.message;
  }

  await prisma.outreachMessage.create({
    data: {
      leadId: lead.id,
      contactId: contact.id,
      channel: step.channel,
      templateId: template.id,
      subject: renderedSubject,
      body: renderedBody,
      status,
      sentAt,
      errorMessage,
      resendEmailId,
      trackingData,
    },
  });

  if (status === 'SENT') {
    await prisma.activity.create({
      data: {
        leadId: lead.id,
        contactId: contact.id,
        type: step.channel === 'EMAIL' ? 'EMAIL_SENT' : 'WHATSAPP_SENT',
        subject: `Sequence: ${enrollment.sequence.name} — Step ${stepOrder}`,
        body: renderedSubject || renderedBody.substring(0, 100),
      },
    });
  }

  const nextStep = enrollment.sequence.steps.find(s => s.stepOrder === stepOrder + 1);
  if (nextStep && status === 'SENT') {
    await prisma.sequenceEnrollment.update({
      where: { id: enrollmentId },
      data: { currentStep: stepOrder + 1 },
    });

    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + nextStep.delayDays);
    scheduledFor.setHours(scheduledFor.getHours() + nextStep.delayHours);
    if (nextStep.channel === 'WHATSAPP') scheduledFor.setTime((await nextSequenceSlot(prisma, scheduledFor)).getTime());

    await prisma.scheduledJob.create({
      data: {
        type: 'SEQUENCE_STEP',
        scheduledFor,
        referenceId: enrollmentId,
        referenceType: 'ENROLLMENT',
        payload: { enrollmentId, stepOrder: stepOrder + 1 },
      },
    });
  } else {
    await prisma.sequenceEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: status === 'SENT' ? 'COMPLETED' : 'STOPPED',
        stoppedReason: status === 'SENT' ? null : 'FAILED',
        completedAt: new Date(),
      },
    });
  }

  return { sent: status === 'SENT', step: stepOrder };
}

async function stopEnrollment(prisma, enrollmentId, reason) {
  await prisma.sequenceEnrollment.update({
    where: { id: enrollmentId },
    data: { status: 'STOPPED', stoppedReason: reason || 'MANUAL', completedAt: new Date() },
  });
  await prisma.scheduledJob.updateMany({
    where: { referenceId: enrollmentId, referenceType: 'ENROLLMENT', status: 'PENDING' },
    data: { status: 'CANCELLED' },
  });
}

async function togglePause(prisma, enrollmentId) {
  const enrollment = await prisma.sequenceEnrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment) throw new Error('Enrollment not found');

  if (enrollment.status === 'ACTIVE') {
    await prisma.sequenceEnrollment.update({
      where: { id: enrollmentId },
      data: { status: 'PAUSED' },
    });
  } else if (enrollment.status === 'PAUSED') {
    await prisma.sequenceEnrollment.update({
      where: { id: enrollmentId },
      data: { status: 'ACTIVE' },
    });
    const pendingJob = await prisma.scheduledJob.findFirst({
      where: { referenceId: enrollmentId, referenceType: 'ENROLLMENT', status: { in: ['PENDING', 'DEFERRED'] } },
    });
    if (!pendingJob) {
      await prisma.scheduledJob.create({
        data: {
          type: 'SEQUENCE_STEP',
          scheduledFor: new Date(),
          referenceId: enrollmentId,
          referenceType: 'ENROLLMENT',
          payload: { enrollmentId, stepOrder: enrollment.currentStep },
        },
      });
    }
  }
}

module.exports = { enrollLead, executeStep, hasEngaged, stopEnrollment, togglePause };
