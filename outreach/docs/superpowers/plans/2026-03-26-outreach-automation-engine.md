# Outreach Automation Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add follow-up sequences, scheduled/recurring campaigns, and event-triggered automations to the existing Outreach CRM, all powered by a Postgres-based job processor.

**Architecture:** A `ScheduledJob` table acts as a universal job queue. A 60-second polling loop picks up due jobs and dispatches them — sequence steps, scheduled campaigns, recurring campaigns, and trigger actions. Events emitted from existing routes (stage changes, lead creation, email webhooks) are matched against `AutomationTrigger` rules to create jobs. All sending flows through the existing `emailService` and `whatsappService`.

**Tech Stack:** Express 5, EJS, Prisma (PostgreSQL), existing Resend + Baileys integrations.

**Spec:** `outreach/docs/superpowers/specs/2026-03-26-outreach-automation-module-b-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `src/services/jobProcessor.js` | Polling loop (60s), job dispatcher, send window check, crash recovery, daily sweep scheduling |
| `src/services/eventEmitter.js` | `emitEvent(prisma, name, data)` — queries triggers, checks filters/cooldown, creates ScheduledJobs |
| `src/services/sequenceEngine.js` | Enroll lead, execute step, advance/stop/pause enrollment, engagement check |
| `src/services/dailySweeps.js` | Stale lead + quote expiry checks, emits events for each |
| `src/routes/sequences.js` | Sequence CRUD, enrollment management |
| `src/routes/automations.js` | AutomationTrigger CRUD |
| `src/routes/jobs.js` | Job queue view, retry, cancel |
| `views/sequences/index.ejs` | Sequence list page |
| `views/sequences/form.ejs` | Create/edit sequence with inline step builder |
| `views/sequences/detail.ejs` | Sequence detail — steps timeline + enrollments table |
| `views/automations/index.ejs` | Trigger list page |
| `views/automations/form.ejs` | Create/edit trigger with dynamic filter fields |
| `views/jobs/index.ejs` | Job queue monitor page |

### Modified Files

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add 5 new models (Sequence, SequenceStep, SequenceEnrollment, AutomationTrigger, ScheduledJob) + Campaign scheduling fields + Lead/Contact/MessageTemplate relations |
| `server.js` | Mount 3 new route modules, import and start job processor on boot, crash recovery |
| `src/routes/leads.js` | Import `emitEvent`, call after stage change and lead creation |
| `src/routes/webhooks.js` | Import `emitEvent`, call on bounce/open/click events |
| `src/routes/campaigns.js` | Add scheduling fields to campaign creation, create ScheduledJob for scheduled/recurring |
| `views/layout.ejs` | Add Sequences, Automations, Job Queue to sidebar nav |
| `views/leads/detail.ejs` | Add enrollments section + "Enroll in sequence" button |
| `views/campaigns/new.ejs` | Add scheduledFor, recurring, send window fields |
| `views/dashboard-body.ejs` | Add automation stats widget |

---

## Task 1: Prisma Schema — New Models + Campaign Fields

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add the 5 new models and Campaign fields to schema.prisma**

Add these models after the existing `OutreachMessage` model at the bottom of `prisma/schema.prisma`:

```prisma
model Sequence {
  id          Int                  @id @default(autoincrement())
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt
  name        String
  channel     String               // EMAIL | WHATSAPP | MIXED
  maxSteps    Int                  @default(3)
  isActive    Boolean              @default(true)
  steps       SequenceStep[]
  enrollments SequenceEnrollment[]
}

model SequenceStep {
  id         Int             @id @default(autoincrement())
  sequenceId Int
  sequence   Sequence        @relation(fields: [sequenceId], references: [id], onDelete: Cascade)
  stepOrder  Int
  templateId Int
  template   MessageTemplate @relation(fields: [templateId], references: [id])
  channel    String          // EMAIL | WHATSAPP
  delayDays  Int             @default(0)
  delayHours Int             @default(0)

  @@unique([sequenceId, stepOrder])
}

model SequenceEnrollment {
  id            Int       @id @default(autoincrement())
  createdAt     DateTime  @default(now())
  sequenceId    Int
  sequence      Sequence  @relation(fields: [sequenceId], references: [id], onDelete: Cascade)
  leadId        Int
  lead          Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)
  contactId     Int
  contact       Contact   @relation(fields: [contactId], references: [id], onDelete: Cascade)
  currentStep   Int       @default(1)
  status        String    @default("ACTIVE") // ACTIVE | COMPLETED | STOPPED | PAUSED
  stoppedReason String?   // REPLIED | BOUNCED | MANUAL
  completedAt   DateTime?

  @@unique([sequenceId, leadId])
}

model AutomationTrigger {
  id            Int       @id @default(autoincrement())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  name          String
  event         String    // STAGE_CHANGE | LEAD_CREATED | EMAIL_BOUNCED | EMAIL_OPENED | QUOTE_EXPIRED | LEAD_STALE
  eventFilter   Json?     // e.g. { "toStage": "CONTACTED" }
  actionType    String    // SEND_TEMPLATE | ENROLL_SEQUENCE | CHANGE_STAGE | CREATE_ACTIVITY
  actionConfig  Json      // e.g. { "templateId": 5, "channel": "EMAIL" }
  cooldownHours Int       @default(0)
  isActive      Boolean   @default(true)
  lastFiredAt   DateTime?
}

model ScheduledJob {
  id            Int       @id @default(autoincrement())
  createdAt     DateTime  @default(now())
  type          String    // SEQUENCE_STEP | SCHEDULED_CAMPAIGN | RECURRING_CAMPAIGN | TRIGGER_ACTION | DAILY_SWEEP
  status        String    @default("PENDING") // PENDING | PROCESSING | COMPLETED | FAILED | DEFERRED | CANCELLED
  scheduledFor  DateTime
  referenceId   Int?
  referenceType String?   // ENROLLMENT | CAMPAIGN | TRIGGER
  payload       Json?
  attempts      Int       @default(0)
  maxAttempts   Int       @default(3)
  lastError     String?
  processedAt   DateTime?
}
```

- [ ] **Step 2: Add relations to existing Lead model**

Add this line to the `Lead` model (after the `outreachMessages` field):

```prisma
  sequenceEnrollments SequenceEnrollment[]
```

- [ ] **Step 3: Add relations to existing Contact model**

Add this line to the `Contact` model (after the `outreachMessages` field):

```prisma
  sequenceEnrollments SequenceEnrollment[]
```

- [ ] **Step 4: Add relations to existing MessageTemplate model**

Add this line to the `MessageTemplate` model (after the `messages` field):

```prisma
  sequenceSteps SequenceStep[]
```

- [ ] **Step 5: Add scheduling fields to existing Campaign model**

Add these fields to the `Campaign` model (after the `completedAt` field):

```prisma
  scheduledFor    DateTime?
  recurringCron   String?
  lastRunAt       DateTime?
  sendWindowStart Int?        @default(9)
  sendWindowEnd   Int?        @default(18)
  sendWindowDays  String?     @default("1,2,3,4,5,6")
```

- [ ] **Step 6: Run Prisma migration**

Run from the `outreach/` directory:

```bash
cd outreach && npx prisma migrate dev --name add-automation-engine
```

Expected: Migration created and applied. 5 new tables + Campaign columns added.

- [ ] **Step 7: Regenerate Prisma client**

```bash
cd outreach && npx prisma generate
```

Expected: `src/generated/prisma` updated with new model types.

- [ ] **Step 8: Commit**

```bash
cd outreach && git add prisma/schema.prisma prisma/migrations/ src/generated/
git commit -m "feat(outreach): add automation engine schema — Sequence, SequenceStep, SequenceEnrollment, AutomationTrigger, ScheduledJob models + Campaign scheduling fields"
```

---

## Task 2: Event Emitter Service

**Files:**
- Create: `outreach/src/services/eventEmitter.js`

- [ ] **Step 1: Create the eventEmitter service**

Create `outreach/src/services/eventEmitter.js`:

```javascript
/**
 * Event Emitter — matches events against AutomationTrigger rules and creates ScheduledJobs.
 */

function matchesFilter(filter, data) {
  if (!filter || typeof filter !== 'object') return true;
  for (const [key, value] of Object.entries(filter)) {
    // Support "!VALUE" for negation
    if (typeof value === 'string' && value.startsWith('!')) {
      if (data[key] === value.slice(1)) return false;
    } else {
      if (data[key] !== value) return false;
    }
  }
  return true;
}

async function emitEvent(prisma, eventName, data) {
  try {
    const triggers = await prisma.automationTrigger.findMany({
      where: { event: eventName, isActive: true },
    });

    for (const trigger of triggers) {
      // Check event filter match
      if (!matchesFilter(trigger.eventFilter, data)) continue;

      // Check cooldown — skip if same trigger fired for same lead within cooldownHours
      if (trigger.cooldownHours > 0 && data.leadId) {
        const cutoff = new Date(Date.now() - trigger.cooldownHours * 3600000);
        const recentJob = await prisma.scheduledJob.findFirst({
          where: {
            type: 'TRIGGER_ACTION',
            referenceId: trigger.id,
            referenceType: 'TRIGGER',
            createdAt: { gte: cutoff },
            payload: { path: ['leadId'], equals: data.leadId },
          },
        });
        if (recentJob) continue;
      }

      // Create a job for this trigger
      await prisma.scheduledJob.create({
        data: {
          type: 'TRIGGER_ACTION',
          scheduledFor: new Date(),
          referenceId: trigger.id,
          referenceType: 'TRIGGER',
          payload: {
            triggerId: trigger.id,
            actionType: trigger.actionType,
            actionConfig: trigger.actionConfig,
            leadId: data.leadId || null,
            contactId: data.contactId || null,
            eventData: data,
          },
        },
      });

      // Update lastFiredAt
      await prisma.automationTrigger.update({
        where: { id: trigger.id },
        data: { lastFiredAt: new Date() },
      });
    }
  } catch (err) {
    console.error(`[EventEmitter] Error processing event ${eventName}:`, err.message);
  }
}

module.exports = { emitEvent, matchesFilter };
```

- [ ] **Step 2: Verify file exists and syntax is correct**

```bash
cd outreach && node -e "require('./src/services/eventEmitter')"
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add outreach/src/services/eventEmitter.js
git commit -m "feat(outreach): add event emitter service — matches events to trigger rules, creates jobs"
```

---

## Task 3: Sequence Engine Service

**Files:**
- Create: `outreach/src/services/sequenceEngine.js`

- [ ] **Step 1: Create the sequenceEngine service**

Create `outreach/src/services/sequenceEngine.js`:

```javascript
/**
 * Sequence Engine — enroll leads, execute steps, check engagement, advance/stop.
 */

const { renderTemplate } = require('./templateEngine');
const { sendEmail } = require('./emailService');
const { sendMessage: sendWhatsApp, isConnected } = require('./whatsappService');

/**
 * Enroll a lead+contact in a sequence. Creates enrollment + first step job.
 */
async function enrollLead(prisma, sequenceId, leadId, contactId) {
  const sequence = await prisma.sequence.findUnique({
    where: { id: sequenceId },
    include: { steps: { orderBy: { stepOrder: 'asc' } } },
  });
  if (!sequence || !sequence.isActive) {
    throw new Error('Sequence not found or inactive');
  }
  if (sequence.steps.length === 0) {
    throw new Error('Sequence has no steps');
  }

  // Check for existing active enrollment (unique constraint will also catch this)
  const existing = await prisma.sequenceEnrollment.findUnique({
    where: { sequenceId_leadId: { sequenceId, leadId } },
  });
  if (existing && existing.status === 'ACTIVE') {
    throw new Error('Lead is already enrolled in this sequence');
  }

  // If a previous stopped/completed enrollment exists, delete it to re-enroll
  if (existing) {
    await prisma.sequenceEnrollment.delete({ where: { id: existing.id } });
  }

  const enrollment = await prisma.sequenceEnrollment.create({
    data: { sequenceId, leadId, contactId, currentStep: 1, status: 'ACTIVE' },
  });

  // Schedule the first step
  const firstStep = sequence.steps[0];
  const scheduledFor = new Date();
  scheduledFor.setDate(scheduledFor.getDate() + firstStep.delayDays);
  scheduledFor.setHours(scheduledFor.getHours() + firstStep.delayHours);

  await prisma.scheduledJob.create({
    data: {
      type: 'SEQUENCE_STEP',
      scheduledFor,
      referenceId: enrollment.id,
      referenceType: 'ENROLLMENT',
      payload: { enrollmentId: enrollment.id, stepOrder: 1 },
    },
  });

  return enrollment;
}

/**
 * Check if a lead has engaged (delivered/read/replied) since enrollment.
 */
async function hasEngaged(prisma, leadId, sinceDate) {
  // Check for delivered/read outreach messages
  const engagedMessage = await prisma.outreachMessage.findFirst({
    where: {
      leadId,
      status: { in: ['DELIVERED', 'READ'] },
      sentAt: { gte: sinceDate },
    },
  });
  if (engagedMessage) return true;

  // Check for reply activities
  const replyActivity = await prisma.activity.findFirst({
    where: {
      leadId,
      type: { in: ['EMAIL_REPLY', 'WHATSAPP_REPLY', 'REPLY'] },
      createdAt: { gte: sinceDate },
    },
  });
  if (replyActivity) return true;

  return false;
}

