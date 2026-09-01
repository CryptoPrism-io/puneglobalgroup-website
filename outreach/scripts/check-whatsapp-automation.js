const assert = require('node:assert/strict');

process.env.WAHA_API_KEY ||= 'test-key';
const { classifyReply, phoneFromChatId } = require('../src/services/whatsappAutomation');
const { hasWhatsAppOptIn } = require('../src/services/whatsappConsent');
const { startOfIstDay } = require('../src/services/whatsappPolicy');

assert.equal(classifyReply('Please send a quotation'), 'HUMAN_HANDOFF');
assert.equal(classifyReply('Hello'), 'QUALIFY');
assert.equal(classifyReply('Here are our dimensions', 1), 'HUMAN_HANDOFF');
assert.equal(classifyReply('STOP'), 'OPT_OUT');
assert.equal(phoneFromChatId('919823383230@c.us'), '919823383230');
assert.equal(phoneFromChatId('919823383230@s.whatsapp.net'), '919823383230');
assert.equal(phoneFromChatId('123456789@lid'), null);
assert.equal(phoneFromChatId('status@broadcast'), null);
assert.equal(hasWhatsAppOptIn({ notes: 'WA_OPT_IN: web form 2026-08-31' }), true);
assert.equal(hasWhatsAppOptIn({ notes: 'WA_OPT_IN: web form\nWA_OPT_OUT: recipient request' }), false);
assert.equal(hasWhatsAppOptIn({ notes: 'WA_OPT_OUT: old request\nWA_OPT_IN: new inbound request' }), true);
assert.equal(startOfIstDay(new Date('2026-08-31T20:00:00.000Z')).toISOString(), '2026-08-31T18:30:00.000Z');

console.log('WhatsApp automation checks passed');
