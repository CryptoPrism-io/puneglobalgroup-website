const express = require('express');
const path = require('path');
const ejs = require('ejs');
const router = express.Router();
const { appendConsentNote, hasWhatsAppOptIn, OPT_IN_MARKER } = require('../services/whatsappConsent');
const { enrollLead } = require('../services/sequenceEngine');

const VIEWS = path.join(__dirname, '../../views');
const DEFAULT_WHATSAPP_SEQUENCE = 'PP WhatsApp Opt-In Intro + One Follow-up';

async function enrollInDefaultWhatsappSequence(prisma, contact) {
  const sequence = await prisma.sequence.findFirst({ where: { name: DEFAULT_WHATSAPP_SEQUENCE, isActive: true } });
  if (!sequence) throw new Error('Approved WhatsApp sequence is not configured');
  return enrollLead(prisma, sequence.id, contact.leadId, contact.id);
}

function extractContactData(body) {
  let notes = body.notes?.trim() || null;
  if (body.whatsappOptIn === 'on' && !hasWhatsAppOptIn({ notes })) {
    notes = appendConsentNote(notes, OPT_IN_MARKER, 'recorded by CRM user');
  }
  return {
    leadId: parseInt(body.leadId),
    name: body.name?.trim() || '',
    designation: body.designation?.trim() || null,
    department: body.department || null,
    phone: body.phone?.trim() || null,
    email: body.email?.trim() || null,
    whatsapp: body.whatsapp?.trim() || null,
    linkedinUrl: body.linkedinUrl?.trim() || null,
    isPrimary: body.isPrimary === 'on' || body.isPrimary === 'true',
    discType: body.discType || null,
    notes,
  };
}

// GET /contacts — directory with search
router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const search = req.query.search || '';
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } },
      ];
    }
    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { lead: { select: { id: true, companyName: true } } },
    });
    const contactsPlain = JSON.parse(JSON.stringify(contacts));
    const body = await ejs.renderFile(path.join(VIEWS, 'contacts/index.ejs'), {
      contacts: contactsPlain,
      search,
    });
    res.render('layout', { title: 'Contacts', body });
  } catch (err) {
    console.error('Contacts list error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// GET /contacts/new — new contact form
router.get('/new', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const leadId = req.query.leadId ? parseInt(req.query.leadId) : null;
    const leads = await prisma.lead.findMany({
      where: { isArchived: false },
      orderBy: { companyName: 'asc' },
      select: { id: true, companyName: true },
    });
    const body = await ejs.renderFile(path.join(VIEWS, 'contacts/form.ejs'), {
      contact: null,
      leads: JSON.parse(JSON.stringify(leads)),
      defaultLeadId: leadId,
      hasWhatsAppOptIn,
    });
    res.render('layout', { title: 'New Contact', body });
  } catch (err) {
    console.error('New contact form error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// POST /contacts — create contact
router.post('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const data = extractContactData(req.body);
    await prisma.$transaction(async tx => {
      const contact = await tx.contact.create({ data });
      if (req.body.whatsappOptIn === 'on') await enrollInDefaultWhatsappSequence(tx, contact);
    });
    res.redirect(`/leads/${data.leadId}?tab=contacts&success=Contact+added`);
  } catch (err) {
    console.error('Create contact error:', err);
    res.redirect('/contacts/new?error=' + encodeURIComponent(err.message));
  }
});

// GET /contacts/:id — edit contact form
router.get('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: { lead: { select: { id: true, companyName: true } } },
    });
    if (!contact) return res.status(404).send('Contact not found');
    const leads = await prisma.lead.findMany({
      where: { isArchived: false },
      orderBy: { companyName: 'asc' },
      select: { id: true, companyName: true },
    });
    const body = await ejs.renderFile(path.join(VIEWS, 'contacts/form.ejs'), {
      contact: JSON.parse(JSON.stringify(contact)),
      leads: JSON.parse(JSON.stringify(leads)),
      defaultLeadId: null,
      hasWhatsAppOptIn,
    });
    res.render('layout', { title: 'Edit Contact — ' + contact.name, body });
  } catch (err) {
    console.error('Edit contact error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// POST /contacts/:id — update contact
router.post('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) return res.status(404).send('Contact not found');
    const data = extractContactData(req.body);
    await prisma.$transaction(async tx => {
      const contact = await tx.contact.update({ where: { id }, data });
      if (!hasWhatsAppOptIn(existing) && hasWhatsAppOptIn(contact)) {
        await enrollInDefaultWhatsappSequence(tx, contact);
      }
    });
    res.redirect(`/leads/${data.leadId}?tab=contacts&success=Contact+updated`);
  } catch (err) {
    console.error('Update contact error:', err);
    res.redirect(`/contacts/${req.params.id}?error=` + encodeURIComponent(err.message));
  }
});

// POST /contacts/:id/delete — delete contact
router.post('/:id/delete', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const id = parseInt(req.params.id);
    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) return res.status(404).send('Contact not found');
    const leadId = contact.leadId;
    await prisma.contact.delete({ where: { id } });
    res.redirect(`/leads/${leadId}?tab=contacts&success=Contact+deleted`);
  } catch (err) {
    console.error('Delete contact error:', err);
    res.redirect(`/contacts/${req.params.id}?error=` + encodeURIComponent(err.message));
  }
});

module.exports = router;
