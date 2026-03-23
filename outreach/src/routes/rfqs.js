const express = require('express');
const path = require('path');
const ejs = require('ejs');
const router = express.Router();

const { getNextRfqNo } = require('../services/quoteNo');
const { generateBom } = require('../services/bom');

const VIEWS = path.join(__dirname, '../../views');

// GET /rfqs — list all RFQs
router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const rfqs = await prisma.supplierRfq.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        quote: {
          select: {
            id: true,
            quoteNo: true,
            lead: { select: { id: true, companyName: true } },
          },
        },
        _count: { select: { items: true } },
      },
    });
    const rfqsPlain = JSON.parse(JSON.stringify(rfqs));
    const body = await ejs.renderFile(path.join(VIEWS, 'rfqs/index.ejs'), {
      rfqs: rfqsPlain,
    });
    res.render('layout', { title: 'Supplier RFQs', body });
  } catch (err) {
    console.error('RFQ list error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// GET /rfqs/new?quoteId=X — generate RFQ form pre-filled from BOM
router.get('/new', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const quoteId = req.query.quoteId ? parseInt(req.query.quoteId) : null;
    if (!quoteId) return res.redirect('/rfqs?error=quoteId+required');

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { items: true, lead: true },
    });
    if (!quote) return res.redirect('/rfqs?error=Quote+not+found');

    const bomItems = generateBom(quote.items);
    const quotePlain = JSON.parse(JSON.stringify(quote));

    const body = await ejs.renderFile(path.join(VIEWS, 'rfqs/form.ejs'), {
      quote: quotePlain,
      bomItems,
    });
    res.render('layout', { title: 'New RFQ — ' + quote.quoteNo, body });
  } catch (err) {
    console.error('New RFQ form error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// POST /rfqs — create RFQ
router.post('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const rfqNo = await getNextRfqNo(prisma);

    // Parse item arrays
    const materialNames   = [].concat(req.body['items.materialName']   || []);
    const specifications  = [].concat(req.body['items.specification']  || []);
    const quantities      = [].concat(req.body['items.quantity']       || []);
    const units           = [].concat(req.body['items.unit']           || []);
    const estimatedRates  = [].concat(req.body['items.estimatedRate']  || []);
    const itemNotes       = [].concat(req.body['items.notes']          || []);

    const parsedItems = materialNames.map((name, i) => ({
      materialName:  name?.trim() || '',
      specification: specifications[i]?.trim() || null,
      quantity:      quantities[i] ? quantities[i].toString().trim() : '0',
      unit:          units[i] || 'sqm',
      estimatedRate: estimatedRates[i] ? estimatedRates[i].toString().trim() : null,
      notes:         itemNotes[i]?.trim() || null,
    })).filter(item => item.materialName);

    const rfq = await prisma.supplierRfq.create({
      data: {
        rfqNo,
        quoteId: parseInt(req.body.quoteId),
        supplierName:     req.body.supplierName.trim(),
        supplierEmail:    req.body.supplierEmail?.trim() || null,
        supplierPhone:    req.body.supplierPhone?.trim() || null,
        responseDeadline: req.body.responseDeadline ? new Date(req.body.responseDeadline) : null,
        notes:            req.body.notes?.trim() || null,
        items: { create: parsedItems },
      },
    });

    res.redirect(`/rfqs/${rfq.id}?success=RFQ+created`);
  } catch (err) {
    console.error('Create RFQ error:', err);
    res.redirect('/rfqs/new?error=' + encodeURIComponent(err.message));
  }
});

// GET /rfqs/:id — RFQ detail
router.get('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);

    const rfq = await prisma.supplierRfq.findUnique({
      where: { id },
      include: {
        items: true,
        quote: {
          select: {
            id: true,
            quoteNo: true,
            lead: { select: { id: true, companyName: true } },
          },
        },
      },
    });
    if (!rfq) return res.status(404).send('RFQ not found');

    const rfqPlain = JSON.parse(JSON.stringify(rfq));
    const body = await ejs.renderFile(path.join(VIEWS, 'rfqs/detail.ejs'), {
      rfq: rfqPlain,
    });
    res.render('layout', { title: rfqPlain.rfqNo, body });
  } catch (err) {
    console.error('RFQ detail error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// POST /rfqs/:id/send — mark SENT
router.post('/:id/send', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);

    const rfq = await prisma.supplierRfq.findUnique({ where: { id } });
    if (!rfq) return res.status(404).send('RFQ not found');

    await prisma.supplierRfq.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() },
    });

    res.redirect(`/rfqs/${id}?success=RFQ+marked+as+sent`);
  } catch (err) {
    console.error('Send RFQ error:', err);
    res.redirect(`/rfqs/${req.params.id}?error=` + encodeURIComponent(err.message));
  }
});

// POST /rfqs/:id/response — record supplier response
router.post('/:id/response', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);

    const rfq = await prisma.supplierRfq.findUnique({ where: { id } });
    if (!rfq) return res.status(404).send('RFQ not found');

    const itemIds    = [].concat(req.body['items.id']                  || []);
    const quotedRates = [].concat(req.body['items.supplierQuotedRate'] || []);

    for (let i = 0; i < itemIds.length; i++) {
      await prisma.rfqItem.update({
        where: { id: parseInt(itemIds[i]) },
        data: { supplierQuotedRate: quotedRates[i]?.trim() || null },
      });
    }

    await prisma.supplierRfq.update({
      where: { id },
      data: { status: 'RECEIVED' },
    });

    res.redirect(`/rfqs/${id}?success=Response+recorded`);
  } catch (err) {
    console.error('RFQ response error:', err);
    res.redirect(`/rfqs/${req.params.id}?error=` + encodeURIComponent(err.message));
  }
});

module.exports = router;
