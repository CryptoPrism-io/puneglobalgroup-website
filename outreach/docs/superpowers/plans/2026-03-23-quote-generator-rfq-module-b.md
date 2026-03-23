# Quote Generator + Supplier RFQ — Module B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add size-based quote generation, supplier RFQ with auto-BOM, and rate card management to the Outreach CRM.

**Architecture:** Extends the existing outreach Express+EJS+Prisma app. New Prisma models (Quote, QuoteItem, SupplierRfq, RfqItem, RateCard), a pricing engine using Decimal.js, GST calculation duplicated from invoicer, Puppeteer for PDF generation. All amounts stored as Decimal strings, never floats.

**Tech Stack:** Express 5, EJS, Prisma 7.x, PostgreSQL, Decimal.js, Puppeteer, same CSS design system.

**Spec:** `outreach/docs/superpowers/specs/2026-03-23-quote-generator-rfq-module-b-design.md`

**Reference:** `invoicer/src/services/gst.js` (GST logic), `invoicer/src/services/invoiceNo.js` (FY numbering)

---

### Task 1: Install Dependencies

**Files:**
- Modify: `outreach/package.json`

- [ ] **Step 1: Install decimal.js and puppeteer**

Run:
```bash
cd C:/cpio_db/puneglobalgroup-website/outreach
npm install decimal.js@^10.6.0 puppeteer@^24.39.1
```

- [ ] **Step 2: Commit**

```bash
cd C:/cpio_db/puneglobalgroup-website
git add outreach/package.json outreach/package-lock.json
git commit -m "feat(outreach): add decimal.js and puppeteer for Module B

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Prisma Schema — Add Quote, RFQ, RateCard Models

**Files:**
- Modify: `outreach/prisma/schema.prisma`

- [ ] **Step 1: Add new models to schema.prisma**

Add after the existing ScrapeBatch model:

```prisma
model Quote {
  id            Int       @id @default(autoincrement())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  quoteNo       String    @unique
  leadId        Int
  lead          Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)
  contactId     Int?
  contact       Contact?  @relation(fields: [contactId], references: [id], onDelete: SetNull)

  gstType       String
  marginPercent String

  subtotal      String
  totalCgst     String
  totalSgst     String
  totalIgst     String
  totalGst      String
  grandTotal    String

  status        String    @default("DRAFT")
  validUntil    DateTime?
  notes         String?
  terms         String?

  items         QuoteItem[]
  rfqs          SupplierRfq[]
}

model QuoteItem {
  id              Int     @id @default(autoincrement())
  quoteId         Int
  quote           Quote   @relation(fields: [quoteId], references: [id], onDelete: Cascade)

  productType     String
  productName     String
  description     String?

  length          Int?
  breadth         Int?
  height          Int?

  sheetThickness  String?
  gsm             Int?
  grade           String?
  flute           String?
  closureType     String?
  extras          Json?

  qty             String

  sheetArea       String
  sheetRatePerSqm String
  sheetCost       String

  cuttingRate     String
  weldingRate     String
  printingRate    String
  sheetingRate    String?
  slittingRate    String?
  rewindingRate   String?
  conversionCost  String

  extrasCost      String
  unitCost        String
  marginPercent   String
  sellingPrice    String

  gstRate         String
  taxableAmt      String
  cgst            String
  sgst            String
  igst            String
  lineTotal       String

  remarks         String?
}

model SupplierRfq {
  id                Int       @id @default(autoincrement())
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  rfqNo             String    @unique
  quoteId           Int
  quote             Quote     @relation(fields: [quoteId], references: [id], onDelete: Cascade)

  supplierName      String
  supplierEmail     String?
  supplierPhone     String?

  status            String    @default("DRAFT")
  sentAt            DateTime?
  responseDeadline  DateTime?
  notes             String?

  items             RfqItem[]
}

model RfqItem {
  id                 Int         @id @default(autoincrement())
  rfqId              Int
  rfq                SupplierRfq @relation(fields: [rfqId], references: [id], onDelete: Cascade)

  materialName       String
  specification      String?
  quantity           String
  unit               String
  estimatedRate      String?
  supplierQuotedRate String?
  notes              String?
}

model RateCard {
  id              Int       @id @default(autoincrement())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  category        String
  name            String
  unit            String
  defaultRate     String
  lastPurchaseRate String?
  notes           String?

  @@unique([category, name])
}
```

Also add relation fields to existing models:

In the `Lead` model, add:
```prisma
  quotes             Quote[]
```

In the `Contact` model, add:
```prisma
  quotes             Quote[]
