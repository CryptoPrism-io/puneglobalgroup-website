const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');

let socket = null;
let currentQR = null;
let connectionStatus = 'disconnected';

async function initSession(authDir) {
  const dir = authDir || './wa-auth';
  const { state, saveCreds } = await useMultiFileAuthState(dir);
  const logger = pino({ level: 'silent' });

  socket = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    logger,
    printQRInTerminal: false,
  });

  socket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      currentQR = await QRCode.toDataURL(qr);
      connectionStatus = 'connecting';
    }
    if (connection === 'open') {
      currentQR = null;
      connectionStatus = 'connected';
      console.log('✓ WhatsApp connected');
    }
    if (connection === 'close') {
      connectionStatus = 'disconnected';
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        console.log('WhatsApp disconnected, reconnecting...');
        await initSession(authDir);
      } else {
        console.log('WhatsApp logged out');
        socket = null;
      }
    }
  });

  socket.ev.on('creds.update', saveCreds);
  return socket;
}

async function sendMessage(phone, text) {
  if (!socket || connectionStatus !== 'connected') {
    throw new Error('WhatsApp not connected');
  }
  const jid = phone.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  await socket.sendMessage(jid, { text });
}

async function sendMedia(phone, buffer, mimetype, filename, caption) {
  if (!socket || connectionStatus !== 'connected') {
    throw new Error('WhatsApp not connected');
  }
  const jid = phone.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  if (mimetype.startsWith('image/')) {
    await socket.sendMessage(jid, { image: buffer, caption: caption || '' });
  } else {
    await socket.sendMessage(jid, { document: buffer, mimetype, fileName: filename, caption: caption || '' });
  }
}

function isConnected() { return connectionStatus === 'connected'; }
function getQrCode() { return currentQR; }
function getStatus() { return connectionStatus; }

async function disconnect() {
  if (socket) {
    await socket.logout();
    socket = null;
    connectionStatus = 'disconnected';
    currentQR = null;
  }
}

function getSocket() { return socket; }

module.exports = { initSession, sendMessage, sendMedia, isConnected, getQrCode, getStatus, disconnect, getSocket };
