# Module B: Outreach Automation Engine — Design Spec

**Date:** 2026-03-26
**Status:** Approved
**Depends on:** Module A (Lead DB + Pipeline), Module C (Outreach Engine)

## Overview

Add automation layer on top of the existing campaign/outreach engine. Three subsystems:
1. **Follow-up Sequences** — multi-step drip flows (up to 5 steps, mixed email/WhatsApp)
2. **Scheduled & Recurring Sends** — time-based campaign execution with send windows
3. **Event Triggers** — stage changes, bounces, stale leads, quote expiry → auto-actions

All outbound messages flow through existing `emailService.js` and `whatsappService.js`. No new integrations.

## Architecture

Central **Job Processor** — a Postgres polling loop (every 60s) that scans a `ScheduledJob` table for due work. No Redis, no Bull, no external queue.

```
┌─────────────────────────────────────────────┐
│              Automation Engine               │
│                                              │
│  ┌───────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Sequences │ │ Triggers │ │ Scheduler  │  │
│  │ (drip     │ │ (event → │ │ (cron-like │  │
│  │  flows)   │ │  action) │ │  jobs)     │  │
│  └─────┬─────┘ └────┬─────┘ └─────┬──────┘  │
│        └─────────────┼─────────────┘          │
│                      ▼                        │
│            ┌──────────────────┐               │
│            │   Job Processor  │               │
│            │  (polling loop)  │               │
│            └────────┬─────────┘               │
│                     ▼                         │
│  ┌──────────────────────────────────────┐     │
│  │  Existing: emailService, whatsapp,  │     │
│  │  templateEngine, OutreachMessage    │     │
│  └──────────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

**Why Postgres polling over Redis/Bull:**
- Zero new infrastructure — uses existing Postgres
- Simple to debug — query the ScheduledJob table directly
- Transactional — job status + message sends in same DB
- Appropriate for scale (<100 jobs/day)
- 60s polling delay is irrelevant for "send follow-up in 3 days"

**Crash recovery:** On server startup, reset any jobs stuck in PROCESSING back to PENDING.

## Data Models

### New Models

#### Sequence
Reusable drip flow definition.

```prisma
model Sequence {
  id         Int              @id @default(autoincrement())
  name       String           // "Cold Intro - Paper"
  channel    String           // EMAIL | WHATSAPP | MIXED
  maxSteps   Int              // 1-5
  isActive   Boolean          @default(true)
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt
  steps      SequenceStep[]
  enrollments SequenceEnrollment[]
}
```

#### SequenceStep
One step in a sequence.

```prisma
model SequenceStep {
  id          Int             @id @default(autoincrement())
  sequenceId  Int
  sequence    Sequence        @relation(fields: [sequenceId], references: [id])
  stepOrder   Int             // 1-5
  templateId  Int
  template    MessageTemplate @relation(fields: [templateId], references: [id])
  channel     String          // EMAIL | WHATSAPP
  delayDays   Int             @default(0)  // wait N days after previous step
  delayHours  Int             @default(0)  // additional hours

  @@unique([sequenceId, stepOrder])
}
```

#### SequenceEnrollment
A lead actively going through a sequence.

```prisma
model SequenceEnrollment {
  id            Int       @id @default(autoincrement())
  sequenceId    Int
  sequence      Sequence  @relation(fields: [sequenceId], references: [id])
  leadId        Int
  lead          Lead      @relation(fields: [leadId], references: [id])
  contactId     Int
  contact       Contact   @relation(fields: [contactId], references: [id])
  currentStep   Int       @default(1)
  status        String    @default("ACTIVE") // ACTIVE | COMPLETED | STOPPED | PAUSED
  stoppedReason String?   // REPLIED | BOUNCED | MANUAL
  enrolledAt    DateTime  @default(now())
  completedAt   DateTime?

  @@unique([sequenceId, leadId]) // one active enrollment per sequence per lead
}
```

#### AutomationTrigger
Event → action rules.

```prisma
model AutomationTrigger {
  id            Int       @id @default(autoincrement())
  name          String    // "Bounce → Dormant"
  event         String    // STAGE_CHANGE | LEAD_CREATED | EMAIL_BOUNCED | EMAIL_OPENED | QUOTE_EXPIRED | LEAD_STALE
  eventFilter   Json?     // { "toStage": "CONTACTED" }
  actionType    String    // SEND_TEMPLATE | ENROLL_SEQUENCE | CHANGE_STAGE | CREATE_ACTIVITY
  actionConfig  Json      // { "templateId": 5, "channel": "EMAIL" } or { "sequenceId": 3 } or { "toStage": "DORMANT" }
  cooldownHours Int       @default(0)  // don't re-fire for same lead within N hours
  isActive      Boolean   @default(true)
  lastFiredAt   DateTime?
  createdAt     DateTime  @default(now())
}
```

#### ScheduledJob
Universal job queue.

```prisma
model ScheduledJob {
  id             Int       @id @default(autoincrement())
  type           String    // SEQUENCE_STEP | SCHEDULED_CAMPAIGN | RECURRING_CAMPAIGN | TRIGGER_ACTION | DAILY_SWEEP
  status         String    @default("PENDING") // PENDING | PROCESSING | COMPLETED | FAILED | DEFERRED
  scheduledFor   DateTime
  referenceId    Int?      // enrollmentId, campaignId, or triggerId
  referenceType  String?   // ENROLLMENT | CAMPAIGN | TRIGGER
  payload        Json?     // extra context
  attempts       Int       @default(0)
  maxAttempts    Int       @default(3)
  lastError      String?
  createdAt      DateTime  @default(now())
  processedAt    DateTime?
}
```

### Modified Models

#### Campaign (add fields)
```prisma
// Add to existing Campaign model:
  scheduledFor    DateTime?   // one-time scheduled send
  recurringCron   String?     // "0 9 * * 1" = every Monday 9am
  lastRunAt       DateTime?
  sendWindowStart Int?        @default(9)   // hour IST
  sendWindowEnd   Int?        @default(18)  // hour IST
  sendWindowDays  String?     @default("1,2,3,4,5,6") // Mon-Sat
