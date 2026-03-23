# Outreach CRM — Module A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a CRM web app for Pune Global Group to store, track, and manage sales leads across Paper & Board and PP Corrugated verticals.

**Architecture:** Express 5 + EJS + Prisma + PostgreSQL, mirroring the sibling `invoicer/` app. Server-rendered CRUD with pipeline stage tracking, lead scoring, filtering, and DISC/sales methodology fields. No automated scraping — leads are inserted via Claude Code terminal sessions.

**Tech Stack:** Node.js 20, Express 5, EJS 5, Prisma 7.x with `@prisma/adapter-pg`, PostgreSQL 15, bcrypt, express-session, connect-pg-simple, plain CSS.

**Spec:** `outreach/docs/superpowers/specs/2026-03-23-outreach-crm-module-a-design.md`

**Reference codebase:** `invoicer/` — same stack, same patterns. Copy patterns verbatim.

---

### Task 1: Scaffold Project

**Files:**
- Create: `outreach/package.json`
- Create: `outreach/server.js`
- Create: `outreach/.env.example`
- Create: `outreach/.gitignore`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "outreach",
  "version": "1.0.0",
  "description": "Outreach CRM for Pune Global Group",
  "main": "server.js",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  },
  "type": "commonjs",
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

- [ ] **Step 2: Install dependencies**

Run:
```bash
cd outreach
npm install express@^5.2.1 ejs@^5.0.1 @prisma/client@^7.5.0 @prisma/adapter-pg@^7.5.0 pg@^8.20.0 prisma@^7.5.0 dotenv@^17.3.1 bcrypt@^6.0.0 express-session@^1.19.0 connect-pg-simple@^10.0.0
npm install -D nodemon@^3.1.14
```

- [ ] **Step 3: Create .env.example**

```
# Database
DATABASE_URL="postgresql://appuser:appuser123@localhost:5432/outreach"

# Session
SESSION_SECRET="change-this-to-random-string"

# Auth — bcrypt hash of your master password
# Generate with: node -e "const b=require('bcrypt'); b.hash('yourpassword',10).then(console.log)"
MASTER_PASSWORD_HASH=""

# Server
PORT=3001
```

Copy `.env.example` to `.env` and fill in values. Use same PostgreSQL credentials as invoicer but different database name (`outreach`).

- [ ] **Step 4: Create .gitignore**

```
node_modules/
.env
src/generated/
```

- [ ] **Step 5: Create directory structure**

Run:
```bash
mkdir -p src/routes src/services src/middleware views/leads views/contacts views/activities views/scrape-batches views/analytics public
```

- [ ] **Step 6: Create minimal server.js**

```javascript
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
```

- [ ] **Step 7: Create database**

Run:
```bash
psql -U appuser -c "CREATE DATABASE outreach;" postgres
```

If using same user as invoicer, the database should be created with the same credentials.

- [ ] **Step 8: Commit**

```bash
git add outreach/package.json outreach/package-lock.json outreach/server.js outreach/.env.example outreach/.gitignore
git commit -m "feat(outreach): scaffold project with Express + Prisma"
```

---

### Task 2: Prisma Schema + Migration

**Files:**
- Create: `outreach/prisma/schema.prisma`

- [ ] **Step 1: Create prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Lead {
  id                     Int       @id @default(autoincrement())
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt

  // ── Company Info ──
  companyName            String
  industry               String?
  city                   String?
  state                  String?
  pincode                String?
  address                String?
  website                String?
  gstin                  String?
  employeeCount          Int?
  estimatedRevenue       String?
  yearEstablished        Int?

  // ── ICP Classification ──
  icpType                String    @default("UNKNOWN")
  productFit             Json?
  fitScore               Int?
  fitNotes               String?

  // ── Pipeline ──
  stage                  String    @default("NEW")
  stageChangedAt         DateTime  @default(now())
  lostReason             String?

  // ── Source ──
  source                 String    @default("MANUAL")
  sourceUrl              String?
  scrapedAt              DateTime?
  scrapeBatchId          Int?

  // ── Business Intelligence ──
  currentPackaging       String?
  currentSupplier        String?
  estimatedMonthlyVolume String?
  painPoints             String?
  opportunities          String?

  // ── DISC Profile ──
  discType               String?
  discNotes              String?

  // ── Sales Methodology ──
  spinSituation          String?
  spinProblem            String?
  spinImplication         String?
  spinNeedPayoff         String?
  meddic                 Json?
  growGoal               String?
  growReality            String?
  growOptions            String?
  growWill               String?

  // ── General ──
  notes                  String?
  tags                   Json?
  isArchived             Boolean   @default(false)

  // ── Relations ──
  contacts               Contact[]
  activities             Activity[]
  scrapeBatch            ScrapeBatch? @relation(fields: [scrapeBatchId], references: [id])
}

model Contact {
  id          Int       @id @default(autoincrement())
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  leadId      Int
  lead        Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)

  name        String
  designation String?
  department  String?
  phone       String?
  email       String?
  whatsapp    String?
  linkedinUrl String?
  isPrimary   Boolean   @default(false)
  discType    String?
  notes       String?

  activities  Activity[]
}

model Activity {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())

  leadId    Int
  lead      Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  contactId Int?
  contact   Contact? @relation(fields: [contactId], references: [id], onDelete: SetNull)

  type      String
  subject   String
  body      String?
}

model ScrapeBatch {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())

  source    String
  query     String
  leadsFound Int     @default(0)
  leadsNew   Int     @default(0)
  notes     String?

  leads     Lead[]
}
```

- [ ] **Step 2: Run initial migration**

Run:
```bash
cd outreach
npx prisma migrate dev --name init
```

Expected: Migration created, Prisma Client generated to `src/generated/prisma/`.

- [ ] **Step 3: Verify server starts**

Run:
```bash
cd outreach
npm run dev
```

Visit `http://localhost:3001` — should see "Outreach CRM / Coming soon." page.

- [ ] **Step 4: Commit**

```bash
git add outreach/prisma/
git commit -m "feat(outreach): add Prisma schema with Lead, Contact, Activity, ScrapeBatch"
```

---

### Task 3: Layout + CSS

**Files:**
- Create: `outreach/views/layout.ejs`
- Create: `outreach/public/style.css`

- [ ] **Step 1: Create views/layout.ejs**

