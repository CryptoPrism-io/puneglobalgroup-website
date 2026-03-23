const express = require('express');
const path = require('path');
const ejs = require('ejs');
const router = express.Router();

const { determineGstType } = require('../services/gst');
const { computeItemCost, computeQuoteTotals, BUSINESS_STATE, calculateSheetArea } = require('../services/pricing');
const { getNextQuoteNo } = require('../services/quoteNo');

const VIEWS = path.join(__dirname, '../../views');

const PRODUCT_TYPES = [
  'PP_BOX', 'PP_BIN', 'PP_TRAY', 'PP_SEPARATOR', 'PP_LAYER_PAD',
  'PP_FLOORING', 'PAPER_SHEET', 'BOARD_SHEET',
];

// Parse line items from form arrays and compute costs
function parseAndComputeItems(body, gstType) {
  const productTypes   = [].concat(body['items.productType']    || []);
  const productNames   = [].concat(body['items.productName']    || []);
  const lengths        = [].concat(body['items.length']         || []);
  const breadths       = [].concat(body['items.breadth']        || []);
  const heights        = [].concat(body['items.height']         || []);
  const sheetThicknesses = [].concat(body['items.sheetThickness'] || []);
  const gsms           = [].concat(body['items.gsm']            || []);
  const grades         = [].concat(body['items.grade']          || []);
  const closureTypes   = [].concat(body['items.closureType']    || []);
  const qtys           = [].concat(body['items.qty']            || []);
  const sheetRates     = [].concat(body['items.sheetRatePerSqm'] || []);
  const cuttingRates   = [].concat(body['items.cuttingRate']    || []);
  const weldingRates   = [].concat(body['items.weldingRate']    || []);
  const printingRates  = [].concat(body['items.printingRate']   || []);
  const sheetingRates  = [].concat(body['items.sheetingRate']   || []);
  const slittingRates  = [].concat(body['items.slittingRate']   || []);
  const rewindingRates = [].concat(body['items.rewindingRate']  || []);
  const extrasCosts    = [].concat(body['items.extrasCost']     || []);
  const marginPercents = [].concat(body['items.marginPercent']  || []);
  const gstRates       = [].concat(body['items.gstRate']        || []);
  const remarksList    = [].concat(body['items.remarks']        || []);

  const count = productTypes.length;
  const computedItems = [];

  for (let i = 0; i < count; i++) {
    const rawItem = {
      productType:     productTypes[i] || 'PP_BOX',
      productName:     productNames[i] || '',
      length:          lengths[i]      || 0,
      breadth:         breadths[i]     || 0,
      height:          heights[i]      || 0,
      sheetThickness:  sheetThicknesses[i] || null,
      gsm:             gsms[i]         || null,
      grade:           grades[i]       || null,
      closureType:     closureTypes[i] || null,
      qty:             qtys[i]         || 1,
      sheetRatePerSqm: sheetRates[i]   || 0,
      cuttingRate:     cuttingRates[i] || 0,
      weldingRate:     weldingRates[i] || 0,
      printingRate:    printingRates[i] || 0,
      sheetingRate:    sheetingRates[i] || 0,
      slittingRate:    slittingRates[i] || 0,
      rewindingRate:   rewindingRates[i] || 0,
      extrasCost:      extrasCosts[i]  || 0,
      marginPercent:   marginPercents[i] || 20,
      gstRate:         gstRates[i]     || 18,
    };

    const computed = computeItemCost(rawItem, gstType);

    computedItems.push({
      productType:     rawItem.productType,
      productName:     rawItem.productName,
      length:          rawItem.length  ? parseInt(rawItem.length)  : null,
      breadth:         rawItem.breadth ? parseInt(rawItem.breadth) : null,
      height:          rawItem.height  ? parseInt(rawItem.height)  : null,
      sheetThickness:  rawItem.sheetThickness || null,
      gsm:             rawItem.gsm    ? parseInt(rawItem.gsm)    : null,
      grade:           rawItem.grade  || null,
      closureType:     rawItem.closureType || null,
      remarks:         remarksList[i] || null,
      // computed fields
      qty:             computed.qty,
      sheetArea:       computed.sheetArea,
      sheetRatePerSqm: computed.sheetRatePerSqm,
      sheetCost:       computed.sheetCost,
      cuttingRate:     computed.cuttingRate,
      weldingRate:     computed.weldingRate,
      printingRate:    computed.printingRate,
      sheetingRate:    computed.sheetingRate,
      slittingRate:    computed.slittingRate,
      rewindingRate:   computed.rewindingRate,
      conversionCost:  computed.conversionCost,
      extrasCost:      computed.extrasCost,
      unitCost:        computed.unitCost,
      marginPercent:   computed.marginPercent,
      sellingPrice:    computed.sellingPrice,
      gstRate:         computed.gstRate,
      taxableAmt:      computed.taxableAmt,
      cgst:            computed.cgst,
      sgst:            computed.sgst,
      igst:            computed.igst,
      lineTotal:       computed.lineTotal,
    });
  }

  return computedItems;
}

