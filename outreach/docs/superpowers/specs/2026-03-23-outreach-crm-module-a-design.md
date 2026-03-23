# Outreach CRM — Module A: Lead Database & Pipeline

**Date:** 2026-03-23
**Status:** Approved
**Module:** A of 3 (A: Lead DB → B: Quote Generator + RFQ → C: Outreach Engine)

---

## Overview

A CRM application for Pune Global Group to store, track, and manage sales leads across two product verticals (Paper & Board trading, PP Corrugated manufacturing). Leads are scraped via Claude Code terminal sessions and stored in PostgreSQL. The app provides pipeline tracking, filtering, search, DISC profiling, and sales methodology fields.

## Business Context

**Pune Global Group** (Est. 1995) is an industrial packaging company in Pune operating two verticals:

### Vertical 1: Paper & Board Trading
- **Products:** ITC PSPD & TNPL grades (FBB, duplex, kraft liner, test liner, white top kraft), 40+ grades in stock
- **Services:** Synchro sheeting (±0.5mm), guillotine sheeting, slitting, rewinding — 50T/day capacity
- **Target customers:** Corrugators, box makers, printers/converters
- **Geography:** Pune + neighbouring cities only
- **ICP size:** <10Cr revenue, 5–50 employees

### Vertical 2: PP Corrugated Manufacturing
- **Products:** 7 families, 20+ variants — boxes (6 closure types), separators, layer pads, trays (5 types), bins (4 types), flooring sheets
- **Key specs:** ±1mm tolerance, 50–500 trip reuse, ESD/FDA/GMP variants
- **Target customers:** Automotive OEMs/Tier-1, pharma, electronics, FMCG manufacturers
- **Geography:** Pan-India (21 states)
- **ICP size:** 50–500 employees
- **Reference clients:** Volkswagen, GM, Mitsubishi, Sun Pharma, Cipla, Asian Paints

### Lead Sources
- Google Search
- LinkedIn
- IndiaMART
- GeM (Government e-Marketplace)
- MEITY (Ministry of Electronics & IT)
- Referrals / Manual entry

### Scraping Model
Claude Code IS the scraper. No automated cron jobs or API services. User opens Claude Code, gives search criteria, Claude uses browser tools + web search to find and extract leads, then INSERTs directly into the database via Prisma. Each session is logged as a ScrapeBatch.

## Tech Stack

Mirrors the invoicer app — sibling project, same patterns:

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Templating | EJS (server-rendered) |
| ORM | Prisma 7.x |
| Database | PostgreSQL 15 (shared instance with invoicer) |
| Auth | Master password (bcrypt hash in .env) |
| Sessions | express-session + connect-pg-simple |
| Styling | Plain CSS (design tokens, no Tailwind) |

## Data Model

### Lead

The core entity — one row per company.

```prisma
model Lead {
  id                    Int       @id @default(autoincrement())
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // ── Company Info ──
  companyName           String
  industry              String?   // automotive, pharma, fmcg, electronics, engineering, printing, corrugator, packaging, other
  city                  String?
  state                 String?
  pincode               String?
  address               String?
  website               String?
  gstin                 String?
  employeeCount         Int?
  estimatedRevenue      String?   // "<1Cr", "1-5Cr", "5-10Cr", "10-50Cr", "50-100Cr", "100Cr+"
  yearEstablished       Int?

  // ── ICP Classification ──
  icpType               String    @default("UNKNOWN") // PAPER, PP, BOTH, UNKNOWN
  productFit            Json?     // ["FBB", "kraft-liner", "pp-tray-esd", "pp-box-collapsible", ...]
  fitScore              Int?      // 1-10
  fitNotes              String?

  // ── Pipeline ──
  stage                 String    @default("NEW") // NEW, RESEARCHED, CONTACTED, QUALIFIED, QUOTED, WON, LOST, DORMANT
  stageChangedAt        DateTime  @default(now())
  lostReason            String?

  // ── Source ──
  source                String    @default("MANUAL") // GOOGLE, LINKEDIN, INDIAMART, GEM, MEITY, REFERRAL, MANUAL
  sourceUrl             String?
  scrapedAt             DateTime?
  scrapeBatchId         Int?

  // ── Business Intelligence ──
  currentPackaging      String?   // what they use now
  currentSupplier       String?   // known competitor supplying them
  estimatedMonthlyVolume String?  // "5-10 tonnes paper", "200 PP boxes/mo"
  painPoints            String?   // packaging problems they likely face
  opportunities         String?   // where PGG can add value

  // ── DISC Profile ──
  discType              String?   // D, I, S, C (primary type of decision maker)
  discNotes             String?

  // ── Sales Methodology ──
  spinSituation         String?   // current situation
  spinProblem           String?   // problems identified
  spinImplication        String?   // implications of not solving
  spinNeedPayoff        String?   // value of solving

  meddic                Json?     // { metrics, economicBuyer, decisionCriteria, decisionProcess, identifyPain, champion }

  growGoal              String?   // what they want to achieve
  growReality           String?   // where they are now
  growOptions           String?   // options we've discussed
  growWill              String?   // committed next steps

  // ── General ──
  notes                 String?
  tags                  Json?     // ["hot", "follow-up", "visited-factory", ...]
  isArchived            Boolean   @default(false)

  // ── Relations ──
  contacts              Contact[]
  activities            Activity[]
  scrapeBatch           ScrapeBatch? @relation(fields: [scrapeBatchId], references: [id])
}
```