```

#### Lead (add relation)
```prisma
// Add to existing Lead model:
  sequenceEnrollments SequenceEnrollment[]
```

#### Contact (add relation)
```prisma
// Add to existing Contact model:
  sequenceEnrollments SequenceEnrollment[]
```

#### MessageTemplate (add relation)
```prisma
// Add to existing MessageTemplate model:
  sequenceSteps SequenceStep[]
```

## Job Processor

### Lifecycle

```
Server starts
  → recoverStalledJobs()     // UPDATE SET status='PENDING' WHERE status='PROCESSING'
  → seedDailySweepJob()      // ensure daily sweep job exists for 8am IST
  → startJobProcessor()      // setInterval every 60s

Every 60 seconds:
  → Query: SELECT * FROM ScheduledJob
           WHERE status = 'PENDING'
           AND scheduledFor <= NOW()
           ORDER BY scheduledFor ASC
           LIMIT 10
  → For each job:
      1. UPDATE status = 'PROCESSING', attempts += 1
      2. Check send window (for message-sending jobs):
         - If outside window → status = 'DEFERRED', scheduledFor = next open slot
      3. Execute by type (see below)
      4. On success → status = 'COMPLETED', processedAt = NOW()
      5. On failure → if attempts < maxAttempts: status = 'PENDING',
         scheduledFor = NOW() + (attempts * 15min). Else: status = 'FAILED'
```

### Send Window Enforcement

Default: 9am-6pm IST, Mon-Sat. Per-campaign override via Campaign fields.

```
isWithinSendWindow(job):
  now = current time in IST
  windowStart = job.campaign?.sendWindowStart ?? 9
  windowEnd = job.campaign?.sendWindowEnd ?? 18
  allowedDays = job.campaign?.sendWindowDays ?? "1,2,3,4,5,6"

  if now.hour >= windowStart AND now.hour < windowEnd
     AND now.dayOfWeek IN allowedDays:
    return true

  return false

nextOpenSlot(job):
  // advance to next allowed day at windowStart hour
```

### Job Type Execution

#### SEQUENCE_STEP
```
1. Load enrollment + current SequenceStep
2. If enrollment.status != ACTIVE → skip (COMPLETED)
3. Check engagement: any OutreachMessage for this lead with
   status IN (DELIVERED, READ) or Activity containing REPLY
   since enrollment.enrolledAt?
   Yes → enrollment.status = STOPPED, stoppedReason = 'REPLIED', skip
4. Render template with lead+contact context
5. Send via emailService or whatsappService
6. Create OutreachMessage + Activity
7. If more steps:
   → enrollment.currentStep += 1
   → Create next ScheduledJob (scheduledFor = now + step[next].delayDays/Hours)
