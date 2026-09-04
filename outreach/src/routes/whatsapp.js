const express = require('express');
const router = express.Router();
const wa = require('../services/whatsappService');

router.get('/status', async (req, res) => {
  const ejs = require('ejs');
  const path = require('path');
  try {
    const status = await wa.getStatus();
    const body = await ejs.renderFile(path.join(__dirname, '../../views/whatsapp/status.ejs'), {
      status,
      qrCode: status === 'connecting' ? await wa.getQrCode() : null,
    });
    res.render('layout', { title: 'WhatsApp', body });
  } catch (err) {
    res.redirect('/?error=' + encodeURIComponent(`WAHA unavailable: ${err.message}`));
  }
});

router.post('/connect', async (req, res) => {
  try {
    await wa.initSession();
    await new Promise(resolve => setTimeout(resolve, 1500));
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
