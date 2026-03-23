# Outreach Engine (Email + WhatsApp) — Module C Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email (Resend) and WhatsApp (Baileys) outreach to the CRM — ad-hoc sends from lead detail, reusable message templates, and batch campaigns to filtered lead lists.

**Architecture:** Extends the existing outreach Express+EJS+Prisma app. Four new services (email, WhatsApp, template engine, campaign runner), five new route files, Prisma models for templates/campaigns/messages/sessions. Email tracking via Resend webhooks. WhatsApp rate-limited via in-process delays.

**Tech Stack:** Express 5, EJS, Prisma 7.x, PostgreSQL, `resend` npm, `@whiskeysockets/baileys` npm, `qrcode` npm (for QR display).

**Spec:** `outreach/docs/superpowers/specs/2026-03-23-outreach-engine-module-c-design.md`

---

### Task 1: Install Dependencies

**Files:**
- Modify: `outreach/package.json`

- [ ] **Step 1: Install new packages**

```bash
cd C:/cpio_db/puneglobalgroup-website/outreach
npm install resend@^4 @whiskeysockets/baileys@^6 qrcode@^1 link-preview-js@^3 pino@^9
```

Notes:
- `resend` — email API client
- `@whiskeysockets/baileys` — WhatsApp Web protocol (no browser)
- `qrcode` — generate QR code data URLs for WhatsApp pairing
- `pino` — logger required by Baileys
- `link-preview-js` — peer dependency of Baileys

- [ ] **Step 2: Add new env vars to .env.example**

Append to `.env.example`:
```
# Resend (Email)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=sales@puneglobalgroup.in
RESEND_WEBHOOK_SECRET=

# Sender info
SENDER_NAME=Pune Global Group
SENDER_PHONE=+919XXXXXXXXX
```

Copy new vars to `.env` with placeholder values.

- [ ] **Step 3: Commit**

```bash
cd C:/cpio_db/puneglobalgroup-website
git add outreach/package.json outreach/package-lock.json outreach/.env.example
git commit -m "feat(outreach): add resend, baileys, qrcode dependencies for Module C

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Prisma Schema — Add Templates, Campaigns, Messages, WhatsApp Session

**Files:**
- Modify: `outreach/prisma/schema.prisma`

- [ ] **Step 1: Add new models to schema.prisma**

Add after existing models:

```prisma
model MessageTemplate {
  id              Int       @id @default(autoincrement())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  name            String
  channel         String    // EMAIL, WHATSAPP, BOTH
  category        String    // STOCK_UPDATE, QUOTE_FOLLOWUP, COLD_INTRO, FESTIVE, QUALITY_EDUCATION, CUSTOM
  subject         String?
  body            String
  attachmentType  String    @default("NONE")
  isActive        Boolean   @default(true)
  campaigns       Campaign[]
  messages        OutreachMessage[]
}

model Campaign {
  id              Int       @id @default(autoincrement())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  name            String
  templateId      Int
  template        MessageTemplate @relation(fields: [templateId], references: [id])
  channel         String
  status          String    @default("DRAFT")
  filters         Json?
  excludedLeadIds Json?
  totalRecipients Int       @default(0)
  sentCount       Int       @default(0)
  failedCount     Int       @default(0)
  sentAt          DateTime?
  completedAt     DateTime?
  messages        OutreachMessage[]
}

model OutreachMessage {
  id              Int       @id @default(autoincrement())
  createdAt       DateTime  @default(now())
  campaignId      Int?
  campaign        Campaign? @relation(fields: [campaignId], references: [id], onDelete: SetNull)
  leadId          Int
  lead            Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)
  contactId       Int?
  contact         Contact?  @relation(fields: [contactId], references: [id], onDelete: SetNull)
  channel         String
  templateId      Int?
  template        MessageTemplate? @relation(fields: [templateId], references: [id], onDelete: SetNull)
  subject         String?
  body            String
  status          String    @default("QUEUED")
  sentAt          DateTime?
  deliveredAt     DateTime?
  readAt          DateTime?
  errorMessage    String?
  resendEmailId   String?
  trackingData    Json?
}