8. Else:
   → enrollment.status = COMPLETED, completedAt = now
```

#### SCHEDULED_CAMPAIGN
```
1. Load campaign
2. Call existing executeCampaign(prisma, campaignId) — unchanged
3. Mark job COMPLETED
```

#### RECURRING_CAMPAIGN
```
1. Load campaign with recurringCron
2. Call executeCampaign(prisma, campaignId)
3. Update campaign.lastRunAt = now
4. Parse cron, calculate next run time
5. Create new ScheduledJob for next run
6. Mark current job COMPLETED
```

#### TRIGGER_ACTION
```
1. Load trigger config from payload
2. Execute based on actionType:
   - SEND_TEMPLATE: render + send to lead's primary contact
   - ENROLL_SEQUENCE: create SequenceEnrollment + first step job
   - CHANGE_STAGE: update lead.stage, create Activity (source=AUTOMATION)
   - CREATE_ACTIVITY: insert Activity record
3. Mark job COMPLETED
```

#### DAILY_SWEEP
```
1. Stale lead check: leads with no Activity in 14+ days,
   stage NOT IN (WON, LOST, DORMANT)
   → emit LEAD_STALE event for each
2. Quote expiry check: quotes with validUntil < today,
   status = SENT
   → emit QUOTE_EXPIRED event for each