/**
 * Execute a sequence step for an enrollment. Called by the job processor.
 */
async function executeStep(prisma, enrollmentId, stepOrder) {
  const enrollment = await prisma.sequenceEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      sequence: { include: { steps: { orderBy: { stepOrder: 'asc' }, include: { template: true } } } },
      lead: true,
      contact: true,
    },
  });

  if (!enrollment) throw new Error('Enrollment not found');
  if (enrollment.status !== 'ACTIVE') return { skipped: true, reason: 'not active' };

  // Check engagement — stop if lead has responded
  const engaged = await hasEngaged(prisma, enrollment.leadId, enrollment.createdAt);
  if (engaged) {
    await prisma.sequenceEnrollment.update({
      where: { id: enrollmentId },
      data: { status: 'STOPPED', stoppedReason: 'REPLIED', completedAt: new Date() },
    });
    return { skipped: true, reason: 'lead engaged' };
  }

  // Find current step
  const step = enrollment.sequence.steps.find(s => s.stepOrder === stepOrder);
  if (!step) throw new Error(`Step ${stepOrder} not found in sequence`);

  const lead = enrollment.lead;
  const contact = enrollment.contact;
  const template = step.template;

  // Render template
  const renderedBody = renderTemplate(template.body, { lead, contact });
  const renderedSubject = template.subject
    ? renderTemplate(template.subject, { lead, contact })
    : null;

  let status = 'QUEUED';
  let errorMessage = null;
  let resendEmailId = null;
  let sentAt = null;

  try {
    if (step.channel === 'EMAIL') {
      const email = contact.email;
      if (!email) throw new Error('No email for contact');
      const result = await sendEmail(email, renderedSubject, renderedBody);
      if (result.error) throw new Error(result.error);
      resendEmailId = result.id;
      status = 'SENT';
      sentAt = new Date();
    } else if (step.channel === 'WHATSAPP') {
      if (!isConnected()) throw new Error('WhatsApp not connected');
      const phone = contact.whatsapp || contact.phone;
      if (!phone) throw new Error('No phone/WhatsApp for contact');
      await sendWhatsApp(phone, renderedBody);
      status = 'SENT';
      sentAt = new Date();
    }
  } catch (err) {
    status = 'FAILED';
    errorMessage = err.message;
  }

  // Create OutreachMessage
  await prisma.outreachMessage.create({
    data: {
      leadId: lead.id,
      contactId: contact.id,
      channel: step.channel,
      templateId: template.id,
      subject: renderedSubject,
      body: renderedBody,
      status,
      sentAt,
      errorMessage,
      resendEmailId,
    },
  });

  // Create Activity
  if (status === 'SENT') {
    await prisma.activity.create({
      data: {
        leadId: lead.id,
        contactId: contact.id,
        type: step.channel === 'EMAIL' ? 'EMAIL_SENT' : 'WHATSAPP_SENT',
        subject: `Sequence: ${enrollment.sequence.name} — Step ${stepOrder}`,
        body: renderedSubject || renderedBody.substring(0, 100),
      },
    });
  }

  // Advance to next step or complete
  const nextStep = enrollment.sequence.steps.find(s => s.stepOrder === stepOrder + 1);
  if (nextStep && status === 'SENT') {
    // Update currentStep
    await prisma.sequenceEnrollment.update({
      where: { id: enrollmentId },
      data: { currentStep: stepOrder + 1 },
    });

    // Schedule next step
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + nextStep.delayDays);
    scheduledFor.setHours(scheduledFor.getHours() + nextStep.delayHours);

    await prisma.scheduledJob.create({
      data: {
        type: 'SEQUENCE_STEP',
        scheduledFor,
        referenceId: enrollmentId,
        referenceType: 'ENROLLMENT',
        payload: { enrollmentId, stepOrder: stepOrder + 1 },
      },
    });
  } else {
    // Sequence complete (or step failed with no retry for sequences)
    await prisma.sequenceEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: status === 'SENT' ? 'COMPLETED' : 'STOPPED',
        stoppedReason: status === 'SENT' ? null : 'FAILED',
        completedAt: new Date(),
      },
    });
  }

  return { sent: status === 'SENT', step: stepOrder };
}

/**
 * Stop an enrollment manually.
 */
async function stopEnrollment(prisma, enrollmentId, reason) {
  await prisma.sequenceEnrollment.update({
    where: { id: enrollmentId },
    data: { status: 'STOPPED', stoppedReason: reason || 'MANUAL', completedAt: new Date() },
  });
  // Cancel any pending jobs for this enrollment
  await prisma.scheduledJob.updateMany({
    where: { referenceId: enrollmentId, referenceType: 'ENROLLMENT', status: 'PENDING' },
    data: { status: 'CANCELLED' },
  });
}

/**
 * Pause/resume an enrollment.
 */
async function togglePause(prisma, enrollmentId) {
  const enrollment = await prisma.sequenceEnrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment) throw new Error('Enrollment not found');

  if (enrollment.status === 'ACTIVE') {
    await prisma.sequenceEnrollment.update({
      where: { id: enrollmentId },
      data: { status: 'PAUSED' },
    });
    // Defer pending jobs (they'll be skipped in the processor since status != ACTIVE)
  } else if (enrollment.status === 'PAUSED') {
    await prisma.sequenceEnrollment.update({
      where: { id: enrollmentId },
      data: { status: 'ACTIVE' },
    });
    // Re-schedule the current step if no pending job exists
    const pendingJob = await prisma.scheduledJob.findFirst({
      where: { referenceId: enrollmentId, referenceType: 'ENROLLMENT', status: { in: ['PENDING', 'DEFERRED'] } },
    });
    if (!pendingJob) {
      await prisma.scheduledJob.create({
        data: {
          type: 'SEQUENCE_STEP',
          scheduledFor: new Date(),
          referenceId: enrollmentId,
          referenceType: 'ENROLLMENT',
          payload: { enrollmentId, stepOrder: enrollment.currentStep },
        },
      });
    }
  }
}

module.exports = { enrollLead, executeStep, hasEngaged, stopEnrollment, togglePause };
```

- [ ] **Step 2: Verify syntax**

```bash
cd outreach && node -e "require('./src/services/sequenceEngine')"
```

Expected: No errors (may warn about WhatsApp not initialized — that's OK).

- [ ] **Step 3: Commit**

```bash
git add outreach/src/services/sequenceEngine.js
git commit -m "feat(outreach): add sequence engine — enroll, execute steps, engagement check, stop/pause"
```

---

## Task 4: Daily Sweeps Service

**Files:**
- Create: `outreach/src/services/dailySweeps.js`

- [ ] **Step 1: Create the dailySweeps service**

Create `outreach/src/services/dailySweeps.js`:

```javascript
/**
 * Daily Sweeps — stale lead detection and quote expiry checks.
 * Run once daily at 8am IST via a self-scheduling ScheduledJob.
 */

const { emitEvent } = require('./eventEmitter');

async function runDailySweeps(prisma) {
  console.log('[DailySweeps] Running daily checks...');

  // 1. Stale lead check: no activity in 14+ days, not WON/LOST/DORMANT
  const staleCutoff = new Date();
  staleCutoff.setDate(staleCutoff.getDate() - 14);

  const staleLeads = await prisma.lead.findMany({
    where: {
      stageChangedAt: { lt: staleCutoff },
      stage: { notIn: ['WON', 'LOST', 'DORMANT'] },
      isArchived: false,
    },
  });

  for (const lead of staleLeads) {
    const daysSince = Math.floor((Date.now() - new Date(lead.stageChangedAt).getTime()) / (1000 * 60 * 60 * 24));
    await emitEvent(prisma, 'LEAD_STALE', { leadId: lead.id, daysSinceActivity: daysSince });
  }
  console.log(`[DailySweeps] Found ${staleLeads.length} stale leads`);

  // 2. Quote expiry check: validUntil < today, status = SENT
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiredQuotes = await prisma.quote.findMany({
    where: {
      validUntil: { lt: today },
      status: 'SENT',
    },
  });

  for (const quote of expiredQuotes) {
    await emitEvent(prisma, 'QUOTE_EXPIRED', { quoteId: quote.id, leadId: quote.leadId });
  }
  console.log(`[DailySweeps] Found ${expiredQuotes.length} expired quotes`);

  return { staleLeads: staleLeads.length, expiredQuotes: expiredQuotes.length };
}

/**
 * Ensure a DAILY_SWEEP job exists for tomorrow 8am IST.
 * Called on server startup and after each sweep completes.
 */
async function scheduleDailySweep(prisma) {
  // Check if a pending sweep already exists
  const existing = await prisma.scheduledJob.findFirst({
    where: { type: 'DAILY_SWEEP', status: { in: ['PENDING', 'DEFERRED'] } },
  });
  if (existing) return;

  // Schedule for tomorrow 8am IST (IST = UTC+5:30)
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(2, 30, 0, 0); // 8am IST = 2:30am UTC

  await prisma.scheduledJob.create({
    data: {
      type: 'DAILY_SWEEP',
      scheduledFor: tomorrow,
      status: 'PENDING',
    },
  });
  console.log(`[DailySweeps] Next sweep scheduled for ${tomorrow.toISOString()}`);
}

module.exports = { runDailySweeps, scheduleDailySweep };
```

- [ ] **Step 2: Verify syntax**

```bash
cd outreach && node -e "require('./src/services/dailySweeps')"
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add outreach/src/services/dailySweeps.js
git commit -m "feat(outreach): add daily sweeps — stale lead + quote expiry checks"
```

---

## Task 5: Job Processor Service

**Files:**
- Create: `outreach/src/services/jobProcessor.js`

- [ ] **Step 1: Create the jobProcessor service**

Create `outreach/src/services/jobProcessor.js`:

```javascript
/**
 * Job Processor — central polling loop that executes all scheduled jobs.
 * Polls ScheduledJob table every 60 seconds for due jobs.
 */

const { executeStep } = require('./sequenceEngine');
const { executeCampaign } = require('./campaignRunner');
const { runDailySweeps, scheduleDailySweep } = require('./dailySweeps');
const { renderTemplate } = require('./templateEngine');
const { sendEmail } = require('./emailService');
const { sendMessage: sendWhatsApp, isConnected } = require('./whatsappService');
const { changeStage } = require('../services/pipeline');

let processorInterval = null;

/**
 * Check if a timestamp falls within the send window.
 * Default: 9am-6pm IST, Mon-Sat.
 */
function isWithinSendWindow(now, windowStart, windowEnd, windowDays) {
  const start = windowStart ?? 9;
  const end = windowEnd ?? 18;
  const days = windowDays ?? '1,2,3,4,5,6';

  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const hour = istTime.getUTCHours();
  const dayOfWeek = istTime.getUTCDay(); // 0=Sun, 1=Mon, ...

  const allowedDays = days.split(',').map(Number);
  if (!allowedDays.includes(dayOfWeek)) return false;
  if (hour < start || hour >= end) return false;
  return true;
}

/**
 * Calculate the next open slot within the send window.
 */
function nextOpenSlot(now, windowStart, windowEnd, windowDays) {
  const start = windowStart ?? 9;
  const days = windowDays ?? '1,2,3,4,5,6';
  const allowedDays = days.split(',').map(Number);

  // Start from tomorrow at windowStart IST
  const istOffset = 5.5 * 60;
  const candidate = new Date(now);

  for (let i = 0; i < 8; i++) {
    candidate.setDate(candidate.getDate() + (i === 0 ? 0 : 1));
    const dayOfWeek = candidate.getDay();

    if (i === 0) {
      // Today — check if windowStart hasn't passed yet
      const istHour = (candidate.getUTCHours() + 5 + (candidate.getUTCMinutes() + 30 >= 60 ? 1 : 0)) % 24;
      if (istHour < start && allowedDays.includes(dayOfWeek)) {
        // Set to today at windowStart IST
        const result = new Date(candidate);
        result.setUTCHours(start - 5, 30, 0, 0); // IST to UTC: subtract 5:30
        return result;
      }
      continue;
    }

    if (allowedDays.includes(dayOfWeek)) {
      // Set to this day at windowStart IST (UTC = IST - 5:30)
      const result = new Date(candidate);
      result.setUTCHours(start - 5, 30, 0, 0);
      if (start < 6) {
        // Handle wrap (e.g., 2am IST = 8:30pm UTC previous day)
        result.setUTCHours(start + 24 - 5, 30, 0, 0);
      }
      return result;
    }
  }

  // Fallback: tomorrow at windowStart
  const fallback = new Date(now);
  fallback.setDate(fallback.getDate() + 1);
  fallback.setUTCHours(start - 5, 30, 0, 0);
  return fallback;
}

/**
 * Execute a TRIGGER_ACTION job.
 */
