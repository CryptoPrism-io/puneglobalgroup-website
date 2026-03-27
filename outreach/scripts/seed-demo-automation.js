require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../src/generated/prisma');

const pool = new Pool({ connectionString: process.env.DATABASE_URL_DEMO });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function seed() {
  // Clean up old test data
  await prisma.scheduledJob.deleteMany({});
  await prisma.sequenceEnrollment.deleteMany({});
  await prisma.sequenceStep.deleteMany({});
  await prisma.sequence.deleteMany({});
  await prisma.automationTrigger.deleteMany({});
  console.log('Cleaned old automation data');

  // === 1. BUSINESS SEQUENCES ===

  // Sequence 1: PP Cold Outreach — 3-step email drip for automotive/pharma leads
  const seq1 = await prisma.sequence.create({
    data: {
      name: 'PP Cold Outreach — Automotive',
      channel: 'EMAIL',
      maxSteps: 3,
      steps: {
        create: [
          { stepOrder: 1, templateId: 1, channel: 'EMAIL', delayDays: 0, delayHours: 0 },   // Cold Intro PP — immediate
          { stepOrder: 2, templateId: 4, channel: 'EMAIL', delayDays: 3, delayHours: 0 },   // Follow-up — 3 days
          { stepOrder: 3, templateId: 6, channel: 'EMAIL', delayDays: 5, delayHours: 0 },   // Quality Education — 5 days
        ]
      }
    }
  });
  console.log('Created:', seq1.name);

  // Sequence 2: Paper & Board Intro — mixed email + WhatsApp for local Pune corrugators
  const seq2 = await prisma.sequence.create({
    data: {
      name: 'Paper & Board Intro — Local Pune',
      channel: 'MIXED',
      maxSteps: 2,
      steps: {
        create: [
          { stepOrder: 1, templateId: 2, channel: 'EMAIL', delayDays: 0, delayHours: 0 },   // Cold Intro Paper — immediate
          { stepOrder: 2, templateId: 5, channel: 'WHATSAPP', delayDays: 2, delayHours: 0 }, // WhatsApp greeting — 2 days
        ]
      }
    }
  });
  console.log('Created:', seq2.name);

  // Sequence 3: Quote Follow-up — closing sequence after quote sent
  const seq3 = await prisma.sequence.create({
    data: {
      name: 'Quote Follow-up — Closing',
      channel: 'MIXED',
      maxSteps: 3,
      steps: {
        create: [
          { stepOrder: 1, templateId: 4, channel: 'EMAIL', delayDays: 2, delayHours: 0 },   // Follow-up email — 2 days
          { stepOrder: 2, templateId: 4, channel: 'WHATSAPP', delayDays: 4, delayHours: 0 }, // WhatsApp nudge — 4 days
          { stepOrder: 3, templateId: 3, channel: 'EMAIL', delayDays: 7, delayHours: 0 },   // Stock update (create urgency) — 7 days
        ]
      }
    }
  });
  console.log('Created:', seq3.name);

  // === 2. AUTOMATION TRIGGERS ===

  // T1: When a new PP lead is created, auto-enroll in cold outreach
  await prisma.automationTrigger.create({
    data: {
      name: 'New PP Lead \u2192 Cold Outreach',
      event: 'LEAD_CREATED',
      eventFilter: { icpType: 'PP' },
      actionType: 'ENROLL_SEQUENCE',
      actionConfig: { sequenceId: seq1.id },
      cooldownHours: 0,
    }
  });
  console.log('Trigger: New PP Lead \u2192 Cold Outreach');

  // T2: When lead moves to CONTACTED, auto-send intro email
  await prisma.automationTrigger.create({
    data: {
      name: 'Stage \u2192 Contacted: Auto-Send Intro',
      event: 'STAGE_CHANGE',
      eventFilter: { toStage: 'CONTACTED' },
      actionType: 'SEND_TEMPLATE',
      actionConfig: { templateId: 1, channel: 'EMAIL' },
      cooldownHours: 24,
    }
  });
  console.log('Trigger: Stage \u2192 Contacted');

  // T3: When lead moves to QUOTED, enroll in quote follow-up sequence
  await prisma.automationTrigger.create({
    data: {
      name: 'Quoted \u2192 Follow-up Sequence',
      event: 'STAGE_CHANGE',
      eventFilter: { toStage: 'QUOTED' },
      actionType: 'ENROLL_SEQUENCE',
      actionConfig: { sequenceId: seq3.id },
      cooldownHours: 0,
    }
  });
  console.log('Trigger: Quoted \u2192 Follow-up');

  // T4: Email bounce → auto-move to DORMANT
  await prisma.automationTrigger.create({
    data: {
      name: 'Email Bounce \u2192 Dormant',
      event: 'EMAIL_BOUNCED',
      eventFilter: null,
      actionType: 'CHANGE_STAGE',
      actionConfig: { toStage: 'DORMANT' },
      cooldownHours: 0,
    }
  });
  console.log('Trigger: Email Bounce \u2192 Dormant');

  // T5: Stale lead (>14 days no activity) → auto-flag with note
  await prisma.automationTrigger.create({
    data: {
      name: 'Stale Lead \u2192 Alert Note',
      event: 'LEAD_STALE',
      eventFilter: null,
      actionType: 'CREATE_ACTIVITY',
      actionConfig: { activityType: 'NOTE', subject: 'Auto-alert: Lead stuck >14 days \u2014 needs attention' },
      cooldownHours: 168, // once per week
    }
  });
  console.log('Trigger: Stale Lead Alert');

  // T6: Quote expired → send reminder
  await prisma.automationTrigger.create({
    data: {
      name: 'Quote Expired \u2192 Reminder',
      event: 'QUOTE_EXPIRED',
      eventFilter: null,
      actionType: 'SEND_TEMPLATE',
      actionConfig: { templateId: 4, channel: 'EMAIL' },
      cooldownHours: 48,
    }
  });
  console.log('Trigger: Quote Expired \u2192 Reminder');

  // === 3. ENROLL LEADS IN SEQUENCES ===

  // PP leads in Cold Outreach
  const ppEnrollments = [
    { leadId: 4, contactId: 5, name: 'ElectroCom Systems' },     // RESEARCHED
    { leadId: 8, contactId: 9, name: 'Precision Bearings Ltd' },  // NEW
  ];
  for (const { leadId, contactId, name } of ppEnrollments) {
    const enrollment = await prisma.sequenceEnrollment.create({
      data: { sequenceId: seq1.id, leadId, contactId, currentStep: 1, status: 'ACTIVE' }
    });
    await prisma.scheduledJob.create({
      data: {
        type: 'SEQUENCE_STEP', scheduledFor: new Date(),
        referenceId: enrollment.id, referenceType: 'ENROLLMENT',
        payload: { enrollmentId: enrollment.id, stepOrder: 1 },
      }
    });
    console.log('Enrolled in PP Cold Outreach:', name);
  }

  // Paper lead in Paper Intro
  const paperEnrollment = await prisma.sequenceEnrollment.create({
    data: { sequenceId: seq2.id, leadId: 5, contactId: 6, currentStep: 1, status: 'ACTIVE' }
  });
  await prisma.scheduledJob.create({
    data: {
      type: 'SEQUENCE_STEP', scheduledFor: new Date(),
      referenceId: paperEnrollment.id, referenceType: 'ENROLLMENT',
      payload: { enrollmentId: paperEnrollment.id, stepOrder: 1 },
    }
  });
  console.log('Enrolled in Paper Intro: Vishwa Print & Pack');

  // Tata Motors (QUOTED) in Quote Follow-up — already on step 2
  const tataEnrollment = await prisma.sequenceEnrollment.create({
    data: { sequenceId: seq3.id, leadId: 6, contactId: 7, currentStep: 2, status: 'ACTIVE' }
  });
  await prisma.scheduledJob.create({
    data: {
      type: 'SEQUENCE_STEP',
      scheduledFor: new Date(Date.now() + 4 * 24 * 3600000),
      referenceId: tataEnrollment.id, referenceType: 'ENROLLMENT',
      payload: { enrollmentId: tataEnrollment.id, stepOrder: 2 },
    }
  });
  console.log('Enrolled in Quote Follow-up: Tata Motors Vendor Cell (step 2)');

  // MediPack — stopped (replied)
  await prisma.sequenceEnrollment.create({
    data: {
      sequenceId: seq1.id, leadId: 2, contactId: 3,
      currentStep: 2, status: 'STOPPED', stoppedReason: 'REPLIED',
      completedAt: new Date(Date.now() - 2 * 24 * 3600000),
    }
  });
  console.log('MediPack Pharma — stopped (replied after step 1)');

  // === 4. SCHEDULED & RECURRING CAMPAIGNS ===

  // Weekly stock update to all QUALIFIED leads — every Monday 9am IST
  const camp1 = await prisma.campaign.create({
    data: {
      name: 'Weekly Stock Update \u2014 Paper Clients',
      templateId: 3, channel: 'EMAIL', status: 'DRAFT',
      filters: { stage: 'QUALIFIED', icpType: 'PAPER' },
      recurringCron: '0 9 * * 1',
      sendWindowStart: 9, sendWindowEnd: 18, sendWindowDays: '1,2,3,4,5,6',
    }
  });
  const nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() + ((8 - nextMonday.getDay()) % 7 || 7));
  nextMonday.setUTCHours(3, 30, 0, 0);
  await prisma.scheduledJob.create({
    data: { type: 'RECURRING_CAMPAIGN', scheduledFor: nextMonday, referenceId: camp1.id, referenceType: 'CAMPAIGN' }
  });
  console.log('Recurring campaign: Weekly Stock Update — next run:', nextMonday.toISOString());

  // One-time scheduled blast — PP Product Launch, March 28 10am IST
  const camp2 = await prisma.campaign.create({
    data: {
      name: 'PP Product Launch \u2014 March 28',
      templateId: 1, channel: 'EMAIL', status: 'DRAFT',
      filters: { icpType: 'PP' },
      scheduledFor: new Date('2026-03-28T04:30:00Z'),
      sendWindowStart: 9, sendWindowEnd: 18, sendWindowDays: '1,2,3,4,5',
    }
  });
  await prisma.scheduledJob.create({
    data: { type: 'SCHEDULED_CAMPAIGN', scheduledFor: new Date('2026-03-28T04:30:00Z'), referenceId: camp2.id, referenceType: 'CAMPAIGN' }
  });
  console.log('Scheduled campaign: PP Product Launch — March 28, 10am IST');

  // Schedule daily sweep for tomorrow 8am IST
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setUTCHours(2, 30, 0, 0);
  await prisma.scheduledJob.create({
    data: { type: 'DAILY_SWEEP', scheduledFor: tomorrow, status: 'PENDING' }
  });
  console.log('Daily sweep scheduled for:', tomorrow.toISOString());

  console.log('\n=== DEMO AUTOMATION DATA READY ===');
  await prisma.$disconnect();
  await pool.end();
}

seed().catch(e => { console.error(e); process.exit(1); });