```

Note: WhatsApp auth uses file-based storage (`wa-auth/` directory via Baileys' `useMultiFileAuthState`), not a DB model. This is simpler for single-user and avoids serializing large binary auth state into PostgreSQL. The `WhatsAppSession` model from the spec is intentionally omitted — file-based auth is sufficient.

Add relation fields to existing models:

In `Lead` model add: `outreachMessages OutreachMessage[]`
In `Contact` model add: `outreachMessages OutreachMessage[]`

- [ ] **Step 2: Run migration**

```bash
cd C:/cpio_db/puneglobalgroup-website/outreach
npx prisma migrate dev --name add_outreach_models
```

- [ ] **Step 3: Create view directories**

```bash
mkdir -p views/templates views/campaigns views/whatsapp
```

- [ ] **Step 4: Commit**

```bash
cd C:/cpio_db/puneglobalgroup-website
git add outreach/prisma/
git commit -m "feat(outreach): add MessageTemplate, Campaign, OutreachMessage, WhatsAppSession models

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Services — Email, WhatsApp, Template Engine, Campaign Runner

**Files:**
- Create: `outreach/src/services/emailService.js`
- Create: `outreach/src/services/whatsappService.js`
- Create: `outreach/src/services/templateEngine.js`
- Create: `outreach/src/services/campaignRunner.js`

- [ ] **Step 1: Create src/services/templateEngine.js**

```javascript
/**
 * Template variable substitution engine.
 * Replaces {{lead.companyName}}, {{contact.name}}, etc. with actual values.
 */

function renderTemplate(templateStr, context) {
  if (!templateStr) return '';
  const { lead, contact, quote, custom } = context || {};

  return templateStr.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const parts = path.split('.');
    let value;

    switch (parts[0]) {
      case 'lead':
        value = lead ? lead[parts[1]] : null;
        break;
      case 'contact':
        value = contact ? contact[parts[1]] : null;
        break;
      case 'quote':
        value = quote ? quote[parts[1]] : null;
        if (parts[1] === 'grandTotal' && value) {
          value = '₹' + Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 });
        }
        if (parts[1] === 'validUntil' && value) {
          value = new Date(value).toLocaleDateString('en-IN');
        }
        break;
      case 'sender':
        if (parts[1] === 'name') value = process.env.SENDER_NAME || 'Pune Global Group';
        if (parts[1] === 'phone') value = process.env.SENDER_PHONE || '';
        break;
      case 'today':
        value = new Date().toLocaleDateString('en-IN');
        break;
      case 'custom':
        value = custom ? custom[parts[1]] : null;
        break;
      default:
        value = null;
    }

    return value != null ? String(value) : match; // leave unreplaced if no value
  });
}

module.exports = { renderTemplate };
```

- [ ] **Step 2: Create src/services/emailService.js**

```javascript
/**
 * Email sending via Resend API.
 */

const { Resend } = require('resend');

let resendClient = null;

function getClient() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

/**
 * Send an email via Resend.
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - HTML body
 * @param {Array} attachments - optional [{filename, content (Buffer)}]
 * @returns {Object} { id, error }
 */
async function sendEmail(to, subject, html, attachments) {
  try {
    const resend = getClient();
    const payload = {
      from: process.env.RESEND_FROM_EMAIL || 'noreply@puneglobalgroup.in',
      to,
      subject,
      html,
    };
    if (attachments && attachments.length > 0) {
      payload.attachments = attachments.map(a => ({
        filename: a.filename,
        content: a.content, // Buffer
      }));
    }
    const { data, error } = await resend.emails.send(payload);
    if (error) {
      return { id: null, error: error.message || JSON.stringify(error) };
    }
    return { id: data.id, error: null };
  } catch (err) {
    return { id: null, error: err.message };
  }
}

module.exports = { sendEmail };
```

- [ ] **Step 3: Create src/services/whatsappService.js**

