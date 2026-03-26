const express = require('express');
const path = require('path');
const ejs = require('ejs');
const router = express.Router();

const VIEWS = path.join(__dirname, '../../views');

const EVENTS = ['STAGE_CHANGE', 'LEAD_CREATED', 'EMAIL_BOUNCED', 'EMAIL_OPENED', 'EMAIL_CLICKED', 'QUOTE_EXPIRED', 'LEAD_STALE'];
const ACTION_TYPES = ['SEND_TEMPLATE', 'ENROLL_SEQUENCE', 'CHANGE_STAGE', 'CREATE_ACTIVITY'];
const { STAGES } = require('../services/pipeline');

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

router.post('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
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

    await prisma.automationTrigger.create({
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