// GET /quotes — list with optional filters
router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.leadId) where.leadId = parseInt(req.query.leadId);

    const quotes = await prisma.quote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        lead: { select: { id: true, companyName: true } },
        _count: { select: { items: true } },
      },
    });
    const quotesPlain = JSON.parse(JSON.stringify(quotes));

    const body = await ejs.renderFile(path.join(VIEWS, 'quotes/index.ejs'), {
      quotes: quotesPlain,
      filters: {
        status: req.query.status || '',
        leadId: req.query.leadId || '',
      },
    });
    res.render('layout', { title: 'Quotes', body });
  } catch (err) {
    console.error('Quotes list error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// GET /quotes/new?leadId=X — new quote form
router.get('/new', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const leadId = req.query.leadId ? parseInt(req.query.leadId) : null;

    let lead = null;
    let contacts = [];
    if (leadId) {
      lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: { contacts: { orderBy: { isPrimary: 'desc' } } },
      });
      if (lead) contacts = lead.contacts;
    }

    const rateCard = await prisma.rateCard.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    const gstType = lead ? determineGstType(BUSINESS_STATE, lead.state) : 'CGST_SGST';

    const leadPlain = lead ? JSON.parse(JSON.stringify(lead)) : null;
    const rateCardPlain = JSON.parse(JSON.stringify(rateCard));

    const body = await ejs.renderFile(path.join(VIEWS, 'quotes/form.ejs'), {
      quote: null,
      lead: leadPlain,
      contacts: JSON.parse(JSON.stringify(contacts)),
      rateCard: rateCardPlain,
      gstType,
      PRODUCT_TYPES,
    });
    res.render('layout', { title: 'New Quote', body });
  } catch (err) {
    console.error('New quote form error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// POST /quotes — create quote
router.post('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const leadId = parseInt(req.body.leadId);

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return res.redirect('/quotes/new?error=Lead+not+found');

    const gstType = determineGstType(BUSINESS_STATE, lead.state);
    const quoteNo = await getNextQuoteNo(prisma);

    const computedItems = parseAndComputeItems(req.body, gstType);
    const totals = computeQuoteTotals(computedItems);

    const quote = await prisma.quote.create({
      data: {
        quoteNo,
        leadId,
        contactId: req.body.contactId ? parseInt(req.body.contactId) : null,
        gstType,
        marginPercent: req.body.marginPercent || '20',
        ...totals,
        status: 'DRAFT',
        validUntil: req.body.validUntil ? new Date(req.body.validUntil) : null,
        notes: req.body.notes?.trim() || null,
        terms: req.body.terms?.trim() || null,
        items: {
          create: computedItems,
        },
      },
    });

    await prisma.activity.create({
      data: {
        leadId,
        type: 'QUOTE_CREATED',
        subject: `Quote ${quoteNo} created`,
      },
    });

    res.redirect(`/quotes/${quote.id}?success=Quote+created`);
  } catch (err) {
    console.error('Create quote error:', err);
    res.redirect('/quotes/new?error=' + encodeURIComponent(err.message));
  }
});