Copy the invoicer's `views/layout.ejs` pattern exactly. Change branding to "PGG Outreach" and update nav links:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= typeof title !== 'undefined' ? title + ' — ' : '' %>PGG Outreach</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <nav class="top-nav">
    <div class="nav-brand">PGG Outreach</div>
    <div class="nav-links">
      <a href="/" class="<%= currentPath === '/' ? 'active' : '' %>">Dashboard</a>
      <span class="nav-divider">|</span>
      <a href="/leads" class="<%= currentPath.startsWith('/leads') ? 'active' : '' %>">Leads</a>
      <a href="/contacts" class="<%= currentPath.startsWith('/contacts') ? 'active' : '' %>">Contacts</a>
      <span class="nav-divider">|</span>
      <a href="/scrape-batches" class="<%= currentPath.startsWith('/scrape-batches') ? 'active' : '' %>">Scrape Log</a>
      <a href="/analytics" class="<%= currentPath.startsWith('/analytics') ? 'active' : '' %>">Analytics</a>
    </div>
  </nav>

  <main class="container">
    <% if (typeof success !== 'undefined' && success) { %>
      <div class="flash flash-success"><%= success %></div>
    <% } %>
    <% if (typeof error !== 'undefined' && error) { %>
      <div class="flash flash-error"><%= error %></div>
    <% } %>

    <%- typeof body !== 'undefined' ? body : '' %>
  </main>

  <footer class="site-footer">
    <p>Pune Global Group — Outreach CRM</p>
  </footer>
</body>
</html>
```

- [ ] **Step 2: Create public/style.css**

Copy `invoicer/public/style.css` entirely as the starting point. This gives us the full design system (tokens, nav, tables, cards, forms, buttons, flash messages). No modifications needed — the same palette and components apply.

Run:
```bash
cp ../invoicer/public/style.css outreach/public/style.css
```

Then add these outreach-specific additions at the end of the file:

```css
/* ── Outreach-Specific ───────────────────────────────────── */