```

- [ ] **Step 2: Run migration**

```bash
cd C:/cpio_db/puneglobalgroup-website/outreach
npx prisma migrate dev --name add_quotes_rfq_ratecard
```

- [ ] **Step 3: Create views directories**

```bash
cd C:/cpio_db/puneglobalgroup-website/outreach
mkdir -p views/quotes views/rfqs views/rate-card
```

- [ ] **Step 4: Commit**

```bash
cd C:/cpio_db/puneglobalgroup-website
git add outreach/prisma/
git commit -m "feat(outreach): add Quote, QuoteItem, SupplierRfq, RfqItem, RateCard models

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Services — GST, Quote Numbering, Pricing Engine, BOM

**Files:**
- Create: `outreach/src/services/gst.js`
- Create: `outreach/src/services/quoteNo.js`
- Create: `outreach/src/services/pricing.js`
- Create: `outreach/src/services/bom.js`

- [ ] **Step 1: Create src/services/gst.js**

Duplicate from `invoicer/src/services/gst.js` — exact same logic. Copy the file verbatim:

```bash
cp C:/cpio_db/puneglobalgroup-website/invoicer/src/services/gst.js C:/cpio_db/puneglobalgroup-website/outreach/src/services/gst.js
```

This provides: `determineGstType(businessState, counterpartyState)`, `computeLineItem(qty, unitPrice, gstRate, gstType)`, `computeTotals(items[])`.

Verify it works: `cd outreach && node src/services/gst.js` — should print "ALL TESTS PASSED".

- [ ] **Step 2: Create src/services/quoteNo.js**

```javascript
/**
 * Quote & RFQ Number Service
 * Formats: QT-YYXX-NNN, RFQ-YYXX-NNN
 * FY runs April 1 → March 31, sequential, resets each FY.
 */

function getCurrentFY(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  let startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;
  const fyStart = new Date(Date.UTC(startYear, 3, 1, 0, 0, 0, 0));
  const fyEnd = new Date(Date.UTC(endYear, 2, 31, 23, 59, 59, 999));
  const fyLabel = String(startYear).slice(-2) + String(endYear).slice(-2);
  return { fyStart, fyEnd, fyLabel };
}

async function getNextQuoteNo(prisma, now = new Date()) {
  const { fyStart, fyEnd, fyLabel } = getCurrentFY(now);
  const prefix = `QT-${fyLabel}-`;
  const latest = await prisma.quote.findFirst({
    where: { quoteNo: { startsWith: prefix }, createdAt: { gte: fyStart, lte: fyEnd } },
    orderBy: { quoteNo: 'desc' },
    select: { quoteNo: true },
  });
  let nextNum = 1;
  if (latest) {
    const lastNum = parseInt(latest.quoteNo.split('-')[2], 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }
  return `${prefix}${String(nextNum).padStart(3, '0')}`;
}

async function getNextRfqNo(prisma, now = new Date()) {
  const { fyStart, fyEnd, fyLabel } = getCurrentFY(now);
  const prefix = `RFQ-${fyLabel}-`;
  const latest = await prisma.supplierRfq.findFirst({
    where: { rfqNo: { startsWith: prefix }, createdAt: { gte: fyStart, lte: fyEnd } },
    orderBy: { rfqNo: 'desc' },
    select: { rfqNo: true },
  });
  let nextNum = 1;
  if (latest) {
    const lastNum = parseInt(latest.rfqNo.split('-')[2], 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }
  return `${prefix}${String(nextNum).padStart(3, '0')}`;
}

module.exports = { getCurrentFY, getNextQuoteNo, getNextRfqNo };
```

- [ ] **Step 3: Create src/services/pricing.js**

