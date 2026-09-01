const assert = require('node:assert/strict');
const { executeCampaign } = require('../src/services/campaignRunner');

process.env.WHATSAPP_CAMPAIGN_LIMIT = '10';

const prisma = {
  campaign: {
    findUnique: async () => ({
      id: 1,
      name: 'Pilot',
      channel: 'WHATSAPP',
      status: 'DRAFT',
      filters: {},
      excludedLeadIds: [],
      template: { body: 'Hello', subject: null },
    }),
    update: async () => assert.fail('Oversized campaign must stop before status changes'),
  },
  lead: {
    findMany: async () => Array.from({ length: 11 }, (_, id) => ({ id, contacts: [] })),
  },
};

assert.rejects(
  executeCampaign(prisma, 1),
  /WhatsApp pilot is limited to 10 recipients; this campaign has 11/,
).then(() => console.log('WhatsApp pilot limit check passed'));
