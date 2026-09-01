const express = require('express');
const crypto = require('node:crypto');
const router = express.Router();
const { emitEvent } = require('../services/eventEmitter');
const { handleInboundMessage, handleAcknowledgement } = require('../services/whatsappAutomation');

function isValidWahaSignature(req) {
  const secret = process.env.WAHA_WEBHOOK_SECRET || process.env.WAHA_API_KEY;
  const received = String(req.get('X-Webhook-Hmac') || '');
  if (!secret || !received || !req.rawBody) return false;
  const expected = crypto.createHmac('sha512', secret).update(req.rawBody).digest('hex');
  if (received.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

router.post('/waha', async (req, res) => {
  if (!isValidWahaSignature(req)) return res.status(401).send('invalid signature');
  try {
    const prisma = req.app.locals.prisma;
    const result = req.body.event === 'message.ack'
      ? await handleAcknowledgement(prisma, req.body)
      : await handleInboundMessage(prisma, req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error('WAHA webhook error:', err.message);
    res.status(500).send('retry');
  }
});

router.post('/resend', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const event = req.body;
    const type = event.type;
    const emailId = event.data?.email_id;

    if (!emailId) return res.status(200).send('ok');

    const message = await prisma.outreachMessage.findFirst({
      where: { resendEmailId: emailId },
    });
    if (!message) return res.status(200).send('ok');

    const updates = {};
    if (type === 'email.delivered') {
      updates.status = 'DELIVERED';
      updates.deliveredAt = new Date();
    } else if (type === 'email.opened') {
      updates.status = 'READ';
      updates.readAt = new Date();
    } else if (type === 'email.bounced') {
      updates.status = 'FAILED';
      updates.errorMessage = 'Bounced: ' + (event.data?.bounce_type || 'unknown');
    } else if (type === 'email.clicked') {
      const existing = message.trackingData || { clicks: [] };
      existing.clicks = existing.clicks || [];
      existing.clicks.push({ at: new Date().toISOString(), url: event.data?.click?.link });
      updates.trackingData = existing;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.outreachMessage.update({
        where: { id: message.id },
        data: updates,
      });

      const eventData = { leadId: message.leadId, contactId: message.contactId, messageId: message.id };
      if (type === 'email.bounced') {
        emitEvent(prisma, 'EMAIL_BOUNCED', eventData);
      } else if (type === 'email.opened') {
        emitEvent(prisma, 'EMAIL_OPENED', eventData);
      } else if (type === 'email.clicked') {
        emitEvent(prisma, 'EMAIL_CLICKED', eventData);
      }
    }

    res.status(200).send('ok');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(200).send('ok');
  }
});

module.exports = router;
