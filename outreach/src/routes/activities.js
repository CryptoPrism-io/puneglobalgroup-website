const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const leadId = parseInt(req.body.leadId);
    await prisma.activity.create({
      data: {
        leadId,
        contactId: req.body.contactId ? parseInt(req.body.contactId) : null,
        type: req.body.type,
        subject: req.body.subject.trim(),
        body: req.body.body?.trim() || null,
      },
    });
    res.redirect(`/leads/${leadId}?tab=activity&success=Activity+logged`);
  } catch (err) {
    console.error('Activity create error:', err);
    res.redirect(`/leads/${req.body.leadId}?tab=activity&error=Failed+to+log+activity`);
  }
});

module.exports = router;
