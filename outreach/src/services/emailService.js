const { Resend } = require('resend');

let resendClient = null;

function getClient() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

async function sendEmail(to, subject, html, attachments) {
  try {
    const resend = getClient();
    const payload = {
      from: process.env.RESEND_FROM_EMAIL || 'noreply@puneglobalgroup.in',
      to,
      subject,
      html,
    };
    if (attachments && attachments.length > 0) {
      payload.attachments = attachments.map(a => ({
        filename: a.filename,
        content: a.content,
      }));
    }
    const { data, error } = await resend.emails.send(payload);
    if (error) {
      return { id: null, error: error.message || JSON.stringify(error) };
    }
    return { id: data.id, error: null };
  } catch (err) {
    return { id: null, error: err.message };
  }
}

module.exports = { sendEmail };
