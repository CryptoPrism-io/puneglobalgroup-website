/**
 * Seed the demo database with synthetic test data.
 * Run: DATABASE_URL="postgresql://appuser:appuser123@localhost:5432/outreach_demo" node scripts/seed-demo.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../src/generated/prisma');

const pool = new Pool({ connectionString: process.env.DATABASE_URL_DEMO || process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function seed() {
  console.log('Seeding demo database...\n');

  // ── Rate Card ──
  const rates = [
    { category: 'SHEET', name: '2mm PP Sheet', unit: 'per_sqm', defaultRate: '85.00' },
    { category: 'SHEET', name: '3mm PP Sheet', unit: 'per_sqm', defaultRate: '120.00' },
    { category: 'SHEET', name: '4mm PP Sheet', unit: 'per_sqm', defaultRate: '155.00' },
    { category: 'SHEET', name: '5mm PP Sheet', unit: 'per_sqm', defaultRate: '190.00' },
    { category: 'SHEET', name: 'Cyber XLPac 300GSM', unit: 'per_sqm', defaultRate: '42.00' },
    { category: 'SHEET', name: 'Eco Natura 350GSM', unit: 'per_sqm', defaultRate: '35.00' },
    { category: 'SHEET', name: 'Kraft Liner 200GSM', unit: 'per_sqm', defaultRate: '28.00' },
    { category: 'CUTTING', name: 'Standard Cutting', unit: 'per_piece', defaultRate: '5.00' },
    { category: 'CUTTING', name: 'Die Cutting', unit: 'per_piece', defaultRate: '12.00' },
    { category: 'WELDING', name: 'Ultrasonic Welding', unit: 'per_piece', defaultRate: '18.00' },
    { category: 'WELDING', name: 'Riveting', unit: 'per_piece', defaultRate: '8.00' },
    { category: 'PRINTING', name: 'Screen Printing 1-color', unit: 'per_piece', defaultRate: '6.00' },
    { category: 'PRINTING', name: 'Screen Printing 2-color', unit: 'per_piece', defaultRate: '10.00' },
    { category: 'SHEETING', name: 'Synchro Sheeting', unit: 'per_piece', defaultRate: '3.50' },
    { category: 'SHEETING', name: 'Guillotine Sheeting', unit: 'per_piece', defaultRate: '2.50' },
    { category: 'FOAM', name: 'EVA Foam 5mm', unit: 'per_sqm', defaultRate: '220.00' },
    { category: 'ESD', name: 'ESD Coating', unit: 'per_sqm', defaultRate: '180.00' },
    { category: 'RIVET', name: 'PP Rivets', unit: 'per_piece', defaultRate: '0.50' },
  ];

  for (const r of rates) {
    await prisma.rateCard.upsert({
      where: { category_name: { category: r.category, name: r.name } },
      create: r,
      update: { defaultRate: r.defaultRate },
    });
  }
  console.log(`✓ ${rates.length} rate card entries seeded`);

  // ── Leads (mix of PP and Paper ICPs) ──
  const leads = [
    { companyName: 'AutoParts India Pvt Ltd', industry: 'automotive', city: 'Pune', state: 'Maharashtra', icpType: 'PP', employeeCount: 120, estimatedRevenue: '10-50Cr', stage: 'NEW', source: 'INDIAMART', fitScore: 8, currentPackaging: 'Cardboard boxes', painPoints: 'High damage rate in transit, single-use packaging waste' },
    { companyName: 'MediPack Pharma', industry: 'pharma', city: 'Hyderabad', state: 'Telangana', icpType: 'PP', employeeCount: 250, estimatedRevenue: '50-100Cr', stage: 'CONTACTED', source: 'LINKEDIN', fitScore: 9, currentPackaging: 'Cardboard trays', painPoints: 'Need FDA-compatible packaging for cleanroom' },
    { companyName: 'Shree Ganesh Corrugators', industry: 'corrugator', city: 'Pune', state: 'Maharashtra', icpType: 'PAPER', employeeCount: 25, estimatedRevenue: '5-10Cr', stage: 'QUALIFIED', source: 'GOOGLE', fitScore: 7, currentPackaging: 'Imports pre-cut sheets', painPoints: 'High cost of imported pre-cut sheets, 60-day lead time' },
    { companyName: 'ElectroCom Systems', industry: 'electronics', city: 'Bengaluru', state: 'Karnataka', icpType: 'PP', employeeCount: 80, estimatedRevenue: '10-50Cr', stage: 'RESEARCHED', source: 'GEM', fitScore: 7, currentPackaging: 'Generic plastic trays', painPoints: 'ESD damage to PCBs, no proper anti-static packaging' },
    { companyName: 'Vishwa Print & Pack', industry: 'printing', city: 'Pimpri-Chinchwad', state: 'Maharashtra', icpType: 'PAPER', employeeCount: 15, estimatedRevenue: '1-5Cr', stage: 'NEW', source: 'REFERRAL', fitScore: 6, currentPackaging: 'N/A - they convert board', painPoints: 'Need reliable FBB supply with low MOQ' },
    { companyName: 'Tata Motors Vendor Cell', industry: 'automotive', city: 'Pune', state: 'Maharashtra', icpType: 'PP', employeeCount: 500, estimatedRevenue: '100Cr+', stage: 'QUOTED', source: 'MANUAL', fitScore: 10, currentPackaging: 'Mixed — cardboard + some returnable', painPoints: 'Mandate to move to returnable packaging by Q4' },
    { companyName: 'FreshFoods FMCG', industry: 'fmcg', city: 'Mumbai', state: 'Maharashtra', icpType: 'BOTH', employeeCount: 60, estimatedRevenue: '10-50Cr', stage: 'CONTACTED', source: 'INDIAMART', fitScore: 6, currentPackaging: 'Corrugated cartons', painPoints: 'Shelf-ready packaging needed for retail chains' },
    { companyName: 'Precision Bearings Ltd', industry: 'engineering', city: 'Chennai', state: 'Tamil Nadu', icpType: 'PP', employeeCount: 180, estimatedRevenue: '50-100Cr', stage: 'NEW', source: 'GEM', fitScore: 8, currentPackaging: 'Wooden crates', painPoints: 'Heavy, expensive, ISPM-15 compliance issues for export' },
    { companyName: 'Maharashtra Paper Mills', industry: 'corrugator', city: 'Solapur', state: 'Maharashtra', icpType: 'PAPER', employeeCount: 40, estimatedRevenue: '5-10Cr', stage: 'WON', source: 'GOOGLE', fitScore: 9, currentPackaging: 'N/A', opportunities: 'Regular monthly FBB + kraft liner supply' },
    { companyName: 'NovaChem Industries', industry: 'pharma', city: 'Ahmedabad', state: 'Gujarat', icpType: 'PP', employeeCount: 300, estimatedRevenue: '50-100Cr', stage: 'LOST', source: 'LINKEDIN', fitScore: 7, lostReason: 'Went with local Gujarat supplier — freight cost concern' },
    { companyName: 'Kohinoor Electronics', industry: 'electronics', city: 'Pune', state: 'Maharashtra', icpType: 'PP', employeeCount: 55, estimatedRevenue: '5-10Cr', stage: 'CONTACTED', source: 'INDIAMART', fitScore: 8, currentPackaging: 'Thermocol + cardboard', painPoints: 'Component scratches in transit, no ESD protection' },
    { companyName: 'Sai Printers', industry: 'printing', city: 'Nashik', state: 'Maharashtra', icpType: 'PAPER', employeeCount: 10, estimatedRevenue: '<1Cr', stage: 'NEW', source: 'REFERRAL', fitScore: 5, currentPackaging: 'N/A', painPoints: 'Small orders, needs flexible MOQ' },
  ];

  const createdLeads = [];
  for (const l of leads) {
    const lead = await prisma.lead.create({ data: l });
    createdLeads.push(lead);
  }
  console.log(`✓ ${leads.length} leads seeded`);

  // ── Contacts (1-2 per lead) ──
  const contacts = [
    { leadIdx: 0, name: 'Rajesh Patil', designation: 'Purchase Manager', department: 'Purchase', phone: '9876543210', email: 'rajesh@autopartsindia.com', whatsapp: '9876543210', isPrimary: true },
    { leadIdx: 0, name: 'Sunil Deshmukh', designation: 'MD', department: 'Management', phone: '9876543211', email: 'sunil@autopartsindia.com', isPrimary: false },
    { leadIdx: 1, name: 'Dr. Priya Sharma', designation: 'Packaging Head', department: 'Packaging', phone: '9123456789', email: 'priya.sharma@medipack.in', whatsapp: '9123456789', isPrimary: true },
    { leadIdx: 2, name: 'Ganesh Kulkarni', designation: 'Owner', department: 'Management', phone: '9765432100', email: 'ganesh@shreeganeshcorr.com', whatsapp: '9765432100', isPrimary: true },
    { leadIdx: 3, name: 'Anil Kumar', designation: 'SCM Lead', department: 'Purchase', phone: '9988776655', email: 'anil.k@electrocom.in', whatsapp: '9988776655', isPrimary: true },
    { leadIdx: 4, name: 'Vijay More', designation: 'Proprietor', department: 'Management', phone: '9823456789', email: 'vijay@vishwaprint.com', isPrimary: true },
    { leadIdx: 5, name: 'Amit Joshi', designation: 'Vendor Development', department: 'Purchase', phone: '9900112233', email: 'amit.joshi@tatavendor.com', whatsapp: '9900112233', isPrimary: true },
    { leadIdx: 6, name: 'Sneha Nair', designation: 'Procurement Exec', department: 'Purchase', phone: '9845678901', email: 'sneha@freshfoods.co.in', whatsapp: '9845678901', isPrimary: true },
    { leadIdx: 7, name: 'Karthik Rajan', designation: 'Plant Manager', department: 'Production', phone: '9445566778', email: 'karthik@precisionbearings.com', isPrimary: true },
    { leadIdx: 8, name: 'Manoj Jadhav', designation: 'Purchase Head', department: 'Purchase', phone: '9623456789', email: 'manoj@maharashtrapaper.com', whatsapp: '9623456789', isPrimary: true },
    { leadIdx: 9, name: 'Nitin Shah', designation: 'COO', department: 'Management', phone: '9876001122', email: 'nitin@novachem.in', isPrimary: true },
    { leadIdx: 10, name: 'Sachin Deshpande', designation: 'Purchase Manager', department: 'Purchase', phone: '9822334455', email: 'sachin@kohinoorelectronics.com', whatsapp: '9822334455', isPrimary: true },
    { leadIdx: 11, name: 'Ramesh Wagh', designation: 'Owner', department: 'Management', phone: '9890123456', email: 'ramesh@saiprinters.com', isPrimary: true },
  ];

  for (const c of contacts) {
    const { leadIdx, ...data } = c;
    await prisma.contact.create({ data: { ...data, leadId: createdLeads[leadIdx].id } });
  }
  console.log(`✓ ${contacts.length} contacts seeded`);

  // ── Activities ──
  const activities = [
    { leadIdx: 0, type: 'SCRAPE', subject: 'Found on IndiaMART — searches for PP corrugated boxes' },
    { leadIdx: 0, type: 'CALL', subject: 'Cold call to Rajesh Patil — interested in returnable PP boxes for engine parts' },
    { leadIdx: 1, type: 'EMAIL_SENT', subject: 'Sent intro email to Dr. Priya about FDA-compatible PP trays' },
    { leadIdx: 1, type: 'CALL', subject: 'Follow-up call — needs samples of ultrasonic weld boxes for cleanroom' },
    { leadIdx: 2, type: 'MEETING', subject: 'Visited Shree Ganesh factory — discussed FBB sheeting needs' },
    { leadIdx: 2, type: 'QUOTE_CREATED', subject: 'Prepared quote for Cyber XLPac sheeting — 5T monthly' },
    { leadIdx: 5, type: 'MEETING', subject: 'Meeting at Tata vendor cell — presented returnable packaging solutions' },
    { leadIdx: 5, type: 'QUOTE_CREATED', subject: 'Quote QT-2526-001 for 500 PP boxes + 1000 layer pads' },
    { leadIdx: 5, type: 'STAGE_CHANGE', subject: 'Stage: QUALIFIED → QUOTED' },
    { leadIdx: 8, type: 'NOTE', subject: 'Won deal — 10T/month FBB + kraft supply starting April' },
    { leadIdx: 9, type: 'STAGE_CHANGE', subject: 'Stage: CONTACTED → LOST — went with local Gujarat supplier' },
    { leadIdx: 10, type: 'WHATSAPP_SENT', subject: 'Sent product catalog on WhatsApp to Sachin' },
  ];

  for (const a of activities) {
    const { leadIdx, ...data } = a;
    await prisma.activity.create({ data: { ...data, leadId: createdLeads[leadIdx].id } });
  }
  console.log(`✓ ${activities.length} activities seeded`);

  // ── Message Templates ──
  const templates = [
    { name: 'Cold Introduction — PP', channel: 'EMAIL', category: 'COLD_INTRO', subject: 'Returnable Packaging Solutions for {{lead.companyName}}', body: '<p>Dear {{contact.name}},</p><p>I am writing from Pune Global Group, a packaging manufacturer established in 1995.</p><p>We specialize in precision PP corrugated packaging — boxes, trays, separators, and bins — designed for returnable logistics in {{lead.industry}} applications.</p><p>Our products offer 50–500 trip reuse cycles, replacing single-use cardboard and reducing packaging waste by up to 80%.</p><p>Would you be open to a brief call to discuss your packaging requirements?</p><p>Best regards,<br>{{sender.name}}<br>{{sender.phone}}</p>' },
    { name: 'Cold Introduction — Paper', channel: 'EMAIL', category: 'COLD_INTRO', subject: 'ITC FBB & Kraft Supply — Ready Stock in Pune', body: '<p>Dear {{contact.name}},</p><p>Pune Global Group has been a trusted paper & board trader since 1995. We stock 40+ ITC PSPD and TNPL grades with same-week delivery from our Pune warehouse.</p><p>Key advantages:<br>- Low MOQ: 1–5 tonnes<br>- Custom sheeting to ±0.5mm tolerance<br>- 8–15% savings vs pre-cut imports</p><p>Would you like a current price list for {{lead.city}}?</p><p>Regards,<br>{{sender.name}}</p>' },
    { name: 'Stock Update', channel: 'BOTH', category: 'STOCK_UPDATE', subject: 'Fresh Stock Available — {{today}}', body: 'Hi {{contact.name}}, fresh stock update from Pune Global Group:\n\n📦 PP Corrugated Sheets: 2mm, 3mm, 4mm, 5mm — ready stock\n📄 ITC Cyber XLPac 300GSM — 15T available\n📄 Eco Natura 350GSM — 8T available\n📄 Kraft Liner 200GSM — 20T available\n\nAll grades available for immediate dispatch. Contact us for rates.\n\n{{sender.name}} | {{sender.phone}}' },
    { name: 'Quote Follow-up', channel: 'BOTH', category: 'QUOTE_FOLLOWUP', subject: 'Following up on Quote {{quote.quoteNo}}', body: 'Hi {{contact.name}},\n\nJust following up on the quotation we sent for {{lead.companyName}} ({{quote.quoteNo}}, total {{quote.grandTotal}}).\n\nThe quote is valid until {{quote.validUntil}}. Happy to discuss any adjustments or answer questions.\n\nBest,\n{{sender.name}} | {{sender.phone}}' },
    { name: 'Diwali Greeting', channel: 'WHATSAPP', category: 'FESTIVE', body: '🪔 Happy Diwali from Pune Global Group! 🪔\n\nDear {{contact.name}},\n\nWishing you and the entire team at {{lead.companyName}} a prosperous Diwali and New Year.\n\nMay this festive season bring new opportunities and success to your business.\n\nWarm regards,\n{{sender.name}}\nPune Global Group' },
    { name: 'Quality Education — FBB vs Duplex', channel: 'EMAIL', category: 'QUALITY_EDUCATION', subject: 'Know Your Board: FBB vs Duplex — Which is Right for You?', body: '<p>Dear {{contact.name}},</p><p>Choosing between FBB (Folding Box Board) and Duplex Board? Here\'s a quick comparison:</p><p><strong>FBB (e.g., ITC Cyber XLPac):</strong><br>✓ Virgin fibre, superior print quality<br>✓ Higher stiffness-to-weight ratio<br>✓ Premium shelf appeal<br>✓ Best for: Pharma, cosmetics, premium FMCG</p><p><strong>Duplex Board (e.g., Eco Natura):</strong><br>✓ Recycled content, lower cost<br>✓ Good printability<br>✓ Eco-friendly positioning<br>✓ Best for: General packaging, mid-range products</p><p>We stock both grades in Pune with low MOQ. Let us know if you\'d like samples.</p><p>{{sender.name}}<br>Pune Global Group</p>' },
  ];

  for (const t of templates) {
    await prisma.messageTemplate.create({ data: t });
  }
  console.log(`✓ ${templates.length} message templates seeded`);

  // ── Scrape Batch (for history) ──
  await prisma.scrapeBatch.create({
    data: {
      source: 'INDIAMART',
      query: 'corrugated PP box manufacturers automotive Pune Maharashtra',
      leadsFound: 3,
      leadsNew: 3,
      notes: 'Initial scrape session — found AutoParts India, Kohinoor Electronics, FreshFoods FMCG',
    },
  });
  await prisma.scrapeBatch.create({
    data: {
      source: 'GOOGLE',
      query: 'corrugated box manufacturers Pune packaging companies',
      leadsFound: 2,
      leadsNew: 2,
      notes: 'Found Shree Ganesh Corrugators and Maharashtra Paper Mills',
    },
  });
  console.log('✓ 2 scrape batches seeded');

  console.log('\n✅ Demo database seeded successfully!');
  console.log('  12 leads, 13 contacts, 12 activities, 18 rate cards, 6 templates, 2 scrape batches');
}

seed()
  .catch(e => { console.error('Seed error:', e); process.exit(1); })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
