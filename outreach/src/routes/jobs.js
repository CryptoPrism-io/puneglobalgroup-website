const express = require('express');
const path = require('path');
const ejs = require('ejs');
const router = express.Router();

const VIEWS = path.join(__dirname, '../../views');

router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const statusFilter = req.query.status || '';
    const typeFilter = req.query.type || '';

    const where = {};
    if (statusFilter) where.status = statusFilter;
    if (typeFilter) where.type = typeFilter;

    const jobs = await prisma.scheduledJob.findMany({
      where,
      orderBy: { scheduledFor: 'desc' },
      take: 100,
    });

    const body = await ejs.renderFile(path.join(VIEWS, 'jobs/index.ejs'), {
      jobs: JSON.parse(JSON.stringify(jobs)),
      statusFilter,
      typeFilter,
    });
    res.render('layout', { title: 'Job Queue', body });
  } catch (err) {
    console.error('Jobs list error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

router.post('/:id/retry', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    await prisma.scheduledJob.update({
      where: { id },
      data: { status: 'PENDING', scheduledFor: new Date(), lastError: null },
    });
    res.redirect('/jobs?success=Job+queued+for+retry');
  } catch (err) {
    console.error('Retry job error:', err);
    res.redirect('/jobs?error=' + encodeURIComponent(err.message));
  }
});

router.post('/:id/cancel', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    await prisma.scheduledJob.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
    res.redirect('/jobs?success=Job+cancelled');
  } catch (err) {
    console.error('Cancel job error:', err);
    res.redirect('/jobs?error=' + encodeURIComponent(err.message));
  }
});

module.exports = router;
