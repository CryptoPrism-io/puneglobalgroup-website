const express = require('express');
const path = require('path');
const ejs = require('ejs');
const router = express.Router();

const { enrollLead, stopEnrollment, togglePause } = require('../services/sequenceEngine');

const VIEWS = path.join(__dirname, '../../views');

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

router.post('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const { name, channel } = req.body;

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

router.post('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const { name, channel, isActive } = req.body;

    await prisma.sequence.update({
      where: { id },
      data: { name: name?.trim(), channel, isActive: isActive === 'on' },
    });

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
