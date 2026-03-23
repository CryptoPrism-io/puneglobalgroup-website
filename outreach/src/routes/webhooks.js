const express = require('express');
const router = express.Router();

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
    }

    res.status(200).send('ok');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(200).send('ok');
  }
});

module.exports = router;
