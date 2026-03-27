require('dotenv').config();

const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./src/generated/prisma');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Dual Databases ───────────────────────────────────────
const adminPool = new Pool({ connectionString: process.env.DATABASE_URL });
const demoPool = new Pool({ connectionString: process.env.DATABASE_URL_DEMO });

const adminPrisma = new PrismaClient({ adapter: new PrismaPg(adminPool) });
const demoPrisma = new PrismaClient({ adapter: new PrismaPg(demoPool) });

// ── View engine ──────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Body parsing ─────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Static files ─────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Sessions ─────────────────────────────────────────────
app.use(session({
  store: new pgSession({
    pool: adminPool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'outreach-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: 'lax',
  },
}));

// ── Flash messages ───────────────────────────────────────
app.use((req, res, next) => {
  res.locals.success = req.query.success || null;
  res.locals.error = req.query.error || null;
  res.locals.currentPath = req.path;
  res.locals.user = req.session.user || null;
  next();
});

// ── Prisma per-request based on user ─────────────────────
app.use((req, res, next) => {
  if (req.session.user === 'demo') {
    req.app.locals.prisma = demoPrisma;
    res.locals.env = 'demo';
  } else {
    req.app.locals.prisma = adminPrisma;
    res.locals.env = 'admin';
  }
  next();
});

// ── Auth: protect all routes except /login and /webhooks ──
app.use((req, res, next) => {
  // Allow login page, static assets, and webhooks without auth
  if (req.path === '/login' || req.path.startsWith('/webhooks')) {
    return next();
  }
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
});

// ── Login Routes ─────────────────────────────────────────
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  const ejs = require('ejs');
  ejs.renderFile(path.join(__dirname, 'views/login.ejs'), {
    error: req.query.error || null,
  }).then(html => {
    res.send(html);
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = {
    admin: process.env.ADMIN_PASSWORD || 'admin123',
    demo: process.env.DEMO_PASSWORD || 'demo123',
  };
  if (users[username] && users[username] === password) {
    req.session.user = username;
    req.session.save(() => {
      res.redirect('/');
    });
  } else {
    res.redirect('/login?error=Invalid+credentials');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// ── Routes ────────────────────────────────────────────────
const leadsRouter = require('./src/routes/leads');
const contactsRouter = require('./src/routes/contacts');
const activitiesRouter = require('./src/routes/activities');
const scrapeBatchesRouter = require('./src/routes/scrapeBatches');
const analyticsRouter = require('./src/routes/analytics');
const rateCardRouter = require('./src/routes/rateCard');
const quotesRouter = require('./src/routes/quotes');
const rfqsRouter = require('./src/routes/rfqs');
const templatesRouter = require('./src/routes/templates');
const campaignsRouter = require('./src/routes/campaigns');
const outreachRouter = require('./src/routes/outreach');
const whatsappRouter = require('./src/routes/whatsapp');
const webhooksRouter = require('./src/routes/webhooks');
const sequencesRouter = require('./src/routes/sequences');
const automationsRouter = require('./src/routes/automations');
const jobsRouter = require('./src/routes/jobs');
app.use('/leads', leadsRouter);
app.use('/contacts', contactsRouter);
app.use('/activities', activitiesRouter);
app.use('/scrape-batches', scrapeBatchesRouter);
app.use('/analytics', analyticsRouter);
app.use('/rate-card', rateCardRouter);
app.use('/quotes', quotesRouter);
app.use('/rfqs', rfqsRouter);
app.use('/templates', templatesRouter);
app.use('/campaigns', campaignsRouter);
app.use('/outreach', outreachRouter);
app.use('/whatsapp', whatsappRouter);
app.use('/webhooks', webhooksRouter);
app.use('/sequences', sequencesRouter);
app.use('/automations', automationsRouter);
app.use('/jobs', jobsRouter);

// ── Dashboard ─────────────────────────────────────────────
app.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const { STAGES, getStaleLeads } = require('./src/services/pipeline');
    const ejs = require('ejs');

    const ICP_TYPES = ['PAPER', 'PP', 'BOTH', 'UNKNOWN'];
    const SOURCES = ['GOOGLE', 'LINKEDIN', 'INDIAMART', 'GEM', 'MEITY', 'REFERRAL', 'MANUAL'];

    const stageCounts = {};
    for (const stage of STAGES) {
      stageCounts[stage] = await prisma.lead.count({ where: { stage, isArchived: false } });
    }

    const totalLeads = await prisma.lead.count({ where: { isArchived: false } });

    const icpCounts = {};
    for (const icp of ICP_TYPES) {
      icpCounts[icp] = await prisma.lead.count({ where: { icpType: icp, isArchived: false } });
    }

    const sourceCounts = {};
    for (const source of SOURCES) {
      sourceCounts[source] = await prisma.lead.count({ where: { source, isArchived: false } });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const wonThisMonth = await prisma.lead.count({
      where: { stage: 'WON', stageChangedAt: { gte: startOfMonth } },
    });

    const hotLeads = await prisma.lead.findMany({
      where: { fitScore: { gte: 7 }, stage: { in: ['NEW', 'RESEARCHED'] }, isArchived: false },
      orderBy: { fitScore: 'desc' },
      take: 10,
    });

    const allStale = await getStaleLeads(prisma, 14);
    const staleLeads = allStale.slice(0, 10);

    const recentActivities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        lead: { select: { id: true, companyName: true } },
        contact: { select: { id: true, name: true } },
      },
    });

    // Automation stats (wrapped — demo DB may not have these tables yet)
    let jobsToday = 0, activeEnrollments = 0, activeTriggers = 0, pendingJobs = 0;
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      jobsToday = await prisma.scheduledJob.count({ where: { processedAt: { gte: todayStart } } });
      activeEnrollments = await prisma.sequenceEnrollment.count({ where: { status: 'ACTIVE' } });
      activeTriggers = await prisma.automationTrigger.count({ where: { isActive: true } });
      pendingJobs = await prisma.scheduledJob.count({ where: { status: 'PENDING' } });
    } catch (statsErr) {
      console.warn('Automation stats unavailable:', statsErr.message.substring(0, 80));
    }

    const body = await ejs.renderFile(path.join(__dirname, 'views/dashboard-body.ejs'), {
      stages: STAGES, stageCounts, totalLeads, icpCounts, sourceCounts,
      wonThisMonth, hotLeads, staleLeads, recentActivities,
      jobsToday, activeEnrollments, activeTriggers, pendingJobs,
    });
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
    await adminPrisma.$connect();
    await demoPrisma.$connect();
    console.log('✓ Admin database connected');
    console.log('✓ Demo database connected');

    // Start automation job processor (runs on admin database only)
    const { startJobProcessor } = require('./src/services/jobProcessor');
    startJobProcessor(adminPrisma);

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
  const { stopJobProcessor } = require('./src/services/jobProcessor');
  stopJobProcessor();
  await adminPrisma.$disconnect();
  await demoPrisma.$disconnect();
  await adminPool.end();
  await demoPool.end();
  process.exit(0);
});
