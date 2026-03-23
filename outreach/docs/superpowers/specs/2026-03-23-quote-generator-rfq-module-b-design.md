# Outreach CRM — Module B: Quote Generator + Supplier RFQ

**Date:** 2026-03-23
**Status:** Approved
**Module:** B of 3 (A: Lead DB [done] → B: Quote Generator + RFQ → C: Outreach Engine)

---

## Overview

A size-based pricing engine and quotation system for Pune Global Group's two verticals (PP Corrugated manufacturing, Paper & Board trading). Quotes are linked to CRM leads, auto-calculate pricing from dimensions and rate cards, generate professional PDFs, and can spawn supplier RFQs with auto-generated BOMs.

## Pricing Model

Both verticals use **size-based calculation** with manual margin per quote:

### PP Corrugated Products
1. **Sheet area** = calculated from unfolded blank size (L, B, H + flap allowances)
2. **Sheet cost** = area × rate per sq.m (varies by thickness: 2mm, 3mm, 4mm, 5mm)
3. **Conversion cost** = cutting + welding/riveting + printing (per-piece rates by closure type)
4. **Extras** = foam lamination, ESD coating, colour, partitions (per-piece add-ons)
5. **Unit cost** = sheet cost + conversion cost + extras
6. **Selling price** = unit cost × (1 + margin%)
7. **GST** = selling price × GST rate (typically 18%)
8. **Line total** = (selling price + GST) × quantity

### Paper & Board Products
1. **Sheet area** = custom cut size (L × B) from reel/jumbo roll
2. **Sheet cost** = area × rate per sq.m (varies by grade and GSM)
3. **Conversion cost** = sheeting/slitting/rewinding rate
4. **Unit cost** = sheet cost + conversion cost
5. **Selling price** = unit cost × (1 + margin%)
6. **GST** = selling price × GST rate
7. **Line total** = (selling price + GST) × quantity

### Rate Defaults
Default rates are pulled from a **RateCard** table (which can be seeded from actual purchase prices in the invoicer). Every rate is **overridable per quote item** before finalizing.

## Tech Stack

Same as Module A (outreach app):

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Framework | Express 5 |
| Templating | EJS (server-rendered) |
| ORM | Prisma 7.x with `@prisma/adapter-pg` |
| Database | PostgreSQL (shared `outreach` database) |
| Math | Decimal.js (never native floats for money) |
| PDF | Puppeteer (same as invoicer) |

## Data Model

### Quote

```prisma
model Quote {
  id            Int       @id @default(autoincrement())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  quoteNo       String    @unique   // QT-2526-001 (FY-based, same pattern as invoicer)
  leadId        Int
  lead          Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)
  contactId     Int?
  contact       Contact?  @relation(fields: [contactId], references: [id], onDelete: SetNull)

  // GST
  gstType       String    // CGST_SGST | IGST
  marginPercent String    // Decimal string, default margin for all items

  // Stored totals (Decimal strings — computed on save, never on-the-fly)
  subtotal      String
  totalCgst     String
  totalSgst     String
  totalIgst     String
  totalGst      String
  grandTotal    String

  // Status & metadata
  status        String    @default("DRAFT")  // DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED
  validUntil    DateTime?
  notes         String?
  terms         String?   // payment terms, delivery, validity

  // Relations
  items         QuoteItem[]
  rfqs          SupplierRfq[]
}
```

### QuoteItem

```prisma
model QuoteItem {
  id              Int     @id @default(autoincrement())
  quoteId         Int
  quote           Quote   @relation(fields: [quoteId], references: [id], onDelete: Cascade)

  // Product info
  productType     String  // PP_BOX, PP_TRAY, PP_SEPARATOR, PP_LAYER_PAD, PP_BIN, PP_FLOORING, PAPER_SHEET, BOARD_SHEET
  productName     String  // "PP Box — Riveted, 600x400x400mm"
  description     String?

  // Dimensions (mm)
  length          Int?
  breadth         Int?
  height          Int?    // null for flat products (sheets, pads)

  // Material specs
  sheetThickness  String? // "2", "3", "4", "5" (mm) for PP; null for paper
  gsm             Int?    // grams per sq.m — for paper/board
  grade           String? // paper grade: "Cyber XLPac", "Eco Natura", etc.
  flute           String? // flute type if applicable
  closureType     String? // riveted, ultrasonic, velcro, collapsible, detachable-lid, top-flap
  extras          Json?   // {foam: true, esd: false, printing: true, partitions: 2, colour: "blue"}

  // Quantity
  qty             String  // Decimal string

  // Pricing breakdown (all Decimal strings)
  sheetArea       String  // sq.m — auto-calculated from dimensions
  sheetRatePerSqm String  // default from rate card, overridable
  sheetCost       String  // sheetArea × sheetRatePerSqm

  cuttingRate     String  // per piece
  weldingRate     String  // per piece (0 if no welding)
  printingRate    String  // per piece (0 if no printing)
  conversionCost  String  // cuttingRate + weldingRate + printingRate

  extrasCost      String  // sum of all extras
  unitCost        String  // sheetCost + conversionCost + extrasCost
  marginPercent   String  // inherited from quote or overridden
  sellingPrice    String  // unitCost × (1 + marginPercent/100)

  // GST breakdown
  gstRate         String  // typically "18"
  taxableAmt      String  // sellingPrice × qty
  cgst            String
  sgst            String
  igst            String
  lineTotal       String  // taxableAmt + cgst + sgst + igst

  remarks         String?
}
```