```javascript
/**
 * WhatsApp messaging via Baileys.
 * Session state stored in PostgreSQL (WhatsAppSession table).
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');

let socket = null;
let currentQR = null;
let connectionStatus = 'disconnected'; // disconnected, connecting, connected

/**
 * Initialize WhatsApp connection.
 * Uses file-based auth state (simpler than DB for single-user).
 * Auth files stored in outreach/.wwebjs_auth/
 */
async function initSession(authDir) {
  const dir = authDir || './wa-auth';
  const { state, saveCreds } = await useMultiFileAuthState(dir);

  const logger = pino({ level: 'silent' });

  socket = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    logger,
    printQRInTerminal: false,
  });

  // QR code event
  socket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      currentQR = await QRCode.toDataURL(qr);
      connectionStatus = 'connecting';
    }

    if (connection === 'open') {
      currentQR = null;
      connectionStatus = 'connected';
      console.log('✓ WhatsApp connected');
    }

    if (connection === 'close') {
      connectionStatus = 'disconnected';
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        // Auto-reconnect on non-logout disconnects
        console.log('WhatsApp disconnected, reconnecting...');
        await initSession(authDir);
      } else {
        console.log('WhatsApp logged out');
        socket = null;
      }
    }
  });

  // Save credentials on update
  socket.ev.on('creds.update', saveCreds);

  return socket;
}

/**
 * Send a text message.
 * @param {string} phone - phone number with country code (e.g., "919876543210")
 * @param {string} text - message text
 */
async function sendMessage(phone, text) {
  if (!socket || connectionStatus !== 'connected') {
    throw new Error('WhatsApp not connected');
  }
  const jid = phone.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  await socket.sendMessage(jid, { text });
}

/**
 * Send media (image/PDF) with caption.
 * @param {string} phone
 * @param {Buffer} buffer - file content
 * @param {string} mimetype - e.g., 'image/jpeg', 'application/pdf'
 * @param {string} filename
 * @param {string} caption
 */
async function sendMedia(phone, buffer, mimetype, filename, caption) {
  if (!socket || connectionStatus !== 'connected') {
    throw new Error('WhatsApp not connected');
  }
  const jid = phone.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  if (mimetype.startsWith('image/')) {
    await socket.sendMessage(jid, { image: buffer, caption: caption || '' });
  } else {
    await socket.sendMessage(jid, {
      document: buffer,
      mimetype,
      fileName: filename,
      caption: caption || '',
    });
  }
}

function isConnected() {
  return connectionStatus === 'connected';
}

function getQrCode() {
  return currentQR;
}

function getStatus() {
  return connectionStatus;
}

async function disconnect() {
  if (socket) {
    await socket.logout();
    socket = null;
    connectionStatus = 'disconnected';
    currentQR = null;
  }
}

function getSocket() {
  return socket;
}

module.exports = {
  initSession,
  sendMessage,
  sendMedia,
  isConnected,
  getQrCode,
  getStatus,
  disconnect,
  getSocket,
};
```

- [ ] **Step 4: Create src/services/campaignRunner.js**

