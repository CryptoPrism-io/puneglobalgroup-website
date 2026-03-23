# Outreach CRM — Module C: Outreach Engine (Email + WhatsApp)

**Date:** 2026-03-23
**Status:** Approved
**Module:** C of 3 (A: Lead DB [done] → B: Quote Generator [done] → C: Outreach Engine)

---

## Overview

Email and WhatsApp outreach system for Pune Global Group's CRM. Supports ad-hoc sends from lead detail, reusable message templates with variable substitution, and batch campaigns to filtered lead lists. Email via Resend (free tier, 3K/mo), WhatsApp via Baileys (lightweight, no browser). Includes delivery tracking for email (Resend webhooks) and rate-limited sending for WhatsApp.

## Volume & Constraints

- Less than 500 emails/month (Resend free tier: 3,000/mo)
- Less than 500 WhatsApp messages/month
- Single user (Yogesh/Umesh)
- Professional domain: puneglobalgroup.in (mailboxes exist)
- WhatsApp: start with personal SIM, migrate to dedicated SIM later
- Baileys ban risk mitigated via rate limiting (15-20s delays, 20/batch, 10-min cooldowns)

## Tech Stack

Same as Modules A & B, plus:

| Layer | Technology |
|-------|-----------|
| Email | Resend (`resend` npm package) |
| WhatsApp | Baileys (`@whiskeysockets/baileys`) |
| Template engine | Custom variable substitution (EJS-style `{{var}}`) |
| Rate limiting | In-process delays (setTimeout), no external queue needed at this volume |

## Data Model

### MessageTemplate

```prisma
model MessageTemplate {
  id              Int       @id @default(autoincrement())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  name            String    // "Stock Update — FBB", "Diwali Greeting 2026"
  channel         String    // EMAIL, WHATSAPP, BOTH
  category        String    // STOCK_UPDATE, QUOTE_FOLLOWUP, COLD_INTRO, FESTIVE, QUALITY_EDUCATION, CUSTOM
  subject         String?   // Email subject line (with {{variables}}), null for WhatsApp-only
  body            String    // Message body with {{lead.companyName}}, {{contact.name}}, etc.
  attachmentType  String    @default("NONE") // NONE, IMAGE, PDF, QUOTE_PDF
  isActive        Boolean   @default(true)

  campaigns       Campaign[]
  messages        OutreachMessage[]
}
```

### Campaign

```prisma
model Campaign {
  id              Int       @id @default(autoincrement())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  name            String    // "March PP Stock Update", "Diwali 2026 Greetings"
  templateId      Int
  template        MessageTemplate @relation(fields: [templateId], references: [id])
  channel         String    // EMAIL, WHATSAPP
  status          String    @default("DRAFT") // DRAFT, SENDING, SENT, PARTIAL
  filters         Json?     // Saved filter criteria: {stage, icpType, industry, city, tags}
  excludedLeadIds Json?     // Lead IDs manually deselected from filtered list

  totalRecipients Int       @default(0)
  sentCount       Int       @default(0)
  failedCount     Int       @default(0)

  sentAt          DateTime?
  completedAt     DateTime?

  messages        OutreachMessage[]
}
```

### OutreachMessage

```prisma
model OutreachMessage {
  id              Int       @id @default(autoincrement())
  createdAt       DateTime  @default(now())

  campaignId      Int?
  campaign        Campaign? @relation(fields: [campaignId], references: [id], onDelete: SetNull)

  leadId          Int
  lead            Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)
  contactId       Int?
  contact         Contact?  @relation(fields: [contactId], references: [id], onDelete: SetNull)

  channel         String    // EMAIL, WHATSAPP
  templateId      Int?
  template        MessageTemplate? @relation(fields: [templateId], references: [id], onDelete: SetNull)

  subject         String?   // Rendered subject (email only)
  body            String    // Rendered body
  status          String    @default("QUEUED") // QUEUED, SENT, DELIVERED, READ, FAILED
  sentAt          DateTime?
  deliveredAt     DateTime?
  readAt          DateTime?
  errorMessage    String?

  resendEmailId   String?   // Resend's ID for tracking
  trackingData    Json?     // {opens: [{at, ip}], clicks: [{at, url}]}
}
```

### WhatsAppSession

```prisma
model WhatsAppSession {
  id              Int       @id @default(autoincrement())
  key             String    @unique
  data            String    // JSON string — Baileys auth state (can be large)
  updatedAt       DateTime  @updatedAt
}
```

### Lead & Contact Relation Updates

