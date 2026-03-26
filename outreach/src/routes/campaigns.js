const express = require('express');
const path = require('path');
const ejs = require('ejs');
const router = express.Router();

const { buildFilterQuery } = require('../services/search');
const { STAGES } = require('../services/pipeline');
const { executeCampaign } = require('../services/campaignRunner');

const VIEWS = path.join(__dirname, '../../views');

// GET /campaigns — list all campaigns
router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;

    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: { template: { select: { name: true } } },
    });

    const campaignsPlain = JSON.parse(JSON.stringify(campaigns));

    const body = await ejs.renderFile(path.join(VIEWS, 'campaigns/index.ejs'), {
      campaigns: campaignsPlain,
    });
    res.render('layout', { title: 'Campaigns', body });
  } catch (err) {
    console.error('Campaigns list error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// GET /campaigns/new — new campaign form
router.get('/new', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;

    const templates = await prisma.messageTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const templatesPlain = JSON.parse(JSON.stringify(templates));

    const body = await ejs.renderFile(path.join(VIEWS, 'campaigns/new.ejs'), {
      templates: templatesPlain,
      STAGES,
    });
    res.render('layout', { title: 'New Campaign', body });
  } catch (err) {
    console.error('New campaign form error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// GET /campaigns/preview-recipients — JSON endpoint for AJAX recipient preview
// MUST be defined BEFORE /:id routes
router.get('/preview-recipients', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const where = buildFilterQuery(req.query);

    const leads = await prisma.lead.findMany({
      where,
      include: { contacts: { where: { isPrimary: true }, take: 1 } },
      orderBy: { companyName: 'asc' },
    });

    res.json(leads.map(l => ({
      id: l.id,
      companyName: l.companyName,
      city: l.city,
      icpType: l.icpType,
      contact: l.contacts[0] || null,
    })));
  } catch (err) {
    console.error('Preview recipients error:', err);
    res.status(500).json({ error: err.message });
  }
});

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

// GET /campaigns/:id — campaign detail
router.get('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        template: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          include: {
            lead: { select: { id: true, companyName: true } },
            contact: { select: { name: true } },
          },
        },
      },
    });

    if (!campaign) return res.status(404).send('Campaign not found');
    const campaignPlain = JSON.parse(JSON.stringify(campaign));

    const body = await ejs.renderFile(path.join(VIEWS, 'campaigns/detail.ejs'), {
      campaign: campaignPlain,
    });
    res.render('layout', { title: campaign.name, body });
  } catch (err) {
    console.error('Campaign detail error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// POST /campaigns/:id/send — execute campaign (fire-and-forget)
router.post('/:id/send', async (req, res) => {
  const prisma = req.app.locals.prisma;
  executeCampaign(prisma, parseInt(req.params.id))
    .then(r => console.log(`Campaign ${req.params.id} done:`, r))
    .catch(e => console.error(`Campaign ${req.params.id} error:`, e));
  res.redirect(`/campaigns/${req.params.id}?success=Campaign+sending+started`);
});

module.exports = router;