/* Stage badges */
.badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.02em; }
.badge-new { background: #e5e7eb; color: #374151; }
.badge-researched { background: var(--info-soft); color: var(--info); border: 1px solid rgba(37,99,235,0.2); }
.badge-contacted { background: var(--warning-soft); color: var(--warning); border: 1px solid rgba(217,119,6,0.2); }
.badge-qualified { background: rgba(147,51,234,0.08); color: #7c3aed; border: 1px solid rgba(147,51,234,0.2); }
.badge-quoted { background: rgba(168,85,247,0.08); color: #9333ea; border: 1px solid rgba(168,85,247,0.2); }
.badge-won { background: var(--success-soft); color: var(--success); border: 1px solid rgba(13,148,136,0.2); }
.badge-lost { background: var(--error-soft); color: var(--error); border: 1px solid rgba(220,38,38,0.2); }
.badge-dormant { background: #f3f4f6; color: #6b7280; border: 1px solid #d1d5db; }

/* ICP badges */
.badge-paper { background: rgba(180,140,60,0.1); color: #92700c; border: 1px solid rgba(180,140,60,0.25); }
.badge-pp { background: rgba(37,99,235,0.08); color: #1d4ed8; border: 1px solid rgba(37,99,235,0.2); }
.badge-both { background: rgba(13,148,136,0.08); color: #0d9488; border: 1px solid rgba(13,148,136,0.2); }

/* Fit score indicator */
.fit-score { display: inline-block; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-size: 0.8rem; font-weight: 700; }
.fit-high { background: var(--success-soft); color: var(--success); border: 1.5px solid var(--success); }
.fit-mid { background: var(--warning-soft); color: var(--warning); border: 1.5px solid var(--warning); }
.fit-low { background: var(--error-soft); color: var(--error); border: 1.5px solid var(--error); }

/* Tabs */
.tabs { display: flex; gap: 0; border-bottom: 2px solid var(--border); margin-bottom: 1.5rem; }
.tab { padding: 0.6rem 1.2rem; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; color: var(--text-secondary); font-weight: 500; text-decoration: none; }
.tab:hover { color: var(--text-primary); text-decoration: none; }
.tab.active { color: var(--saffron); border-bottom-color: var(--saffron); }

/* Tab content */
.tab-content { display: none; }
.tab-content.active { display: block; }

/* Pipeline funnel (dashboard) */
.pipeline-funnel { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.funnel-stage { flex: 1; min-width: 100px; text-align: center; padding: 0.75rem 0.5rem; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--border); }
.funnel-stage .stage-count { font-size: 1.5rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
.funnel-stage .stage-label { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }

/* Activity timeline */
.timeline { list-style: none; padding: 0; }
.timeline-item { display: flex; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border-light); }
.timeline-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; background: var(--bg-warm); color: var(--text-secondary); }
.timeline-body { flex: 1; }
.timeline-body .subject { font-weight: 500; }
.timeline-body .meta { font-size: 0.8rem; color: var(--text-tertiary); }

/* Filter bar */
.filter-bar { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; align-items: center; }
.filter-bar select, .filter-bar input { padding: 0.4rem 0.6rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; background: var(--surface); }

/* Tag pills */
.tag-pill { display: inline-block; padding: 1px 8px; border-radius: 10px; font-size: 0.75rem; background: var(--saffron-soft); color: var(--saffron); margin-right: 4px; }
```

- [ ] **Step 3: Verify layout renders**

Restart server, visit `http://localhost:3001`. Should see the nav bar with "PGG Outreach" branding and the placeholder dashboard.

- [ ] **Step 4: Commit**

```bash
git add outreach/views/layout.ejs outreach/public/style.css
git commit -m "feat(outreach): add layout template and CSS design system"
```

---

### Task 4: Services — Pipeline, Scoring, Search

**Files:**
- Create: `outreach/src/services/pipeline.js`
- Create: `outreach/src/services/scoring.js`
- Create: `outreach/src/services/search.js`

- [ ] **Step 1: Create src/services/pipeline.js**

```javascript
// Valid stage transitions
const STAGES = ['NEW', 'RESEARCHED', 'CONTACTED', 'QUALIFIED', 'QUOTED', 'WON', 'LOST', 'DORMANT'];

const FORWARD_ORDER = ['NEW', 'RESEARCHED', 'CONTACTED', 'QUALIFIED', 'QUOTED'];
// WON/LOST are terminal from QUOTED
// DORMANT can be entered from any stage, and any stage can be entered from DORMANT

function isValidTransition(from, to) {
  if (from === to) return false;
  // Any → DORMANT
  if (to === 'DORMANT') return true;
  // DORMANT → any active stage
  if (from === 'DORMANT' && STAGES.includes(to)) return true;
  // WON/LOST only from QUOTED
  if ((to === 'WON' || to === 'LOST') && from === 'QUOTED') return true;
  // Forward progression
  const fromIdx = FORWARD_ORDER.indexOf(from);
  const toIdx = FORWARD_ORDER.indexOf(to);
  if (fromIdx >= 0 && toIdx >= 0 && toIdx === fromIdx + 1) return true;
  return false;
}

async function changeStage(prisma, leadId, newStage, notes) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error('Lead not found');
  if (!isValidTransition(lead.stage, newStage)) {
    throw new Error(`Cannot move from ${lead.stage} to ${newStage}`);
  }

  const updatedLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      stage: newStage,
      stageChangedAt: new Date(),
      lostReason: newStage === 'LOST' ? (notes || null) : lead.lostReason,
    },
  });

  // Auto-create activity
  await prisma.activity.create({
    data: {
      leadId,
      type: 'STAGE_CHANGE',
      subject: `Stage: ${lead.stage} → ${newStage}`,
      body: notes || null,
    },
  });

  return updatedLead;
}

async function getStaleLeads(prisma, daysSinceStageChange = 14) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysSinceStageChange);
  return prisma.lead.findMany({
    where: {
      stageChangedAt: { lt: cutoff },
      stage: { notIn: ['WON', 'LOST', 'DORMANT'] },
      isArchived: false,
    },
    orderBy: { stageChangedAt: 'asc' },
  });
}

module.exports = { STAGES, FORWARD_ORDER, isValidTransition, changeStage, getStaleLeads };
```

- [ ] **Step 2: Create src/services/scoring.js**

```javascript
// ICP fit scoring for Pune Global Group's two verticals
// Paper ICP: Pune/neighbouring + <10Cr + 5-50 employees + corrugator/printer/box-maker
// PP ICP: any India + 50-500 employees + automotive/pharma/electronics/FMCG

const PUNE_CITIES = [
  'pune', 'pimpri', 'chinchwad', 'pimpri-chinchwad', 'pcmc',
  'hinjewadi', 'wakad', 'baner', 'kothrud', 'hadapsar',
  'chakan', 'talegaon', 'lonavala', 'ranjangaon', 'sanaswadi',
  'shirwal', 'satara', 'solapur', 'kolhapur', 'sangli',
  'nashik', 'ahmednagar', 'aurangabad',
];

const PAPER_INDUSTRIES = ['corrugator', 'printing', 'packaging', 'box-maker', 'converter'];
const PP_INDUSTRIES = ['automotive', 'pharma', 'electronics', 'fmcg', 'engineering'];

const REVENUE_SCORES = {
  '<1Cr': 1, '1-5Cr': 3, '5-10Cr': 5, '10-50Cr': 4, '50-100Cr': 3, '100Cr+': 2,
};

function computeFitScore(lead) {
  const icp = (lead.icpType || 'UNKNOWN').toUpperCase();
  if (icp === 'UNKNOWN') return null;

  let score = 0;
  const city = (lead.city || '').toLowerCase().trim();
  const industry = (lead.industry || '').toLowerCase().trim();
  const emp = lead.employeeCount || 0;
  const rev = lead.estimatedRevenue || '';

  if (icp === 'PAPER' || icp === 'BOTH') {
    // Geography (3 pts)
    if (PUNE_CITIES.includes(city)) score += 3;
    // Industry (3 pts)
    if (PAPER_INDUSTRIES.includes(industry)) score += 3;
    // Size: 5-50 employees (2 pts)
    if (emp >= 5 && emp <= 50) score += 2;
    else if (emp > 0 && emp < 5) score += 1;
    // Revenue (2 pts)
    if (rev && REVENUE_SCORES[rev]) {
      const rs = REVENUE_SCORES[rev];
      score += rs <= 5 ? Math.min(rs, 2) : 1;
    }
  }

  if (icp === 'PP' || icp === 'BOTH') {
    // Industry (4 pts)
    if (PP_INDUSTRIES.includes(industry)) score += 4;
    // Size: 50-500 employees (3 pts)
    if (emp >= 50 && emp <= 500) score += 3;
    else if (emp > 500) score += 1;
    else if (emp >= 20) score += 1;
    // Revenue (3 pts)
    if (rev === '10-50Cr' || rev === '50-100Cr') score += 3;
    else if (rev === '5-10Cr' || rev === '100Cr+') score += 2;
    else if (rev) score += 1;
  }

  // Clamp to 1-10
  return Math.max(1, Math.min(10, score));
}

module.exports = { computeFitScore, PUNE_CITIES, PAPER_INDUSTRIES, PP_INDUSTRIES };
```

- [ ] **Step 3: Create src/services/search.js**

```javascript
// Build Prisma where clause from URL query params

function buildFilterQuery(query) {
  const where = { isArchived: false };

  if (query.stage) where.stage = query.stage;
  if (query.icpType) where.icpType = query.icpType;
  if (query.source) where.source = query.source;
  if (query.industry) where.industry = query.industry;
  if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
  if (query.state) where.state = { contains: query.state, mode: 'insensitive' };

  if (query.fitScoreMin || query.fitScoreMax) {
    where.fitScore = {};
    if (query.fitScoreMin) where.fitScore.gte = parseInt(query.fitScoreMin);
    if (query.fitScoreMax) where.fitScore.lte = parseInt(query.fitScoreMax);
  }

  if (query.search) {
    where.OR = [
      { companyName: { contains: query.search, mode: 'insensitive' } },
      { notes: { contains: query.search, mode: 'insensitive' } },
      { painPoints: { contains: query.search, mode: 'insensitive' } },
      { opportunities: { contains: query.search, mode: 'insensitive' } },
      { city: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.archived === 'true') {
    where.isArchived = true;
  }

  return where;
}

module.exports = { buildFilterQuery };
```

- [ ] **Step 4: Commit**

```bash
git add outreach/src/services/
git commit -m "feat(outreach): add pipeline, scoring, and search services"
```

---

### Task 5: Auth Middleware

**Files:**
- Create: `outreach/src/middleware/auth.js`

- [ ] **Step 1: Create src/middleware/auth.js**

Same pattern as invoicer — master password with bcrypt:

```javascript
const bcrypt = require('bcrypt');

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.redirect('/login');
}

async function verifyPassword(password) {
  const hash = process.env.MASTER_PASSWORD_HASH;
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

module.exports = { requireAuth, verifyPassword };
```

Note: Auth is defined but NOT wired into routes yet (same as invoicer's current state). Will be enabled later.

- [ ] **Step 2: Commit**

```bash
git add outreach/src/middleware/auth.js
git commit -m "feat(outreach): add auth middleware (master password pattern)"
```

---

### Task 6: Leads Routes

**Files:**
- Create: `outreach/src/routes/leads.js`
- Modify: `outreach/server.js` — mount leads router

- [ ] **Step 1: Create src/routes/leads.js**

```javascript
const express = require('express');
const router = express.Router();
const { buildFilterQuery } = require('../services/search');
const { changeStage, STAGES } = require('../services/pipeline');
const { computeFitScore } = require('../services/scoring');

// GET /leads — list with filters
router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const where = buildFilterQuery(req.query);
    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        contacts: { where: { isPrimary: true }, take: 1 },
        activities: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    const ejs = require('ejs');
    const path = require('path');
    const body = await ejs.renderFile(path.join(__dirname, '../../views/leads/index.ejs'), {
      leads,
      filters: req.query,
      stages: STAGES,
    });
    res.render('layout', { title: 'Leads', body });
  } catch (err) {
    console.error('Leads list error:', err);
    res.status(500).send('Server error');
  }
});

// GET /leads/new — form
router.get('/new', (req, res) => {
  const ejs = require('ejs');
  const path = require('path');
  ejs.renderFile(path.join(__dirname, '../../views/leads/form.ejs'), {
    lead: null,
    stages: STAGES,
  }).then(body => {
    res.render('layout', { title: 'New Lead', body });
  });
});

// POST /leads — create
router.post('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const data = extractLeadData(req.body);
    // Auto-compute fit score
    data.fitScore = computeFitScore(data);
    const lead = await prisma.lead.create({ data });
    res.redirect(`/leads/${lead.id}?success=Lead+created`);
  } catch (err) {
    console.error('Lead create error:', err);
    res.redirect('/leads/new?error=Failed+to+create+lead');
  }
});

// GET /leads/:id — detail
router.get('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const lead = await prisma.lead.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        contacts: { orderBy: { isPrimary: 'desc' } },
        activities: { orderBy: { createdAt: 'desc' }, include: { contact: { select: { name: true } } } },
        scrapeBatch: true,
      },
    });
    if (!lead) return res.redirect('/leads?error=Lead+not+found');
    const plainLead = JSON.parse(JSON.stringify(lead));
    const ejs = require('ejs');
    const path = require('path');
    const body = await ejs.renderFile(path.join(__dirname, '../../views/leads/detail.ejs'), {
      lead: plainLead,
      stages: STAGES,
      tab: req.query.tab || 'info',
    });
    res.render('layout', { title: plainLead.companyName, body });
  } catch (err) {
    console.error('Lead detail error:', err);
    res.redirect('/leads?error=Failed+to+load+lead');
  }
});

// GET /leads/:id/edit — edit form
router.get('/:id/edit', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const lead = await prisma.lead.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!lead) return res.redirect('/leads?error=Lead+not+found');
    const plainLead = JSON.parse(JSON.stringify(lead));
    const ejs = require('ejs');
    const path = require('path');
    const body = await ejs.renderFile(path.join(__dirname, '../../views/leads/form.ejs'), {
      lead: plainLead,
      stages: STAGES,
    });
    res.render('layout', { title: `Edit ${plainLead.companyName}`, body });
  } catch (err) {
    console.error('Lead edit error:', err);
    res.redirect('/leads?error=Failed+to+load+lead');
  }
});

// POST /leads/:id — update
router.post('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const data = extractLeadData(req.body);
    data.fitScore = computeFitScore(data);
    await prisma.lead.update({ where: { id }, data });
    res.redirect(`/leads/${id}?success=Lead+updated`);
  } catch (err) {
    console.error('Lead update error:', err);
    res.redirect(`/leads/${req.params.id}?error=Failed+to+update+lead`);
  }
});

// POST /leads/:id/stage — change pipeline stage
router.post('/:id/stage', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const { newStage, notes } = req.body;
    await changeStage(prisma, id, newStage, notes);
    res.redirect(`/leads/${id}?success=Stage+updated+to+${newStage}`);
  } catch (err) {
    console.error('Stage change error:', err);
    res.redirect(`/leads/${req.params.id}?error=${encodeURIComponent(err.message)}`);
  }
});

// POST /leads/:id/archive — soft archive
router.post('/:id/archive', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const lead = await prisma.lead.findUnique({ where: { id } });
    await prisma.lead.update({
      where: { id },
      data: { isArchived: !lead.isArchived },
    });
    const action = lead.isArchived ? 'restored' : 'archived';
    res.redirect(`/leads/${id}?success=Lead+${action}`);
  } catch (err) {
    console.error('Archive error:', err);
    res.redirect(`/leads/${req.params.id}?error=Failed+to+archive`);
  }
});

// Helper: extract lead fields from form body
function extractLeadData(body) {
  return {
    companyName: body.companyName?.trim(),
    industry: body.industry?.trim() || null,
    city: body.city?.trim() || null,
    state: body.state?.trim() || null,
    pincode: body.pincode?.trim() || null,
    address: body.address?.trim() || null,
    website: body.website?.trim() || null,
    gstin: body.gstin?.trim() || null,
    employeeCount: body.employeeCount ? parseInt(body.employeeCount) : null,
    estimatedRevenue: body.estimatedRevenue || null,
    yearEstablished: body.yearEstablished ? parseInt(body.yearEstablished) : null,
    icpType: body.icpType || 'UNKNOWN',
    productFit: body.productFit ? JSON.parse(body.productFit) : null,
    fitNotes: body.fitNotes?.trim() || null,
    source: body.source || 'MANUAL',
    sourceUrl: body.sourceUrl?.trim() || null,
    currentPackaging: body.currentPackaging?.trim() || null,
    currentSupplier: body.currentSupplier?.trim() || null,
    estimatedMonthlyVolume: body.estimatedMonthlyVolume?.trim() || null,
    painPoints: body.painPoints?.trim() || null,
    opportunities: body.opportunities?.trim() || null,
    discType: body.discType || null,
    discNotes: body.discNotes?.trim() || null,
    spinSituation: body.spinSituation?.trim() || null,
    spinProblem: body.spinProblem?.trim() || null,
    spinImplication: body.spinImplication?.trim() || null,
    spinNeedPayoff: body.spinNeedPayoff?.trim() || null,
    meddic: body.meddic ? JSON.parse(body.meddic) : null,
    growGoal: body.growGoal?.trim() || null,
    growReality: body.growReality?.trim() || null,
    growOptions: body.growOptions?.trim() || null,
    growWill: body.growWill?.trim() || null,
    notes: body.notes?.trim() || null,
    tags: body.tags ? JSON.parse(body.tags) : null,
  };
}

module.exports = router;
```

- [ ] **Step 2: Mount in server.js**

Add to `server.js` after the flash middleware, before the placeholder home route:

```javascript
// ── Routes ───────────────────────────────────────────────────
const leadsRouter = require('./src/routes/leads');
app.use('/leads', leadsRouter);
```

Remove the placeholder home route (will be replaced by dashboard in Task 9).

- [ ] **Step 3: Commit**

```bash
git add outreach/src/routes/leads.js outreach/server.js
git commit -m "feat(outreach): add leads routes with CRUD, stage transitions, filtering"
```

---

### Task 7: Leads Views

**Files:**
- Create: `outreach/views/leads/index.ejs`
- Create: `outreach/views/leads/form.ejs`
- Create: `outreach/views/leads/detail.ejs`

- [ ] **Step 1: Create views/leads/index.ejs**

Lead listing with filter bar and table. Include:
- Filter bar: dropdowns for stage, ICP type, source, industry; text search input; "Apply" button
- Table columns: Company Name (link to detail), Industry, City, ICP (badge), Stage (badge), Fit Score (circle), Source, Last Activity date, Actions (View)
- Link to "/leads/new" button at top
- Each filter value should be preserved in the dropdowns after applying (use `filters` object)

Stage badge CSS class: `badge badge-${stage.toLowerCase()}` (e.g., `badge badge-new`)
ICP badge CSS class: `badge badge-${icpType.toLowerCase()}`
Fit score class: `fit-score ${score >= 7 ? 'fit-high' : score >= 4 ? 'fit-mid' : 'fit-low'}`

The filter form uses GET method to `/leads` so filters appear as query params.

- [ ] **Step 2: Create views/leads/form.ejs**

New/edit lead form. Sections:
- **Company Info:** companyName (required), industry (dropdown), city, state, pincode, address, website, gstin, employeeCount, estimatedRevenue (dropdown), yearEstablished
- **ICP & Scoring:** icpType (radio: PAPER/PP/BOTH/UNKNOWN), fitNotes (textarea)
- **Source:** source (dropdown), sourceUrl
- **Business Intel:** currentPackaging, currentSupplier, estimatedMonthlyVolume, painPoints (textarea), opportunities (textarea)

For edit mode: pre-fill all fields from `lead` object. Form POSTs to `/leads` (new) or `/leads/:id` (edit).

Industry dropdown values: automotive, pharma, fmcg, electronics, engineering, printing, corrugator, packaging, other.
Revenue dropdown values: <1Cr, 1-5Cr, 5-10Cr, 10-50Cr, 50-100Cr, 100Cr+.
Source dropdown values: GOOGLE, LINKEDIN, INDIAMART, GEM, MEITY, REFERRAL, MANUAL.

- [ ] **Step 3: Create views/leads/detail.ejs**

The workhorse page — all lead info with tabs. Structure:

**Header area:**
- Company name (h1) + stage badge + ICP badge + fit score circle
- Stage transition buttons (show valid next stages as buttons, each is a form POSTing to `/leads/:id/stage`)
- Archive/restore button
- "Edit" link to form

**Tab navigation:** Info | Contacts | Activity | Sales Intel

**Tab: Info** (default)
- Company details in a 2-column grid (label: value)
- Business intelligence section (currentPackaging, currentSupplier, volume, painPoints, opportunities)
- Source info (source badge, sourceUrl link, scrapedAt date)

**Tab: Contacts**
- Table of contacts (name, designation, phone, email, whatsapp, primary badge)
- "Add Contact" button linking to `/contacts/new?leadId=:id`
- Each contact row has Edit link

**Tab: Activity**
- "Log Activity" form at top (type dropdown, subject input, body textarea, submit)
- Timeline list below (newest first) — each item shows: type icon, subject, body preview, contact name if linked, timestamp
- The form POSTs to `/activities` with hidden `leadId`

**Tab: Sales Intel**
- DISC section: discType (D/I/S/C radio), discNotes textarea
- SPIN section: 4 textareas (situation, problem, implication, need-payoff)
- GROW section: 4 textareas (goal, reality, options, will)
- MEDDIC section: 6 textareas displayed as a grid (metrics, economicBuyer, decisionCriteria, decisionProcess, identifyPain, champion)
- Notes & Tags: notes textarea, tags input
- Save button POSTs to `/leads/:id`

Tab switching uses `?tab=info|contacts|activity|sales-intel` query param (server-rendered, no JS required). The `tab` variable controls which `.tab-content` div gets the `active` class.

- [ ] **Step 4: Verify lead CRUD works end-to-end**

Run:
```bash
cd outreach && npm run dev
```

1. Visit `/leads/new`, create a test lead
2. Verify it appears in `/leads` list
3. Click into detail, verify all tabs render
4. Change stage, verify activity is logged
5. Edit the lead, verify updates persist

- [ ] **Step 5: Commit**

```bash
git add outreach/views/leads/
git commit -m "feat(outreach): add lead views — list with filters, form, detail with tabs"
```

---

### Task 8: Contacts Routes + Views

**Files:**
- Create: `outreach/src/routes/contacts.js`
- Create: `outreach/views/contacts/index.ejs`
- Create: `outreach/views/contacts/form.ejs`
- Modify: `outreach/server.js` — mount contacts router

- [ ] **Step 1: Create src/routes/contacts.js**

```javascript
const express = require('express');
const router = express.Router();

// GET /contacts — directory
router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const search = req.query.search || '';
    const where = search
      ? { OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { designation: { contains: search, mode: 'insensitive' } },
        ]}
      : {};
    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { lead: { select: { id: true, companyName: true, stage: true } } },
    });
    const ejs = require('ejs');
    const path = require('path');
    const body = await ejs.renderFile(path.join(__dirname, '../../views/contacts/index.ejs'), {
      contacts,
      search,
    });
    res.render('layout', { title: 'Contacts', body });
  } catch (err) {
    console.error('Contacts list error:', err);
    res.status(500).send('Server error');
  }
});

// GET /contacts/new — form (with optional leadId)
router.get('/new', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const leadId = req.query.leadId ? parseInt(req.query.leadId) : null;
    let lead = null;
    if (leadId) {
      lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true, companyName: true } });
    }
    const leads = await prisma.lead.findMany({ where: { isArchived: false }, select: { id: true, companyName: true }, orderBy: { companyName: 'asc' } });
    const ejs = require('ejs');
    const path = require('path');
    const body = await ejs.renderFile(path.join(__dirname, '../../views/contacts/form.ejs'), {
      contact: null, lead, leads,
    });
    res.render('layout', { title: 'New Contact', body });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).send('Server error');
  }
});

// POST /contacts — create
router.post('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const leadId = parseInt(req.body.leadId);
    const contact = await prisma.contact.create({
      data: {
        leadId,
        name: req.body.name.trim(),
        designation: req.body.designation?.trim() || null,
        department: req.body.department?.trim() || null,
        phone: req.body.phone?.trim() || null,
        email: req.body.email?.trim() || null,
        whatsapp: req.body.whatsapp?.trim() || null,
        linkedinUrl: req.body.linkedinUrl?.trim() || null,
        isPrimary: req.body.isPrimary === 'on',
        discType: req.body.discType || null,
        notes: req.body.notes?.trim() || null,
      },
    });
    res.redirect(`/leads/${leadId}?tab=contacts&success=Contact+added`);
  } catch (err) {
    console.error('Contact create error:', err);
    res.redirect(`/contacts/new?leadId=${req.body.leadId}&error=Failed+to+create+contact`);
  }
});

// GET /contacts/:id — edit form
router.get('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { lead: { select: { id: true, companyName: true } } },
    });
    if (!contact) return res.redirect('/contacts?error=Contact+not+found');
    const leads = await prisma.lead.findMany({ where: { isArchived: false }, select: { id: true, companyName: true }, orderBy: { companyName: 'asc' } });
    const plainContact = JSON.parse(JSON.stringify(contact));
    const ejs = require('ejs');
    const path = require('path');
    const body = await ejs.renderFile(path.join(__dirname, '../../views/contacts/form.ejs'), {
      contact: plainContact, lead: plainContact.lead, leads,
    });
    res.render('layout', { title: `Edit ${plainContact.name}`, body });
  } catch (err) {
    console.error('Contact edit error:', err);
    res.redirect('/contacts?error=Failed+to+load+contact');
  }
});

// POST /contacts/:id — update
router.post('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    await prisma.contact.update({
      where: { id },
      data: {
        leadId: parseInt(req.body.leadId),
        name: req.body.name.trim(),
        designation: req.body.designation?.trim() || null,
        department: req.body.department?.trim() || null,
        phone: req.body.phone?.trim() || null,
        email: req.body.email?.trim() || null,
        whatsapp: req.body.whatsapp?.trim() || null,
        linkedinUrl: req.body.linkedinUrl?.trim() || null,
        isPrimary: req.body.isPrimary === 'on',
        discType: req.body.discType || null,
        notes: req.body.notes?.trim() || null,
      },
    });
    res.redirect(`/leads/${req.body.leadId}?tab=contacts&success=Contact+updated`);
  } catch (err) {
    console.error('Contact update error:', err);
    res.redirect(`/contacts/${req.params.id}?error=Failed+to+update`);
  }
});

// POST /contacts/:id/delete
router.post('/:id/delete', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const contact = await prisma.contact.findUnique({ where: { id: parseInt(req.params.id) } });
    await prisma.contact.delete({ where: { id: parseInt(req.params.id) } });
    res.redirect(`/leads/${contact.leadId}?tab=contacts&success=Contact+deleted`);
  } catch (err) {
    console.error('Contact delete error:', err);
    res.redirect('/contacts?error=Failed+to+delete');
  }
});

module.exports = router;
```

- [ ] **Step 2: Create views/contacts/index.ejs**

Contact directory: search bar, table with Name, Designation, Company (link to lead), Phone, Email, WhatsApp, Actions (Edit).

- [ ] **Step 3: Create views/contacts/form.ejs**

New/edit contact form: leadId (dropdown if not pre-set), name (required), designation, department (dropdown: Purchase, Production, Packaging, Management, Other), phone, email, whatsapp, linkedinUrl, isPrimary (checkbox), discType (D/I/S/C radio), notes.

- [ ] **Step 4: Mount in server.js**

```javascript
const contactsRouter = require('./src/routes/contacts');
app.use('/contacts', contactsRouter);
```

- [ ] **Step 5: Verify contacts CRUD works**

Create a contact via lead detail → Contacts tab → "Add Contact". Verify it appears. Edit. Delete.

- [ ] **Step 6: Commit**

```bash
git add outreach/src/routes/contacts.js outreach/views/contacts/ outreach/server.js
git commit -m "feat(outreach): add contacts routes and views"
```

---

### Task 9: Activities Route

**Files:**
- Create: `outreach/src/routes/activities.js`
- Create: `outreach/views/activities/form-partial.ejs`
- Modify: `outreach/server.js` — mount activities router

- [ ] **Step 1: Create src/routes/activities.js**

```javascript
const express = require('express');
const router = express.Router();

// POST /activities — log an activity
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
```

- [ ] **Step 2: Create views/activities/form-partial.ejs**

Inline form used on the lead detail Activity tab. Fields:
- type (dropdown: NOTE, CALL, EMAIL_SENT, EMAIL_RECEIVED, WHATSAPP, MEETING, SITE_VISIT, SAMPLE_SENT)
- contactId (optional dropdown of lead's contacts)
- subject (text input, required)
- body (textarea)
- Hidden: leadId
- Submit button "Log Activity"

This partial is included inside `views/leads/detail.ejs` via `<%- include('../activities/form-partial', { lead }) %>`.

- [ ] **Step 3: Mount in server.js**

```javascript
const activitiesRouter = require('./src/routes/activities');
app.use('/activities', activitiesRouter);
```

- [ ] **Step 4: Commit**

```bash
git add outreach/src/routes/activities.js outreach/views/activities/ outreach/server.js
git commit -m "feat(outreach): add activities route and form partial"
```

---

### Task 10: Dashboard

**Files:**
- Create: `outreach/views/dashboard-body.ejs`
- Modify: `outreach/server.js` — replace placeholder home route with dashboard logic

- [ ] **Step 1: Add dashboard route to server.js**

Replace the placeholder `app.get('/')` with full dashboard logic:

```javascript
app.get('/', async (req, res) => {
  try {
    const { STAGES } = require('./src/services/pipeline');
    const { getStaleLeads } = require('./src/services/pipeline');

    // Pipeline counts
    const stageCounts = {};
    for (const stage of STAGES) {
      stageCounts[stage] = await prisma.lead.count({ where: { stage, isArchived: false } });
    }

    // Total leads
    const totalLeads = await prisma.lead.count({ where: { isArchived: false } });

    // By ICP
    const icpCounts = {};
    for (const icp of ['PAPER', 'PP', 'BOTH', 'UNKNOWN']) {
      icpCounts[icp] = await prisma.lead.count({ where: { icpType: icp, isArchived: false } });
    }

    // By source
    const sourceCounts = {};
    for (const src of ['GOOGLE', 'LINKEDIN', 'INDIAMART', 'GEM', 'MEITY', 'REFERRAL', 'MANUAL']) {
      sourceCounts[src] = await prisma.lead.count({ where: { source: src, isArchived: false } });
    }

    // Won this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const wonThisMonth = await prisma.lead.count({
      where: { stage: 'WON', stageChangedAt: { gte: monthStart }, isArchived: false },
    });

    // Hot leads (fitScore >= 7, stage is NEW or RESEARCHED)
    const hotLeads = await prisma.lead.findMany({
      where: { fitScore: { gte: 7 }, stage: { in: ['NEW', 'RESEARCHED'] }, isArchived: false },
      orderBy: { fitScore: 'desc' },
      take: 10,
    });

    // Stale leads (stuck > 14 days)
    const staleLeads = await getStaleLeads(prisma, 14);

    // Recent activity
    const recentActivities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        lead: { select: { id: true, companyName: true } },
        contact: { select: { name: true } },
      },
    });

    const ejs = require('ejs');
    const path = require('path');
    const body = await ejs.renderFile(path.join(__dirname, 'views/dashboard-body.ejs'), {
      stageCounts, totalLeads, icpCounts, sourceCounts, wonThisMonth,
      hotLeads, staleLeads: staleLeads.slice(0, 10), recentActivities,
      stages: STAGES,
    });
    res.render('layout', { title: 'Dashboard', body });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).send('Server error');
  }
});
```

- [ ] **Step 2: Create views/dashboard-body.ejs**

Dashboard layout:

**Top row:** Quick action buttons — "+ New Lead" (primary), "View All Leads" (secondary)

**Pipeline funnel:** Horizontal row of stage cards, each showing count and stage name. Use `.pipeline-funnel` and `.funnel-stage` classes. Each card is clickable, links to `/leads?stage=STAGE_NAME`.

**KPI cards row (4 cards):**
- Total Leads (count)
- Hot Leads (fitScore >= 7 count)
- Stale Leads (stuck > 14 days count)
- Won This Month (count where stage=WON and stageChangedAt this month)

**Two-column section:**
Left: **Hot Leads** — table of top 10 highest-fit-score leads that are NEW/RESEARCHED. Columns: Company, Industry, City, Fit Score, Stage.
Right: **Stale Leads** — leads stuck in a stage > 14 days. Columns: Company, Stage, Days Stuck.

**Bottom:** **Recent Activity** — timeline of last 20 activities. Each item: type badge, subject, lead name (link), contact name, timestamp.

- [ ] **Step 3: Verify dashboard renders**

Visit `http://localhost:3001`. All sections should render (with zero counts if no data yet).

- [ ] **Step 4: Commit**

```bash
git add outreach/views/dashboard-body.ejs outreach/server.js
git commit -m "feat(outreach): add dashboard with pipeline funnel, KPIs, hot/stale leads"
```

---

### Task 11: Scrape Batches Route + View

**Files:**
- Create: `outreach/src/routes/scrapeBatches.js`
- Create: `outreach/views/scrape-batches/index.ejs`
- Modify: `outreach/server.js` — mount router

- [ ] **Step 1: Create src/routes/scrapeBatches.js**

```javascript
const express = require('express');
const router = express.Router();

// GET /scrape-batches — list all
router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const batches = await prisma.scrapeBatch.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { leads: true } } },
    });
    const ejs = require('ejs');
    const path = require('path');
    const body = await ejs.renderFile(path.join(__dirname, '../../views/scrape-batches/index.ejs'), { batches });
    res.render('layout', { title: 'Scrape Log', body });
  } catch (err) {
    console.error('Scrape batches error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
```

- [ ] **Step 2: Create views/scrape-batches/index.ejs**

Simple table: Date, Source (badge), Query, Leads Found, New Leads, Notes. Sorted newest first. Each row links to `/leads?scrapeBatchId=X` (filter leads by batch — requires adding `scrapeBatchId` filter to `search.js`).

- [ ] **Step 3: Add scrapeBatchId filter to search.js**

In `src/services/search.js`, add:
```javascript
if (query.scrapeBatchId) where.scrapeBatchId = parseInt(query.scrapeBatchId);
```

- [ ] **Step 4: Mount in server.js**

```javascript
const scrapeBatchesRouter = require('./src/routes/scrapeBatches');
app.use('/scrape-batches', scrapeBatchesRouter);
```

- [ ] **Step 5: Commit**

```bash
git add outreach/src/routes/scrapeBatches.js outreach/views/scrape-batches/ outreach/src/services/search.js outreach/server.js
git commit -m "feat(outreach): add scrape batches log view"
```

---

### Task 12: Analytics Route + View

**Files:**
- Create: `outreach/src/routes/analytics.js`
- Create: `outreach/views/analytics/index.ejs`
- Modify: `outreach/server.js` — mount router

- [ ] **Step 1: Create src/routes/analytics.js**

```javascript
const express = require('express');
const router = express.Router();
const { STAGES } = require('../services/pipeline');

router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;

    // Stage counts
    const stageCounts = {};
    for (const stage of STAGES) {
      stageCounts[stage] = await prisma.lead.count({ where: { stage, isArchived: false } });
    }

    // Conversion: how many leads moved from each stage to the next
    // (approximated by counting leads currently at or past each stage)
    const totalActive = await prisma.lead.count({ where: { isArchived: false } });

    // Source effectiveness: leads per source + won rate per source
    const sourceStats = {};
    for (const src of ['GOOGLE', 'LINKEDIN', 'INDIAMART', 'GEM', 'MEITY', 'REFERRAL', 'MANUAL']) {
      const total = await prisma.lead.count({ where: { source: src, isArchived: false } });
      const won = await prisma.lead.count({ where: { source: src, stage: 'WON', isArchived: false } });
      sourceStats[src] = { total, won, winRate: total > 0 ? ((won / total) * 100).toFixed(1) : '0.0' };
    }

    // ICP effectiveness
    const icpStats = {};
    for (const icp of ['PAPER', 'PP', 'BOTH']) {
      const total = await prisma.lead.count({ where: { icpType: icp, isArchived: false } });
      const won = await prisma.lead.count({ where: { icpType: icp, stage: 'WON', isArchived: false } });
      icpStats[icp] = { total, won, winRate: total > 0 ? ((won / total) * 100).toFixed(1) : '0.0' };
    }

    // Average days in each stage (for leads that have moved past it)
    // Simplified: show current stage distribution as a table

    const ejs = require('ejs');
    const path = require('path');
    const body = await ejs.renderFile(path.join(__dirname, '../../views/analytics/index.ejs'), {
      stageCounts, totalActive, sourceStats, icpStats, stages: STAGES,
    });
    res.render('layout', { title: 'Analytics', body });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
```

- [ ] **Step 2: Create views/analytics/index.ejs**

Analytics page sections:
- **Pipeline Breakdown:** Table with Stage, Count, % of Total
- **Source Effectiveness:** Table with Source, Total Leads, Won, Win Rate %
- **ICP Effectiveness:** Table with ICP Type, Total Leads, Won, Win Rate %

Simple, data-dense tables. No charts (keep it server-rendered, no JS charting library needed).

- [ ] **Step 3: Mount in server.js**

```javascript
const analyticsRouter = require('./src/routes/analytics');
app.use('/analytics', analyticsRouter);
```

- [ ] **Step 4: Commit**

```bash
git add outreach/src/routes/analytics.js outreach/views/analytics/ outreach/server.js
git commit -m "feat(outreach): add analytics page with pipeline and source stats"
```

---

### Task 13: CLAUDE.md + Final Wiring

**Files:**
- Create: `outreach/CLAUDE.md`
- Verify: `outreach/server.js` has all routes mounted

- [ ] **Step 1: Create outreach/CLAUDE.md**

```markdown
# CLAUDE.md — Outreach CRM

## Project

Pune Global Group Outreach CRM — lead management and sales pipeline for Paper & Board (local Pune) and PP Corrugated (pan-India) verticals.

## Commands

\`\`\`bash
npm run dev          # Express dev server on localhost:3001 (nodemon)
npm start            # Production: node server.js
\`\`\`

## Architecture

- **Express 5 + EJS + Prisma + PostgreSQL** — same stack as sibling `invoicer/` app
- Server-rendered, no client-side SPA
- Prisma with `@prisma/adapter-pg` (raw pg Pool)
- Port 3001 (invoicer uses 3000)
- Auth: master password (bcrypt), same pattern as invoicer

## Key Files

| Path | Purpose |
|------|---------|
| server.js | Express entry + dashboard route |
| prisma/schema.prisma | Lead, Contact, Activity, ScrapeBatch models |
| src/routes/leads.js | Lead CRUD, stage transitions, filtering |
| src/routes/contacts.js | Contact CRUD |
| src/routes/activities.js | Activity logging |
| src/services/pipeline.js | Stage validation, transition logic |
| src/services/scoring.js | ICP fit score computation |
| src/services/search.js | Filter query builder |
| views/leads/detail.ejs | Lead detail with tabs (Info/Contacts/Activity/Sales Intel) |

## Database

Shared PostgreSQL instance. Database name: `outreach`.

Run migrations: `npx prisma migrate dev`

## Scraping Workflow (Claude Code)

Leads are NOT scraped by the app. Use Claude Code terminal sessions to scrape and INSERT:

\`\`\`
# IndiaMART — PP leads
"Search IndiaMART for companies buying corrugated PP boxes / returnable packaging
in [city/state]. Extract company name, contact person, phone, email, city, industry.
Insert into the outreach database as ICP=PP, source=INDIAMART."

# Google — Paper leads
"Search Google for 'corrugated box manufacturers Pune' / 'packaging companies Pune'.
Visit top results, extract company details. Insert as ICP=PAPER, source=GOOGLE."

# GeM — PP leads
"Search GeM portal for tenders related to PP corrugated packaging / returnable
packaging. Extract buyer org, tender details, contact info. Insert as ICP=PP, source=GEM."

# LinkedIn — PP leads
"Search LinkedIn for Purchase Managers / Packaging Heads at automotive / pharma
companies in India with 50-500 employees. Insert as ICP=PP, source=LINKEDIN."
\`\`\`

Deduplication: check companyName + city before inserting. Enrich existing records if match found.

## Pipeline Stages

NEW → RESEARCHED → CONTACTED → QUALIFIED → QUOTED → WON/LOST

Any stage → DORMANT. DORMANT → any stage.

## ICP Definitions

| | Paper & Board | PP Corrugated |
|---|---|---|
| Target | Corrugators, box makers, printers | Automotive, pharma, electronics, FMCG |
| Size | 5-50 employees, <10Cr revenue | 50-500 employees |
| Geo | Pune + neighbouring cities | Pan-India |
\`\`\`
```

- [ ] **Step 2: Verify all routes are mounted in server.js**

Final `server.js` should have:
```javascript
app.use('/leads', leadsRouter);
app.use('/contacts', contactsRouter);
app.use('/activities', activitiesRouter);
app.use('/scrape-batches', scrapeBatchesRouter);
app.use('/analytics', analyticsRouter);
```

- [ ] **Step 3: Full smoke test**

Run `npm run dev` and verify:
1. Dashboard loads with pipeline funnel (all zeros)
2. `/leads` — empty list, filters render
3. `/leads/new` — form renders, can create lead
4. `/leads/1` — detail page, all 4 tabs work
5. Add a contact, log an activity
6. Change stage — activity auto-logged
7. `/contacts` — directory shows contacts
8. `/scrape-batches` — empty log
9. `/analytics` — tables render with zero data

- [ ] **Step 4: Commit**

```bash
git add outreach/CLAUDE.md outreach/server.js
git commit -m "feat(outreach): add CLAUDE.md and finalize route wiring"
```

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Scaffold (package.json, server.js, .env) | 4 files |
| 2 | Prisma schema + migration | 1 file |
| 3 | Layout + CSS | 2 files |
| 4 | Services (pipeline, scoring, search) | 3 files |
| 5 | Auth middleware | 1 file |
| 6 | Leads routes | 1 file |
| 7 | Leads views (list, form, detail) | 3 files |
| 8 | Contacts routes + views | 3 files |
| 9 | Activities route + partial | 2 files |
| 10 | Dashboard | 1 file |
| 11 | Scrape batches route + view | 2 files |
| 12 | Analytics route + view | 2 files |
| 13 | CLAUDE.md + final wiring | 1 file |

**Total: 13 tasks, ~26 files, 13 commits.**