async function executeTriggerAction(prisma, job) {
  const { actionType, actionConfig, leadId, contactId } = job.payload;

  if (actionType === 'SEND_TEMPLATE') {
    const template = await prisma.messageTemplate.findUnique({ where: { id: actionConfig.templateId } });
    if (!template) throw new Error('Template not found');

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error('Lead not found');

    // Find contact: use provided contactId or primary contact
    let contact = null;
    if (contactId) {
      contact = await prisma.contact.findUnique({ where: { id: contactId } });
    }
    if (!contact) {
      contact = await prisma.contact.findFirst({
        where: { leadId, isPrimary: true },
      });
    }

    const channel = actionConfig.channel || template.channel;
    const renderedBody = renderTemplate(template.body, { lead, contact });
    const renderedSubject = template.subject ? renderTemplate(template.subject, { lead, contact }) : null;

    let status = 'QUEUED';
    let errorMessage = null;
    let resendEmailId = null;
    let sentAt = null;

    if (channel === 'EMAIL') {
      if (!contact?.email) throw new Error('No email for contact');
      const result = await sendEmail(contact.email, renderedSubject, renderedBody);
      if (result.error) throw new Error(result.error);
      resendEmailId = result.id;
      status = 'SENT';
      sentAt = new Date();
    } else if (channel === 'WHATSAPP') {
      if (!isConnected()) throw new Error('WhatsApp not connected');
      const phone = contact?.whatsapp || contact?.phone;
      if (!phone) throw new Error('No phone for contact');
      await sendWhatsApp(phone, renderedBody);
      status = 'SENT';
      sentAt = new Date();
    }

    await prisma.outreachMessage.create({
      data: {
        leadId, contactId: contact?.id || null, channel,
        templateId: template.id, subject: renderedSubject, body: renderedBody,
        status, sentAt, errorMessage, resendEmailId,
      },
    });

    if (status === 'SENT') {
      await prisma.activity.create({
        data: {
          leadId, contactId: contact?.id || null,
          type: channel === 'EMAIL' ? 'EMAIL_SENT' : 'WHATSAPP_SENT',
          subject: `Auto: ${template.name}`,
          body: renderedSubject || renderedBody.substring(0, 100),
        },
      });
    }
  } else if (actionType === 'ENROLL_SEQUENCE') {
    const { enrollLead } = require('./sequenceEngine');
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { contacts: { where: { isPrimary: true }, take: 1 } },
    });
    if (!lead) throw new Error('Lead not found');
    const contact = lead.contacts[0];
    if (!contact) throw new Error('Lead has no primary contact');
    await enrollLead(prisma, actionConfig.sequenceId, leadId, contact.id);
  } else if (actionType === 'CHANGE_STAGE') {
    await changeStage(prisma, leadId, actionConfig.toStage, 'Auto: trigger action');
  } else if (actionType === 'CREATE_ACTIVITY') {
    await prisma.activity.create({
      data: {
        leadId,
        type: actionConfig.activityType || 'NOTE',
        subject: actionConfig.subject || 'Automation triggered',
        body: actionConfig.body || null,
      },
    });
  }
}

/**
 * Parse a simple cron expression and calculate the next run time.
 * Supports: "minute hour dayOfMonth month dayOfWeek"
 * Only handles simple cases: fixed values and '*'.
 */
function nextCronRun(cronStr, after) {
  const parts = cronStr.split(/\s+/);
  if (parts.length !== 5) return null;

  const [minute, hour, , , dayOfWeek] = parts;
  const targetMin = minute === '*' ? 0 : parseInt(minute);
  const targetHour = hour === '*' ? 0 : parseInt(hour);
  const targetDays = dayOfWeek === '*' ? [0, 1, 2, 3, 4, 5, 6] : dayOfWeek.split(',').map(Number);

  // Convert target time from IST to UTC
  const utcHour = targetHour - 5;
  const utcMin = targetMin - 30;

  const candidate = new Date(after);
  candidate.setMinutes(0, 0, 0);

  for (let i = 1; i <= 8; i++) {
    candidate.setDate(candidate.getDate() + 1);
    if (targetDays.includes(candidate.getDay())) {
      candidate.setUTCHours(utcHour < 0 ? utcHour + 24 : utcHour);
      candidate.setUTCMinutes(utcMin < 0 ? utcMin + 60 : utcMin);
      return candidate;
    }
  }

  // Fallback: tomorrow
  const fallback = new Date(after);
  fallback.setDate(fallback.getDate() + 1);
  fallback.setUTCHours(utcHour < 0 ? utcHour + 24 : utcHour, utcMin < 0 ? utcMin + 60 : utcMin, 0, 0);
  return fallback;
}

/**
 * Process a single job.
 */
async function processJob(prisma, job) {
  // Mark as processing
  await prisma.scheduledJob.update({
    where: { id: job.id },
    data: { status: 'PROCESSING', attempts: job.attempts + 1 },
  });

  try {
    // Send window check (skip for DAILY_SWEEP — always runs)
    if (job.type !== 'DAILY_SWEEP') {
      // Get send window config from campaign if applicable
      let winStart = 9, winEnd = 18, winDays = '1,2,3,4,5,6';
      if (job.referenceType === 'CAMPAIGN' && job.referenceId) {
        const campaign = await prisma.campaign.findUnique({ where: { id: job.referenceId } });
        if (campaign) {
          winStart = campaign.sendWindowStart ?? 9;
          winEnd = campaign.sendWindowEnd ?? 18;
          winDays = campaign.sendWindowDays ?? '1,2,3,4,5,6';
        }
      }

      if (!isWithinSendWindow(new Date(), winStart, winEnd, winDays)) {
        const nextSlot = nextOpenSlot(new Date(), winStart, winEnd, winDays);
        await prisma.scheduledJob.update({
          where: { id: job.id },
          data: { status: 'DEFERRED', scheduledFor: nextSlot, attempts: job.attempts },
        });
        console.log(`[JobProcessor] Job ${job.id} deferred to ${nextSlot.toISOString()} (outside send window)`);
        return;
      }
    }

    // Dispatch by type
    switch (job.type) {
      case 'SEQUENCE_STEP': {
        const { enrollmentId, stepOrder } = job.payload;
        await executeStep(prisma, enrollmentId, stepOrder);
        break;
      }
      case 'SCHEDULED_CAMPAIGN': {
        await executeCampaign(prisma, job.referenceId);
        break;
      }
      case 'RECURRING_CAMPAIGN': {
        const campaign = await prisma.campaign.findUnique({ where: { id: job.referenceId } });
        if (!campaign || !campaign.recurringCron) break;

        // Reset campaign to DRAFT so executeCampaign can run it
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'DRAFT', sentCount: 0, failedCount: 0, sentAt: null, completedAt: null },
        });
        await executeCampaign(prisma, campaign.id);
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { lastRunAt: new Date() },
        });

        // Schedule next run
        const nextRun = nextCronRun(campaign.recurringCron, new Date());
        if (nextRun) {
          await prisma.scheduledJob.create({
            data: {
              type: 'RECURRING_CAMPAIGN',
              scheduledFor: nextRun,
              referenceId: campaign.id,
              referenceType: 'CAMPAIGN',
            },
          });
        }
        break;
      }
      case 'TRIGGER_ACTION': {
        await executeTriggerAction(prisma, job);
        break;
      }
      case 'DAILY_SWEEP': {
        await runDailySweeps(prisma);
        await scheduleDailySweep(prisma);
        break;
      }
      default:
        console.warn(`[JobProcessor] Unknown job type: ${job.type}`);
    }

    // Mark completed
    await prisma.scheduledJob.update({
      where: { id: job.id },
      data: { status: 'COMPLETED', processedAt: new Date() },
    });
  } catch (err) {
    console.error(`[JobProcessor] Job ${job.id} failed:`, err.message);
    const newStatus = (job.attempts + 1) >= job.maxAttempts ? 'FAILED' : 'PENDING';
    const retryAt = new Date(Date.now() + (job.attempts + 1) * 15 * 60 * 1000);

    await prisma.scheduledJob.update({
      where: { id: job.id },
      data: {
        status: newStatus,
        lastError: err.message,
        scheduledFor: newStatus === 'PENDING' ? retryAt : job.scheduledFor,
      },
    });
  }
}

/**
 * Main polling loop — called every 60 seconds.
 */
async function pollJobs(prisma) {
  try {
    const jobs = await prisma.scheduledJob.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: { lte: new Date() },
      },
      orderBy: { scheduledFor: 'asc' },
      take: 10,
    });

    for (const job of jobs) {
      await processJob(prisma, job);
    }
  } catch (err) {
    console.error('[JobProcessor] Poll error:', err.message);
  }
}

/**
 * Recover stalled jobs on startup — reset PROCESSING back to PENDING.
 */
async function recoverStalledJobs(prisma) {
  const result = await prisma.scheduledJob.updateMany({
    where: { status: 'PROCESSING' },
    data: { status: 'PENDING' },
  });
  if (result.count > 0) {
    console.log(`[JobProcessor] Recovered ${result.count} stalled jobs`);
  }
}

/**
 * Start the job processor.
 */
async function startJobProcessor(prisma) {
  await recoverStalledJobs(prisma);
  await scheduleDailySweep(prisma);

  processorInterval = setInterval(() => pollJobs(prisma), 60000);
  console.log('[JobProcessor] Started — polling every 60s');

  // Run an immediate poll on startup
  await pollJobs(prisma);
}

/**
 * Stop the job processor (for graceful shutdown).
 */
function stopJobProcessor() {
  if (processorInterval) {
    clearInterval(processorInterval);
    processorInterval = null;
    console.log('[JobProcessor] Stopped');
  }
}

module.exports = { startJobProcessor, stopJobProcessor, isWithinSendWindow, nextOpenSlot, nextCronRun };
```

- [ ] **Step 2: Verify syntax**

```bash
cd outreach && node -e "require('./src/services/jobProcessor')"
```

Expected: No errors (warnings about services not initialized are OK).

- [ ] **Step 3: Commit**

```bash
git add outreach/src/services/jobProcessor.js
git commit -m "feat(outreach): add job processor — polling loop, dispatch, send window, crash recovery"
```

---

## Task 6: Wire Events into Existing Routes

**Files:**
- Modify: `outreach/src/routes/leads.js`
- Modify: `outreach/src/routes/webhooks.js`

- [ ] **Step 1: Add event emission to leads route — stage change**

In `outreach/src/routes/leads.js`, add the import at the top (after the existing requires):

```javascript
const { emitEvent } = require('../services/eventEmitter');
```

Then in the `POST /:id/stage` handler, add the event emission after `changeStage` succeeds. Replace the existing handler body:

Find this block in the stage change handler (around line 197-209):

```javascript
router.post('/:id/stage', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const newStage = req.body.newStage;
    const notes = req.body.notes || null;
    await changeStage(prisma, id, newStage, notes);
    res.redirect(`/leads/${id}?success=Stage+updated+to+${newStage}`);
  } catch (err) {
    console.error('Stage change error:', err);
    res.redirect(`/leads/${req.params.id}?error=` + encodeURIComponent(err.message));
  }
});
```

Replace with:

```javascript
router.post('/:id/stage', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const newStage = req.body.newStage;
    const notes = req.body.notes || null;
    const lead = await prisma.lead.findUnique({ where: { id } });
    const fromStage = lead ? lead.stage : null;
    await changeStage(prisma, id, newStage, notes);
    // Emit event for automation triggers
    emitEvent(prisma, 'STAGE_CHANGE', { leadId: id, fromStage, toStage: newStage });
    res.redirect(`/leads/${id}?success=Stage+updated+to+${newStage}`);
  } catch (err) {
    console.error('Stage change error:', err);
    res.redirect(`/leads/${req.params.id}?error=` + encodeURIComponent(err.message));
  }
});
```

- [ ] **Step 2: Add event emission to leads route — lead created**

In the `POST /` handler (create lead), add event emission after the lead is created. Replace:

```javascript
    const lead = await prisma.lead.create({
      data: { ...data, fitScore },
    });
    res.redirect(`/leads/${lead.id}?success=Lead+created+successfully`);
```

With:

```javascript
    const lead = await prisma.lead.create({
      data: { ...data, fitScore },
    });
    // Emit event for automation triggers
    emitEvent(prisma, 'LEAD_CREATED', { leadId: lead.id, source: data.source, icpType: data.icpType });
    res.redirect(`/leads/${lead.id}?success=Lead+created+successfully`);
```

- [ ] **Step 3: Add event emissions to webhooks route**

In `outreach/src/routes/webhooks.js`, add the import at the top:

```javascript
const { emitEvent } = require('../services/eventEmitter');
```

Then after the `OutreachMessage` update (around line 36-39), add event emission. Replace:

```javascript
    if (Object.keys(updates).length > 0) {
      await prisma.outreachMessage.update({
        where: { id: message.id },
        data: updates,
      });
    }

    res.status(200).send('ok');
```

With:

```javascript
    if (Object.keys(updates).length > 0) {
      await prisma.outreachMessage.update({
        where: { id: message.id },
        data: updates,
      });

      // Emit events for automation triggers
      const eventData = { leadId: message.leadId, contactId: message.contactId, messageId: message.id };
      if (type === 'email.bounced') {
        emitEvent(prisma, 'EMAIL_BOUNCED', eventData);
      } else if (type === 'email.opened') {
        emitEvent(prisma, 'EMAIL_OPENED', eventData);
      } else if (type === 'email.clicked') {
        emitEvent(prisma, 'EMAIL_CLICKED', eventData);
      }
    }

    res.status(200).send('ok');
