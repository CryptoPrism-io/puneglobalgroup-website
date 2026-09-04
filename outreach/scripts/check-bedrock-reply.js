const assert = require('node:assert/strict');

process.env.BEDROCK_AUTO_REPLY_ENABLED = 'false';
const { generateReply } = require('../src/services/bedrockReplyService');

generateReply('What packaging do you make?')
  .then(reply => {
    assert.equal(reply, null);
    console.log('Bedrock reply safety check passed');
  })
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
