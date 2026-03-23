const { renderTemplate } = require('./templateEngine');
const { sendEmail } = require('./emailService');
const { sendMessage: sendWhatsApp, isConnected } = require('./whatsappService');
const { buildFilterQuery } = require('./search');

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function randomDelay(minMs, maxMs) { return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs; }

async function executeCampaign(prisma, campaignId) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { template: true },
  });
  if (!campaign || campaign.status !== 'DRAFT') {
    throw new Error('Campaign not found or already sent');
  }

  const filters = campaign.filters || {};
  const where = buildFilterQuery(filters);
  const excluded = campaign.excludedLeadIds || [];
  if (excluded.length > 0) {
    where.id = { notIn: excluded };
  }

  const leads = await prisma.lead.findMany({
    where,
    include: { contacts: { where: { isPrimary: true }, take: 1 } },
  });

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: 'SENDING', totalRecipients: leads.length, sentAt: new Date() },
  });

  let sentCount = 0;
  let failedCount = 0;

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const contact = lead.contacts[0] || null;
    const renderedBody = renderTemplate(campaign.template.body, { lead, contact });
    const renderedSubject = campaign.template.subject
      ? renderTemplate(campaign.template.subject, { lead, contact })
      : null;

    let status = 'QUEUED';
    let errorMessage = null;
    let resendEmailId = null;
    let sentAt = null;

    try {
      if (campaign.channel === 'EMAIL') {
        const email = contact?.email;
        if (!email) throw new Error('No email address for contact');
        const result = await sendEmail(email, renderedSubject, renderedBody);
        if (result.error) throw new Error(result.error);
        resendEmailId = result.id;
        status = 'SENT';
        sentAt = new Date();
        sentCount++;
      } else if (campaign.channel === 'WHATSAPP') {
        if (!isConnected()) throw new Error('WhatsApp not connected');
        const phone = contact?.whatsapp || contact?.phone;
        if (!phone) throw new Error('No phone/WhatsApp number for contact');
        await sendWhatsApp(phone, renderedBody);
        status = 'SENT';
        sentAt = new Date();
        sentCount++;
      }
    } catch (err) {
      status = 'FAILED';
      errorMessage = err.message;
      failedCount++;
    }

    await prisma.outreachMessage.create({
      data: {
        campaignId, leadId: lead.id, contactId: contact?.id || null,
        channel: campaign.channel, templateId: campaign.templateId,
        subject: renderedSubject, body: renderedBody,
        status, sentAt, errorMessage, resendEmailId,
      },
    });

    if (status === 'SENT') {
      await prisma.activity.create({
        data: {
          leadId: lead.id, contactId: contact?.id || null,
          type: campaign.channel === 'EMAIL' ? 'EMAIL_SENT' : 'WHATSAPP_SENT',
          subject: `Campaign: ${campaign.name}`,
          body: renderedSubject || renderedBody.substring(0, 100),
        },
      });
    }

    if (i % 5 === 0) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { sentCount, failedCount },
      });
    }

    if (i < leads.length - 1) {
      if (campaign.channel === 'WHATSAPP') {
        await sleep(randomDelay(15000, 20000));
        if ((i + 1) % 20 === 0) {
          console.log(`WhatsApp batch pause at message ${i + 1}...`);
          await sleep(600000);
        }
      } else {
        await sleep(500);
      }
    }
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: failedCount === 0 ? 'SENT' : 'PARTIAL',
      sentCount, failedCount, completedAt: new Date(),
    },
  });

  return { sent: sentCount, failed: failedCount, total: leads.length };
}

module.exports = { executeCampaign };
