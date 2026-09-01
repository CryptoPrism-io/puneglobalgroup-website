const { normalizePhone, getPhoneByLid, sendMessage } = require('./whatsappService');
const { appendConsentNote, OPT_IN_MARKER, OPT_OUT_MARKER } = require('./whatsappConsent');
const { changeStage } = require('./pipeline');
const { generateReply } = require('./bedrockReplyService');

const QUALIFICATION_PROMPT = [
  'Thank you for responding. To route this correctly, please share:',
  '1. Product or component',
  '2. Dimensions, weight, or a current-pack photo',
  '3. Expected monthly quantity',
  '4. Delivery location',
  '',
  'Yogesh will review it during business hours. Reply STOP to opt out.',
].join('\n');

const HANDOFF_REPLY = 'Thank you. I have passed this to Yogesh for review. He will respond during business hours.';

function classifyReply(body, priorReplyCount = 0) {
  const text = String(body || '').trim().toLowerCase();
  if (/\b(stop|unsubscribe|remove me|do not contact|don'?t contact|wrong number|not interested|no thanks)\b/.test(text)) return 'OPT_OUT';
  if (priorReplyCount > 0 || /\b(yes|interested|quote|quotation|price|cost|sample|call|requirement|dimension|qty|quantity|purchase|procurement|brochure|catalog|send details)\b/.test(text)) return 'HUMAN_HANDOFF';
  return 'QUALIFY';
}

function isOutgoingMessage(event, payload) {
  const serializedId = typeof payload?.id === 'string'
    ? payload.id
    : payload?.id?._serialized || payload?.id?.$1;
  return Boolean(
    payload?.fromMe
    || payload?.id?.fromMe
    || payload?._data?.id?.fromMe
    || String(serializedId || '').startsWith('true_')
    || event?.source === 'api'
  );
}

function isStaleMessage(payload, now = Date.now()) {
  const timestamp = Number(payload?.timestamp);
  if (!Number.isFinite(timestamp)) return false;
  const sentAt = timestamp < 1e12 ? timestamp * 1000 : timestamp;
  const maxAge = Number.parseInt(process.env.WHATSAPP_INBOUND_MAX_AGE_MS || '900000', 10);
  return sentAt < now - maxAge;
}

function isSystemMessage(payload) {
  return payload?._data?.type === 'e2e_notification';
}

function phoneFromChatId(chatId) {
  const match = String(chatId || '').match(/^(\d+)(?::\d+)?(?:@c\.us|@s\.whatsapp\.net)?$/);
  return match ? normalizePhone(match[1]) : null;
}

async function resolvePhoneFromChatId(chatId) {
  const id = String(chatId || '');
  if (id.endsWith('@lid')) {
    try {
      return phoneFromChatId(await getPhoneByLid(id));
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }
  return phoneFromChatId(id);
}

function withTag(tags, tag) {
  const values = Array.isArray(tags) ? tags : [];
  return values.includes(tag) ? values : [...values, tag];
}

function withoutTag(tags, tag) {
  return (Array.isArray(tags) ? tags : []).filter(value => value !== tag);
}

async function findContactByPhone(prisma, phone) {
  const lastTen = phone.slice(-10);
  const candidates = await prisma.contact.findMany({
    where: { OR: [{ phone: { contains: lastTen } }, { whatsapp: { contains: lastTen } }] },
    include: { lead: true },
  });
  return candidates.find(contact => {
    try {
      return [contact.whatsapp, contact.phone].some(value => value && normalizePhone(value) === phone);
    } catch (_) {
      return false;
    }
  }) || null;
}

async function stopPendingFollowUps(prisma, leadId) {
  const enrollments = await prisma.sequenceEnrollment.findMany({ where: { leadId, status: 'ACTIVE' } });
  if (!enrollments.length) return;
  const ids = enrollments.map(item => item.id);
  await prisma.sequenceEnrollment.updateMany({
    where: { id: { in: ids } },
    data: { status: 'STOPPED', stoppedReason: 'REPLIED', completedAt: new Date() },
  });
  await prisma.scheduledJob.updateMany({
    where: { referenceType: 'ENROLLMENT', referenceId: { in: ids }, status: { in: ['PENDING', 'DEFERRED'] } },
    data: { status: 'CANCELLED' },
  });
}

async function moveToContacted(prisma, lead) {
  let current = lead;
  if (current.stage === 'NEW') current = await changeStage(prisma, current.id, 'RESEARCHED', 'Inbound WhatsApp reply matched to an existing contact');
  if (current.stage === 'RESEARCHED') await changeStage(prisma, current.id, 'CONTACTED', 'Inbound WhatsApp reply received');
}

async function handleInboundMessage(prisma, event) {
  const payload = event?.payload || {};
  if (event?.event !== 'message' || isOutgoingMessage(event, payload) || isStaleMessage(payload) || isSystemMessage(payload) || String(payload.from || '').endsWith('@g.us')) return { ignored: true };

  const eventKey = `WAHA_REPLY:${event.id || payload.id}`;
  if (await prisma.activity.findFirst({ where: { subject: eventKey } })) return { duplicate: true };

  const phone = await resolvePhoneFromChatId(payload.from);
  if (!phone) return { ignored: true, reason: 'unsupported sender id' };
  const contact = await findContactByPhone(prisma, phone);
  if (!contact) return { unmatched: true, phone };

  const priorReplyCount = await prisma.activity.count({ where: { leadId: contact.leadId, type: 'WHATSAPP_REPLY' } });
  const disposition = classifyReply(payload.body, priorReplyCount);
  await prisma.activity.create({
    data: {
      leadId: contact.leadId,
      contactId: contact.id,
      type: 'WHATSAPP_REPLY',
      subject: eventKey,
      body: String(payload.body || '[media/non-text reply]').slice(0, 4000),
    },
  });
  await stopPendingFollowUps(prisma, contact.leadId);

  if (disposition === 'OPT_OUT') {
    await prisma.contact.update({
      where: { id: contact.id },
      data: { notes: appendConsentNote(contact.notes, OPT_OUT_MARKER, 'recipient request') },
    });
    await prisma.lead.update({
      where: { id: contact.leadId },
      data: { tags: withTag(withoutTag(contact.lead.tags, 'human-handoff'), 'whatsapp-opt-out') },
    });
    if (contact.lead.stage !== 'DORMANT') await changeStage(prisma, contact.leadId, 'DORMANT', 'WhatsApp opt-out received');
    return { disposition, leadId: contact.leadId };
  }

  await prisma.contact.update({
    where: { id: contact.id },
    data: { notes: appendConsentNote(contact.notes, OPT_IN_MARKER, 'inbound WhatsApp reply') },
  });
  await moveToContacted(prisma, contact.lead);

  if (disposition === 'HUMAN_HANDOFF') {
    await prisma.lead.update({
      where: { id: contact.leadId },
      data: { tags: withTag(contact.lead.tags, 'human-handoff') },
    });
    await prisma.activity.create({
      data: {
        leadId: contact.leadId,
        contactId: contact.id,
        type: 'HUMAN_HANDOFF',
        subject: 'WhatsApp reply requires human review',
        body: String(payload.body || '[media/non-text reply]').slice(0, 1000),
      },
    });
    await sendMessage(phone, HANDOFF_REPLY);
  } else {
    let reply = null;
    try {
      reply = await generateReply(payload.body);
    } catch (error) {
      console.error('Bedrock reply failed:', error.message);
    }
    reply ||= QUALIFICATION_PROMPT;
    await sendMessage(phone, reply);
    await prisma.activity.create({
      data: {
        leadId: contact.leadId,
        contactId: contact.id,
        type: 'WHATSAPP_AUTO_REPLY',
        subject: reply === QUALIFICATION_PROMPT ? 'Qualification prompt sent' : 'Bedrock reply sent',
        body: reply.slice(0, 4000),
      },
    });
  }

  return { disposition, leadId: contact.leadId };
}

async function handleAcknowledgement(prisma, event) {
  const payload = event?.payload || {};
  if (event?.event !== 'message.ack' || !payload.id) return { ignored: true };
  const message = await prisma.outreachMessage.findFirst({
    where: { trackingData: { path: ['wahaMessageId'], equals: payload.id } },
  });
  if (!message) return { unmatched: true };

  const updates = {};
  if (payload.ack >= 3) { updates.status = 'READ'; updates.readAt = new Date(); }
  else if (payload.ack >= 2) { updates.status = 'DELIVERED'; updates.deliveredAt = new Date(); }
  else if (payload.ack === -1) { updates.status = 'FAILED'; updates.errorMessage = 'WhatsApp delivery error'; }
  if (Object.keys(updates).length) await prisma.outreachMessage.update({ where: { id: message.id }, data: updates });
  return { updated: Boolean(Object.keys(updates).length), messageId: message.id };
}

module.exports = { classifyReply, isOutgoingMessage, isStaleMessage, isSystemMessage, phoneFromChatId, resolvePhoneFromChatId, handleInboundMessage, handleAcknowledgement };
