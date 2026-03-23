# CLAUDE.md — Outreach CRM

## Project

Pune Global Group Outreach CRM — lead management and sales pipeline for Paper & Board (local Pune) and PP Corrugated (pan-India) verticals.

## Commands

```bash
npm run dev          # Express dev server on localhost:3001 (nodemon)
npm start            # Production: node server.js
```

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
| src/routes/scrapeBatches.js | Scrape session log |
| src/routes/analytics.js | Pipeline, source, ICP stats |
| src/services/pipeline.js | Stage validation, transition logic |
| src/services/scoring.js | ICP fit score computation |
| src/services/search.js | Filter query builder |
| views/leads/detail.ejs | Lead detail with tabs (Info/Contacts/Activity/Sales Intel) |

## Database

Shared PostgreSQL instance. Database name: `outreach`.

Run migrations: `npx prisma migrate dev`

## Scraping Workflow (Claude Code)

Leads are NOT scraped by the app. Use Claude Code terminal sessions to scrape and INSERT:

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
packaging. Extract buyer org, tender details, contact info. Insert as ICP=PP, source=GEM."

# LinkedIn — PP leads
"Search LinkedIn for Purchase Managers / Packaging Heads at automotive / pharma
companies in India with 50-500 employees. Insert as ICP=PP, source=LINKEDIN."
```

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