```javascript
/**
 * Pricing Engine — size-based cost calculation for PP and Paper/Board products.
 * All math uses Decimal.js. All outputs are Decimal strings.
 */

const Decimal = require('decimal.js');
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

const BUSINESS_STATE = 'Maharashtra';

// Flap allowance in mm (per side) for box/tray/bin blanks
const FLAP_ALLOWANCE = 30;

/**
 * Calculate sheet area (sq.m) from product dimensions.
 */
function calculateSheetArea(productType, length, breadth, height) {
  const L = new Decimal(length || 0);
  const B = new Decimal(breadth || 0);
  const H = new Decimal(height || 0);
  const flap = new Decimal(FLAP_ALLOWANCE);
  const million = new Decimal(1_000_000);

  let blankL, blankB;

  switch (productType) {
    case 'PP_BOX':
    case 'PP_BIN':
      // Unfolded blank: L + 2H + 2×flap by B + 2H + 2×flap
      blankL = L.plus(H.times(2)).plus(flap.times(2));
      blankB = B.plus(H.times(2)).plus(flap.times(2));
      return blankL.times(blankB).dividedBy(million).toDecimalPlaces(4).toString();

    case 'PP_TRAY':
      // Tray: L + 2H + 2×flap by B + 2H + 2×flap (same formula, shallower H)
      blankL = L.plus(H.times(2)).plus(flap.times(2));
      blankB = B.plus(H.times(2)).plus(flap.times(2));
      return blankL.times(blankB).dividedBy(million).toDecimalPlaces(4).toString();

    case 'PP_SEPARATOR':
    case 'PP_LAYER_PAD':
    case 'PP_FLOORING':
    case 'PAPER_SHEET':
    case 'BOARD_SHEET':
      // Flat product: L × B
      return L.times(B).dividedBy(million).toDecimalPlaces(4).toString();

    default:
      return L.times(B).dividedBy(million).toDecimalPlaces(4).toString();
  }
}

/**
 * Compute full cost breakdown for a single quote item.
 *
 * @param {Object} item - Item with dimensions, rates, qty, etc.
 * @param {string} gstType - "CGST_SGST" | "IGST"
 * @returns {Object} Computed pricing fields (all Decimal strings)
 */
function computeItemCost(item, gstType) {
  const sheetArea = new Decimal(item.sheetArea || calculateSheetArea(
    item.productType, item.length, item.breadth, item.height
  ));
  const sheetRatePerSqm = new Decimal(item.sheetRatePerSqm || 0);
  const qty = new Decimal(item.qty || 1);
  const marginPct = new Decimal(item.marginPercent || 0);
  const gstRate = new Decimal(item.gstRate || 18);

  // Sheet cost = area × rate (per unit)
  const sheetCost = sheetArea.times(sheetRatePerSqm).toDecimalPlaces(2);

  // Conversion costs (per piece)
  const cutting = new Decimal(item.cuttingRate || 0);
  const welding = new Decimal(item.weldingRate || 0);
  const printing = new Decimal(item.printingRate || 0);
  const sheeting = new Decimal(item.sheetingRate || 0);
  const slitting = new Decimal(item.slittingRate || 0);
  const rewinding = new Decimal(item.rewindingRate || 0);
  const conversionCost = cutting.plus(welding).plus(printing)
    .plus(sheeting).plus(slitting).plus(rewinding).toDecimalPlaces(2);

  // Extras cost (per piece)
  const extrasCost = new Decimal(item.extrasCost || 0).toDecimalPlaces(2);

  // Unit cost
  const unitCost = sheetCost.plus(conversionCost).plus(extrasCost).toDecimalPlaces(2);

  // Selling price = unitCost × (1 + margin/100)
  const sellingPrice = unitCost.times(
    new Decimal(1).plus(marginPct.dividedBy(100))
  ).toDecimalPlaces(2);

  // Taxable amount = sellingPrice × qty
  const taxableAmt = sellingPrice.times(qty).toDecimalPlaces(2);

  // GST breakdown
  const gstAmount = taxableAmt.times(gstRate).dividedBy(100).toDecimalPlaces(2);
  let cgst, sgst, igst;
  if (gstType === 'CGST_SGST') {
    cgst = gstAmount.dividedBy(2).toDecimalPlaces(2);
    sgst = gstAmount.minus(cgst).toDecimalPlaces(2);
    igst = new Decimal(0);
  } else {
    cgst = new Decimal(0);
    sgst = new Decimal(0);
    igst = gstAmount;
  }

  const lineTotal = taxableAmt.plus(cgst).plus(sgst).plus(igst).toDecimalPlaces(2);

  return {
    sheetArea: sheetArea.toString(),
    sheetRatePerSqm: sheetRatePerSqm.toDecimalPlaces(2).toString(),
    sheetCost: sheetCost.toString(),
    cuttingRate: cutting.toDecimalPlaces(2).toString(),
    weldingRate: welding.toDecimalPlaces(2).toString(),
    printingRate: printing.toDecimalPlaces(2).toString(),
    sheetingRate: sheeting.toDecimalPlaces(2).toString(),
    slittingRate: slitting.toDecimalPlaces(2).toString(),
    rewindingRate: rewinding.toDecimalPlaces(2).toString(),
    conversionCost: conversionCost.toString(),
    extrasCost: extrasCost.toString(),
    unitCost: unitCost.toString(),
    marginPercent: marginPct.toDecimalPlaces(2).toString(),
    sellingPrice: sellingPrice.toString(),
    gstRate: gstRate.toDecimalPlaces(2).toString(),
    taxableAmt: taxableAmt.toString(),
    cgst: cgst.toString(),
    sgst: sgst.toString(),
    igst: igst.toString(),
    lineTotal: lineTotal.toString(),
    qty: qty.toDecimalPlaces(2).toString(),
  };
}

/**
 * Compute quote-level totals from computed items.
 */
function computeQuoteTotals(items) {
  let subtotal = new Decimal(0);
  let totalCgst = new Decimal(0);
  let totalSgst = new Decimal(0);
  let totalIgst = new Decimal(0);

  for (const item of items) {
    subtotal = subtotal.plus(new Decimal(item.taxableAmt));
    totalCgst = totalCgst.plus(new Decimal(item.cgst));
    totalSgst = totalSgst.plus(new Decimal(item.sgst));
    totalIgst = totalIgst.plus(new Decimal(item.igst));
  }

  const totalGst = totalCgst.plus(totalSgst).plus(totalIgst).toDecimalPlaces(2);
  const grandTotal = subtotal.plus(totalGst).toDecimalPlaces(2);

  return {
    subtotal: subtotal.toDecimalPlaces(2).toString(),
    totalCgst: totalCgst.toDecimalPlaces(2).toString(),
    totalSgst: totalSgst.toDecimalPlaces(2).toString(),
    totalIgst: totalIgst.toDecimalPlaces(2).toString(),
    totalGst: totalGst.toString(),
    grandTotal: grandTotal.toString(),
  };
}

/**
 * Load default rates from RateCard for a given product type.
 */
async function getDefaultRates(prisma, productType) {
  const rates = await prisma.rateCard.findMany();
  const rateMap = {};
  for (const r of rates) {
    rateMap[`${r.category}:${r.name}`] = r.defaultRate;
  }
  return rateMap;
}

module.exports = {
  BUSINESS_STATE,
  FLAP_ALLOWANCE,
  calculateSheetArea,
  computeItemCost,
  computeQuoteTotals,
  getDefaultRates,
};
```

