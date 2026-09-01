const assert = require('node:assert/strict');

process.env.WAHA_API_KEY ||= 'test-key';
const { normalizePhone, sendMessage } = require('../src/services/whatsappService');

assert.equal(normalizePhone('98233 83230'), '919823383230');
assert.equal(normalizePhone('+91 98233 83230'), '919823383230');
assert.equal(normalizePhone('09823383230'), '919823383230');
assert.throws(() => normalizePhone('1234'), /Invalid WhatsApp phone number/);

async function checkSendContract() {
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    const body = url.endsWith('/api/sessions/default')
      ? { name: 'default', status: 'WORKING' }
      : { id: 'message-id' };
    return { ok: true, status: 200, text: async () => JSON.stringify(body) };
  };

  await sendMessage('98233 83230', 'Pilot message');
  assert.equal(calls.length, 2);
  assert.equal(calls[1].url, 'http://127.0.0.1:3002/api/sendText');
  assert.deepEqual(JSON.parse(calls[1].options.body), {
    session: 'default',
    chatId: '919823383230@c.us',
    text: 'Pilot message',
  });
}

checkSendContract()
  .then(() => console.log('WhatsApp service checks passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
