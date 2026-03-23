const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/emailService');
const { sendMessage: sendWhatsApp, isConnected } = require('../services/whatsappService');
const { renderTemplate } = require('../services/templateEngine');

// POST /outreach/send
router.post('/send', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const { leadId, contactId, channel, templateId, subject, body } = req.body;
    const lead = await prisma.lead.findUnique({ where: { id: parseInt(leadId) } });
    const contact = contactId ? await prisma.contact.findUnique({ where: { id: parseInt(contactId) } }) : null;

    let renderedSubject = subject || '';
    let renderedBody = body || '';

    if (templateId && templateId !== '') {
      const template = await prisma.messageTemplate.findUnique({ where: { id: parseInt(templateId) } });
      if (template) {
        renderedBody = renderTemplate(template.body, { lead, contact });
        renderedSubject = template.subject ? renderTemplate(template.subject, { lead, contact }) : subject;
      }
    } else {
      renderedBody = renderTemplate(body || '', { lead, contact });
      renderedSubject = renderTemplate(subject || '', { lead, contact });
    }

    let status = 'QUEUED';
    let errorMessage = null;
    let resendEmailId = null;

    if (channel === 'EMAIL') {
      const email = contact?.email;
      if (!email) throw new Error('Contact has no email address');
      const result = await sendEmail(email, renderedSubject, renderedBody);
      if (result.error) throw new Error(result.error);
      resendEmailId = result.id;
      status = 'SENT';
    } else if (channel === 'WHATSAPP') {
      if (!isConnected()) throw new Error('WhatsApp not connected. Go to /whatsapp/status to connect.');
      const phone = contact?.whatsapp || contact?.phone;
      if (!phone) throw new Error('Contact has no phone/WhatsApp number');
      await sendWhatsApp(phone, renderedBody);
      status = 'SENT';
    }

    await prisma.outreachMessage.create({
      data: {
        leadId: parseInt(leadId),
        contactId: contactId ? parseInt(contactId) : null,
        channel,
        templateId: templateId && templateId !== '' ? parseInt(templateId) : null,
        subject: renderedSubject || null,
        body: renderedBody,
        status,
        sentAt: status === 'SENT' ? new Date() : null,
        errorMessage,
        resendEmailId,
      },
    });

    await prisma.activity.create({
      data: {
        leadId: parseInt(leadId),
        contactId: contactId ? parseInt(contactId) : null,
        type: channel === 'EMAIL' ? 'EMAIL_SENT' : 'WHATSAPP_SENT',
        subject: `${channel} sent: ${renderedSubject || renderedBody.substring(0, 50)}`,
        body: renderedBody.substring(0, 200),
      },
    });

    res.redirect(`/leads/${leadId}?tab=activity&success=${channel}+sent+successfully`);
  } catch (err) {
    console.error('Outreach send error:', err);
    res.redirect(`/leads/${req.body.leadId}?tab=activity&error=${encodeURIComponent(err.message)}`);
  }
});

module.exports = router;