### Contact

Multiple people per lead.

```prisma
model Contact {
  id            Int       @id @default(autoincrement())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  leadId        Int
  lead          Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)

  name          String
  designation   String?   // MD, Purchase Manager, Packaging Head, etc.
  department    String?   // Purchase, Production, Packaging, Management
  phone         String?
  email         String?
  whatsapp      String?
  linkedinUrl   String?
  isPrimary     Boolean   @default(false)
  discType      String?   // individual DISC type
  notes         String?
}
```

### Activity

Timeline of all interactions with a lead.

```prisma
model Activity {
  id            Int       @id @default(autoincrement())
  createdAt     DateTime  @default(now())

  leadId        Int
  lead          Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)

  contactId     Int?      // optional — which contact was this with
  type          String    // NOTE, CALL, EMAIL_SENT, EMAIL_RECEIVED, WHATSAPP, MEETING, SITE_VISIT, QUOTE_SENT, RFQ_RECEIVED, SAMPLE_SENT, STAGE_CHANGE, SCRAPE
  subject       String    // short summary
  body          String?   // details
}
```

### ScrapeBatch

Tracks each Claude Code scraping session.

```prisma
model ScrapeBatch {
  id            Int       @id @default(autoincrement())
  createdAt     DateTime  @default(now())

  source        String    // GOOGLE, LINKEDIN, INDIAMART, GEM, MEITY
  query         String    // search terms used
  leadsFound    Int       @default(0)
  leadsNew      Int       @default(0) // how many were new (not duplicates)
  notes         String?

  leads         Lead[]
}
```

### Tag (optional — for structured tagging)

```prisma
model Tag {
  id            Int       @id @default(autoincrement())
  name          String    @unique // "hot", "follow-up", "sample-sent", "price-sensitive"
  color         String?   // hex for UI display
}
```

