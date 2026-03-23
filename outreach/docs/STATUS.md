# PGG Outreach CRM — Project Status

**Last updated:** 2026-03-23
**Server:** `http://localhost:3001` (port 3001)
**Credentials:** admin/admin123 (production), demo/demo123 (test)

---

## What's Built (100% Complete)

### Module A — Lead Database & Pipeline
- 12 routes: Dashboard, Leads CRUD, Contacts CRUD, Activities, Scrape Log, Analytics
- Pipeline: NEW → RESEARCHED → CONTACTED → QUALIFIED → QUOTED → WON/LOST, DORMANT
- ICP scoring (Paper vs PP), lead filters, search
- DISC/SPIN/GROW/MEDDIC fields on lead detail

### Module B — Quote Generator + Supplier RFQ
- Size-based pricing engine (Decimal.js, never floats)
- Auto-calculate: sheet area from dimensions → cost buildup → margin → GST
- Quote CRUD with PDF generation (Puppeteer)
- Rate Card management (18 default rates seeded in demo)
- Supplier RFQ with auto-BOM from quote items
- Quote lifecycle: DRAFT → SENT (→ lead QUOTED) → ACCEPTED (→ lead WON) / REJECTED

### Module C — Outreach Engine
- Email via Resend (free tier 3K/mo)
- WhatsApp via Baileys (file-based auth, rate-limited)
- 6 message template types: cold intro, stock update, quote follow-up, festive, quality education, custom
- Batch campaigns with lead filters + manual exclusion
- Ad-hoc send from lead detail (Quick Send form)
- Resend webhook tracking (delivered/opened/clicked/bounced)

### UI/UX
- Left sidebar nav with PGG Turiya logo, Lucide icons, section labels
- Collapsible sidebar (toggle at bottom, expand-on-hover when collapsed)
- Invoicer design system: Fraunces headings, DM Sans body, JetBrains Mono numbers
- Navy/cream/saffron palette, warm backgrounds

### Auth & Data Isolation
- 2 users: Admin (production DB: `outreach`) + Demo (test DB: `outreach_demo`)
- Session-based auth with PostgreSQL session store
- Environment badge in sidebar (green ADMIN / orange DEMO)

---

## What's Tested (Demo Account)

| Test | Result |
|------|--------|
| Dashboard pipeline + KPIs | PASS |
| Lead list + filters (ICP, stage, source, industry) | PASS |
| Lead detail with 5 tabs (Info, Contacts, Activity, Quotes, Sales Intel) | PASS |
| Stage transitions + auto activity logging | PASS |
| Contacts CRUD | PASS |
| Rate card CRUD (18 entries across 8 categories) | PASS |
| Quote creation with pricing engine (QT-2526-001, ₹1,69,743) | PASS |
| Quote send/accept lifecycle | PASS |
| Supplier RFQ creation from quote | PASS (bug fixed: quantity type) |
| Message templates (6 seeded) | PASS |
| Campaign creation + recipient preview | PASS |
| Analytics page | PASS |
| Scrape log (2 batches) | PASS |
| WhatsApp status page | PASS |
| Resend webhook endpoint | PASS |
| Login/logout + DB isolation | PASS |

**Demo data:** 12 leads, 13 contacts, 12 activities, 18 rate cards, 6 templates, 1 quote, 1 RFQ, 2 scrape batches

---

## What's Pending (Tomorrow's TODO)

### Priority 1: Make It Operational (Admin Account)

- [ ] **Seed admin Rate Card** — Add YOUR real PP sheet rates, cutting/welding rates, paper grade rates at `/rate-card` (logged in as admin). These are currently only in the demo DB.
- [ ] **First real lead scrape** — Claude Code session: "Scrape IndiaMART for corrugated PP box buyers in Pune/Maharashtra" — will INSERT directly into admin DB
- [ ] **Create real message templates** — Customize the 6 template types with your actual business messaging

### Priority 2: Connect External Services

- [ ] **Resend email setup**
  1. Sign up at [resend.com](https://resend.com)
  2. Add domain `puneglobalgroup.in` in Resend dashboard
  3. Add the DNS records (SPF, DKIM) they provide
  4. Copy API key → paste in `outreach/.env` as `RESEND_API_KEY`
  5. Set `RESEND_FROM_EMAIL=sales@puneglobalgroup.in`

- [ ] **WhatsApp (Baileys) setup**
  1. Login as admin → go to `/whatsapp/status`
  2. Click "Connect" → scan QR code with your phone
  3. Test by sending a WhatsApp from a lead's Quick Send form
  4. Get a dedicated SIM when ready (to avoid ban risk on business number)

### Priority 3: Start Working Leads

- [ ] Quote a real lead → Download PDF → Send via email/WhatsApp
- [ ] Create a batch campaign (e.g., stock update to all PAPER leads in Pune)
- [ ] Track pipeline: move leads through stages as conversations progress

### Priority 4: Deferred Features (Future Sessions)

- [ ] SPIN/MEDDIC guided workflow prompts (structured sales methodology)
- [ ] DISC assessment questionnaire
- [ ] Campaign scheduling (currently sends immediately)
- [ ] Auto follow-up sequences
- [ ] Email subdomain isolation (outreach.puneglobalgroup.in)
- [ ] Visual creative designer for one-pager templates
- [ ] Push to GitHub / deploy to Cloud Run
- [ ] Change passwords from defaults (admin123/demo123) to secure values

---

## Quick Reference

```bash
# Start the app
cd outreach && npm run dev

# Access
http://localhost:3001          # Login page
admin / admin123               # Production data
demo / demo123                 # Test data (isolated DB)

# Reset demo data
node scripts/seed-demo.js      # Re-seeds demo DB

# Run Prisma migrations (after schema changes)
npx prisma migrate dev
npx prisma generate
```

## File Counts

- **30+ commits** on master
- **~60 files** in outreach/
- **13 Prisma models** (Lead, Contact, Activity, ScrapeBatch, Quote, QuoteItem, SupplierRfq, RfqItem, RateCard, MessageTemplate, Campaign, OutreachMessage + session table)
- **13 route files** + server.js dashboard route
- **8 service files** (pipeline, scoring, search, gst, pricing, quoteNo, bom, emailService, whatsappService, templateEngine, campaignRunner)