```javascript
/**
 * Campaign execution engine.
 * Sends messages to filtered leads with rate limiting.
 */

const { renderTemplate } = require('./templateEngine');
const { sendEmail } = require('./emailService');
const { sendMessage: sendWhatsApp, isConnected } = require('./whatsappService');
const { buildFilterQuery } = require('./search');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

/**
 * Execute a campaign — send to all matching leads.
 */
async function executeCampaign(prisma, campaignId) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { template: true },
  });
  if (!campaign || campaign.status !== 'DRAFT') {
    throw new Error('Campaign not found or already sent');
  }

  // Build lead query from saved filters
  const filters = campaign.filters || {};
  const where = buildFilterQuery(filters);

  // Exclude manually deselected leads
  const excluded = campaign.excludedLeadIds || [];
  if (excluded.length > 0) {
    where.id = { notIn: excluded };
  }

  // Load leads with primary contacts
  const leads = await prisma.lead.findMany({
    where,
    include: {
      contacts: { where: { isPrimary: true }, take: 1 },
    },
  });

  // Update campaign status
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: 'SENDING',
      totalRecipients: leads.length,
      sentAt: new Date(),
    },
  });

  let sentCount = 0;
  let failedCount = 0;

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const contact = lead.contacts[0] || null;

    // Render template
    const renderedBody = renderTemplate(campaign.template.body, { lead, contact });
    const renderedSubject = campaign.template.subject
      ? renderTemplate(campaign.template.subject, { lead, contact })
      : null;

    let status = 'QUEUED';
    let errorMessage = null;
    let resendEmailId = null;
    let sentAt = null;

    try {
      if (campaign.channel === 'EMAIL') {
        const email = contact?.email || null;
        if (!email) {
          throw new Error('No email address for contact');
        }
        const result = await sendEmail(email, renderedSubject, renderedBody);
        if (result.error) throw new Error(result.error);
        resendEmailId = result.id;
        status = 'SENT';
        sentAt = new Date();
        sentCount++;
      } else if (campaign.channel === 'WHATSAPP') {
        if (!isConnected()) throw new Error('WhatsApp not connected');
        const phone = contact?.whatsapp || contact?.phone || null;
        if (!phone) throw new Error('No phone/WhatsApp number for contact');
        await sendWhatsApp(phone, renderedBody);
        status = 'SENT';
        sentAt = new Date();
        sentCount++;
      }
    } catch (err) {
      status = 'FAILED';
      errorMessage = err.message;
      failedCount++;
    }

    // Create message record
    await prisma.outreachMessage.create({
      data: {
        campaignId,
        leadId: lead.id,
        contactId: contact?.id || null,
        channel: campaign.channel,
        templateId: campaign.templateId,
        subject: renderedSubject,
        body: renderedBody,
        status,
        sentAt,
        errorMessage,
        resendEmailId,
      },
    });

    // Log activity
    if (status === 'SENT') {
      await prisma.activity.create({
        data: {
          leadId: lead.id,
          contactId: contact?.id || null,
          type: campaign.channel === 'EMAIL' ? 'EMAIL_SENT' : 'WHATSAPP_SENT',
          subject: `Campaign: ${campaign.name}`,
          body: renderedSubject || renderedBody.substring(0, 100),
        },
      });
    }

    // Update counts periodically
    if (i % 5 === 0) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { sentCount, failedCount },
      });
    }

    // Rate limiting — delay between messages
    if (i < leads.length - 1) {
      if (campaign.channel === 'WHATSAPP') {
        // WhatsApp: 15-20 second random delay, 10-min pause every 20 messages
        await sleep(randomDelay(15000, 20000));
        if ((i + 1) % 20 === 0) {
          console.log(`WhatsApp batch pause at message ${i + 1}...`);
          await sleep(600000); // 10 minutes
        }
      } else {
        // Email: 500ms between sends (Resend handles rate limiting internally)
        await sleep(500);
      }
    }
  }

  // Final update
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: failedCount === 0 ? 'SENT' : 'PARTIAL',
      sentCount,
      failedCount,
      completedAt: new Date(),
    },
  });

  return { sent: sentCount, failed: failedCount, total: leads.length };
}

module.exports = { executeCampaign };
```

- [ ] **Step 5: Commit**

```bash
cd C:/cpio_db/puneglobalgroup-website
git add outreach/src/services/templateEngine.js outreach/src/services/emailService.js outreach/src/services/whatsappService.js outreach/src/services/campaignRunner.js
git commit -m "feat(outreach): add email, WhatsApp, template engine, and campaign runner services

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Templates Route + Views

**Files:**
- Create: `outreach/src/routes/templates.js`
- Create: `outreach/views/templates/index.ejs`
- Create: `outreach/views/templates/form.ejs`

- [ ] **Step 1: Create src/routes/templates.js**

CRUD routes:
- `GET /templates` — list all, filterable by channel and category
- `GET /templates/new` — create form
- `POST /templates` — save template
- `GET /templates/:id/edit` — edit form
- `POST /templates/:id` — update
- `POST /templates/:id/delete` — delete

Follow existing route pattern (req.app.locals.prisma, ejs.renderFile, res.render('layout')).

- [ ] **Step 2: Create views/templates/index.ejs**

Template listing:
- Filter bar: channel (EMAIL/WHATSAPP/BOTH), category dropdown
- "+ New Template" button
- Table: Name | Channel (badge) | Category (badge) | Subject preview | Active (toggle) | Actions (Edit/Delete)
- Channel badges: badge-email (use badge-pp styling), badge-whatsapp (use badge-won green styling)

- [ ] **Step 3: Create views/templates/form.ejs**

Template form (new/edit):
- Name (text, required)
- Channel (radio: EMAIL, WHATSAPP, BOTH)
- Category (select: STOCK_UPDATE, QUOTE_FOLLOWUP, COLD_INTRO, FESTIVE, QUALITY_EDUCATION, CUSTOM)
- Subject (text — shown only when channel is EMAIL or BOTH)
- Body (textarea, large — with hint text showing available variables)
- Attachment Type (select: NONE, IMAGE, PDF, QUOTE_PDF)
- Active (checkbox)

Variable reference panel beside body field:
```
Available variables:
{{lead.companyName}}, {{lead.city}}, {{lead.industry}}
{{contact.name}}, {{contact.designation}}
{{quote.quoteNo}}, {{quote.grandTotal}}, {{quote.validUntil}}
{{sender.name}}, {{sender.phone}}
{{today}}
```

- [ ] **Step 4: Commit**

```bash
cd C:/cpio_db/puneglobalgroup-website
git add outreach/src/routes/templates.js outreach/views/templates/
git commit -m "feat(outreach): add message templates CRUD route and views

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Campaigns Route + Views