## Routes & Views

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/` | Dashboard — pipeline funnel, KPIs, recent activity, follow-up reminders |
| GET | `/leads` | Lead table — filterable by stage, ICP, source, industry, city, tags; search by company name; toggle kanban view |
| GET | `/leads/new` | New lead form |
| POST | `/leads` | Create lead |
| GET | `/leads/:id` | Lead detail — tabbed: Info / Contacts / Activity / Sales Intel |
| POST | `/leads/:id` | Update lead |
| POST | `/leads/:id/stage` | Change stage (auto-creates Activity) |
| POST | `/leads/:id/archive` | Soft-archive a lead |
| GET | `/contacts` | Contact directory — all contacts, searchable, linked to leads |
| GET | `/contacts/new?leadId=X` | New contact form (pre-linked to lead) |
| POST | `/contacts` | Create contact |
| GET | `/contacts/:id` | Edit contact |
| POST | `/contacts/:id` | Update contact |
| POST | `/activities` | Log an activity (note, call, email, etc.) |
| GET | `/scrape-batches` | Scrape session history |
| GET | `/analytics` | Pipeline analytics — conversion rates, stage durations, source effectiveness |

## Dashboard KPIs

- **Pipeline funnel:** Count of leads at each stage (NEW → WON), with conversion % between stages
- **Leads by ICP:** PAPER vs PP vs BOTH breakdown
- **Leads by source:** Which source is producing the most/best leads
- **Hot leads:** Leads with fitScore >= 7 that haven't been contacted
- **Stale leads:** Leads stuck in a stage for >14 days
- **Recent activity:** Last 20 activities across all leads
- **This week's follow-ups:** Leads tagged for follow-up

## UI Design

### Layout
- Same as invoicer: top nav bar, flash messages, cream/navy/saffron palette
- Lead table is the primary view — dense, sortable, with inline stage badges
- Lead detail is the workhorse page — everything on one page with tab sections

### Lead Table Columns
Company Name | Industry | City | ICP | Stage (badge) | Fit Score | Source | Last Activity | Actions

### Lead Detail Tabs
1. **Info** — company details, ICP classification, fit score, editable form
2. **Contacts** — table of people at this company, add/edit/remove
3. **Activity** — chronological timeline, add new activity form at top
4. **Sales Intel** — DISC profile, SPIN fields, MEDDIC JSON editor, GROW fields
5. **Notes & Tags** — free text notes, tag management

### Stage Badges (color-coded)
- NEW (grey)
- RESEARCHED (blue)
- CONTACTED (yellow)
- QUALIFIED (orange)
- QUOTED (purple)
- WON (green)
- LOST (red)
- DORMANT (dark grey)

## Services

### pipeline.js
- `changeStage(leadId, newStage, notes)` — validates transition, updates lead, creates Activity record
- `getStaleLeads(daysSinceStageChange)` — finds leads stuck in a stage
- Valid transitions: NEW→RESEARCHED→CONTACTED→QUALIFIED→QUOTED→WON/LOST, any→DORMANT, DORMANT→any

### scoring.js
- `computeFitScore(lead)` — based on industry match, employee count, geography, revenue range
- Paper ICP: Pune/neighbouring + <10Cr + 5-50 employees + corrugator/printer/box-maker = high score
- PP ICP: any India + 50-500 employees + automotive/pharma/electronics/FMCG = high score

### search.js
- `buildFilterQuery(filters)` — converts URL query params to Prisma where clause
- Supports: stage, icpType, source, industry, city, state, tags, fitScore range, search text
- Full-text search on companyName, notes, painPoints, opportunities

## File Structure

```
outreach/
├── server.js
├── package.json
├── .env / .env.example
├── CLAUDE.md
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
├── src/
│   ├── routes/
│   │   ├── leads.js
│   │   ├── contacts.js
│   │   ├── activities.js
│   │   ├── scrapeBatches.js
│   │   └── analytics.js
│   ├── services/
│   │   ├── pipeline.js
│   │   ├── scoring.js
│   │   └── search.js
│   └── middleware/
│       └── auth.js
├── views/
│   ├── layout.ejs
│   ├── dashboard-body.ejs
│   ├── leads/
│   │   ├── index.ejs
│   │   ├── detail.ejs
│   │   └── form.ejs
│   ├── contacts/
│   │   ├── index.ejs
│   │   └── form.ejs
│   ├── activities/
│   │   └── form-partial.ejs
│   ├── scrape-batches/
│   │   └── index.ejs
│   └── analytics/
│       └── index.ejs
└── public/
    └── style.css
```

## Claude Code Scraping Workflow

Not part of the app code. This is the operational workflow:

### Standard Scraping Prompts (to be saved in CLAUDE.md)

```
# IndiaMART — PP leads
"Search IndiaMART for companies buying corrugated PP boxes / returnable packaging
in [city/state]. Extract company name, contact person, phone, email, city, industry.
Insert into the outreach database as ICP=PP, source=INDIAMART."

# Google — Paper leads
"Search Google for 'corrugated box manufacturers Pune' / 'packaging companies Pune'.
Visit top results, extract company details. Insert as ICP=PAPER, source=GOOGLE."

# GeM — PP leads
"Search GeM portal for tenders related to PP corrugated packaging / returnable
packaging / polypropylene boxes. Extract buyer org, tender details, contact info.
Insert as ICP=PP, source=GEM."

# LinkedIn — PP leads
"Search LinkedIn for Purchase Managers / Packaging Heads at automotive / pharma
companies in India with 50-500 employees. Extract company name, person name,
designation, company industry. Insert as ICP=PP, source=LINKEDIN."
```

### Deduplication
Claude Code checks `companyName` + `city` before inserting. If a match exists, enriches the existing record instead of creating a duplicate.

## Deferred to Module B
- Quote Generator (size inputs → auto-calculate pricing)
- Quotation PDF generation and sending
- Supplier RFQ management

## Deferred to Module C
- Email outreach (templates, scheduling, tracking)
- WhatsApp outreach (API integration)
- Daily stock creative one-pagers
- Weekly outreach campaigns
- Festive outreach campaigns
- SPIN/GROW/MEDDIC structured workflows and guided prompts
- DISC assessment questionnaire

## Non-Functional Requirements
- Single-user power interface (Yogesh/Umesh)
- Same deployment pattern as invoicer (local dev → Cloud Run)
- Shared PostgreSQL instance with invoicer
- Master password auth (bcrypt)
- Mobile-responsive (but desktop-first)