Add to Lead model:
```prisma
  outreachMessages OutreachMessage[]
```

Add to Contact model:
```prisma
  outreachMessages OutreachMessage[]
```

## Services

### emailService.js

```
sendEmail(to, subject, html, attachments?)
  → { id, status } (Resend response)

  Uses: const { Resend } = require('resend');
  From address: sales@puneglobalgroup.in (after domain verification in Resend dashboard)
  Env var: RESEND_API_KEY
```

### whatsappService.js

```
initSession(prisma)
  → Connects to WhatsApp via Baileys, generates QR code if needed
  → Auth state stored/loaded from WhatsAppSession DB table
  → Returns socket instance

sendMessage(socket, phone, text)
  → Send text message to phone number (with country code +91)

sendMedia(socket, phone, buffer, mimetype, caption)
  → Send image/PDF with caption

isConnected(socket)
  → boolean

getQrCode()
  → Returns current QR code data URL for pairing (if not yet paired)

disconnect(socket)
  → Clean disconnect
```

**Rate limiting strategy:**
- Random delay 15-20 seconds between messages
- Max 20 messages per batch, then 10-minute cooldown
- At 500 msgs/month (~17/day), this means ~5-6 minutes of sending per day
- Implemented via async sleep between sends, not external queue

**Session persistence:**
- Baileys auth state (creds + keys) stored in WhatsAppSession table
- On server restart, session is restored from DB — no re-scan needed
- If session expires, user re-scans QR from `/whatsapp/status` page

### templateEngine.js

```
renderTemplate(templateBody, context)
  → Replaces {{lead.companyName}}, {{contact.name}}, {{quote.quoteNo}}, etc.
  → Context object: { lead, contact, quote?, custom? }
  → Returns rendered string

  Supported variables:
    {{lead.companyName}}, {{lead.city}}, {{lead.industry}}, {{lead.state}}
    {{contact.name}}, {{contact.designation}}, {{contact.phone}}
    {{quote.quoteNo}}, {{quote.grandTotal}}, {{quote.validUntil}}
    {{sender.name}} (hardcoded: "Pune Global Group")
    {{sender.phone}} (from env)
    {{today}} (formatted date)
    {{custom.KEY}} (ad-hoc variables passed at send time)
```

### campaignRunner.js

```
executeCampaign(prisma, campaignId, socket?)
  → Loads campaign with template and filters
  → Queries leads matching filters, excludes excludedLeadIds
  → For each lead: find primary contact → render template → send → create OutreachMessage → update counts
  → Updates campaign status: SENDING → SENT (all succeeded) or PARTIAL (some failed)
  → Returns { sent, failed, total }

  Uses buildFilterQuery from search service for filter application.
  Respects rate limits per channel.
```

## Routes

### Templates

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/templates` | List all templates, filterable by channel/category |
| GET | `/templates/new` | Create template form |
| POST | `/templates` | Save template |
| GET | `/templates/:id/edit` | Edit template form |
| POST | `/templates/:id` | Update template |
| POST | `/templates/:id/delete` | Delete template |

### Campaigns

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/campaigns` | List campaigns with stats (sent/failed/total) |
| GET | `/campaigns/new` | New campaign wizard: pick template → set filters → preview recipients |
| POST | `/campaigns` | Create campaign (DRAFT) |
| GET | `/campaigns/:id` | Campaign detail — stats, message-by-message status |
| POST | `/campaigns/:id/send` | Execute campaign (start sending) |
| GET | `/campaigns/:id/recipients` | AJAX endpoint — preview recipients for filter+exclusions |

### Ad-hoc Send

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/outreach/send` | Send single message from lead detail page |

Request body: `{ leadId, contactId, channel, templateId?, subject?, body?, attachmentQuoteId? }`

Creates OutreachMessage + Activity record.

### WhatsApp Management

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/whatsapp/status` | QR code page / connection status / phone number |
| POST | `/whatsapp/disconnect` | Disconnect and clear session |