**Files:**
- Create: `outreach/src/routes/campaigns.js`
- Create: `outreach/views/campaigns/index.ejs`
- Create: `outreach/views/campaigns/new.ejs`
- Create: `outreach/views/campaigns/detail.ejs`

- [ ] **Step 1: Create src/routes/campaigns.js**

Routes:
- `GET /campaigns` — list campaigns with stats
- `GET /campaigns/new` — wizard form: pick template, channel, set filters, preview recipients
- `POST /campaigns` — create campaign (DRAFT status)
- `GET /campaigns/:id` — detail with message-by-message status
- `POST /campaigns/:id/send` — execute campaign via `executeCampaign(prisma, campaignId)`
- `GET /campaigns/preview-recipients` — JSON endpoint returning filtered leads for preview (query params for filters)

For the recipients preview endpoint (must be defined BEFORE `/:id` routes):
```javascript
router.get('/preview-recipients', async (req, res) => {
  const prisma = req.app.locals.prisma;
  const filters = req.query;
  const where = buildFilterQuery(filters);
  const leads = await prisma.lead.findMany({
    where,
    include: {
      contacts: { where: { isPrimary: true }, take: 1 },
    },
    orderBy: { companyName: 'asc' },
  });
  // Return slim payload
  res.json(leads.map(l => ({
    id: l.id,
    companyName: l.companyName,
    city: l.city,
    icpType: l.icpType,
    contact: l.contacts[0] || null,
  })));
});
```

The `/campaigns/:id/send` route calls `executeCampaign` — this runs asynchronously (sends in background while redirecting user to detail page). Use a fire-and-forget pattern:
```javascript
router.post('/:id/send', async (req, res) => {
  const { executeCampaign } = require('../services/campaignRunner');
  const id = parseInt(req.params.id);
  // Fire and forget — campaign runs in background
  executeCampaign(req.app.locals.prisma, id)
    .then(result => console.log(`Campaign ${id} complete:`, result))
    .catch(err => console.error(`Campaign ${id} error:`, err));
  res.redirect(`/campaigns/${id}?success=Campaign+sending+started`);
});
```

- [ ] **Step 2: Create views/campaigns/index.ejs**

Campaign listing:
- "+ New Campaign" button
- Table: Name | Template | Channel | Status badge | Recipients | Sent | Failed | Date | Actions (View)
- Status badges reuse existing classes

- [ ] **Step 3: Create views/campaigns/new.ejs**

Campaign creation form — single-page wizard:
1. **Campaign Name** (text, auto-generated suggestion)
2. **Channel** (radio: EMAIL, WHATSAPP)
3. **Template** (select dropdown — filtered by channel, shows template names)
4. **Filters** — reuse lead filter UI: stage, ICP, industry, city dropdowns + search
5. **Recipient Preview** — table with checkboxes (all checked by default). Shows: Lead Name, City, Contact, Email/Phone. Deselect to exclude.
   - Preview loads via JS fetch to `/campaigns/preview-recipients?stage=X&icpType=Y...`