- [ ] **Step 4: Create src/services/bom.js**

```javascript
/**
 * Bill of Materials Generator
 * Breaks down quote items into raw materials for supplier RFQ.
 */

const Decimal = require('decimal.js');
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Generate BOM from quote items.
 * Aggregates duplicate materials across items.
 *
 * @param {Array} quoteItems - Array of QuoteItem records
 * @returns {Array} RfqItem-shaped objects
 */
function generateBom(quoteItems) {
  const materials = {};

  for (const item of quoteItems) {
    const qty = new Decimal(item.qty || 1);
    const area = new Decimal(item.sheetArea || 0);
    const totalArea = area.times(qty).toDecimalPlaces(4);

    // Primary material: PP sheet or Paper/Board
    let matKey, matName, matSpec, matQty, matUnit, matRate;

    if (item.productType.startsWith('PP_')) {
      matKey = `PP_SHEET_${item.sheetThickness || '3'}mm`;
      matName = `${item.sheetThickness || 3}mm PP Corrugated Sheet`;
      matSpec = `Thickness: ${item.sheetThickness || 3}mm`;
      matQty = totalArea;
      matUnit = 'sqm';
      matRate = item.sheetRatePerSqm;
    } else {
      matKey = `PAPER_${item.grade || 'generic'}_${item.gsm || 0}GSM`;
      matName = `${item.grade || 'Paper'} ${item.gsm || ''}GSM`;
      matSpec = `Grade: ${item.grade || 'N/A'}, GSM: ${item.gsm || 'N/A'}`;
      matQty = totalArea;
      matUnit = 'sqm';
      matRate = item.sheetRatePerSqm;
    }

    if (materials[matKey]) {
      materials[matKey].quantity = new Decimal(materials[matKey].quantity)
        .plus(matQty).toDecimalPlaces(4).toString();
    } else {
      materials[matKey] = {
        materialName: matName,
        specification: matSpec,
        quantity: matQty.toString(),
        unit: matUnit,
        estimatedRate: matRate || null,
      };
    }

    // Closure materials (PP only)
    if (item.closureType === 'riveted' && item.productType.startsWith('PP_')) {
      const rivetKey = 'RIVETS';
      const rivetQty = qty.times(8); // ~8 rivets per box
      if (materials[rivetKey]) {
        materials[rivetKey].quantity = new Decimal(materials[rivetKey].quantity)
          .plus(rivetQty).toString();
      } else {
        materials[rivetKey] = {
          materialName: 'Rivets',
          specification: 'Standard PP rivets',
          quantity: rivetQty.toString(),
          unit: 'pcs',
          estimatedRate: null,
        };
      }
    }

    // Extras materials
    const extras = item.extras || {};
    if (extras.foam) {
      const foamKey = 'FOAM_EVA';
      if (!materials[foamKey]) {
        materials[foamKey] = {
          materialName: 'EVA Foam Sheet',
          specification: '30 Shore A',
          quantity: totalArea.toString(),
          unit: 'sqm',
          estimatedRate: null,
        };
      } else {
        materials[foamKey].quantity = new Decimal(materials[foamKey].quantity)
          .plus(totalArea).toDecimalPlaces(4).toString();
      }
    }
  }

  return Object.values(materials);
}

module.exports = { generateBom };
```