### SupplierRfq

```prisma
model SupplierRfq {
  id                Int       @id @default(autoincrement())
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  rfqNo             String    @unique  // RFQ-2526-001
  quoteId           Int
  quote             Quote     @relation(fields: [quoteId], references: [id], onDelete: Cascade)

  supplierName      String
  supplierEmail     String?
  supplierPhone     String?

  status            String    @default("DRAFT")  // DRAFT, SENT, RECEIVED, ACCEPTED
  sentAt            DateTime?
  responseDeadline  DateTime?
  notes             String?

  items             RfqItem[]
}
```

### RfqItem

```prisma
model RfqItem {
  id                Int         @id @default(autoincrement())
  rfqId             Int
  rfq               SupplierRfq @relation(fields: [rfqId], references: [id], onDelete: Cascade)

  materialName      String      // "3mm PP Corrugated Sheet"
  specification     String?     // thickness, GSM, colour, grade details
  quantity          String      // Decimal string
  unit              String      // sqm, kg, pcs, tonnes
  estimatedRate     String?     // from last purchase / rate card
  supplierQuotedRate String?    // filled when response received
  notes             String?
}
```

### RateCard

```prisma
model RateCard {
  id              Int       @id @default(autoincrement())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  category        String    // SHEET, CUTTING, WELDING, PRINTING, FOAM, ESD, RIVET, COLOUR, PARTITION
  name            String    // "3mm PP Sheet", "Ultrasonic Welding", "Cyber XLPac 300GSM"
  unit            String    // per_sqm, per_piece, per_kg, per_tonne
  defaultRate     String    // Decimal string — current standard rate
  lastPurchaseRate String?  // auto-updated from purchases or manual entry
  notes           String?

  @@unique([category, name])
}
```

### Lead & Contact Relation Updates

Add to existing Lead model:
```prisma
quotes Quote[]
```

Add to existing Contact model:
```prisma
quotes Quote[]
```

## Services

### pricing.js — Core Pricing Engine

```
calculateSheetArea(productType, length, breadth, height, closureType)
  → Decimal (sq.m)

  PP_BOX:
    flapAllowance = 30mm per side (configurable)
    blankL = length + (2 × height) + (2 × flapAllowance)
    blankB = breadth + (2 × height) + (2 × flapAllowance)
    area = (blankL × blankB) / 1_000_000

  PP_TRAY:
    blankL = length + (2 × height) + (2 × flapAllowance)
    blankB = breadth + (2 × height) + (2 × flapAllowance)
    area = (blankL × blankB) / 1_000_000

  PP_SEPARATOR / PP_LAYER_PAD / PP_FLOORING:
    area = (length × breadth) / 1_000_000

  PP_BIN:
    Same as PP_BOX formula

  PAPER_SHEET / BOARD_SHEET:
    area = (length × breadth) / 1_000_000

computeItemCost(item, rateCard)
  → { sheetArea, sheetCost, conversionCost, extrasCost, unitCost, sellingPrice, taxableAmt, cgst, sgst, igst, lineTotal }

  Uses Decimal.js throughout. Pulls defaults from rateCard, uses item overrides if present.

computeQuoteTotals(items[])
  → { subtotal, totalCgst, totalSgst, totalIgst, totalGst, grandTotal }
```

### gst.js — GST Calculation (duplicated from invoicer)

```
determineGstType(businessState, leadState)
  → "CGST_SGST" | "IGST"

computeGstBreakdown(taxableAmt, gstRate, gstType)
  → { cgst, sgst, igst }
```

Uses Decimal.js with precision 20 and HALF_UP rounding. Identical logic to invoicer's gst.js.

### quoteNo.js — Quote Number Generation

```
getNextQuoteNo(prisma)
  → "QT-2526-001" (FY-based, April-March, atomic)

getNextRfqNo(prisma)
  → "RFQ-2526-001" (same pattern)
```

Same financial year logic as invoicer's invoiceNo.js.

### bom.js — Bill of Materials Generator

```
generateBom(quoteItems[])
  → RfqItem[]

  For each quote item, break down into raw materials:
  - PP box → X sq.m PP sheet (by thickness) + Y rivets/welding + printing area
  - Paper sheet → X sq.m grade at GSM
  - Aggregate duplicate materials across items
```

## Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/quotes` | List quotes — filter by lead, status, date range |
| GET | `/quotes/new?leadId=X` | New quote form (pre-linked to lead) |
| POST | `/quotes` | Create quote — compute all pricing, generate quoteNo |
| GET | `/quotes/:id` | Quote detail — line items, totals, status controls |
| GET | `/quotes/:id/edit` | Edit quote (DRAFT only) |
| POST | `/quotes/:id` | Update quote |
| POST | `/quotes/:id/send` | Mark SENT, log Activity |
| POST | `/quotes/:id/accept` | Mark ACCEPTED, transition lead stage, log Activity |
| POST | `/quotes/:id/reject` | Mark REJECTED with reason, log Activity |
| GET | `/quotes/:id/pdf` | Generate/download PDF via Puppeteer |
| GET | `/rfqs` | List all supplier RFQs |
| GET | `/rfqs/new?quoteId=X` | Generate RFQ from quote (auto-BOM) |
| POST | `/rfqs` | Create RFQ |
| GET | `/rfqs/:id` | RFQ detail |
| POST | `/rfqs/:id/send` | Mark SENT |
| POST | `/rfqs/:id/response` | Record supplier's quoted rates |
| GET | `/rate-card` | View all rates |
| POST | `/rate-card` | Create a rate |
| POST | `/rate-card/:id` | Update a rate |

## UI

### Quote Form (most complex view)

Dynamic line-item form (add/remove rows). Each row:

**Product type dropdown** → conditionally shows relevant fields:
- PP products: dimensions (L×B×H), thickness, closure type, extras checkboxes
- Paper/Board: dimensions (L×B), grade dropdown, GSM

**Auto-calculated fields** (update on input change via inline JS):
- Sheet area (from dimensions)
- Sheet cost (area × rate)
- Conversion cost (sum of applicable rates)
- Unit cost, selling price, line total

**Rate fields** pre-filled from RateCard, all editable.

**Quote-level fields:**
- Lead (pre-selected if from lead detail)
- Contact (dropdown of lead's contacts)
- Margin % (applies to all items, overridable per item)
- Valid until date
- Terms textarea
- Notes textarea

### Quote Detail

Header: quoteNo, lead name, status badge, date, valid until
Action buttons: Send (if DRAFT), Accept/Reject (if SENT), Edit (if DRAFT), Download PDF
Line items table with full breakdown
Totals section: subtotal, CGST, SGST, IGST, grand total

### Quote PDF

Professional quotation document generated via Puppeteer:
- Company header (Pune Global Group branding)
- Quote number, date, validity
- To: Lead company name, address, GSTIN
- Line items table: product, dimensions, qty, rate, GST, total
- Totals with GST breakdown
- Terms & conditions
- Same pattern as invoicer's invoice-pdf.ejs

### Rate Card Page

Simple CRUD table:
- Category | Name | Unit | Default Rate | Last Purchase Rate | Actions (Edit)
- Inline edit or modal
- "Add Rate" button

### Lead Detail — Quotes Tab

Add a 5th tab to the existing lead detail page showing:
- Table of quotes for this lead (quoteNo, date, grand total, status badge)
- "Create Quote" button

### Nav Bar Update

Add "Quotes" and "RFQs" links between Contacts and Scrape Log.

## Integration with Module A

- Quote.leadId → Lead (required FK)
- Quote creation → Activity logged (type: QUOTE_SENT or similar)
- Quote ACCEPTED → `changeStage(prisma, leadId, 'QUOTED', 'Quote QT-xxxx accepted')` via pipeline service
- Quote REJECTED → Activity logged with rejection reason
- Lead detail page gets Quotes tab

## Dependencies

- **Decimal.js** — already installed (from invoicer pattern). Add to outreach package.json.
- **Puppeteer** — add to outreach package.json for PDF generation.

## Deferred to Module C

- Email/WhatsApp sending of quote PDFs
- Automated follow-up on sent quotes
- Quote expiry notifications

## File Structure (new files)

```
outreach/
├── src/
│   ├── routes/
│   │   ├── quotes.js        (NEW)
│   │   ├── rfqs.js           (NEW)
│   │   └── rateCard.js       (NEW)
│   └── services/
│       ├── pricing.js        (NEW)
│       ├── gst.js            (NEW — duplicated from invoicer)
│       ├── quoteNo.js        (NEW)
│       └── bom.js            (NEW)
├── views/
│   ├── quotes/
│   │   ├── index.ejs         (NEW)
│   │   ├── form.ejs          (NEW)
│   │   ├── detail.ejs        (NEW)
│   │   └── pdf.ejs           (NEW)
│   ├── rfqs/
│   │   ├── index.ejs         (NEW)
│   │   ├── form.ejs          (NEW)
│   │   └── detail.ejs        (NEW)
│   └── rate-card/
│       └── index.ejs         (NEW)
├── prisma/
│   └── schema.prisma         (MODIFY — add Quote, QuoteItem, SupplierRfq, RfqItem, RateCard)
└── server.js                 (MODIFY — mount 3 new routers, add nav links)
```

## Non-Functional Requirements

- All money calculations via Decimal.js (precision 20, HALF_UP rounding)
- All amounts stored as Decimal strings, never floats
- Same single-user power interface
- Same CSS design system (navy/cream/saffron)
- Quote numbers and RFQ numbers are FY-based, atomic
