const express = require('express');
const path = require('path');
const ejs = require('ejs');
const router = express.Router();

const { buildFilterQuery } = require('../services/search');
const { changeStage, STAGES, isValidTransition } = require('../services/pipeline');
const { computeFitScore } = require('../services/scoring');
const { emitEvent } = require('../services/eventEmitter');

const VIEWS = path.join(__dirname, '../../views');

function extractLeadData(body) {
  return {
    companyName: body.companyName?.trim() || '',
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
    source: body.source || 'MANUAL',
    sourceUrl: body.sourceUrl?.trim() || null,
    fitNotes: body.fitNotes?.trim() || null,
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
    growGoal: body.growGoal?.trim() || null,
    growReality: body.growReality?.trim() || null,
    growOptions: body.growOptions?.trim() || null,
    growWill: body.growWill?.trim() || null,
    notes: body.notes?.trim() || null,
    tags: body.tags ? JSON.parse(body.tags) : null,
    indiamartUrl: body.indiamartUrl?.trim() || null,
    justdialUrl: body.justdialUrl?.trim() || null,
    mapsUrl: body.mapsUrl?.trim() || null,
    cin: body.cin?.trim() || null,
    latitude: body.latitude ? parseFloat(body.latitude) : null,
    longitude: body.longitude ? parseFloat(body.longitude) : null,
  };
}

// GET /leads — list with filters
router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const filters = {
      search: req.query.search || '',
      stage: req.query.stage || '',
      icpType: req.query.icpType || '',
      source: req.query.source || '',
      industry: req.query.industry || '',
    };
    const where = buildFilterQuery(req.query);
    const leads = await prisma.lead.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        contacts: { where: { isPrimary: true }, take: 1 },
        activities: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    const leadsPlain = JSON.parse(JSON.stringify(leads));
    const body = await ejs.renderFile(path.join(VIEWS, 'leads/index.ejs'), {
      leads: leadsPlain,
      filters,
      STAGES,
    });
    res.render('layout', { title: 'Leads', body });
  } catch (err) {
    console.error('Leads list error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// GET /leads/new — new lead form
router.get('/new', async (req, res) => {
  try {
    const body = await ejs.renderFile(path.join(VIEWS, 'leads/form.ejs'), {
      lead: null,
      title: 'New Lead',
    });
    res.render('layout', { title: 'New Lead', body });
  } catch (err) {
    console.error('New lead form error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// POST /leads — create lead
router.post('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const data = extractLeadData(req.body);
    const fitScore = computeFitScore(data);
    const lead = await prisma.lead.create({
      data: { ...data, fitScore },
    });
    emitEvent(prisma, 'LEAD_CREATED', { leadId: lead.id, source: data.source, icpType: data.icpType });
    res.redirect(`/leads/${lead.id}?success=Lead+created+successfully`);
  } catch (err) {
    console.error('Create lead error:', err);
    res.redirect('/leads/new?error=' + encodeURIComponent(err.message));
  }
});

// GET /leads/:id — lead detail
router.get('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const tab = req.query.tab || 'info';
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        contacts: { orderBy: { isPrimary: 'desc' } },
        activities: {
          orderBy: { createdAt: 'desc' },
          include: { contact: { select: { id: true, name: true } } },
        },
        quotes: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, quoteNo: true, createdAt: true, grandTotal: true, status: true },
        },
        scrapeBatch: true,
      },
    });
    if (!lead) return res.status(404).send('Lead not found');
    const leadPlain = JSON.parse(JSON.stringify(lead));

    // Compute valid next stages
    const validNextStages = STAGES.filter(s => isValidTransition(lead.stage, s));

    // Load active templates for Quick Send form
    const templates = await prisma.messageTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

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

    const body = await ejs.renderFile(path.join(VIEWS, 'leads/detail.ejs'), {
      lead: leadPlain,
      tab,
      validNextStages,
      STAGES,
      templates,
      sequences: JSON.parse(JSON.stringify(sequences)),
      enrollments: JSON.parse(JSON.stringify(enrollments)),
    });
    res.render('layout', { title: lead.companyName, body });
  } catch (err) {
    console.error('Lead detail error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// GET /leads/:id/edit — edit lead form
router.get('/:id/edit', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return res.status(404).send('Lead not found');
    const leadPlain = JSON.parse(JSON.stringify(lead));
    const body = await ejs.renderFile(path.join(VIEWS, 'leads/form.ejs'), {
      lead: leadPlain,
      title: 'Edit Lead',
    });
    res.render('layout', { title: 'Edit Lead — ' + lead.companyName, body });
  } catch (err) {
    console.error('Edit lead form error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// POST /leads/:id — update lead
router.post('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const data = extractLeadData(req.body);
    const fitScore = computeFitScore(data);
    await prisma.lead.update({
      where: { id },
      data: { ...data, fitScore },
    });
    res.redirect(`/leads/${id}?success=Lead+updated`);
  } catch (err) {
    console.error('Update lead error:', err);
    res.redirect(`/leads/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
  }
});

// POST /leads/:id/stage — change pipeline stage
router.post('/:id/stage', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const newStage = req.body.newStage;
    const notes = req.body.notes || null;
    const lead = await prisma.lead.findUnique({ where: { id } });
    const fromStage = lead ? lead.stage : null;
    await changeStage(prisma, id, newStage, notes);
    emitEvent(prisma, 'STAGE_CHANGE', { leadId: id, fromStage, toStage: newStage });
    res.redirect(`/leads/${id}?success=Stage+updated+to+${newStage}`);
  } catch (err) {
    console.error('Stage change error:', err);
    res.redirect(`/leads/${req.params.id}?error=` + encodeURIComponent(err.message));
  }
});

// POST /leads/:id/archive — toggle archive
router.post('/:id/archive', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return res.status(404).send('Lead not found');
    const updated = await prisma.lead.update({
      where: { id },
      data: { isArchived: !lead.isArchived },
    });
    const msg = updated.isArchived ? 'Lead+archived' : 'Lead+unarchived';
    res.redirect(`/leads/${id}?success=${msg}`);
  } catch (err) {
    console.error('Archive lead error:', err);
    res.redirect(`/leads/${req.params.id}?error=` + encodeURIComponent(err.message));
  }
});

router.post('/:id/handoff/resolve', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return res.status(404).send('Lead not found');
    const tags = (Array.isArray(lead.tags) ? lead.tags : []).filter(tag => tag !== 'human-handoff');
    await prisma.lead.update({ where: { id }, data: { tags } });
    await prisma.activity.create({
      data: { leadId: id, type: 'HUMAN_HANDOFF_RESOLVED', subject: 'Human handoff reviewed' },
    });
    res.redirect('/?success=Human+handoff+marked+reviewed');
  } catch (err) {
    res.redirect('/?error=' + encodeURIComponent(err.message));
  }
});

module.exports = router;