- [ ] **Step 5: Commit**

```bash
cd C:/cpio_db/puneglobalgroup-website
git add outreach/src/services/gst.js outreach/src/services/quoteNo.js outreach/src/services/pricing.js outreach/src/services/bom.js
git commit -m "feat(outreach): add GST, pricing engine, quote numbering, and BOM services

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Rate Card Route + View

**Files:**
- Create: `outreach/src/routes/rateCard.js`
- Create: `outreach/views/rate-card/index.ejs`

- [ ] **Step 1: Create src/routes/rateCard.js**

```javascript
const express = require('express');
const router = express.Router();

// GET /rate-card — list all rates
router.get('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    const rates = await prisma.rateCard.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    // Group by category
    const grouped = {};
    for (const rate of rates) {
      if (!grouped[rate.category]) grouped[rate.category] = [];
      grouped[rate.category].push(rate);
    }
    const ejs = require('ejs');
    const path = require('path');
    const body = await ejs.renderFile(path.join(__dirname, '../../views/rate-card/index.ejs'), {
      grouped, rates,
    });
    res.render('layout', { title: 'Rate Card', body });
  } catch (err) {
    console.error('Rate card error:', err);
    res.status(500).send('Server error');
  }
});

// POST /rate-card — create a new rate
router.post('/', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    await prisma.rateCard.create({
      data: {
        category: req.body.category.trim().toUpperCase(),
        name: req.body.name.trim(),
        unit: req.body.unit.trim(),
        defaultRate: req.body.defaultRate.trim(),
        lastPurchaseRate: req.body.lastPurchaseRate?.trim() || null,
        notes: req.body.notes?.trim() || null,
      },
    });
    res.redirect('/rate-card?success=Rate+added');
  } catch (err) {
    console.error('Rate create error:', err);
    res.redirect('/rate-card?error=Failed+to+add+rate.+Duplicate+category/name?');
  }
});

// POST /rate-card/:id — update a rate
router.post('/:id', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    await prisma.rateCard.update({
      where: { id: parseInt(req.params.id) },
      data: {
        defaultRate: req.body.defaultRate.trim(),
        lastPurchaseRate: req.body.lastPurchaseRate?.trim() || null,
        notes: req.body.notes?.trim() || null,
      },
    });
    res.redirect('/rate-card?success=Rate+updated');
  } catch (err) {
    console.error('Rate update error:', err);
    res.redirect('/rate-card?error=Failed+to+update+rate');
  }
});

// POST /rate-card/:id/delete — delete a rate
router.post('/:id/delete', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    await prisma.rateCard.delete({ where: { id: parseInt(req.params.id) } });
    res.redirect('/rate-card?success=Rate+deleted');
  } catch (err) {
    console.error('Rate delete error:', err);
    res.redirect('/rate-card?error=Failed+to+delete+rate');
  }
});

module.exports = router;
```

- [ ] **Step 2: Create views/rate-card/index.ejs**

Rate card management page:
- **"Add Rate" form** at top: category (text/select), name (text), unit (select: per_sqm, per_piece, per_kg, per_tonne), defaultRate (number), lastPurchaseRate (number, optional), notes
- **Table per category** (grouped): Name | Unit | Default Rate | Last Purchase Rate | Notes | Actions (Edit/Delete)
- Each row has an inline edit form (or toggle) to update defaultRate and lastPurchaseRate
- Categories: SHEET, CUTTING, WELDING, PRINTING, SHEETING, SLITTING, REWINDING, FOAM, ESD, RIVET, COLOUR, PARTITION

- [ ] **Step 3: Commit**

```bash
cd C:/cpio_db/puneglobalgroup-website
git add outreach/src/routes/rateCard.js outreach/views/rate-card/
git commit -m "feat(outreach): add rate card route and view

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Quotes Route