### Webhooks

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/webhooks/resend` | Resend delivery/open/click/bounce events → update OutreachMessage status |

Resend sends webhook POSTs with:
```json
{
  "type": "email.delivered" | "email.opened" | "email.clicked" | "email.bounced",
  "data": { "email_id": "...", "to": "...", ... }
}
```
Match on `resendEmailId` to update OutreachMessage.

## UI

### Lead Detail — Outreach Actions

Add to the lead detail page header area:
- "Send Email" button → opens inline form/section
- "Send WhatsApp" button → opens inline form/section

The send form:
- Template dropdown (filtered by channel) or "Custom message" option
- If template: shows rendered preview with lead's actual data
- If custom: subject (email) + body textarea
- Contact dropdown (from lead's contacts)
- Optional: attach quote PDF (dropdown of lead's quotes)
- "Send" button

Outreach history visible in Activity tab (types: EMAIL_SENT, WHATSAPP_SENT).

### Templates Page

- List view with filters: channel (EMAIL/WHATSAPP/BOTH), category
- Each template shows: name, channel badge, category badge, preview snippet, active toggle
- Form: name, channel (radio), category (dropdown), subject (email only), body (textarea with variable hints), attachment type (dropdown)
- Variable reference shown beside body field: `{{lead.companyName}}`, `{{contact.name}}`, etc.

### Campaigns Page

**List view:**
- Table: Name | Template | Channel | Status badge | Recipients | Sent | Failed | Date | Actions

**New campaign wizard (single page form):**
1. **Template selection:** dropdown of active templates for chosen channel
2. **Channel:** EMAIL or WHATSAPP (radio)
3. **Filters:** stage, ICP, industry, city, tags (same dropdowns as leads page)
4. **Recipient preview:** table of matching leads with checkboxes (all checked by default). Deselect to exclude.
5. **Campaign name:** auto-generated from template name + date, editable
6. **"Create & Send" button** — creates campaign and immediately starts sending

**Campaign detail:**
- Header: name, template, channel, status badge
- Progress: sent / total, failed count
- Message table: Lead name | Contact | Status (QUEUED/SENT/DELIVERED/READ/FAILED) | Sent At | Error

### WhatsApp Status Page

- If not connected: shows QR code image (auto-refreshes every 30s via meta refresh or JS polling)
- If connected: shows "Connected as +91XXXXXXXXXX", last active timestamp
- Disconnect button

### Nav Bar Update

Add between existing nav items:
```
Dashboard | Leads, Contacts | Quotes, RFQs | Rate Card | Templates, Campaigns | WhatsApp | Scrape Log, Analytics
```

## Environment Variables (new)

```
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=sales@puneglobalgroup.in
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
SENDER_NAME=Pune Global Group
SENDER_PHONE=+919XXXXXXXXX
```

## Integration with Modules A & B

- OutreachMessage.leadId → Lead (FK)
- OutreachMessage.contactId → Contact (FK)
- Every send creates an Activity record (type: EMAIL_SENT or WHATSAPP_SENT)
- Quote follow-up templates reference quote data via `{{quote.quoteNo}}`, `{{quote.grandTotal}}`
- Quote PDF attachment: render PDF via existing Puppeteer route, attach buffer to email
- Campaign filters reuse `buildFilterQuery` from `src/services/search.js`
- Resend webhook updates OutreachMessage status for email tracking

## Resend Domain Setup (prerequisite)

Before the app can send emails:
1. Add domain `puneglobalgroup.in` in Resend dashboard
2. Add DNS records (SPF, DKIM, DMARC) provided by Resend
3. Verify domain
4. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in `.env`

This is a one-time manual step, not part of the app code.

## File Structure (new files)

```
outreach/
├── src/
│   ├── routes/
│   │   ├── templates.js       (NEW)
│   │   ├── campaigns.js       (NEW)
│   │   ├── outreach.js        (NEW — ad-hoc send)
│   │   ├── whatsapp.js        (NEW)
│   │   └── webhooks.js        (NEW)
│   └── services/
│       ├── emailService.js    (NEW)
│       ├── whatsappService.js (NEW)
│       ├── templateEngine.js  (NEW)
│       └── campaignRunner.js  (NEW)
├── views/
│   ├── templates/
│   │   ├── index.ejs          (NEW)
│   │   └── form.ejs           (NEW)
│   ├── campaigns/
│   │   ├── index.ejs          (NEW)
│   │   ├── new.ejs            (NEW)
│   │   └── detail.ejs         (NEW)
│   └── whatsapp/
│       └── status.ejs         (NEW)
├── prisma/
│   └── schema.prisma          (MODIFY — add 4 new models + relations)
└── server.js                  (MODIFY — mount 5 new routers, update nav)
```

## Deferred (not in Module C)

- SPIN/MEDDIC guided workflow prompts
- DISC assessment questionnaire
- Visual creative design tool for one-pagers (templates are text/HTML, not visual)
- Campaign scheduling (all campaigns send immediately for now)
- Auto follow-up sequences
- Email subdomain isolation (outreach.puneglobalgroup.in — can add later)
