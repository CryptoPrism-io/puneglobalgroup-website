const baseUrl = (process.env.WAHA_URL || 'http://127.0.0.1:3002').replace(/\/$/, '');
const session = process.env.WAHA_SESSION || 'default';

function headers(extra = {}) {
  const apiKey = process.env.WAHA_API_KEY;
  if (!apiKey) throw new Error('WAHA_API_KEY is not configured');
  return { 'X-Api-Key': apiKey, ...extra };
}

async function request(path, options = {}) {
  const { timeoutMs = 15000, ...fetchOptions } = options;
  const response = await fetch(`${baseUrl}${path}`, {
    ...fetchOptions,
    headers: headers(options.headers),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch (_) { data = { message: text }; }
  }
  if (!response.ok) {
    const error = new Error(data?.message || `WAHA request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function normalizePhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
  if (digits.length === 10) digits = `${process.env.WAHA_DEFAULT_COUNTRY_CODE || '91'}${digits}`;
  if (digits.length < 11 || digits.length > 15) throw new Error('Invalid WhatsApp phone number');
  return digits;
}

async function getSession() {
  try {
    return await request(`/api/sessions/${encodeURIComponent(session)}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

async function initSession() {
  const existing = await getSession();
  if (!existing) {
    await request('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: session }),
    });
    return request(`/api/sessions/${encodeURIComponent(session)}/start`, { method: 'POST' });
  }
  if (existing.status === 'FAILED') {
    return request(`/api/sessions/${encodeURIComponent(session)}/restart`, { method: 'POST' });
  }
  if (existing.status === 'STOPPED') {
    return request(`/api/sessions/${encodeURIComponent(session)}/start`, { method: 'POST' });
  }
  return existing;
}

async function sendMessage(phone, text) {
  if (!await isConnected()) throw new Error('WhatsApp not connected');
  return request('/api/sendText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session, chatId: `${normalizePhone(phone)}@c.us`, text }),
  });
}

async function getReachoutTimelock() {
  return request(`/api/sessions/${encodeURIComponent(session)}/timelock`);
}

async function getMessageCapping() {
  return request(`/api/sessions/${encodeURIComponent(session)}/capping`);
}

async function getPhoneByLid(lid) {
  const mapping = await request(`/api/${encodeURIComponent(session)}/lids/${encodeURIComponent(lid)}`);
  return mapping?.pn || null;
}

async function assertCanReachOut() {
  const [timelock, capping] = await Promise.all([getReachoutTimelock(), getMessageCapping()]);
  if (timelock?.isActive) throw new Error('WhatsApp reachout timelock is active; outreach paused');
  if (['FIRST_WARNING', 'SECOND_WARNING', 'CAPPED'].includes(capping?.cappingStatus)) {
    throw new Error(`WhatsApp message capping status is ${capping.cappingStatus}; outreach paused`);
  }
  return { timelock, capping };
}

async function sendMedia(phone, buffer, mimetype, filename, caption) {
  if (!await isConnected()) throw new Error('WhatsApp not connected');
  const endpoint = mimetype.startsWith('image/')
    ? '/api/sendImage'
    : mimetype.startsWith('video/') ? '/api/sendVideo' : '/api/sendFile';
  return request(endpoint, {
    method: 'POST',
    timeoutMs: 60000,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session,
      chatId: `${normalizePhone(phone)}@c.us`,
      file: { mimetype, filename, data: buffer.toString('base64') },
      caption: caption || '',
    }),
  });
}

async function getStatus() {
  const current = await getSession();
  if (!current) return 'disconnected';
  if (current.status === 'WORKING') return 'connected';
  if (['STARTING', 'SCAN_QR_CODE'].includes(current.status)) return 'connecting';
  return 'disconnected';
}

async function getQrCode() {
  const current = await getSession();
  if (current?.status !== 'SCAN_QR_CODE') return null;
  const qr = await request(`/api/${encodeURIComponent(session)}/auth/qr?format=image`, {
    headers: { Accept: 'application/json' },
  });
  return `data:${qr.mimetype};base64,${qr.data}`;
}

async function isConnected() {
  return await getStatus() === 'connected';
}

async function disconnect() {
  const current = await getSession();
  if (current && current.status !== 'STOPPED') {
    await request(`/api/sessions/${encodeURIComponent(session)}/stop`, { method: 'POST' });
  }
}

module.exports = {
  initSession, sendMessage, sendMedia, isConnected, getQrCode, getStatus, disconnect,
  normalizePhone, getPhoneByLid, getReachoutTimelock, getMessageCapping, assertCanReachOut,
};
