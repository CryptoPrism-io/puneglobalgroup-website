const express = require('express');
const path = require('path');
const ejs = require('ejs');
const router = express.Router();

const VIEWS = path.join(__dirname, '../../views');

const CHANNELS = ['EMAIL', 'WHATSAPP', 'BOTH'];
const CATEGORIES = ['STOCK_UPDATE', 'QUOTE_FOLLOWUP', 'COLD_INTRO', 'FESTIVE', 'QUALITY_EDUCATION', 'CUSTOM'];

// GET /templates — list all, filterable by channel and category
router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const { channel, category } = req.query;

    const where = {};
    if (channel && channel !== 'ALL') where.channel = channel;
    if (category && category !== 'ALL') where.category = category;

    const templates = await prisma.messageTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const templatesPlain = JSON.parse(JSON.stringify(templates));

    const body = await ejs.renderFile(path.join(VIEWS, 'templates/index.ejs'), {
      templates: templatesPlain,
      filters: { channel: channel || 'ALL', category: category || 'ALL' },
      CHANNELS,
      CATEGORIES,
    });
    res.render('layout', { title: 'Templates', body });
  } catch (err) {
    console.error('Templates list error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// GET /templates/new — create form
router.get('/new', async (req, res) => {
  try {
    const body = await ejs.renderFile(path.join(VIEWS, 'templates/form.ejs'), {
      template: null,
      CHANNELS,
      CATEGORIES,
    });
    res.render('layout', { title: 'New Template', body });
  } catch (err) {
    console.error('New template form error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// POST /templates — create template
router.post('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const { name, channel, category, subject, body: bodyText, attachmentType, isActive } = req.body;

    const template = await prisma.messageTemplate.create({
      data: {
        name: name?.trim() || '',
        channel: channel || 'EMAIL',
        category: category || 'CUSTOM',
        subject: subject?.trim() || null,
        body: bodyText?.trim() || '',
        attachmentType: attachmentType || 'NONE',
        isActive: isActive === 'on',
      },
    });

    res.redirect(`/templates/${template.id}/edit?success=Template+created+successfully`);
  } catch (err) {
    console.error('Create template error:', err);
    res.redirect('/templates/new?error=' + encodeURIComponent(err.message));
  }
});

// GET /templates/:id/edit — edit form
router.get('/:id/edit', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const template = await prisma.messageTemplate.findUnique({ where: { id } });
    if (!template) return res.status(404).send('Template not found');

    const templatePlain = JSON.parse(JSON.stringify(template));
    const body = await ejs.renderFile(path.join(VIEWS, 'templates/form.ejs'), {
      template: templatePlain,
      CHANNELS,
      CATEGORIES,
    });
    res.render('layout', { title: 'Edit Template — ' + template.name, body });
  } catch (err) {
    console.error('Edit template form error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// POST /templates/:id — update template
router.post('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const { name, channel, category, subject, body: bodyText, attachmentType, isActive } = req.body;

    await prisma.messageTemplate.update({
      where: { id },
      data: {
        name: name?.trim() || '',
        channel: channel || 'EMAIL',
        category: category || 'CUSTOM',
        subject: subject?.trim() || null,
        body: bodyText?.trim() || '',
        attachmentType: attachmentType || 'NONE',
        isActive: isActive === 'on',
      },
    });

    res.redirect(`/templates/${id}/edit?success=Template+updated`);
  } catch (err) {
    console.error('Update template error:', err);
    res.redirect(`/templates/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
  }
});

// POST /templates/:id/delete — delete (only if no campaigns use it)
router.post('/:id/delete', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);

    // Check if any campaigns reference this template
    const campaignCount = await prisma.campaign.count({ where: { templateId: id } });
    if (campaignCount > 0) {
      return res.redirect(
        `/templates/${id}/edit?error=` +
        encodeURIComponent(`Cannot delete — ${campaignCount} campaign(s) use this template`)
      );
    }

    await prisma.messageTemplate.delete({ where: { id } });
    res.redirect('/templates?success=Template+deleted');
  } catch (err) {
    console.error('Delete template error:', err);
    res.redirect(`/templates/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
  }
});

module.exports = router;