3. Create next DAILY_SWEEP job for tomorrow 8am IST
4. Mark COMPLETED
```

## Event System

### Event Emission Points

| Location | Event | Data |
|----------|-------|------|
| `routes/leads.js` POST `/:id/stage` | `STAGE_CHANGE` | `{ leadId, fromStage, toStage }` |
| `routes/leads.js` POST `/` | `LEAD_CREATED` | `{ leadId, source, icpType }` |
| `routes/webhooks.js` POST `/webhooks/resend` | `EMAIL_BOUNCED` | `{ leadId, contactId, messageId }` |
| `routes/webhooks.js` POST `/webhooks/resend` | `EMAIL_OPENED` | `{ leadId, contactId, messageId }` |
| `routes/webhooks.js` POST `/webhooks/resend` | `EMAIL_CLICKED` | `{ leadId, contactId, messageId }` |
| `services/dailySweeps.js` | `LEAD_STALE` | `{ leadId, daysSinceActivity }` |
| `services/dailySweeps.js` | `QUOTE_EXPIRED` | `{ quoteId, leadId }` |

### Event Processing

```javascript
async function emitEvent(prisma, eventName, data) {
  const triggers = await prisma.automationTrigger.findMany({
    where: { event: eventName, isActive: true }
  });

  for (const trigger of triggers) {
    // Check event filter match
    if (trigger.eventFilter && !matchesFilter(trigger.eventFilter, data)) continue;

    // Check cooldown
    if (trigger.cooldownHours > 0) {
      const cutoff = new Date(Date.now() - trigger.cooldownHours * 3600000);
      const recentJob = await prisma.scheduledJob.findFirst({
        where: {
          type: 'TRIGGER_ACTION',
          referenceId: trigger.id,
          payload: { path: ['leadId'], equals: data.leadId },
          createdAt: { gte: cutoff }
        }
      });
      if (recentJob) continue;
    }

    // Create job
    await prisma.scheduledJob.create({
      data: {
        type: 'TRIGGER_ACTION',
        scheduledFor: new Date(),
        referenceId: trigger.id,
        referenceType: 'TRIGGER',
        payload: { triggerId: trigger.id, ...trigger.actionConfig, ...data }
      }
    });
  }
}
```

### Guard Rails

- **No duplicate enrollments:** `@@unique([sequenceId, leadId])` constraint. Enroll attempt on already-enrolled lead skips silently.
- **No trigger loops:** Stage changes from triggers tagged `source=AUTOMATION` in Activity. Triggers can set `eventFilter: { "source": "!AUTOMATION" }` to ignore automation-sourced events. Default behavior: all CHANGE_STAGE triggers ignore automation-sourced changes.
- **Cooldown:** `cooldownHours` field prevents re-firing same trigger for same lead within N hours.
- **Engagement stop:** Sequences check for engagement signals before each step. Any DELIVERED/READ message or REPLY activity stops the sequence.

## UI & Routes

### New Sidebar Items

```
Sequences       → /sequences
Automations     → /automations
Job Queue       → /jobs
```

### Sequences

| Route | Method | Purpose |
|-------|--------|---------|
| `/sequences` | GET | List: name, channel, step count, active enrollments, isActive |
| `/sequences/new` | GET | Form: name, channel. Inline step builder: order, template dropdown, channel, delay days/hours |
| `/sequences` | POST | Create sequence + steps |
| `/sequences/:id` | GET | Detail: step timeline, enrollment list (lead, contact, step, status) |
| `/sequences/:id/edit` | GET | Edit form (warn if active enrollments) |
| `/sequences/:id` | POST | Update |
| `/sequences/:id/enroll` | POST | Enroll lead+contact, create first step job |
| `/sequences/:id/enrollments/:eid/stop` | POST | Stop enrollment manually |
| `/sequences/:id/enrollments/:eid/pause` | POST | Pause/resume enrollment |

### Automations

| Route | Method | Purpose |
|-------|--------|---------|
| `/automations` | GET | List: name, event, action summary, isActive, last fired |
| `/automations/new` | GET | Form: name, event dropdown, dynamic filter fields, action type, action config, cooldownHours |
| `/automations` | POST | Create trigger |
| `/automations/:id/edit` | GET | Edit form |
| `/automations/:id` | POST | Update |
| `/automations/:id/delete` | POST | Delete |
| `/automations/:id/toggle` | POST | Toggle isActive |

### Job Queue

| Route | Method | Purpose |
|-------|--------|---------|
| `/jobs` | GET | Table: type, status, scheduledFor, reference link, attempts, lastError. Filters: status, type |
| `/jobs/:id/retry` | POST | Reset FAILED job to PENDING |
| `/jobs/:id/cancel` | POST | Set PENDING job to CANCELLED |

### Modifications to Existing Pages

| Page | Change |
|------|--------|
| `views/layout.ejs` | Add Sequences, Automations, Job Queue to sidebar |
| `views/leads/detail.ejs` | Add "Automations" section: active enrollments, trigger history, "Enroll in sequence" button |
| `views/campaigns/new.ejs` | Add fields: scheduledFor (datetime picker), recurring (cron preset dropdown), send window (start/end hour, day checkboxes) |
| `views/dashboard-body.ejs` | Add widget: jobs today, active sequences, triggers fired |

## New Files

| File | Purpose |
|------|---------|
| `src/services/jobProcessor.js` | Polling loop, dispatcher, send window, crash recovery |
| `src/services/eventEmitter.js` | `emitEvent()`, filter matching, cooldown, job creation |
| `src/services/sequenceEngine.js` | Enroll, advance step, stop, pause, engagement check |
| `src/services/dailySweeps.js` | Stale lead + quote expiry checks |
| `src/routes/sequences.js` | Sequence CRUD + enrollment management |
| `src/routes/automations.js` | Trigger CRUD |
| `src/routes/jobs.js` | Job queue view + retry/cancel |
| `views/sequences/index.ejs` | Sequence list |
| `views/sequences/form.ejs` | Create/edit with inline step builder |
| `views/sequences/detail.ejs` | Steps timeline + enrollments table |
| `views/automations/index.ejs` | Trigger list |
| `views/automations/form.ejs` | Create/edit trigger with dynamic fields |
| `views/jobs/index.ejs` | Job queue monitor |

## Modified Files

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add 5 new models, Campaign scheduling fields, Lead/Contact/MessageTemplate relations |
| `server.js` | Mount 3 new route modules, start job processor, crash recovery on boot |
| `src/routes/leads.js` | Import and call `emitEvent('STAGE_CHANGE')` and `emitEvent('LEAD_CREATED')` |
| `src/routes/webhooks.js` | Import and call `emitEvent('EMAIL_BOUNCED/OPENED/CLICKED')` |
| `src/routes/campaigns.js` | Add scheduling fields, create ScheduledJob for scheduled/recurring campaigns |
| `views/layout.ejs` | Add sidebar nav items |
| `views/leads/detail.ejs` | Add enrollments section + enroll button |
| `views/campaigns/new.ejs` | Add schedule/recurring/send window fields |
| `views/dashboard-body.ejs` | Add automation stats widget |

## Unchanged Files

- `src/services/emailService.js` — called as-is by job processor
- `src/services/whatsappService.js` — called as-is
- `src/services/templateEngine.js` — called as-is
- `src/services/campaignRunner.js` — called as-is by SCHEDULED/RECURRING jobs
- `src/services/pipeline.js` — stage validation unchanged
- `src/services/scoring.js` — scoring unchanged
