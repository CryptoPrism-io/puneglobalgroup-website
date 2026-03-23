const express = require('express');
const path = require('path');
const ejs = require('ejs');
const router = express.Router();

const VIEWS = path.join(__dirname, '../../views');

// GET /rate-card — list all rates grouped by category
router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const rates = await prisma.rateCard.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    const ratesPlain = JSON.parse(JSON.stringify(rates));

    // Group by category
    const grouped = {};
    for (const r of ratesPlain) {
      if (!grouped[r.category]) grouped[r.category] = [];
      grouped[r.category].push(r);
    }

    const body = await ejs.renderFile(path.join(VIEWS, 'rate-card/index.ejs'), {
      grouped,
      categories: Object.keys(grouped).sort(),
    });
    res.render('layout', { title: 'Rate Card', body });
  } catch (err) {
    console.error('Rate card list error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// POST /rate-card — create a new rate entry
router.post('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    await prisma.rateCard.create({
      data: {
        category: req.body.category?.trim() || '',
        name: req.body.name?.trim() || '',
        unit: req.body.unit || 'per_sqm',
        defaultRate: req.body.defaultRate?.trim() || '0',
        lastPurchaseRate: req.body.lastPurchaseRate?.trim() || null,
        notes: req.body.notes?.trim() || null,
      },
    });
    res.redirect('/rate-card?success=Rate+entry+added');
  } catch (err) {
    console.error('Create rate error:', err);
    res.redirect('/rate-card?error=' + encodeURIComponent(err.message));
  }
});

// POST /rate-card/:id — update a rate entry
router.post('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    await prisma.rateCard.update({
      where: { id },
      data: {
        defaultRate: req.body.defaultRate?.trim() || '0',
        lastPurchaseRate: req.body.lastPurchaseRate?.trim() || null,
        notes: req.body.notes?.trim() || null,
      },
    });
    res.redirect('/rate-card?success=Rate+updated');
  } catch (err) {
    console.error('Update rate error:', err);
    res.redirect('/rate-card?error=' + encodeURIComponent(err.message));
  }
});

// POST /rate-card/:id/delete — delete a rate entry
router.post('/:id/delete', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    await prisma.rateCard.delete({ where: { id } });
    res.redirect('/rate-card?success=Rate+entry+deleted');
  } catch (err) {
    console.error('Delete rate error:', err);
    res.redirect('/rate-card?error=' + encodeURIComponent(err.message));
  }
});

module.exports = router;