```

- [ ] **Step 4: Verify both files load**

```bash
cd outreach && node -e "require('./src/routes/leads'); require('./src/routes/webhooks'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add outreach/src/routes/leads.js outreach/src/routes/webhooks.js
git commit -m "feat(outreach): emit automation events on stage change, lead creation, and email webhooks"
```

---

## Task 7: Add Scheduling to Campaign Route

**Files:**
- Modify: `outreach/src/routes/campaigns.js`

- [ ] **Step 1: Update campaign creation to support scheduling**

In `outreach/src/routes/campaigns.js`, replace the `POST /` handler (the full `router.post('/', ...)` block around lines 84-130):

```javascript
// POST /campaigns — create campaign
router.post('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const { name, templateId, channel, sendNow, scheduledFor, recurringCron,
            sendWindowStart, sendWindowEnd, sendWindowDays } = req.body;

    // Build filters object from individual filter params
    const filters = {};
    if (req.body.stage) filters.stage = req.body.stage;
    if (req.body.icpType) filters.icpType = req.body.icpType;
    if (req.body.industry) filters.industry = req.body.industry;
    if (req.body.city) filters.city = req.body.city;
    if (req.body.search) filters.search = req.body.search;

    // Parse excluded lead IDs from hidden input (JSON array)
    let excludedLeadIds = [];
    if (req.body.excludedLeadIds) {
      try {
        excludedLeadIds = JSON.parse(req.body.excludedLeadIds);
      } catch (_) {
        excludedLeadIds = [];
      }
    }

    // Parse send window days from checkbox array
    const winDays = Array.isArray(sendWindowDays)
      ? sendWindowDays.join(',')
      : sendWindowDays || '1,2,3,4,5,6';

    const campaign = await prisma.campaign.create({
      data: {
        name: name?.trim() || 'Untitled Campaign',
        templateId: parseInt(templateId),
        channel: channel || 'EMAIL',
        filters,
        excludedLeadIds,
        status: 'DRAFT',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        recurringCron: recurringCron || null,
        sendWindowStart: sendWindowStart ? parseInt(sendWindowStart) : 9,
        sendWindowEnd: sendWindowEnd ? parseInt(sendWindowEnd) : 18,
        sendWindowDays: winDays,
      },
    });

    if (recurringCron) {
      // Create first recurring job
      const { nextCronRun } = require('../services/jobProcessor');
      const nextRun = nextCronRun(recurringCron, new Date());
      if (nextRun) {
        await prisma.scheduledJob.create({
          data: {
            type: 'RECURRING_CAMPAIGN',
            scheduledFor: nextRun,
            referenceId: campaign.id,
            referenceType: 'CAMPAIGN',
          },
        });
      }
    } else if (scheduledFor) {
      // Create scheduled job
      await prisma.scheduledJob.create({
        data: {
          type: 'SCHEDULED_CAMPAIGN',
          scheduledFor: new Date(scheduledFor),
          referenceId: campaign.id,
          referenceType: 'CAMPAIGN',
        },
      });
    } else if (sendNow === 'on') {
      // Fire and forget — execute in background (existing behavior)
      executeCampaign(prisma, campaign.id)
        .then(r => console.log(`Campaign ${campaign.id} done:`, r))
        .catch(e => console.error(`Campaign ${campaign.id} error:`, e));
    }

    res.redirect(`/campaigns/${campaign.id}?success=Campaign+created+successfully`);
  } catch (err) {
    console.error('Create campaign error:', err);
    res.redirect('/campaigns/new?error=' + encodeURIComponent(err.message));
  }
});
```

- [ ] **Step 2: Verify file loads**

```bash
cd outreach && node -e "require('./src/routes/campaigns'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add outreach/src/routes/campaigns.js
git commit -m "feat(outreach): add scheduled, recurring, and send-window support to campaign creation"
```

---

## Task 8: Mount Job Processor in server.js

**Files:**
- Modify: `outreach/server.js`

- [ ] **Step 1: Import job processor and mount new routes**

In `outreach/server.js`, add the new route imports after line 128 (after `const webhooksRouter = ...`):

```javascript
const sequencesRouter = require('./src/routes/sequences');
const automationsRouter = require('./src/routes/automations');
const jobsRouter = require('./src/routes/jobs');
```

And add route mounting after line 141 (after `app.use('/webhooks', webhooksRouter);`):

```javascript
app.use('/sequences', sequencesRouter);
app.use('/automations', automationsRouter);
app.use('/jobs', jobsRouter);
```

- [ ] **Step 2: Start job processor on boot**

In the `start()` function, add job processor startup after the `console.log` lines. Replace:

```javascript
async function start() {
  try {
    await adminPrisma.$connect();
    await demoPrisma.$connect();
    console.log('✓ Admin database connected');
    console.log('✓ Demo database connected');

    app.listen(PORT, () => {
      console.log(`✓ Outreach CRM running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}
```

With:

```javascript
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
```

- [ ] **Step 3: Stop job processor on shutdown**

In the `SIGTERM` handler, add job processor stop. Replace:

```javascript
process.on('SIGTERM', async () => {
  await adminPrisma.$disconnect();
  await demoPrisma.$disconnect();
  await adminPool.end();
  await demoPool.end();
  process.exit(0);
});
```

With:

```javascript
process.on('SIGTERM', async () => {
  const { stopJobProcessor } = require('./src/services/jobProcessor');
  stopJobProcessor();
  await adminPrisma.$disconnect();
  await demoPrisma.$disconnect();
  await adminPool.end();
  await demoPool.end();
  process.exit(0);
});
```

- [ ] **Step 4: Commit**

```bash
git add outreach/server.js
git commit -m "feat(outreach): mount automation routes + start job processor on boot"
```

---

## Task 9: Sequences Route

**Files:**
- Create: `outreach/src/routes/sequences.js`

- [ ] **Step 1: Create the sequences route**

Create `outreach/src/routes/sequences.js`:

```javascript
const express = require('express');
const path = require('path');
const ejs = require('ejs');
const router = express.Router();

const { enrollLead, stopEnrollment, togglePause } = require('../services/sequenceEngine');

const VIEWS = path.join(__dirname, '../../views');

// GET /sequences — list all
router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const sequences = await prisma.sequence.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        steps: true,
        enrollments: { where: { status: 'ACTIVE' } },
      },
    });
    const sequencesPlain = JSON.parse(JSON.stringify(sequences));
    const body = await ejs.renderFile(path.join(VIEWS, 'sequences/index.ejs'), {
      sequences: sequencesPlain,
    });
    res.render('layout', { title: 'Sequences', body });
  } catch (err) {
    console.error('Sequences list error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// GET /sequences/new — new sequence form
router.get('/new', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const templates = await prisma.messageTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    const body = await ejs.renderFile(path.join(VIEWS, 'sequences/form.ejs'), {
      sequence: null,
      templates: JSON.parse(JSON.stringify(templates)),
    });
    res.render('layout', { title: 'New Sequence', body });
  } catch (err) {
    console.error('New sequence form error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// POST /sequences — create sequence + steps
router.post('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const { name, channel } = req.body;

    // Parse steps from form arrays
    const stepOrders = Array.isArray(req.body['steps.order']) ? req.body['steps.order'] : [req.body['steps.order']].filter(Boolean);
    const stepTemplates = Array.isArray(req.body['steps.templateId']) ? req.body['steps.templateId'] : [req.body['steps.templateId']].filter(Boolean);
    const stepChannels = Array.isArray(req.body['steps.channel']) ? req.body['steps.channel'] : [req.body['steps.channel']].filter(Boolean);
    const stepDelayDays = Array.isArray(req.body['steps.delayDays']) ? req.body['steps.delayDays'] : [req.body['steps.delayDays']].filter(Boolean);
    const stepDelayHours = Array.isArray(req.body['steps.delayHours']) ? req.body['steps.delayHours'] : [req.body['steps.delayHours']].filter(Boolean);

    const sequence = await prisma.sequence.create({
      data: {
        name: name?.trim() || 'Untitled Sequence',
        channel: channel || 'EMAIL',
        maxSteps: stepOrders.length,
        steps: {
          create: stepOrders.map((_, i) => ({
            stepOrder: parseInt(stepOrders[i]),
            templateId: parseInt(stepTemplates[i]),
            channel: stepChannels[i] || channel || 'EMAIL',
            delayDays: parseInt(stepDelayDays[i]) || 0,
            delayHours: parseInt(stepDelayHours[i]) || 0,
          })),
        },
      },
    });

    res.redirect(`/sequences/${sequence.id}?success=Sequence+created`);
  } catch (err) {
    console.error('Create sequence error:', err);
    res.redirect('/sequences/new?error=' + encodeURIComponent(err.message));
  }
});

// GET /sequences/:id — sequence detail
router.get('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const sequence = await prisma.sequence.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { stepOrder: 'asc' }, include: { template: { select: { name: true, channel: true } } } },
        enrollments: {
          orderBy: { createdAt: 'desc' },
          include: {
            lead: { select: { id: true, companyName: true } },
            contact: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!sequence) return res.status(404).send('Sequence not found');
    const body = await ejs.renderFile(path.join(VIEWS, 'sequences/detail.ejs'), {
      sequence: JSON.parse(JSON.stringify(sequence)),
    });
    res.render('layout', { title: sequence.name, body });
  } catch (err) {
    console.error('Sequence detail error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// GET /sequences/:id/edit — edit form
router.get('/:id/edit', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const sequence = await prisma.sequence.findUnique({
      where: { id },
      include: { steps: { orderBy: { stepOrder: 'asc' } }, enrollments: { where: { status: 'ACTIVE' } } },
    });
    if (!sequence) return res.status(404).send('Sequence not found');
    const templates = await prisma.messageTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    const body = await ejs.renderFile(path.join(VIEWS, 'sequences/form.ejs'), {
      sequence: JSON.parse(JSON.stringify(sequence)),
      templates: JSON.parse(JSON.stringify(templates)),
    });
    res.render('layout', { title: 'Edit — ' + sequence.name, body });
  } catch (err) {
    console.error('Edit sequence form error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// POST /sequences/:id — update sequence
router.post('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const { name, channel, isActive } = req.body;

    await prisma.sequence.update({
      where: { id },
      data: { name: name?.trim(), channel, isActive: isActive === 'on' },
    });

    // Delete old steps and recreate
    await prisma.sequenceStep.deleteMany({ where: { sequenceId: id } });

    const stepOrders = Array.isArray(req.body['steps.order']) ? req.body['steps.order'] : [req.body['steps.order']].filter(Boolean);
    const stepTemplates = Array.isArray(req.body['steps.templateId']) ? req.body['steps.templateId'] : [req.body['steps.templateId']].filter(Boolean);
    const stepChannels = Array.isArray(req.body['steps.channel']) ? req.body['steps.channel'] : [req.body['steps.channel']].filter(Boolean);
    const stepDelayDays = Array.isArray(req.body['steps.delayDays']) ? req.body['steps.delayDays'] : [req.body['steps.delayDays']].filter(Boolean);
    const stepDelayHours = Array.isArray(req.body['steps.delayHours']) ? req.body['steps.delayHours'] : [req.body['steps.delayHours']].filter(Boolean);

    for (let i = 0; i < stepOrders.length; i++) {
      await prisma.sequenceStep.create({
        data: {
          sequenceId: id,
          stepOrder: parseInt(stepOrders[i]),
          templateId: parseInt(stepTemplates[i]),
          channel: stepChannels[i] || channel || 'EMAIL',
          delayDays: parseInt(stepDelayDays[i]) || 0,
          delayHours: parseInt(stepDelayHours[i]) || 0,
        },
      });
    }

    await prisma.sequence.update({ where: { id }, data: { maxSteps: stepOrders.length } });

    res.redirect(`/sequences/${id}?success=Sequence+updated`);
  } catch (err) {
    console.error('Update sequence error:', err);
    res.redirect(`/sequences/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
  }
});

// POST /sequences/:id/enroll — manually enroll a lead
router.post('/:id/enroll', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const sequenceId = parseInt(req.params.id);
    const leadId = parseInt(req.body.leadId);
    const contactId = parseInt(req.body.contactId);
    await enrollLead(prisma, sequenceId, leadId, contactId);
    const redirectTo = req.body.redirectTo || `/sequences/${sequenceId}`;
    res.redirect(redirectTo + '?success=Lead+enrolled+in+sequence');
  } catch (err) {
    console.error('Enroll error:', err);
    const redirectTo = req.body.redirectTo || `/sequences/${req.params.id}`;
    res.redirect(redirectTo + '?error=' + encodeURIComponent(err.message));
  }
});

// POST /sequences/:id/enrollments/:eid/stop — stop enrollment
router.post('/:id/enrollments/:eid/stop', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    await stopEnrollment(prisma, parseInt(req.params.eid), 'MANUAL');
    res.redirect(`/sequences/${req.params.id}?success=Enrollment+stopped`);
  } catch (err) {
    console.error('Stop enrollment error:', err);
    res.redirect(`/sequences/${req.params.id}?error=` + encodeURIComponent(err.message));
  }
});

// POST /sequences/:id/enrollments/:eid/pause — toggle pause
router.post('/:id/enrollments/:eid/pause', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    await togglePause(prisma, parseInt(req.params.eid));
    res.redirect(`/sequences/${req.params.id}?success=Enrollment+toggled`);
  } catch (err) {
    console.error('Pause enrollment error:', err);
    res.redirect(`/sequences/${req.params.id}?error=` + encodeURIComponent(err.message));
  }
});