6. **"Create & Send" button** — POSTs to `/campaigns` which creates then redirects, and a "Save as Draft" link

The form saves `filters` as JSON and `excludedLeadIds` as JSON array of unchecked lead IDs.

- [ ] **Step 4: Create views/campaigns/detail.ejs**

Campaign detail:
- Header: name, template name, channel badge, status badge
- Progress bar: sentCount / totalRecipients
- Stats cards: Sent, Failed, Delivered, Read (for email)
- "Send" button (if DRAFT)
- Message table: Lead (link) | Contact | Status badge | Sent At | Error (if failed)
- Auto-refresh meta tag when status is SENDING: `<meta http-equiv="refresh" content="5">` — refreshes every 5 seconds while sending

- [ ] **Step 5: Commit**

```bash
cd C:/cpio_db/puneglobalgroup-website
git add outreach/src/routes/campaigns.js outreach/views/campaigns/
git commit -m "feat(outreach): add campaigns route and views with batch send

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Ad-hoc Send + WhatsApp Status + Webhooks

**Files:**
- Create: `outreach/src/routes/outreach.js`
- Create: `outreach/src/routes/whatsapp.js`
- Create: `outreach/src/routes/webhooks.js`
- Create: `outreach/views/whatsapp/status.ejs`

- [ ] **Step 1: Create src/routes/outreach.js**

Single route for ad-hoc sends from lead detail:

```javascript
const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/emailService');
const { sendMessage: sendWhatsApp, sendMedia, isConnected } = require('../services/whatsappService');
const { renderTemplate } = require('../services/templateEngine');

// POST /outreach/send — send single message from lead detail
router.post('/send', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const { leadId, contactId, channel, templateId, subject, body } = req.body;
    const lead = await prisma.lead.findUnique({ where: { id: parseInt(leadId) } });
    const contact = contactId ? await prisma.contact.findUnique({ where: { id: parseInt(contactId) } }) : null;

    let renderedSubject = subject || '';
    let renderedBody = body || '';

    // If using a template, render it
    if (templateId) {
      const template = await prisma.messageTemplate.findUnique({ where: { id: parseInt(templateId) } });
      if (template) {
        renderedBody = renderTemplate(template.body, { lead, contact });
        renderedSubject = template.subject ? renderTemplate(template.subject, { lead, contact }) : subject;
      }
    } else {
      // Freeform — still render variables in body
      renderedBody = renderTemplate(body, { lead, contact });
      renderedSubject = renderTemplate(subject || '', { lead, contact });
    }

    let status = 'QUEUED';
    let errorMessage = null;
    let resendEmailId = null;

    if (channel === 'EMAIL') {
      const email = contact?.email;
      if (!email) throw new Error('Contact has no email address');
      const result = await sendEmail(email, renderedSubject, renderedBody);
      if (result.error) throw new Error(result.error);
      resendEmailId = result.id;
      status = 'SENT';
    } else if (channel === 'WHATSAPP') {
      if (!isConnected()) throw new Error('WhatsApp not connected. Go to /whatsapp/status to connect.');
      const phone = contact?.whatsapp || contact?.phone;
      if (!phone) throw new Error('Contact has no phone/WhatsApp number');
      await sendWhatsApp(phone, renderedBody);
      status = 'SENT';
    }

    // Create message record
    await prisma.outreachMessage.create({
      data: {
        leadId: parseInt(leadId),
        contactId: contactId ? parseInt(contactId) : null,
        channel,
        templateId: templateId ? parseInt(templateId) : null,
        subject: renderedSubject || null,
        body: renderedBody,
        status,
        sentAt: status === 'SENT' ? new Date() : null,
        errorMessage,
        resendEmailId,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        leadId: parseInt(leadId),
        contactId: contactId ? parseInt(contactId) : null,
        type: channel === 'EMAIL' ? 'EMAIL_SENT' : 'WHATSAPP_SENT',
        subject: `${channel} sent: ${renderedSubject || renderedBody.substring(0, 50)}`,
        body: renderedBody.substring(0, 200),
      },
    });

    res.redirect(`/leads/${leadId}?tab=activity&success=${channel}+sent+successfully`);
  } catch (err) {
    console.error('Outreach send error:', err);
    res.redirect(`/leads/${req.body.leadId}?tab=activity&error=${encodeURIComponent(err.message)}`);
  }
});