// GET /quotes/:id — quote detail
router.get('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        items: true,
        lead: { select: { id: true, companyName: true, state: true } },
        contact: { select: { name: true } },
        rfqs: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!quote) return res.status(404).send('Quote not found');

    const quotePlain = JSON.parse(JSON.stringify(quote));
    const body = await ejs.renderFile(path.join(VIEWS, 'quotes/detail.ejs'), {
      quote: quotePlain,
    });
    res.render('layout', { title: quotePlain.quoteNo, body });
  } catch (err) {
    console.error('Quote detail error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// GET /quotes/:id/edit — edit form (DRAFT only)
router.get('/:id/edit', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        items: true,
        lead: { include: { contacts: { orderBy: { isPrimary: 'desc' } } } },
        contact: true,
      },
    });
    if (!quote) return res.status(404).send('Quote not found');
    if (quote.status !== 'DRAFT') {
      return res.redirect(`/quotes/${id}?error=Only+DRAFT+quotes+can+be+edited`);
    }

    const rateCard = await prisma.rateCard.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    const gstType = determineGstType(BUSINESS_STATE, quote.lead.state);
    const quotePlain = JSON.parse(JSON.stringify(quote));
    const rateCardPlain = JSON.parse(JSON.stringify(rateCard));

    const body = await ejs.renderFile(path.join(VIEWS, 'quotes/form.ejs'), {
      quote: quotePlain,
      lead: quotePlain.lead,
      contacts: quotePlain.lead.contacts,
      rateCard: rateCardPlain,
      gstType,
      PRODUCT_TYPES,
    });
    res.render('layout', { title: 'Edit Quote — ' + quote.quoteNo, body });
  } catch (err) {
    console.error('Edit quote form error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// POST /quotes/:id — update quote (DRAFT only)
router.post('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);

    const existing = await prisma.quote.findUnique({ where: { id }, include: { lead: true } });
    if (!existing) return res.status(404).send('Quote not found');
    if (existing.status !== 'DRAFT') {
      return res.redirect(`/quotes/${id}?error=Only+DRAFT+quotes+can+be+edited`);
    }

    const gstType = determineGstType(BUSINESS_STATE, existing.lead.state);

    // Delete existing items and recompute
    await prisma.quoteItem.deleteMany({ where: { quoteId: id } });

    const computedItems = parseAndComputeItems(req.body, gstType);
    const totals = computeQuoteTotals(computedItems);

    await prisma.quote.update({
      where: { id },
      data: {
        contactId: req.body.contactId ? parseInt(req.body.contactId) : null,
        marginPercent: req.body.marginPercent || '20',
        ...totals,
        validUntil: req.body.validUntil ? new Date(req.body.validUntil) : null,
        notes: req.body.notes?.trim() || null,
        terms: req.body.terms?.trim() || null,
        items: {
          create: computedItems,
        },
      },
    });

    res.redirect(`/quotes/${id}?success=Quote+updated`);
  } catch (err) {
    console.error('Update quote error:', err);
    res.redirect(`/quotes/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
  }
});

// POST /quotes/:id/send — mark SENT
router.post('/:id/send', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);

    const quote = await prisma.quote.findUnique({ where: { id } });
    if (!quote) return res.status(404).send('Quote not found');

    await prisma.quote.update({ where: { id }, data: { status: 'SENT' } });
    await prisma.activity.create({
      data: {
        leadId: quote.leadId,
        type: 'QUOTE_SENT',
        subject: `Quote ${quote.quoteNo} sent`,
      },
    });

    try {
      const { changeStage } = require('../services/pipeline');
      await changeStage(prisma, quote.leadId, 'QUOTED', `Quote ${quote.quoteNo} sent`);
    } catch (e) {
      // Lead may already be at QUOTED or past it — that's OK
    }

    res.redirect(`/quotes/${id}?success=Quote+marked+as+sent`);
  } catch (err) {
    console.error('Send quote error:', err);
    res.redirect(`/quotes/${req.params.id}?error=` + encodeURIComponent(err.message));
  }
});

// POST /quotes/:id/accept — mark ACCEPTED
router.post('/:id/accept', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);

    const quote = await prisma.quote.findUnique({ where: { id } });
    if (!quote) return res.status(404).send('Quote not found');

    await prisma.quote.update({ where: { id }, data: { status: 'ACCEPTED' } });
    await prisma.activity.create({
      data: {
        leadId: quote.leadId,
        type: 'QUOTE_ACCEPTED',
        subject: `Quote ${quote.quoteNo} accepted`,
      },
    });

    try {
      const { changeStage } = require('../services/pipeline');
      await changeStage(prisma, quote.leadId, 'WON', `Quote ${quote.quoteNo} accepted`);
    } catch (e) {
      // May not be a valid transition
    }

    res.redirect(`/quotes/${id}?success=Quote+accepted`);
  } catch (err) {
    console.error('Accept quote error:', err);
    res.redirect(`/quotes/${req.params.id}?error=` + encodeURIComponent(err.message));
  }
});

// POST /quotes/:id/reject — mark REJECTED
router.post('/:id/reject', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);

    const quote = await prisma.quote.findUnique({ where: { id } });
    if (!quote) return res.status(404).send('Quote not found');

    await prisma.quote.update({ where: { id }, data: { status: 'REJECTED' } });
    await prisma.activity.create({
      data: {
        leadId: quote.leadId,
        type: 'QUOTE_REJECTED',
        subject: `Quote ${quote.quoteNo} rejected`,
        body: req.body.reason || null,
      },
    });

    res.redirect(`/quotes/${id}?success=Quote+marked+as+rejected`);
  } catch (err) {
    console.error('Reject quote error:', err);
    res.redirect(`/quotes/${req.params.id}?error=` + encodeURIComponent(err.message));
  }
});

// GET /quotes/:id/pdf — generate PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        items: true,
        lead: true,
        contact: true,
      },
    });
    if (!quote) return res.status(404).send('Quote not found');

    const puppeteer = require('puppeteer');

    const html = await ejs.renderFile(
      path.join(__dirname, '../../views/quotes/pdf.ejs'),
      { quote: JSON.parse(JSON.stringify(quote)) }
    );

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '15mm', bottom: '15mm', left: '10mm', right: '10mm' },
    });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${quote.quoteNo}.pdf"`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).send('PDF error: ' + err.message);
  }
});

module.exports = router;
