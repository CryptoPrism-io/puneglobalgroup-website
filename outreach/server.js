require('dotenv').config();

const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Database ─────────────────────────────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── View engine ──────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Body parsing ─────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Static files ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Flash messages (query-param approach, same as invoicer) ──
app.use((req, res, next) => {
  res.locals.success = req.query.success || null;
  res.locals.error = req.query.error || null;
  res.locals.currentPath = req.path;
  next();
});

// ── Make prisma available to routes ──────────────────────────
app.locals.prisma = prisma;

// ── Placeholder home route ───────────────────────────────────
app.get('/', (req, res) => {
  res.render('layout', { title: 'Dashboard', body: '<h1>Outreach CRM</h1><p>Coming soon.</p>' });
});

// ── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// ── Error handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.log('[ERROR]', req.method, req.url, err.message);
  console.log(err.stack);
  res.status(500).send('Error: ' + err.message);
});

// ── Start ────────────────────────────────────────────────────
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