**Files:**
- Create: `outreach/src/routes/quotes.js`

- [ ] **Step 1: Create src/routes/quotes.js**

Routes to implement:

**GET /quotes** — list quotes with filters (status, leadId). Include lead name, item count.

**GET /quotes/new?leadId=X** — new quote form. Load lead (with state for GST), lead's contacts, rate card. Pre-set gstType from `determineGstType('Maharashtra', lead.state)`.

**POST /quotes** — create quote:
1. Generate quoteNo via `getNextQuoteNo(prisma)`
2. Parse form arrays: `items[].productType`, `items[].length`, `items[].breadth`, etc. (same array-form pattern as invoicer's sales.js)
3. For each item: `computeItemCost(item, gstType)`
4. `computeQuoteTotals(computedItems)`
5. `prisma.quote.create({ data: { ...quoteLevelFields, items: { create: computedItems } } })`
6. Log Activity: type=QUOTE_CREATED
7. Redirect to `/quotes/:id`

**GET /quotes/:id** — detail view. Include items, lead, contact, rfqs.

**GET /quotes/:id/edit** — edit form (DRAFT only). Same form as new, pre-filled.

**POST /quotes/:id** — update (DRAFT only). Delete existing items, recompute, recreate.

**POST /quotes/:id/send** — mark SENT, log Activity, `changeStage(prisma, leadId, 'QUOTED', ...)` if lead is at QUALIFIED stage.

**POST /quotes/:id/accept** — mark ACCEPTED, log Activity, `changeStage(prisma, leadId, 'WON', ...)`.

**POST /quotes/:id/reject** — mark REJECTED with reason from `req.body.reason`, log Activity.

**GET /quotes/:id/pdf** — generate PDF via Puppeteer (same pattern as invoicer's pdf.js). Render `views/quotes/pdf.ejs` to HTML, convert to PDF buffer, send as `application/pdf`.

Key pattern for form arrays (from invoicer `sales.js`):
```javascript
const productTypes = [].concat(req.body['items.productType'] || []);
const lengths = [].concat(req.body['items.length'] || []);
const breadths = [].concat(req.body['items.breadth'] || []);
// ... loop through indices, build item objects
```

Import services:
```javascript
const { determineGstType } = require('../services/gst');
const { computeItemCost, computeQuoteTotals, BUSINESS_STATE } = require('../services/pricing');
const { getNextQuoteNo } = require('../services/quoteNo');
const { changeStage } = require('../services/pipeline');
```

- [ ] **Step 2: Commit**

```bash
cd C:/cpio_db/puneglobalgroup-website
git add outreach/src/routes/quotes.js
git commit -m "feat(outreach): add quotes routes with CRUD, pricing, stage transitions, PDF

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Quote Views

**Files:**
- Create: `outreach/views/quotes/index.ejs`
- Create: `outreach/views/quotes/form.ejs`
- Create: `outreach/views/quotes/detail.ejs`
- Create: `outreach/views/quotes/pdf.ejs`

- [ ] **Step 1: Create views/quotes/index.ejs**

Quote listing:
- Filter bar: status dropdown (DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED), lead search
- "+ New Quote" primary button
- Table: Quote # (link to detail) | Date | Lead (link) | Grand Total (₹, text-mono) | Status (badge) | Actions (View, PDF)
- Status badges: badge-draft (grey), badge-sent (blue), badge-accepted (green), badge-rejected (red), badge-expired (dark grey) — add these to style.css

- [ ] **Step 2: Create views/quotes/form.ejs**

The most complex form. Structure:

**Header fields:**
- Lead (dropdown, pre-selected from `leadId` or query param)
- Contact (dropdown, populated from lead's contacts — needs JS to update when lead changes, or just show all)
- Margin % (number input, default 20)
- Valid Until (date input)
- Terms (textarea, default: "Prices valid for 15 days. Delivery within 7-14 working days.")
- Notes (textarea)

**Line items section** — dynamic rows (add/remove):
Each row:
- Product Type (select: PP_BOX, PP_TRAY, PP_SEPARATOR, PP_LAYER_PAD, PP_BIN, PP_FLOORING, PAPER_SHEET, BOARD_SHEET)
- Product Name (text)
- Length (mm), Breadth (mm), Height (mm — hidden for flat products)
- Sheet Thickness (select: 2,3,4,5 — for PP) / Grade (text — for paper) / GSM (number — for paper)
- Closure Type (select — for PP boxes only)
- Qty (number)
- Sheet Rate/sq.m (number, pre-filled from rate card)
- Cutting Rate (number), Welding Rate (number), Printing Rate (number) — for PP
- Sheeting Rate (number), Slitting Rate (number), Rewinding Rate (number) — for Paper
- Extras Cost (number)
- Margin % (number, defaults to quote-level margin)
- GST Rate (number, default 18)
- Remarks (text)

All rate fields use `name="items.fieldName"` array pattern.

**"Add Item" button** adds a new row. Use a `<template>` tag with a row prototype and JS to clone it.

**"Remove" button** on each row removes it.

Form POSTs to `/quotes` (new) or `/quotes/:id` (edit).

- [ ] **Step 3: Create views/quotes/detail.ejs**

Quote detail page:
- **Header:** quoteNo, date, lead name (link), contact name, status badge, valid until
- **Action buttons** based on status:
  - DRAFT: Edit, Send, Delete
  - SENT: Accept, Reject, Download PDF
  - ACCEPTED/REJECTED: Download PDF
- **Send form** — just a POST button to `/quotes/:id/send`
- **Accept form** — POST to `/quotes/:id/accept`
- **Reject form** — text input for reason + POST to `/quotes/:id/reject`
- **Line items table:** Product | Dimensions | Qty | Sheet Area | Sheet Cost | Conversion | Extras | Unit Cost | Margin | Selling Price | GST | Line Total
- **Totals:** Subtotal, CGST, SGST (or IGST), Grand Total
- **Terms & Notes** section
- **Linked RFQs** section — table of RFQs generated from this quote, "Generate RFQ" button linking to `/rfqs/new?quoteId=:id`

- [ ] **Step 4: Create views/quotes/pdf.ejs**

Standalone HTML template (no layout) for Puppeteer PDF:
- PGG company header (name, address, GSTIN, phone, email)
- "QUOTATION" title
- Quote #, Date, Valid Until
- To: Lead company, address, GSTIN, contact person
- Line items table: S.No | Product | Dimensions | Qty | Rate | Taxable | CGST | SGST/IGST | Total
- Totals row
- Terms & Conditions
- Signature line
- Follow invoicer's `invoice-pdf.ejs` styling pattern (clean, print-optimized, A4)

- [ ] **Step 5: Add quote status badges to style.css**

Append to `outreach/public/style.css`:
```css
/* Quote status badges */
.badge-draft { background: #e5e7eb; color: #374151; }
.badge-sent { background: var(--info-soft); color: var(--info); border: 1px solid rgba(37,99,235,0.2); }
.badge-accepted { background: var(--success-soft); color: var(--success); border: 1px solid rgba(13,148,136,0.2); }
.badge-rejected { background: var(--error-soft); color: var(--error); border: 1px solid rgba(220,38,38,0.2); }
.badge-expired { background: #f3f4f6; color: #6b7280; border: 1px solid #d1d5db; }

/* Quote form — dynamic line items */
.line-items-table { width: 100%; border-collapse: collapse; }
.line-items-table th { font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); padding: 0.3rem; }
.line-items-table td { padding: 0.3rem; }
.line-items-table input, .line-items-table select { width: 100%; padding: 0.3rem; font-size: 0.85rem; border: 1px solid var(--border); border-radius: var(--radius-sm); }
.line-items-table input[type="number"] { width: 80px; }
.btn-remove { background: var(--error-soft); color: var(--error); border: 1px solid rgba(220,38,38,0.2); padding: 2px 8px; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.8rem; }
```

- [ ] **Step 6: Commit**

```bash
cd C:/cpio_db/puneglobalgroup-website
git add outreach/views/quotes/ outreach/public/style.css
git commit -m "feat(outreach): add quote views — list, form with dynamic items, detail, PDF

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Supplier RFQ Routes + Views

**Files:**
- Create: `outreach/src/routes/rfqs.js`
- Create: `outreach/views/rfqs/index.ejs`
- Create: `outreach/views/rfqs/form.ejs`
- Create: `outreach/views/rfqs/detail.ejs`

- [ ] **Step 1: Create src/routes/rfqs.js**

Routes:

**GET /rfqs** — list all RFQs. Include quote info (quoteNo, lead name).

**GET /rfqs/new?quoteId=X** — generate RFQ from quote:
1. Load quote with items
2. Call `generateBom(quote.items)` to get material list
3. Render form pre-filled with BOM items, supplier fields empty

**POST /rfqs** — create RFQ:
1. Generate rfqNo via `getNextRfqNo(prisma)`
2. Parse supplier info + items array
3. Create RFQ + nested items

**GET /rfqs/:id** — detail view with items, supplier info, status.

**POST /rfqs/:id/send** — mark SENT, set sentAt.

**POST /rfqs/:id/response** — update each RfqItem with `supplierQuotedRate` from form. Mark status RECEIVED.

Import: `{ getNextRfqNo } from '../services/quoteNo'`, `{ generateBom } from '../services/bom'`

- [ ] **Step 2: Create views/rfqs/index.ejs**

RFQ listing: RFQ # | Quote # (link) | Supplier | Status badge | Date | Actions (View)

- [ ] **Step 3: Create views/rfqs/form.ejs**

RFQ form:
- Quote reference (read-only, from quoteId)
- Supplier Name, Email, Phone
- Response Deadline (date)
- Notes
- **Materials table** (pre-filled from BOM): Material | Specification | Quantity | Unit | Estimated Rate | Notes
- All fields editable before sending
- Submit creates RFQ

- [ ] **Step 4: Create views/rfqs/detail.ejs**

RFQ detail:
- Header: rfqNo, supplier name, status badge, date, deadline
- Actions: Send (if DRAFT), Record Response (if SENT)
- Materials table: Material | Spec | Qty | Unit | Estimated Rate | Supplier Quoted Rate
- "Record Response" form — inline fields for supplierQuotedRate per item

- [ ] **Step 5: Commit**

```bash
cd C:/cpio_db/puneglobalgroup-website
git add outreach/src/routes/rfqs.js outreach/views/rfqs/
git commit -m "feat(outreach): add supplier RFQ routes and views with auto-BOM

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Integration — Server, Nav, Lead Detail Quotes Tab

**Files:**
- Modify: `outreach/server.js` — mount 3 new routers
- Modify: `outreach/views/layout.ejs` — add nav links
- Modify: `outreach/views/leads/detail.ejs` — add Quotes tab

- [ ] **Step 1: Mount new routers in server.js**

After existing router mounts (line ~49), add:
```javascript
const quotesRouter = require('./src/routes/quotes');
const rfqsRouter = require('./src/routes/rfqs');
const rateCardRouter = require('./src/routes/rateCard');
app.use('/quotes', quotesRouter);
app.use('/rfqs', rfqsRouter);
app.use('/rate-card', rateCardRouter);
```

- [ ] **Step 2: Update nav in layout.ejs**

Add Quotes and RFQs links. The nav should now be:
```
Dashboard | Leads, Contacts | Quotes, RFQs | Rate Card | Scrape Log, Analytics
```

- [ ] **Step 3: Add Quotes tab to lead detail**

In `views/leads/detail.ejs`:
1. Add "Quotes" tab link between Contacts and Activity
2. Add Quotes tab content section:
   - "Create Quote" button linking to `/quotes/new?leadId=:id`
   - Table of quotes for this lead: Quote # | Date | Grand Total | Status badge | Actions (View)
3. The lead detail route (`GET /leads/:id`) needs to include quotes in the Prisma query. Modify `src/routes/leads.js` to add `quotes: { orderBy: { createdAt: 'desc' } }` to the include.

- [ ] **Step 4: Verify everything works**

```bash
cd C:/cpio_db/puneglobalgroup-website/outreach && npm run dev
```

1. Visit `/rate-card` — add some test rates
2. Visit `/quotes/new?leadId=1` — form renders
3. Create a quote — pricing auto-calculates
4. Visit `/quotes` — listing shows
5. View detail, try Send, PDF download
6. Generate RFQ from quote
7. Lead detail → Quotes tab shows the quote

- [ ] **Step 5: Commit**

```bash
cd C:/cpio_db/puneglobalgroup-website
git add outreach/server.js outreach/views/layout.ejs outreach/views/leads/detail.ejs outreach/src/routes/leads.js
git commit -m "feat(outreach): integrate quotes, RFQs, rate card — nav, routing, lead detail tab

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Summary

| Task | What | Key Files |
|------|------|-----------|
| 1 | Install decimal.js + puppeteer | package.json |
| 2 | Prisma schema (5 new models) | schema.prisma |
| 3 | Services (GST, pricing, quoteNo, BOM) | 4 service files |
| 4 | Rate Card route + view | rateCard.js, index.ejs |
| 5 | Quotes route (CRUD, pricing, PDF, status) | quotes.js |
| 6 | Quote views (list, form, detail, PDF) | 4 EJS templates + CSS |
| 7 | Supplier RFQ routes + views | rfqs.js, 3 EJS templates |
| 8 | Integration (server, nav, lead detail) | server.js, layout.ejs, detail.ejs |

**Total: 8 tasks, ~20 files, 8 commits.**