module.exports = router;
```

- [ ] **Step 2: Create src/routes/whatsapp.js**

```javascript
const express = require('express');
const router = express.Router();
const wa = require('../services/whatsappService');

// GET /whatsapp/status — QR code or connection status
router.get('/status', async (req, res) => {
  const ejs = require('ejs');
  const path = require('path');
  const body = await ejs.renderFile(path.join(__dirname, '../../views/whatsapp/status.ejs'), {
    status: wa.getStatus(),
    qrCode: wa.getQrCode(),
  });
  res.render('layout', { title: 'WhatsApp', body });
});

// POST /whatsapp/connect — initialize session
router.post('/connect', async (req, res) => {
  try {
    await wa.initSession('./wa-auth');
    // Wait briefly for QR to generate
    await new Promise(resolve => setTimeout(resolve, 3000));
    res.redirect('/whatsapp/status?success=Connecting...+Scan+QR+code');
  } catch (err) {
    res.redirect('/whatsapp/status?error=' + encodeURIComponent(err.message));
  }
});

// POST /whatsapp/disconnect — disconnect session
router.post('/disconnect', async (req, res) => {
  try {
    await wa.disconnect();
    res.redirect('/whatsapp/status?success=Disconnected');
  } catch (err) {
    res.redirect('/whatsapp/status?error=' + encodeURIComponent(err.message));
  }
});

module.exports = router;
```

- [ ] **Step 3: Create views/whatsapp/status.ejs**

WhatsApp status page:
- If status is 'disconnected': "Connect" button (POST /whatsapp/connect)
- If status is 'connecting' and qrCode exists: show QR code image (`<img src="<%= qrCode %>" />`), auto-refresh every 5 seconds (`<meta http-equiv="refresh" content="5">`)
- If status is 'connected': green badge "Connected", disconnect button
- Add `wa-auth/` to `.gitignore`

- [ ] **Step 4: Create src/routes/webhooks.js**

```javascript
const express = require('express');
const router = express.Router();

// POST /webhooks/resend — delivery/open/click tracking
router.post('/resend', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const event = req.body;
    const type = event.type;
    const emailId = event.data?.email_id;

    if (!emailId) return res.status(200).send('ok');

    const message = await prisma.outreachMessage.findFirst({
      where: { resendEmailId: emailId },
    });
    if (!message) return res.status(200).send('ok');

    const updates = {};
    if (type === 'email.delivered') {
      updates.status = 'DELIVERED';
      updates.deliveredAt = new Date();
    } else if (type === 'email.opened') {
      updates.status = 'READ';
      updates.readAt = new Date();
    } else if (type === 'email.bounced') {
      updates.status = 'FAILED';
      updates.errorMessage = 'Bounced: ' + (event.data?.bounce_type || 'unknown');
    } else if (type === 'email.clicked') {
      // Update tracking data with click info
      const existing = message.trackingData || { clicks: [] };
      existing.clicks = existing.clicks || [];
      existing.clicks.push({ at: new Date(), url: event.data?.click?.link });
      updates.trackingData = existing;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.outreachMessage.update({
        where: { id: message.id },
        data: updates,
      });
    }

    res.status(200).send('ok');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(200).send('ok'); // Always return 200 to prevent retries
  }
});

module.exports = router;
```

- [ ] **Step 5: Add wa-auth/ to .gitignore**

Append to `outreach/.gitignore`:
```
wa-auth/
```

- [ ] **Step 6: Commit**

```bash
cd C:/cpio_db/puneglobalgroup-website
git add outreach/src/routes/outreach.js outreach/src/routes/whatsapp.js outreach/src/routes/webhooks.js outreach/views/whatsapp/ outreach/.gitignore
git commit -m "feat(outreach): add ad-hoc send, WhatsApp status page, Resend webhooks

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Integration — Server, Nav, Lead Detail Outreach Actions

**Files:**
- Modify: `outreach/server.js` — mount 5 new routers
- Modify: `outreach/views/layout.ejs` — update nav
- Modify: `outreach/views/leads/detail.ejs` — add outreach send forms

