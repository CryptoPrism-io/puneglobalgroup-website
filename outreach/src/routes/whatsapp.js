const express = require('express');
const router = express.Router();
const wa = require('../services/whatsappService');

router.get('/status', async (req, res) => {
  const ejs = require('ejs');
  const path = require('path');
  const body = await ejs.renderFile(path.join(__dirname, '../../views/whatsapp/status.ejs'), {
    status: wa.getStatus(),
    qrCode: wa.getQrCode(),
  });
  res.render('layout', { title: 'WhatsApp', body });
});

router.post('/connect', async (req, res) => {
  try {
    await wa.initSession('./wa-auth');
    await new Promise(resolve => setTimeout(resolve, 3000));
    res.redirect('/whatsapp/status?success=Connecting...+Scan+QR+code');
  } catch (err) {
    res.redirect('/whatsapp/status?error=' + encodeURIComponent(err.message));
  }
});

router.post('/disconnect', async (req, res) => {
  try {
    await wa.disconnect();
    res.redirect('/whatsapp/status?success=Disconnected');
  } catch (err) {
    res.redirect('/whatsapp/status?error=' + encodeURIComponent(err.message));
  }
});

module.exports = router;
