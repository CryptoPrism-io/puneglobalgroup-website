require('dotenv').config();

const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./src/generated/prisma');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Database ─────────────────────────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── View engine ──────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Body parsing ─────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Static files ─────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Flash messages (query-param approach, same as invoicer) ──
app.use((req, res, next) => {
  res.locals.success = req.query.success || null;
  res.locals.error = req.query.error || null;
  res.locals.currentPath = req.path;
  next();
});

// ── Make prisma available to routes ──────────────────────
app.locals.prisma = prisma;

// ── Routes ────────────────────────────────────────────────
const leadsRouter = require('./src/routes/leads');
const contactsRouter = require('./src/routes/contacts');
const activitiesRouter = require('./src/routes/activities');
const scrapeBatchesRouter = require('./src/routes/scrapeBatches');
const analyticsRouter = require('./src/routes/analytics');
const rateCardRouter = require('./src/routes/rateCard');
app.use('/leads', leadsRouter);
app.use('/contacts', contactsRouter);
app.use('/activities', activitiesRouter);
app.use('/scrape-batches', scrapeBatchesRouter);
app.use('/analytics', analyticsRouter);
app.use('/rate-card', rateCardRouter);

// ── Dashboard ─────────────────────────────────────────────
app.get('/', async (req, res) => {
  try {
    const { STAGES, getStaleLeads } = require('./src/services/pipeline');
    const ejs = require('ejs');

    const ICP_TYPES = ['PAPER', 'PP', 'BOTH', 'UNKNOWN'];
    const SOURCES = ['GOOGLE', 'LINKEDIN', 'INDIAMART', 'GEM', 'MEITY', 'REFERRAL', 'MANUAL'];

    // Stage counts
    const stageCounts = {};
    for (const stage of STAGES) {
      stageCounts[stage] = await prisma.lead.count({
        where: { stage, isArchived: false },
      });
    }

    // Total leads (non-archived)
    const totalLeads = await prisma.lead.count({ where: { isArchived: false } });

    // ICP counts
    const icpCounts = {};
    for (const icp of ICP_TYPES) {
      icpCounts[icp] = await prisma.lead.count({
        where: { icpType: icp, isArchived: false },
      });
    }

    // Source counts
    const sourceCounts = {};
    for (const source of SOURCES) {
      sourceCounts[source] = await prisma.lead.count({
        where: { source, isArchived: false },
      });
    }

    // Won this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const wonThisMonth = await prisma.lead.count({
      where: {
        stage: 'WON',
        stageChangedAt: { gte: startOfMonth },
      },
    });

    // Hot leads — fitScore >= 7, stage in NEW/RESEARCHED
    const hotLeads = await prisma.lead.findMany({
      where: {
        fitScore: { gte: 7 },
        stage: { in: ['NEW', 'RESEARCHED'] },
        isArchived: false,
      },
      orderBy: { fitScore: 'desc' },
      take: 10,
    });

    // Stale leads (capped at 10)
    const allStale = await getStaleLeads(prisma, 14);
    const staleLeads = allStale.slice(0, 10);

    // Recent activities — last 20, include lead and contact name
    const recentActivities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        lead: { select: { id: true, companyName: true } },
        contact: { select: { id: true, name: true } },
      },
    });

    const body = await ejs.renderFile(
      path.join(__dirname, 'views/dashboard-body.ejs'),
      {
        stages: STAGES,
        stageCounts,
        totalLeads,
        icpCounts,
        sourceCounts,
        wonThisMonth,
        hotLeads,
        staleLeads,
        recentActivities,
      }
    );
    res.render('layout', { title: 'Dashboard', body });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).send('Dashboard error: ' + err.message);
  }
});

// ── 404 ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// ── Error handler ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.log('[ERROR]', req.method, req.url, err.message);
  console.log(err.stack);
  res.status(500).send('Error: ' + err.message);
});

// ── Start ────────────────────────────────────────────────
async function start() {
  try {
    await prisma.$connect();
    console.log('✓ Database connected');

    app.listen(PORT, () => {
      console.log(`✓ Outreach CRM running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});