- [ ] **Step 1: Mount new routers in server.js**

After existing router mounts, add:
```javascript
const templatesRouter = require('./src/routes/templates');
const campaignsRouter = require('./src/routes/campaigns');
const outreachRouter = require('./src/routes/outreach');
const whatsappRouter = require('./src/routes/whatsapp');
const webhooksRouter = require('./src/routes/webhooks');
app.use('/templates', templatesRouter);
app.use('/campaigns', campaignsRouter);
app.use('/outreach', outreachRouter);
app.use('/whatsapp', whatsappRouter);
app.use('/webhooks', webhooksRouter);
```

- [ ] **Step 2: Update nav in layout.ejs**

Final nav order:
```
Dashboard | Leads, Contacts | Quotes, RFQs | Rate Card | Templates, Campaigns | WhatsApp | Scrape Log, Analytics
```

- [ ] **Step 3: Add outreach actions to lead detail**

In `views/leads/detail.ejs`, add to the header area (near the stage transition buttons):
- "Send Email" button and "Send WhatsApp" button

These expand an inline send form below the header:
```html
<div class="outreach-actions" style="margin-top:1rem; padding:1rem; background:var(--bg-warm); border-radius:var(--radius);">
  <form method="POST" action="/outreach/send">
    <input type="hidden" name="leadId" value="<%= lead.id %>">
    <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:end;">
      <div class="form-group" style="margin:0">
        <label>Channel</label>
        <select name="channel" required>
          <option value="EMAIL">Email</option>
          <option value="WHATSAPP">WhatsApp</option>
        </select>
      </div>
      <div class="form-group" style="margin:0">
        <label>Contact</label>
        <select name="contactId">
          <% (lead.contacts || []).forEach(function(c) { %>
            <option value="<%= c.id %>"><%= c.name %> (<%= c.email || c.phone || 'no contact' %>)</option>
          <% }); %>
        </select>
      </div>
      <div class="form-group" style="margin:0">
        <label>Template</label>
        <select name="templateId">
          <option value="">-- Freeform --</option>
          <!-- Templates loaded from route — pass templates list to detail view -->
        </select>
      </div>
    </div>
    <div style="margin-top:0.5rem;">
      <input type="text" name="subject" placeholder="Subject (email only)" style="width:100%; margin-bottom:0.5rem;">
      <textarea name="body" placeholder="Message body (or leave blank to use template)" rows="3" style="width:100%;"></textarea>
    </div>
    <button type="submit" class="btn btn-primary" style="margin-top:0.5rem;">Send</button>
  </form>
</div>
```

The leads detail route (`GET /leads/:id`) needs to also load active templates:
```javascript
const templates = await prisma.messageTemplate.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
```
Pass `templates` to the detail view.

- [ ] **Step 4: Verify everything works**

```bash
cd C:/cpio_db/puneglobalgroup-website/outreach && npm run dev
```

1. `/templates` — create a test template
2. `/campaigns/new` — form loads, filter preview works
3. `/whatsapp/status` — shows disconnected status with connect button
4. Lead detail — outreach form appears
5. `/webhooks/resend` — POST returns 200

- [ ] **Step 5: Commit**

```bash
cd C:/cpio_db/puneglobalgroup-website
git add outreach/server.js outreach/views/layout.ejs outreach/views/leads/detail.ejs outreach/src/routes/leads.js
git commit -m "feat(outreach): integrate outreach engine — nav, lead detail send form, all routers mounted

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Summary

| Task | What | Key Files |
|------|------|-----------|
| 1 | Install resend, baileys, qrcode | package.json |
| 2 | Prisma schema (4 new models) | schema.prisma |
| 3 | Services (email, WhatsApp, template engine, campaign runner) | 4 service files |
| 4 | Templates route + views | templates.js, 2 EJS files |
| 5 | Campaigns route + views | campaigns.js, 3 EJS files |
| 6 | Ad-hoc send + WhatsApp status + webhooks | outreach.js, whatsapp.js, webhooks.js, 1 EJS |
| 7 | Integration (server, nav, lead detail) | server.js, layout.ejs, detail.ejs |

**Total: 7 tasks, ~20 files, 7 commits.**