module.exports = router;
```

- [ ] **Step 2: Verify syntax**

```bash
cd outreach && node -e "require('./src/routes/sequences'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add outreach/src/routes/sequences.js
git commit -m "feat(outreach): add sequences route — CRUD, enroll, stop, pause"
```

---

## Task 10: Automations Route

**Files:**
- Create: `outreach/src/routes/automations.js`

- [ ] **Step 1: Create the automations route**

Create `outreach/src/routes/automations.js`:

```javascript
const express = require('express');
const path = require('path');
const ejs = require('ejs');
const router = express.Router();

const VIEWS = path.join(__dirname, '../../views');

const EVENTS = ['STAGE_CHANGE', 'LEAD_CREATED', 'EMAIL_BOUNCED', 'EMAIL_OPENED', 'EMAIL_CLICKED', 'QUOTE_EXPIRED', 'LEAD_STALE'];
const ACTION_TYPES = ['SEND_TEMPLATE', 'ENROLL_SEQUENCE', 'CHANGE_STAGE', 'CREATE_ACTIVITY'];
const { STAGES } = require('../services/pipeline');

// GET /automations — list all
router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const triggers = await prisma.automationTrigger.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const body = await ejs.renderFile(path.join(VIEWS, 'automations/index.ejs'), {
      triggers: JSON.parse(JSON.stringify(triggers)),
    });
    res.render('layout', { title: 'Automations', body });
  } catch (err) {
    console.error('Automations list error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// GET /automations/new — new trigger form
router.get('/new', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const templates = await prisma.messageTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    const sequences = await prisma.sequence.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    const body = await ejs.renderFile(path.join(VIEWS, 'automations/form.ejs'), {
      trigger: null,
      EVENTS, ACTION_TYPES, STAGES,
      templates: JSON.parse(JSON.stringify(templates)),
      sequences: JSON.parse(JSON.stringify(sequences)),
    });
    res.render('layout', { title: 'New Automation', body });
  } catch (err) {
    console.error('New automation form error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// POST /automations — create trigger
router.post('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const { name, event, actionType, cooldownHours } = req.body;

    // Build eventFilter based on event type
    const eventFilter = {};
    if (event === 'STAGE_CHANGE') {
      if (req.body.fromStage) eventFilter.fromStage = req.body.fromStage;
      if (req.body.toStage) eventFilter.toStage = req.body.toStage;
    } else if (event === 'LEAD_CREATED') {
      if (req.body.filterSource) eventFilter.source = req.body.filterSource;
      if (req.body.filterIcpType) eventFilter.icpType = req.body.filterIcpType;
    }

    // Build actionConfig based on actionType
    const actionConfig = {};
    if (actionType === 'SEND_TEMPLATE') {
      actionConfig.templateId = parseInt(req.body.actionTemplateId);
      actionConfig.channel = req.body.actionChannel || 'EMAIL';
    } else if (actionType === 'ENROLL_SEQUENCE') {
      actionConfig.sequenceId = parseInt(req.body.actionSequenceId);
    } else if (actionType === 'CHANGE_STAGE') {
      actionConfig.toStage = req.body.actionToStage;
    } else if (actionType === 'CREATE_ACTIVITY') {
      actionConfig.activityType = req.body.actionActivityType || 'NOTE';
      actionConfig.subject = req.body.actionSubject || 'Automation triggered';
    }

    const trigger = await prisma.automationTrigger.create({
      data: {
        name: name?.trim() || 'Untitled Trigger',
        event,
        eventFilter: Object.keys(eventFilter).length > 0 ? eventFilter : null,
        actionType,
        actionConfig,
        cooldownHours: parseInt(cooldownHours) || 0,
      },
    });

    res.redirect('/automations?success=Trigger+created');
  } catch (err) {
    console.error('Create trigger error:', err);
    res.redirect('/automations/new?error=' + encodeURIComponent(err.message));
  }
});

// GET /automations/:id/edit — edit trigger
router.get('/:id/edit', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const trigger = await prisma.automationTrigger.findUnique({ where: { id } });
    if (!trigger) return res.status(404).send('Trigger not found');
    const templates = await prisma.messageTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    const sequences = await prisma.sequence.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    const body = await ejs.renderFile(path.join(VIEWS, 'automations/form.ejs'), {
      trigger: JSON.parse(JSON.stringify(trigger)),
      EVENTS, ACTION_TYPES, STAGES,
      templates: JSON.parse(JSON.stringify(templates)),
      sequences: JSON.parse(JSON.stringify(sequences)),
    });
    res.render('layout', { title: 'Edit — ' + trigger.name, body });
  } catch (err) {
    console.error('Edit trigger error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// POST /automations/:id — update trigger
router.post('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const { name, event, actionType, cooldownHours } = req.body;

    const eventFilter = {};
    if (event === 'STAGE_CHANGE') {
      if (req.body.fromStage) eventFilter.fromStage = req.body.fromStage;
      if (req.body.toStage) eventFilter.toStage = req.body.toStage;
    } else if (event === 'LEAD_CREATED') {
      if (req.body.filterSource) eventFilter.source = req.body.filterSource;
      if (req.body.filterIcpType) eventFilter.icpType = req.body.filterIcpType;
    }

    const actionConfig = {};
    if (actionType === 'SEND_TEMPLATE') {
      actionConfig.templateId = parseInt(req.body.actionTemplateId);
      actionConfig.channel = req.body.actionChannel || 'EMAIL';
    } else if (actionType === 'ENROLL_SEQUENCE') {
      actionConfig.sequenceId = parseInt(req.body.actionSequenceId);
    } else if (actionType === 'CHANGE_STAGE') {
      actionConfig.toStage = req.body.actionToStage;
    } else if (actionType === 'CREATE_ACTIVITY') {
      actionConfig.activityType = req.body.actionActivityType || 'NOTE';
      actionConfig.subject = req.body.actionSubject || 'Automation triggered';
    }

    await prisma.automationTrigger.update({
      where: { id },
      data: {
        name: name?.trim(),
        event,
        eventFilter: Object.keys(eventFilter).length > 0 ? eventFilter : null,
        actionType,
        actionConfig,
        cooldownHours: parseInt(cooldownHours) || 0,
      },
    });

    res.redirect('/automations?success=Trigger+updated');
  } catch (err) {
    console.error('Update trigger error:', err);
    res.redirect(`/automations/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
  }
});

// POST /automations/:id/delete — delete trigger
router.post('/:id/delete', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    await prisma.automationTrigger.delete({ where: { id: parseInt(req.params.id) } });
    res.redirect('/automations?success=Trigger+deleted');
  } catch (err) {
    console.error('Delete trigger error:', err);
    res.redirect('/automations?error=' + encodeURIComponent(err.message));
  }
});

// POST /automations/:id/toggle — toggle isActive
router.post('/:id/toggle', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const trigger = await prisma.automationTrigger.findUnique({ where: { id } });
    if (!trigger) return res.status(404).send('Not found');
    await prisma.automationTrigger.update({
      where: { id },
      data: { isActive: !trigger.isActive },
    });
    res.redirect('/automations?success=Trigger+' + (trigger.isActive ? 'disabled' : 'enabled'));
  } catch (err) {
    console.error('Toggle trigger error:', err);
    res.redirect('/automations?error=' + encodeURIComponent(err.message));
  }
});

module.exports = router;
```

- [ ] **Step 2: Verify syntax**

```bash
cd outreach && node -e "require('./src/routes/automations'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add outreach/src/routes/automations.js
git commit -m "feat(outreach): add automations route — trigger CRUD, toggle, delete"
```

---

## Task 11: Jobs Route

**Files:**
- Create: `outreach/src/routes/jobs.js`

- [ ] **Step 1: Create the jobs route**

Create `outreach/src/routes/jobs.js`:

```javascript
const express = require('express');
const path = require('path');
const ejs = require('ejs');
const router = express.Router();

const VIEWS = path.join(__dirname, '../../views');

// GET /jobs — job queue list
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

// POST /jobs/:id/retry — retry a failed job
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

// POST /jobs/:id/cancel — cancel a pending job
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
```

- [ ] **Step 2: Verify syntax**

```bash
cd outreach && node -e "require('./src/routes/jobs'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add outreach/src/routes/jobs.js
git commit -m "feat(outreach): add jobs route — queue view, retry, cancel"
```

---

## Task 12: Sidebar Navigation Update

**Files:**
- Modify: `outreach/views/layout.ejs`

- [ ] **Step 1: Add Automation section to sidebar**

In `outreach/views/layout.ejs`, find the "Outreach" nav section (around lines 63-77). After that section's closing `</div>` (line 77), add a new section before the "Data" label:

```html
      <div class="nav-section-label">Automation</div>
      <div class="nav-section">
        <a href="/sequences" class="nav-item <%= currentPath.startsWith('/sequences') ? 'active' : '' %>">
          <i data-lucide="workflow" class="nav-icon"></i>
          <span class="nav-label">Sequences</span>
        </a>
        <a href="/automations" class="nav-item <%= currentPath.startsWith('/automations') ? 'active' : '' %>">
          <i data-lucide="zap" class="nav-icon"></i>
          <span class="nav-label">Automations</span>
        </a>
        <a href="/jobs" class="nav-item <%= currentPath.startsWith('/jobs') ? 'active' : '' %>">
          <i data-lucide="clock" class="nav-icon"></i>
          <span class="nav-label">Job Queue</span>
        </a>
      </div>
```

- [ ] **Step 2: Commit**

```bash
git add outreach/views/layout.ejs
git commit -m "feat(outreach): add Sequences, Automations, Job Queue to sidebar nav"
```

---

## Task 13: Sequences Views

**Files:**
- Create: `outreach/views/sequences/index.ejs`
- Create: `outreach/views/sequences/form.ejs`
- Create: `outreach/views/sequences/detail.ejs`

- [ ] **Step 1: Create sequences directory**

```bash
mkdir -p outreach/views/sequences
```

- [ ] **Step 2: Create sequences/index.ejs**

Create `outreach/views/sequences/index.ejs`:

```html
<div class="page-header">
  <h1>Sequences</h1>
  <a href="/sequences/new" class="btn btn-primary">+ New Sequence</a>
</div>

<% if (sequences.length === 0) { %>
  <p class="text-muted" style="font-size:0.9rem;margin-top:1rem">No sequences created yet.</p>
<% } else { %>
<div class="table-wrapper">
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Channel</th>
        <th>Steps</th>
        <th>Active Enrollments</th>
        <th>Status</th>
        <th>Created</th>
      </tr>
    </thead>
    <tbody>
      <% sequences.forEach(function(seq) { %>
      <tr>
        <td><a href="/sequences/<%= seq.id %>" style="font-weight:600;color:var(--navy-800)"><%= seq.name %></a></td>
        <td><span class="badge"><%= seq.channel %></span></td>
        <td><%= seq.steps.length %></td>
        <td><%= seq.enrollments.length %></td>
        <td>
          <span class="badge" style="background:<%= seq.isActive ? 'var(--success-bg)' : 'var(--bg-warm)' %>;color:<%= seq.isActive ? 'var(--success)' : 'var(--text-tertiary)' %>">
            <%= seq.isActive ? 'Active' : 'Inactive' %>
          </span>
        </td>
        <td class="text-muted"><%= new Date(seq.createdAt).toLocaleDateString('en-IN') %></td>
      </tr>
      <% }); %>
    </tbody>
  </table>
</div>
<% } %>
```

- [ ] **Step 3: Create sequences/form.ejs**

Create `outreach/views/sequences/form.ejs`:

```html
<div class="page-header">
  <h1><%= sequence ? 'Edit Sequence' : 'New Sequence' %></h1>
  <a href="/sequences" class="btn btn-secondary">&larr; Back</a>
</div>

<% if (sequence && sequence.enrollments && sequence.enrollments.length > 0) { %>
  <div class="flash flash-error" style="margin-bottom:1rem">
    Warning: This sequence has <%= sequence.enrollments.length %> active enrollment(s). Editing steps may affect in-progress flows.
  </div>
<% } %>

<form method="POST" action="<%= sequence ? '/sequences/' + sequence.id : '/sequences' %>" id="seq-form">
  <div style="max-width:700px">
    <div class="form-card" style="max-width:none;margin-bottom:1.5rem">
      <h2 style="font-family:'Fraunces',serif;font-size:1rem;font-weight:700;color:var(--navy-800);margin-bottom:1.25rem;padding-bottom:0.5rem;border-bottom:1px solid var(--border)">Sequence Info</h2>

      <div class="form-group">
        <label>Name *</label>
        <input type="text" name="name" required value="<%= sequence ? sequence.name : '' %>" placeholder="e.g. Cold Intro — Paper">
      </div>

      <div class="form-group">
        <label>Channel</label>
        <select name="channel">
          <option value="EMAIL" <%= sequence && sequence.channel === 'EMAIL' ? 'selected' : '' %>>EMAIL</option>
          <option value="WHATSAPP" <%= sequence && sequence.channel === 'WHATSAPP' ? 'selected' : '' %>>WHATSAPP</option>
          <option value="MIXED" <%= sequence && sequence.channel === 'MIXED' ? 'selected' : '' %>>MIXED</option>
        </select>
      </div>

      <% if (sequence) { %>
      <div class="form-group">
        <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer">
          <input type="checkbox" name="isActive" value="on" <%= sequence.isActive ? 'checked' : '' %>>
          <span>Active</span>
        </label>
      </div>
      <% } %>
    </div>

    <div class="form-card" style="max-width:none;margin-bottom:1.5rem">
      <h2 style="font-family:'Fraunces',serif;font-size:1rem;font-weight:700;color:var(--navy-800);margin-bottom:1.25rem;padding-bottom:0.5rem;border-bottom:1px solid var(--border)">Steps</h2>
      <p class="text-muted" style="font-size:0.82rem;margin-bottom:1rem">Add up to 5 steps. Each step sends a template after a delay from the previous step.</p>

      <div id="steps-container">
        <% if (sequence && sequence.steps) { %>
          <% sequence.steps.forEach(function(step, i) { %>
            <div class="step-row" style="border:1px solid var(--border);border-radius:var(--radius);padding:1rem;margin-bottom:0.75rem;background:var(--surface)">
              <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem">
                <strong style="font-size:0.85rem">Step <%= step.stepOrder %></strong>
                <input type="hidden" name="steps.order" value="<%= step.stepOrder %>">
                <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.step-row').remove()" style="margin-left:auto">Remove</button>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Template</label>
                  <select name="steps.templateId" required>
                    <% templates.forEach(function(t) { %>
                      <option value="<%= t.id %>" <%= t.id === step.templateId ? 'selected' : '' %>>[<%= t.channel %>] <%= t.name %></option>
                    <% }); %>
                  </select>
                </div>
                <div class="form-group">
                  <label>Channel</label>
                  <select name="steps.channel">
                    <option value="EMAIL" <%= step.channel === 'EMAIL' ? 'selected' : '' %>>EMAIL</option>
                    <option value="WHATSAPP" <%= step.channel === 'WHATSAPP' ? 'selected' : '' %>>WHATSAPP</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Delay (days)</label>
                  <input type="number" name="steps.delayDays" min="0" max="30" value="<%= step.delayDays %>">
                </div>
                <div class="form-group">
                  <label>Delay (hours)</label>
                  <input type="number" name="steps.delayHours" min="0" max="23" value="<%= step.delayHours %>">
                </div>
              </div>
            </div>
          <% }); %>
        <% } %>
      </div>

      <button type="button" class="btn btn-secondary" onclick="addStep()">+ Add Step</button>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary"><%= sequence ? 'Update Sequence' : 'Create Sequence' %></button>
      <a href="/sequences" class="btn btn-secondary">Cancel</a>
    </div>
  </div>
</form>

<script>
var stepCount = document.querySelectorAll('.step-row').length;
var templatesJson = <%- JSON.stringify(templates) %>;

function addStep() {
  if (stepCount >= 5) { alert('Maximum 5 steps'); return; }
  stepCount++;
  var div = document.createElement('div');
  div.className = 'step-row';
  div.style.cssText = 'border:1px solid var(--border);border-radius:var(--radius);padding:1rem;margin-bottom:0.75rem;background:var(--surface)';

  var templateOpts = templatesJson.map(function(t) {
    return '<option value="' + t.id + '">[' + t.channel + '] ' + escHtml(t.name) + '</option>';
  }).join('');

  div.innerHTML =
    '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem">' +
      '<strong style="font-size:0.85rem">Step ' + stepCount + '</strong>' +
      '<input type="hidden" name="steps.order" value="' + stepCount + '">' +
      '<button type="button" class="btn btn-sm btn-danger" onclick="this.closest(\'.step-row\').remove()" style="margin-left:auto">Remove</button>' +
    '</div>' +
    '<div class="form-row">' +
      '<div class="form-group"><label>Template</label><select name="steps.templateId" required>' + templateOpts + '</select></div>' +
      '<div class="form-group"><label>Channel</label><select name="steps.channel"><option value="EMAIL">EMAIL</option><option value="WHATSAPP">WHATSAPP</option></select></div>' +
    '</div>' +
    '<div class="form-row">' +
      '<div class="form-group"><label>Delay (days)</label><input type="number" name="steps.delayDays" min="0" max="30" value="0"></div>' +
      '<div class="form-group"><label>Delay (hours)</label><input type="number" name="steps.delayHours" min="0" max="23" value="0"></div>' +
    '</div>';
  document.getElementById('steps-container').appendChild(div);
}

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
</script>
```

- [ ] **Step 4: Create sequences/detail.ejs**

Create `outreach/views/sequences/detail.ejs`:

```html
<div class="page-header">
  <h1><%= sequence.name %></h1>
  <div style="display:flex;gap:0.5rem">
    <span class="badge"><%= sequence.channel %></span>
    <span class="badge" style="background:<%= sequence.isActive ? 'var(--success-bg)' : 'var(--bg-warm)' %>;color:<%= sequence.isActive ? 'var(--success)' : 'var(--text-tertiary)' %>">
      <%= sequence.isActive ? 'Active' : 'Inactive' %>
    </span>
    <a href="/sequences/<%= sequence.id %>/edit" class="btn btn-secondary btn-sm">Edit</a>
    <a href="/sequences" class="btn btn-secondary btn-sm">&larr; Sequences</a>
  </div>
</div>

<!-- Steps Timeline -->
<div class="section">
  <h2>Steps <span style="font-size:0.8rem;font-weight:400;color:var(--text-tertiary)">(<%= sequence.steps.length %> total)</span></h2>
  <% if (sequence.steps.length === 0) { %>
    <p class="text-muted">No steps defined. <a href="/sequences/<%= sequence.id %>/edit">Add steps</a></p>
  <% } else { %>
  <div style="display:flex;flex-direction:column;gap:0.5rem;max-width:600px">
    <% sequence.steps.forEach(function(step, i) { %>
    <div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface)">
      <div style="width:28px;height:28px;border-radius:50%;background:var(--navy-700);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0"><%= step.stepOrder %></div>
      <div style="flex:1">
        <div style="font-weight:600;font-size:0.88rem"><%= step.template.name %></div>
        <div class="text-muted" style="font-size:0.78rem">
          <%= step.channel %> &middot;
          <% if (step.delayDays > 0 || step.delayHours > 0) { %>
            Wait <%= step.delayDays > 0 ? step.delayDays + 'd ' : '' %><%= step.delayHours > 0 ? step.delayHours + 'h' : '' %> after step <%= i === 0 ? 'enrollment' : (step.stepOrder - 1) %>
          <% } else { %>
            Send immediately<%= i === 0 ? ' on enrollment' : '' %>
          <% } %>
        </div>
      </div>
    </div>
    <% if (i < sequence.steps.length - 1) { %>
      <div style="margin-left:14px;width:1px;height:16px;background:var(--border)"></div>
    <% } %>
    <% }); %>
  </div>
  <% } %>
</div>

<!-- Enrollments -->
<div class="section" style="margin-top:2rem">
  <h2>Enrollments <span style="font-size:0.8rem;font-weight:400;color:var(--text-tertiary)">(<%= sequence.enrollments.length %>)</span></h2>
  <% if (sequence.enrollments.length === 0) { %>
    <p class="text-muted" style="font-size:0.9rem">No leads enrolled in this sequence yet.</p>
  <% } else { %>
  <div class="table-wrapper">
    <table style="font-size:0.85rem">
      <thead>
        <tr>
          <th>Lead</th>
          <th>Contact</th>
          <th>Current Step</th>
          <th>Status</th>
          <th>Enrolled</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <% sequence.enrollments.forEach(function(e) { %>
        <%
          var statusColor = { ACTIVE: 'var(--success)', COMPLETED: 'var(--info)', STOPPED: 'var(--error)', PAUSED: 'var(--warning)' }[e.status] || 'var(--text-tertiary)';
        %>
        <tr>
          <td><a href="/leads/<%= e.lead.id %>" style="font-weight:600;color:var(--navy-800)"><%= e.lead.companyName %></a></td>
          <td><%= e.contact ? e.contact.name : '—' %></td>
          <td><%= e.currentStep %> / <%= sequence.steps.length %></td>
          <td>
            <span class="badge" style="color:<%= statusColor %>"><%= e.status %></span>
            <% if (e.stoppedReason) { %>
              <span class="text-muted" style="font-size:0.75rem">(<%= e.stoppedReason %>)</span>
            <% } %>
          </td>
          <td class="text-muted"><%= new Date(e.createdAt).toLocaleDateString('en-IN') %></td>
          <td>
            <% if (e.status === 'ACTIVE') { %>
              <form method="POST" action="/sequences/<%= sequence.id %>/enrollments/<%= e.id %>/pause" style="display:inline">
                <button type="submit" class="btn btn-sm btn-secondary">Pause</button>
              </form>
              <form method="POST" action="/sequences/<%= sequence.id %>/enrollments/<%= e.id %>/stop" style="display:inline">
                <button type="submit" class="btn btn-sm btn-danger">Stop</button>
              </form>
            <% } else if (e.status === 'PAUSED') { %>
              <form method="POST" action="/sequences/<%= sequence.id %>/enrollments/<%= e.id %>/pause" style="display:inline">
                <button type="submit" class="btn btn-sm btn-secondary">Resume</button>
              </form>
              <form method="POST" action="/sequences/<%= sequence.id %>/enrollments/<%= e.id %>/stop" style="display:inline">
                <button type="submit" class="btn btn-sm btn-danger">Stop</button>
              </form>
            <% } else { %>
              <span class="text-muted" style="font-size:0.78rem">&mdash;</span>
            <% } %>
          </td>
        </tr>
        <% }); %>
      </tbody>
    </table>
  </div>
  <% } %>
</div>
```

- [ ] **Step 5: Commit**

```bash
git add outreach/views/sequences/
git commit -m "feat(outreach): add sequence views — list, form with step builder, detail with enrollments"
```

---

## Task 14: Automations Views

**Files:**
- Create: `outreach/views/automations/index.ejs`
- Create: `outreach/views/automations/form.ejs`

- [ ] **Step 1: Create automations directory**

```bash
mkdir -p outreach/views/automations
```

- [ ] **Step 2: Create automations/index.ejs**

Create `outreach/views/automations/index.ejs`:

```html
<div class="page-header">
  <h1>Automations</h1>
  <a href="/automations/new" class="btn btn-primary">+ New Trigger</a>
</div>

<% if (triggers.length === 0) { %>
  <p class="text-muted" style="font-size:0.9rem;margin-top:1rem">No automation triggers configured yet.</p>
<% } else { %>
<div class="table-wrapper">
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Event</th>
        <th>Action</th>
        <th>Cooldown</th>
        <th>Status</th>
        <th>Last Fired</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <% triggers.forEach(function(t) { %>
      <%
        var actionSummary = t.actionType.replace(/_/g, ' ').toLowerCase();
        var eventLabel = t.event.replace(/_/g, ' ');
        var filterNote = '';
        if (t.eventFilter) {
          var parts = [];
          if (t.eventFilter.toStage) parts.push('to ' + t.eventFilter.toStage);
          if (t.eventFilter.fromStage) parts.push('from ' + t.eventFilter.fromStage);
          if (t.eventFilter.source) parts.push('source=' + t.eventFilter.source);
          if (t.eventFilter.icpType) parts.push('ICP=' + t.eventFilter.icpType);
          if (parts.length) filterNote = ' (' + parts.join(', ') + ')';
        }
      %>
      <tr>
        <td><a href="/automations/<%= t.id %>/edit" style="font-weight:600;color:var(--navy-800)"><%= t.name %></a></td>
        <td><span class="badge"><%= eventLabel %></span><span class="text-muted" style="font-size:0.75rem"><%= filterNote %></span></td>
        <td style="font-size:0.85rem"><%= actionSummary %></td>
        <td class="text-muted"><%= t.cooldownHours > 0 ? t.cooldownHours + 'h' : '—' %></td>
        <td>
          <form method="POST" action="/automations/<%= t.id %>/toggle" style="display:inline">
            <button type="submit" class="btn btn-sm" style="background:<%= t.isActive ? 'var(--success-bg)' : 'var(--bg-warm)' %>;color:<%= t.isActive ? 'var(--success)' : 'var(--text-tertiary)' %>;border:none;cursor:pointer">
              <%= t.isActive ? 'ON' : 'OFF' %>
            </button>
          </form>
        </td>
        <td class="text-muted" style="font-size:0.82rem">
          <%= t.lastFiredAt ? new Date(t.lastFiredAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—' %>
        </td>
        <td>
          <a href="/automations/<%= t.id %>/edit" class="btn btn-sm btn-secondary">Edit</a>
          <form method="POST" action="/automations/<%= t.id %>/delete" style="display:inline" onsubmit="return confirm('Delete this trigger?')">
            <button type="submit" class="btn btn-sm btn-danger">Delete</button>
          </form>
        </td>
      </tr>
      <% }); %>
    </tbody>
  </table>
</div>
<% } %>
```

- [ ] **Step 3: Create automations/form.ejs**

Create `outreach/views/automations/form.ejs`:

```html
<div class="page-header">
  <h1><%= trigger ? 'Edit Automation' : 'New Automation' %></h1>
  <a href="/automations" class="btn btn-secondary">&larr; Back</a>
</div>

<form method="POST" action="<%= trigger ? '/automations/' + trigger.id : '/automations' %>">
  <div style="max-width:700px">
    <div class="form-card" style="max-width:none;margin-bottom:1.5rem">
      <h2 style="font-family:'Fraunces',serif;font-size:1rem;font-weight:700;color:var(--navy-800);margin-bottom:1.25rem;padding-bottom:0.5rem;border-bottom:1px solid var(--border)">Trigger Setup</h2>

      <div class="form-group">
        <label>Name *</label>
        <input type="text" name="name" required value="<%= trigger ? trigger.name : '' %>" placeholder="e.g. Bounce → Dormant">
      </div>

      <div class="form-group">
        <label>When this event occurs *</label>
        <select name="event" id="event-select" required onchange="showEventFilters()">
          <option value="">— Select event —</option>
          <% EVENTS.forEach(function(e) { %>
            <option value="<%= e %>" <%= trigger && trigger.event === e ? 'selected' : '' %>><%= e.replace(/_/g, ' ') %></option>
          <% }); %>
        </select>
      </div>

      <!-- Event-specific filters -->
      <div id="stage-filters" style="display:none">
        <div class="form-row">
          <div class="form-group">
            <label>From Stage (optional)</label>
            <select name="fromStage">
              <option value="">Any</option>
              <% STAGES.forEach(function(s) { %>
                <option value="<%= s %>" <%= trigger && trigger.eventFilter && trigger.eventFilter.fromStage === s ? 'selected' : '' %>><%= s %></option>
              <% }); %>
            </select>
          </div>
          <div class="form-group">
            <label>To Stage (optional)</label>
            <select name="toStage">
              <option value="">Any</option>
              <% STAGES.forEach(function(s) { %>
                <option value="<%= s %>" <%= trigger && trigger.eventFilter && trigger.eventFilter.toStage === s ? 'selected' : '' %>><%= s %></option>
              <% }); %>
            </select>
          </div>
        </div>
      </div>

      <div id="lead-created-filters" style="display:none">
        <div class="form-row">
          <div class="form-group">
            <label>Source (optional)</label>
            <select name="filterSource">
              <option value="">Any</option>
              <option value="GOOGLE" <%= trigger && trigger.eventFilter && trigger.eventFilter.source === 'GOOGLE' ? 'selected' : '' %>>GOOGLE</option>
              <option value="LINKEDIN" <%= trigger && trigger.eventFilter && trigger.eventFilter.source === 'LINKEDIN' ? 'selected' : '' %>>LINKEDIN</option>
              <option value="INDIAMART" <%= trigger && trigger.eventFilter && trigger.eventFilter.source === 'INDIAMART' ? 'selected' : '' %>>INDIAMART</option>
              <option value="GEM" <%= trigger && trigger.eventFilter && trigger.eventFilter.source === 'GEM' ? 'selected' : '' %>>GEM</option>
              <option value="MANUAL" <%= trigger && trigger.eventFilter && trigger.eventFilter.source === 'MANUAL' ? 'selected' : '' %>>MANUAL</option>
            </select>
          </div>
          <div class="form-group">
            <label>ICP Type (optional)</label>
            <select name="filterIcpType">
              <option value="">Any</option>
              <option value="PAPER" <%= trigger && trigger.eventFilter && trigger.eventFilter.icpType === 'PAPER' ? 'selected' : '' %>>PAPER</option>
              <option value="PP" <%= trigger && trigger.eventFilter && trigger.eventFilter.icpType === 'PP' ? 'selected' : '' %>>PP</option>
              <option value="BOTH" <%= trigger && trigger.eventFilter && trigger.eventFilter.icpType === 'BOTH' ? 'selected' : '' %>>BOTH</option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Cooldown (hours)</label>
        <input type="number" name="cooldownHours" min="0" max="720" value="<%= trigger ? trigger.cooldownHours : 0 %>" style="max-width:120px">
        <p class="text-light" style="font-size:0.78rem;margin-top:0.25rem">Don't re-fire for the same lead within this many hours. 0 = no cooldown.</p>
      </div>
    </div>

    <div class="form-card" style="max-width:none;margin-bottom:1.5rem">
      <h2 style="font-family:'Fraunces',serif;font-size:1rem;font-weight:700;color:var(--navy-800);margin-bottom:1.25rem;padding-bottom:0.5rem;border-bottom:1px solid var(--border)">Action</h2>

      <div class="form-group">
        <label>Then do this *</label>
        <select name="actionType" id="action-select" required onchange="showActionConfig()">
          <option value="">— Select action —</option>
          <% ACTION_TYPES.forEach(function(a) { %>
            <option value="<%= a %>" <%= trigger && trigger.actionType === a ? 'selected' : '' %>><%= a.replace(/_/g, ' ') %></option>
          <% }); %>
        </select>
      </div>

      <!-- SEND_TEMPLATE config -->
      <div id="action-send-template" style="display:none">
        <div class="form-row">
          <div class="form-group">
            <label>Template</label>
            <select name="actionTemplateId">
              <option value="">— Select —</option>
              <% templates.forEach(function(t) { %>
                <option value="<%= t.id %>" <%= trigger && trigger.actionConfig && trigger.actionConfig.templateId === t.id ? 'selected' : '' %>>[<%= t.channel %>] <%= t.name %></option>
              <% }); %>
            </select>
          </div>
          <div class="form-group">
            <label>Channel</label>
            <select name="actionChannel">
              <option value="EMAIL" <%= trigger && trigger.actionConfig && trigger.actionConfig.channel === 'EMAIL' ? 'selected' : '' %>>EMAIL</option>
              <option value="WHATSAPP" <%= trigger && trigger.actionConfig && trigger.actionConfig.channel === 'WHATSAPP' ? 'selected' : '' %>>WHATSAPP</option>
            </select>
          </div>
        </div>
      </div>

      <!-- ENROLL_SEQUENCE config -->
      <div id="action-enroll-sequence" style="display:none">
        <div class="form-group">
          <label>Sequence</label>
          <select name="actionSequenceId">
            <option value="">— Select —</option>
            <% sequences.forEach(function(s) { %>
              <option value="<%= s.id %>" <%= trigger && trigger.actionConfig && trigger.actionConfig.sequenceId === s.id ? 'selected' : '' %>><%= s.name %> (<%= s.channel %>)</option>
            <% }); %>
          </select>
        </div>
      </div>

      <!-- CHANGE_STAGE config -->
      <div id="action-change-stage" style="display:none">
        <div class="form-group">
          <label>Move to Stage</label>
          <select name="actionToStage">
            <% STAGES.forEach(function(s) { %>
              <option value="<%= s %>" <%= trigger && trigger.actionConfig && trigger.actionConfig.toStage === s ? 'selected' : '' %>><%= s %></option>
            <% }); %>
          </select>
        </div>
      </div>

      <!-- CREATE_ACTIVITY config -->
      <div id="action-create-activity" style="display:none">
        <div class="form-group">
          <label>Activity Subject</label>
          <input type="text" name="actionSubject" value="<%= trigger && trigger.actionConfig ? (trigger.actionConfig.subject || '') : '' %>" placeholder="e.g. Auto-flagged as stale">
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary"><%= trigger ? 'Update Trigger' : 'Create Trigger' %></button>
      <a href="/automations" class="btn btn-secondary">Cancel</a>
    </div>
  </div>
</form>

<script>
function showEventFilters() {
  var event = document.getElementById('event-select').value;
  document.getElementById('stage-filters').style.display = event === 'STAGE_CHANGE' ? '' : 'none';
  document.getElementById('lead-created-filters').style.display = event === 'LEAD_CREATED' ? '' : 'none';
}

function showActionConfig() {
  var action = document.getElementById('action-select').value;
  document.getElementById('action-send-template').style.display = action === 'SEND_TEMPLATE' ? '' : 'none';
  document.getElementById('action-enroll-sequence').style.display = action === 'ENROLL_SEQUENCE' ? '' : 'none';
  document.getElementById('action-change-stage').style.display = action === 'CHANGE_STAGE' ? '' : 'none';
  document.getElementById('action-create-activity').style.display = action === 'CREATE_ACTIVITY' ? '' : 'none';
}

// Initialize visibility on page load (for edit mode)
showEventFilters();
showActionConfig();
</script>
```

- [ ] **Step 4: Commit**

```bash
git add outreach/views/automations/
git commit -m "feat(outreach): add automation views — trigger list with toggle, form with dynamic event/action config"
```

---

## Task 15: Jobs View

**Files:**
- Create: `outreach/views/jobs/index.ejs`

- [ ] **Step 1: Create jobs directory and view**

```bash
mkdir -p outreach/views/jobs
```

Create `outreach/views/jobs/index.ejs`:

```html
<div class="page-header">
  <h1>Job Queue</h1>
</div>

<!-- Filters -->
<div style="display:flex;gap:1rem;margin-bottom:1.25rem;flex-wrap:wrap">
  <form method="GET" action="/jobs" style="display:flex;gap:0.75rem;align-items:flex-end;flex-wrap:wrap">
    <div class="form-group" style="margin-bottom:0">
      <label style="font-size:0.78rem">Status</label>
      <select name="status" style="min-width:120px" onchange="this.form.submit()">
        <option value="">All</option>
        <% ['PENDING','PROCESSING','COMPLETED','FAILED','DEFERRED','CANCELLED'].forEach(function(s) { %>
          <option value="<%= s %>" <%= statusFilter === s ? 'selected' : '' %>><%= s %></option>
        <% }); %>
      </select>
    </div>
    <div class="form-group" style="margin-bottom:0">
      <label style="font-size:0.78rem">Type</label>
      <select name="type" style="min-width:160px" onchange="this.form.submit()">
        <option value="">All</option>
        <% ['SEQUENCE_STEP','SCHEDULED_CAMPAIGN','RECURRING_CAMPAIGN','TRIGGER_ACTION','DAILY_SWEEP'].forEach(function(t) { %>
          <option value="<%= t %>" <%= typeFilter === t ? 'selected' : '' %>><%= t.replace(/_/g, ' ') %></option>
        <% }); %>
      </select>
    </div>
  </form>
</div>

<% if (jobs.length === 0) { %>
  <p class="text-muted" style="font-size:0.9rem">No jobs found.</p>
<% } else { %>
<div class="table-wrapper">
  <table style="font-size:0.82rem">
    <thead>
      <tr>
        <th>ID</th>
        <th>Type</th>
        <th>Status</th>
        <th>Scheduled For</th>
        <th>Attempts</th>
        <th>Error</th>
        <th>Processed</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <% jobs.forEach(function(job) { %>
      <%
        var statusColors = {
          PENDING: 'var(--warning)', PROCESSING: 'var(--info)', COMPLETED: 'var(--success)',
          FAILED: 'var(--error)', DEFERRED: 'var(--text-tertiary)', CANCELLED: 'var(--text-tertiary)'
        };
        var fmtDate = function(d) { return d ? new Date(d).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'; };
      %>
      <tr>
        <td class="text-mono"><%= job.id %></td>
        <td><span class="badge"><%= job.type.replace(/_/g, ' ') %></span></td>
        <td><span style="color:<%= statusColors[job.status] || 'inherit' %>;font-weight:600"><%= job.status %></span></td>
        <td class="text-muted"><%= fmtDate(job.scheduledFor) %></td>
        <td class="text-mono"><%= job.attempts %> / <%= job.maxAttempts %></td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--error);font-size:0.78rem" title="<%= job.lastError || '' %>">
          <%= job.lastError || '—' %>
        </td>
        <td class="text-muted"><%= fmtDate(job.processedAt) %></td>
        <td>
          <% if (job.status === 'FAILED') { %>
            <form method="POST" action="/jobs/<%= job.id %>/retry" style="display:inline">
              <button type="submit" class="btn btn-sm btn-secondary">Retry</button>
            </form>
          <% } %>
          <% if (job.status === 'PENDING' || job.status === 'DEFERRED') { %>
            <form method="POST" action="/jobs/<%= job.id %>/cancel" style="display:inline">
              <button type="submit" class="btn btn-sm btn-danger">Cancel</button>
            </form>
          <% } %>
          <% if (job.status === 'COMPLETED' || job.status === 'CANCELLED') { %>
            <span class="text-muted">&mdash;</span>
          <% } %>
        </td>
      </tr>
      <% }); %>
    </tbody>
  </table>
</div>
<% } %>
```

- [ ] **Step 2: Commit**

```bash
git add outreach/views/jobs/
git commit -m "feat(outreach): add job queue view — filterable table with retry/cancel actions"
```

---

## Task 16: Campaign Form — Add Scheduling Fields

**Files:**
- Modify: `outreach/views/campaigns/new.ejs`

- [ ] **Step 1: Add scheduling fields to campaign form**

In `outreach/views/campaigns/new.ejs`, replace the "Send Options" form-card section (lines 108-129) with:

```html
      <!-- Send Options -->
      <div class="form-card" style="max-width:none">
        <h2 style="font-family:'Fraunces',serif;font-size:1rem;font-weight:700;color:var(--navy-800);margin-bottom:1.25rem;padding-bottom:0.5rem;border-bottom:1px solid var(--border)">Send Options</h2>

        <div class="form-group">
          <label>Send Mode</label>
          <div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.25rem">
            <label style="display:flex;align-items:center;gap:0.4rem;font-weight:400;font-size:0.9rem;cursor:pointer">
              <input type="radio" name="sendMode" value="now" checked onchange="toggleScheduling()"> Send Now
            </label>
            <label style="display:flex;align-items:center;gap:0.4rem;font-weight:400;font-size:0.9rem;cursor:pointer">
              <input type="radio" name="sendMode" value="scheduled" onchange="toggleScheduling()"> Schedule for Later
            </label>
            <label style="display:flex;align-items:center;gap:0.4rem;font-weight:400;font-size:0.9rem;cursor:pointer">
              <input type="radio" name="sendMode" value="recurring" onchange="toggleScheduling()"> Recurring
            </label>
            <label style="display:flex;align-items:center;gap:0.4rem;font-weight:400;font-size:0.9rem;cursor:pointer">
              <input type="radio" name="sendMode" value="draft" onchange="toggleScheduling()"> Save as Draft
            </label>
          </div>
        </div>

        <div id="schedule-fields" style="display:none;margin-top:1rem">
          <div class="form-group">
            <label>Send At (IST)</label>
            <input type="datetime-local" name="scheduledFor">
          </div>
        </div>

        <div id="recurring-fields" style="display:none;margin-top:1rem">
          <div class="form-group">
            <label>Recurrence</label>
            <select name="recurringCron">
              <option value="">— Select —</option>
              <option value="0 9 * * 1">Every Monday 9am</option>
              <option value="0 10 * * 1">Every Monday 10am</option>
              <option value="0 9 * * 1,4">Mon & Thu 9am</option>
              <option value="0 9 * * *">Daily 9am</option>
              <option value="0 10 * * *">Daily 10am</option>
              <option value="0 9 1 * *">1st of month 9am</option>
            </select>
          </div>
        </div>

        <!-- Send Window -->
        <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border)">
          <h3 style="font-size:0.85rem;font-weight:600;margin-bottom:0.75rem;color:var(--text-secondary)">Send Window</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Start Hour (IST)</label>
              <input type="number" name="sendWindowStart" min="0" max="23" value="9" style="max-width:80px">
            </div>
            <div class="form-group">
              <label>End Hour (IST)</label>
              <input type="number" name="sendWindowEnd" min="0" max="23" value="18" style="max-width:80px">
            </div>
          </div>
          <div class="form-group">
            <label>Days</label>
            <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
              <% ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(function(day, i) { %>
                <label style="display:flex;align-items:center;gap:0.3rem;font-weight:400;font-size:0.85rem;cursor:pointer">
                  <input type="checkbox" name="sendWindowDays" value="<%= i + 1 %>" <%= i < 6 ? 'checked' : '' %>> <%= day %>
                </label>
              <% }); %>
            </div>
          </div>
        </div>

        <!-- Hidden inputs -->
        <input type="hidden" name="sendNow" id="send-now-hidden" value="on">
        <input type="hidden" name="excludedLeadIds" id="excluded-lead-ids" value="[]">
        <input type="hidden" name="filters" id="filters-json" value="{}">

        <div class="form-actions" style="margin-top:1.5rem">
          <button type="submit" class="btn btn-primary">Create Campaign</button>
          <a href="/campaigns" class="btn btn-secondary">Cancel</a>
        </div>
      </div>
```

- [ ] **Step 2: Add the toggleScheduling JS function**

At the bottom of the `<script>` block in the same file (before the closing `</script>` tag), add:

```javascript
function toggleScheduling() {
  var mode = document.querySelector('input[name="sendMode"]:checked').value;
  document.getElementById('schedule-fields').style.display = mode === 'scheduled' ? '' : 'none';
  document.getElementById('recurring-fields').style.display = mode === 'recurring' ? '' : 'none';
  document.getElementById('send-now-hidden').value = mode === 'now' ? 'on' : '';
}
```

- [ ] **Step 3: Commit**

```bash
git add outreach/views/campaigns/new.ejs
git commit -m "feat(outreach): add scheduling, recurring, and send window controls to campaign form"
```

---

## Task 17: Lead Detail — Enrollment Section + Enroll Button

**Files:**
- Modify: `outreach/views/leads/detail.ejs`
- Modify: `outreach/src/routes/leads.js` (add enrollment data to detail query)

- [ ] **Step 1: Pass enrollment and sequence data to lead detail view**

In `outreach/src/routes/leads.js`, in the `GET /:id` route handler, after the `templates` query (around line 141-143), add:

```javascript
    // Load active sequences for enrollment dropdown
    const sequences = await prisma.sequence.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    // Load enrollments for this lead
    const enrollments = await prisma.sequenceEnrollment.findMany({
      where: { leadId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        sequence: { select: { name: true } },
        contact: { select: { name: true } },
      },
    });
```

Then update the `ejs.renderFile` call to pass the new data. In the existing render call, add `sequences` and `enrollments`:

```javascript
    const body = await ejs.renderFile(path.join(VIEWS, 'leads/detail.ejs'), {
      lead: leadPlain,
      tab,
      validNextStages,
      STAGES,
      templates,
      sequences: JSON.parse(JSON.stringify(sequences)),
      enrollments: JSON.parse(JSON.stringify(enrollments)),
    });
```

- [ ] **Step 2: Add enrollment section to lead detail view**

In `outreach/views/leads/detail.ejs`, add an "Automations" section at the end of the file (after the last closing `</div>` of the existing content). This will show active enrollments and an enroll form:

```html
<!-- Sequence Enrollments -->
<div class="section" style="margin-top:2rem">
  <h2>Sequences</h2>

  <% if (typeof enrollments !== 'undefined' && enrollments.length > 0) { %>
  <div class="table-wrapper" style="margin-bottom:1rem">
    <table style="font-size:0.85rem">
      <thead>
        <tr>
          <th>Sequence</th>
          <th>Contact</th>
          <th>Step</th>
          <th>Status</th>
          <th>Enrolled</th>
        </tr>
      </thead>
      <tbody>
        <% enrollments.forEach(function(e) { %>
        <tr>
          <td style="font-weight:600"><%= e.sequence.name %></td>
          <td><%= e.contact ? e.contact.name : '—' %></td>
          <td class="text-mono"><%= e.currentStep %></td>
          <td><span class="badge" style="color:<%= e.status === 'ACTIVE' ? 'var(--success)' : e.status === 'STOPPED' ? 'var(--error)' : 'var(--text-tertiary)' %>"><%= e.status %></span></td>
          <td class="text-muted"><%= new Date(e.createdAt).toLocaleDateString('en-IN') %></td>
        </tr>
        <% }); %>
      </tbody>
    </table>
  </div>
  <% } else { %>
    <p class="text-muted" style="font-size:0.85rem;margin-bottom:1rem">Not enrolled in any sequence.</p>
  <% } %>

  <% if (typeof sequences !== 'undefined' && sequences.length > 0 && lead.contacts && lead.contacts.length > 0) { %>
  <form method="POST" action="/sequences/0/enroll" id="enroll-form" style="display:flex;gap:0.75rem;align-items:flex-end;flex-wrap:wrap">
    <input type="hidden" name="leadId" value="<%= lead.id %>">
    <input type="hidden" name="redirectTo" value="/leads/<%= lead.id %>">
    <div class="form-group" style="margin-bottom:0">
      <label style="font-size:0.78rem">Sequence</label>
      <select name="sequenceSelect" id="enroll-seq" style="min-width:180px" onchange="document.getElementById('enroll-form').action='/sequences/'+this.value+'/enroll'">
        <% sequences.forEach(function(s) { %>
          <option value="<%= s.id %>"><%= s.name %></option>
        <% }); %>
      </select>
    </div>
    <div class="form-group" style="margin-bottom:0">
      <label style="font-size:0.78rem">Contact</label>
      <select name="contactId" style="min-width:150px">
        <% lead.contacts.forEach(function(c) { %>
          <option value="<%= c.id %>"><%= c.name %><%= c.isPrimary ? ' (primary)' : '' %></option>
        <% }); %>
      </select>
    </div>
    <button type="submit" class="btn btn-sm btn-primary">Enroll</button>
  </form>
  <script>
    // Initialize form action with first sequence
    (function() {
      var sel = document.getElementById('enroll-seq');
      if (sel && sel.value) {
        document.getElementById('enroll-form').action = '/sequences/' + sel.value + '/enroll';
      }
    })();
  </script>
  <% } %>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add outreach/src/routes/leads.js outreach/views/leads/detail.ejs
git commit -m "feat(outreach): add sequence enrollment section to lead detail page"
```

---

## Task 18: Dashboard — Automation Stats Widget

**Files:**
- Modify: `outreach/views/dashboard-body.ejs`
- Modify: `outreach/server.js` (dashboard route — add automation stats query)

- [ ] **Step 1: Query automation stats in dashboard route**

In `outreach/server.js`, in the dashboard `GET /` handler, add these queries after the `recentActivities` query (around line 192):

```javascript
    // Automation stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const jobsToday = await prisma.scheduledJob.count({
      where: { processedAt: { gte: today } },
    });
    const activeEnrollments = await prisma.sequenceEnrollment.count({
      where: { status: 'ACTIVE' },
    });
    const activeTriggers = await prisma.automationTrigger.count({
      where: { isActive: true },
    });
    const pendingJobs = await prisma.scheduledJob.count({
      where: { status: 'PENDING' },
    });
```

Then add these to the `ejs.renderFile` data object:

```javascript
    const body = await ejs.renderFile(path.join(__dirname, 'views/dashboard-body.ejs'), {
      stages: STAGES, stageCounts, totalLeads, icpCounts, sourceCounts,
      wonThisMonth, hotLeads, staleLeads, recentActivities,
      jobsToday, activeEnrollments, activeTriggers, pendingJobs,
    });
```

- [ ] **Step 2: Add automation stats widget to dashboard view**

In `outreach/views/dashboard-body.ejs`, after the KPI Cards section (after line 41, after the closing `</div>` of `dashboard-cards`), add:

```html
<!-- Automation Stats -->
<div class="dashboard-cards" style="margin-top:0.5rem">
  <div class="card">
    <h3>Jobs Today</h3>
    <div class="card-value"><%= typeof jobsToday !== 'undefined' ? jobsToday : 0 %></div>
    <div class="text-muted">processed</div>
  </div>
  <div class="card">
    <h3>Active Sequences</h3>
    <div class="card-value"><%= typeof activeEnrollments !== 'undefined' ? activeEnrollments : 0 %></div>
    <div class="text-muted">enrollments running</div>
  </div>
  <div class="card">
    <h3>Triggers</h3>
    <div class="card-value"><%= typeof activeTriggers !== 'undefined' ? activeTriggers : 0 %></div>
    <div class="text-muted">active rules</div>
  </div>
  <div class="card">
    <h3>Pending Jobs</h3>
    <div class="card-value"><%= typeof pendingJobs !== 'undefined' ? pendingJobs : 0 %></div>
    <div class="text-muted">queued</div>
  </div>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add outreach/server.js outreach/views/dashboard-body.ejs
git commit -m "feat(outreach): add automation stats widget to dashboard — jobs, enrollments, triggers"
```

---

## Task 19: Smoke Test

- [ ] **Step 1: Start the dev server and verify no crashes**

```bash
cd outreach && npm run dev
```

Expected: Server starts, `[JobProcessor] Started — polling every 60s` appears in logs. No errors.

- [ ] **Step 2: Verify all pages load**

Visit each route in the browser and confirm no 500 errors:
- `http://localhost:3001/` — Dashboard with automation stats cards
- `http://localhost:3001/sequences` — Empty list, "New Sequence" button
- `http://localhost:3001/sequences/new` — Form with step builder
- `http://localhost:3001/automations` — Empty list, "New Trigger" button
- `http://localhost:3001/automations/new` — Form with dynamic event/action fields
- `http://localhost:3001/jobs` — Empty or daily sweep job visible
- `http://localhost:3001/campaigns/new` — Now has scheduling + send window fields
- `http://localhost:3001/leads/<any-id>` — Now has "Sequences" section at bottom

- [ ] **Step 3: Create a test sequence**

1. Create a sequence "Test Flow" with 2 steps (any templates, EMAIL channel, step 1 delay 0, step 2 delay 1 day)
2. Verify it appears in `/sequences`
3. Open its detail page — verify steps timeline renders

- [ ] **Step 4: Create a test automation trigger**

1. Create trigger "Test — Stage to Contacted" with event=STAGE_CHANGE, filter toStage=CONTACTED, action=CREATE_ACTIVITY, subject="Auto: moved to contacted"
2. Verify it appears in `/automations`
3. Move a lead to CONTACTED stage
4. Check `/jobs` — a TRIGGER_ACTION job should appear

- [ ] **Step 5: Verify job processor picks up jobs**

Wait 60 seconds (or check logs), verify the TRIGGER_ACTION job status changes to COMPLETED. Check the lead's activities for the auto-created note.

- [ ] **Step 6: Commit any fixes if needed**

```bash
git add -A
git commit -m "fix(outreach): smoke test fixes for automation engine"
```
