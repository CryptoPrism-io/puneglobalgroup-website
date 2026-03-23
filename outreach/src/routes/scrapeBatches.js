const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const batches = await prisma.scrapeBatch.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { leads: true } } },
    });
    const ejs = require('ejs');
    const path = require('path');
    const body = await ejs.renderFile(
      path.join(__dirname, '../../views/scrape-batches/index.ejs'),
      { batches }
    );
    res.render('layout', { title: 'Scrape Log', body });
  } catch (err) {
    console.error('Scrape batches error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
