const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const { STAGES } = require('../services/pipeline');
    const ejs = require('ejs');
    const path = require('path');

    const SOURCES = ['GOOGLE', 'LINKEDIN', 'INDIAMART', 'GEM', 'MEITY', 'REFERRAL', 'MANUAL'];
    const ICP_TYPES = ['PAPER', 'PP', 'BOTH', 'UNKNOWN'];

    // Stage counts
    const stageCounts = {};
    let totalActive = 0;
    for (const stage of STAGES) {
      const count = await prisma.lead.count({
        where: { stage, isArchived: false },
      });
      stageCounts[stage] = count;
      if (stage !== 'LOST' && stage !== 'DORMANT') {
        totalActive += count;
      }
    }
    const grandTotal = Object.values(stageCounts).reduce((a, b) => a + b, 0);

    // Source stats: total + won, compute win rate
    const sourceStats = [];
    for (const source of SOURCES) {
      const total = await prisma.lead.count({
        where: { source, isArchived: false },
      });
      const won = await prisma.lead.count({
        where: { source, stage: 'WON', isArchived: false },
      });
      const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
      sourceStats.push({ source, total, won, winRate });
    }

    // ICP stats: total + won, compute win rate
    const icpStats = [];
    for (const icpType of ICP_TYPES) {
      const total = await prisma.lead.count({
        where: { icpType, isArchived: false },
      });
      const won = await prisma.lead.count({
        where: { icpType, stage: 'WON', isArchived: false },
      });
      const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
      icpStats.push({ icpType, total, won, winRate });
    }

    const body = await ejs.renderFile(
      path.join(__dirname, '../../views/analytics/index.ejs'),
      {
        stages: STAGES,
        stageCounts,
        grandTotal,
        totalActive,
        sourceStats,
        icpStats,
      }
    );
    res.render('layout', { title: 'Analytics', body });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
