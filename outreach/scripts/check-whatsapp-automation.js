const assert = require('node:assert/strict');

process.env.WAHA_API_KEY ||= 'test-key';
const { classifyReply, isOutgoingMessage, isStaleMessage, isSystemMessage, isEmptyNonMediaMessage, phoneFromChatId } = require('../src/services/whatsappAutomation');
const { hasWhatsAppOptIn } = require('../src/services/whatsappConsent');
const { startOfIstDay } = require('../src/services/whatsappPolicy');

assert.equal(classifyReply('Please send a quotation'), 'HUMAN_HANDOFF');
assert.equal(classifyReply('Yes, please share it'), 'HUMAN_HANDOFF');
assert.equal(classifyReply('Hello'), 'HUMAN_HANDOFF');
assert.equal(classifyReply('Here are our dimensions', 1), 'HUMAN_HANDOFF');
assert.equal(classifyReply('STOP'), 'OPT_OUT');
assert.equal(phoneFromChatId('919823383230@c.us'), '919823383230');
assert.equal(phoneFromChatId('919823383230@s.whatsapp.net'), '919823383230');
assert.equal(phoneFromChatId('123456789@lid'), null);
assert.equal(phoneFromChatId('status@broadcast'), null);
assert.equal(isOutgoingMessage({}, { id: { fromMe: true } }), true);
assert.equal(isOutgoingMessage({}, { _data: { id: { fromMe: true } } }), true);
assert.equal(isOutgoingMessage({}, { id: 'true_919823383230@c.us_ABC123' }), true);
assert.equal(isOutgoingMessage({}, { id: { _serialized: 'true_919823383230@lid_ABC123' } }), true);
assert.equal(isOutgoingMessage({}, { fromMe: false }), false);
assert.equal(isStaleMessage({ timestamp: 1_700_000_000 }, 1_700_001_000_000), true);
assert.equal(isStaleMessage({ timestamp: 1_700_000_900 }, 1_700_001_000_000), false);
assert.equal(isSystemMessage({ _data: { type: 'e2e_notification', subtype: 'encrypt' } }), true);
assert.equal(isSystemMessage({ _data: { type: 'chat' } }), false);
assert.equal(isEmptyNonMediaMessage({ body: '', _data: { type: 'notification' } }), true);
assert.equal(isEmptyNonMediaMessage({ body: '', hasMedia: true, _data: { type: 'image' } }), false);
assert.equal(isEmptyNonMediaMessage({ body: 'Yes', _data: { type: 'chat' } }), false);
assert.equal(hasWhatsAppOptIn({ notes: 'WA_OPT_IN: web form 2026-08-31' }), true);
assert.equal(hasWhatsAppOptIn({ notes: 'WA_OPT_IN: web form\nWA_OPT_OUT: recipient request' }), false);
assert.equal(hasWhatsAppOptIn({ notes: 'WA_OPT_OUT: old request\nWA_OPT_IN: new inbound request' }), true);
assert.equal(startOfIstDay(new Date('2026-08-31T20:00:00.000Z')).toISOString(), '2026-08-31T18:30:00.000Z');

async function checkReplyHandoffFlow() {
  const automationPath = require.resolve('../src/services/whatsappAutomation');
  const servicePath = require.resolve('../src/services/whatsappService');
  const originalService = require(servicePath);

  require.cache[servicePath].exports = {
    ...originalService,
    sendMedia: async () => assert.fail('Inbound replies must not send media'),
    sendMessage: async () => assert.fail('Inbound replies must not send text'),
  };
  delete require.cache[automationPath];
  const { handleInboundMessage } = require(automationPath);

  const activities = [];
  const leadUpdates = [];
  const contact = {
    id: 7,
    leadId: 9,
    name: 'Test Contact',
    phone: '919999999999',
    whatsapp: null,
    notes: 'WA_OPT_IN: isolated test',
    lead: { id: 9, stage: 'CONTACTED', tags: [] },
  };
  const prisma = {
    activity: {
      findFirst: async ({ where }) => activities.find(item => item.subject === where.subject) || null,
      count: async () => 0,
      create: async ({ data }) => { activities.push(data); return data; },
    },
    contact: {
      findMany: async () => [contact],
      update: async () => contact,
    },
    lead: {
      update: async ({ data }) => { leadUpdates.push(data); return { ...contact.lead, ...data }; },
    },
    sequenceEnrollment: {
      findMany: async () => [{ id: 11 }],
      updateMany: async () => ({ count: 1 }),
    },
    scheduledJob: {
      updateMany: async () => ({ count: 1 }),
    },
  };
  const event = {
    event: 'message',
    id: 'isolated-positive-reply',
    payload: {
      id: 'false_919999999999@c.us_TEST',
      from: '919999999999@c.us',
      body: 'Yes, please share it',
      timestamp: Math.floor(Date.now() / 1000),
      _data: { type: 'chat' },
    },
  };

  const first = await handleInboundMessage(prisma, event);
  const duplicate = await handleInboundMessage(prisma, event);

  assert.equal(first.disposition, 'HUMAN_HANDOFF');
  assert.equal(duplicate.duplicate, true);
  assert.equal(activities.filter(item => item.type === 'WHATSAPP_REPLY').length, 1);
  assert.equal(activities.filter(item => item.type === 'HUMAN_HANDOFF').length, 1);
  assert.equal(leadUpdates.some(data => data.tags?.includes('human-handoff')), true);

  require.cache[servicePath].exports = originalService;
  delete require.cache[automationPath];
}

checkReplyHandoffFlow()
  .then(() => console.log('WhatsApp automation checks passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
