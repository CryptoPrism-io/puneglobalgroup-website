/**
 * GST Calculation Service
 *
 * Shared by both Sales and Purchases.
 * All money math uses Decimal.js — NEVER native JS floats.
 */

const Decimal = require('decimal.js');

// Configure Decimal.js for financial precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Determine GST type based on business state vs counterparty state.
 * Same state → CGST + SGST (intra-state)
 * Different state → IGST (inter-state)
 *
 * @param {string} businessState - Business's registered state
 * @param {string} counterpartyState - Customer's or Supplier's state
 * @returns {"CGST_SGST" | "IGST"}
 */
function determineGstType(businessState, counterpartyState) {
  const biz = (businessState || '').trim().toLowerCase();
  const cp = (counterpartyState || '').trim().toLowerCase();
  return biz === cp ? 'CGST_SGST' : 'IGST';
}

/**
 * Compute a single line item's GST breakdown.
 *
 * @param {string|number|Decimal} qty - Quantity
 * @param {string|number|Decimal} unitPrice - Price per unit
 * @param {string|number|Decimal} gstRate - GST rate (e.g. 18 for 18%)
 * @param {"CGST_SGST"|"IGST"} gstType - Intra or inter-state
 * @returns {Object} All fields needed for SaleItem / PurchaseItem
 */
function computeLineItem(qty, unitPrice, gstRate, gstType) {
  const q = new Decimal(qty);
  const price = new Decimal(unitPrice);
  const rate = new Decimal(gstRate);

  // Taxable amount = qty × unitPrice
  const taxableAmt = q.times(price).toDecimalPlaces(2);

  // GST amount = taxableAmt × (rate / 100)
  const gstAmount = taxableAmt.times(rate).dividedBy(100).toDecimalPlaces(2);

  let cgst, sgst, igst;

  if (gstType === 'CGST_SGST') {
    // Split equally: CGST = SGST = gstAmount / 2
    cgst = gstAmount.dividedBy(2).toDecimalPlaces(2);
    sgst = gstAmount.minus(cgst).toDecimalPlaces(2); // remainder handles odd paise
    igst = new Decimal(0);
  } else {
    // Full amount goes to IGST
    cgst = new Decimal(0);
    sgst = new Decimal(0);
    igst = gstAmount;
  }

  // Line total = taxable + all taxes
  const lineTotal = taxableAmt.plus(cgst).plus(sgst).plus(igst).toDecimalPlaces(2);

  return {
    qty: q.toDecimalPlaces(2).toString(),
    unitPrice: price.toDecimalPlaces(2).toString(),
    gstRate: rate.toDecimalPlaces(2).toString(),
    taxableAmt: taxableAmt.toString(),
    cgst: cgst.toString(),
    sgst: sgst.toString(),
    igst: igst.toString(),
    lineTotal: lineTotal.toString(),
  };
}

/**
 * Compute sale/purchase totals from an array of computed line items.
 *
 * @param {Array<Object>} items - Array of objects with taxableAmt, cgst, sgst, igst, lineTotal
 * @returns {Object} { subtotal, totalCgst, totalSgst, totalIgst, totalGst, grandTotal }
 */
function computeTotals(items) {
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

module.exports = { determineGstType, computeLineItem, computeTotals };

// ── Inline test — run with: node src/services/gst.js ─────────
if (require.main === module) {
  console.log('=== GST Service Tests ===\n');

  // Test 1: Intra-state (CGST + SGST) — 18% on ₹1,000 × 10
  console.log('Test 1: Intra-state 18% GST on 10 × ₹1,000');
  const item1 = computeLineItem(10, 1000, 18, 'CGST_SGST');
  console.log('  taxableAmt:', item1.taxableAmt, '(expect 10000)');
  console.log('  cgst:      ', item1.cgst, '(expect 900)');
  console.log('  sgst:      ', item1.sgst, '(expect 900)');
  console.log('  igst:      ', item1.igst, '(expect 0)');
  console.log('  lineTotal: ', item1.lineTotal, '(expect 11800)');
  const t1ok = item1.taxableAmt === '10000' && item1.cgst === '900' && item1.sgst === '900'
    && item1.igst === '0' && item1.lineTotal === '11800';
  console.log('  Result:', t1ok ? 'PASS ✓' : 'FAIL ✗');

  // Test 2: Inter-state (IGST) — 18% on ₹1,000 × 10
  console.log('\nTest 2: Inter-state 18% GST on 10 × ₹1,000');
  const item2 = computeLineItem(10, 1000, 18, 'IGST');
  console.log('  taxableAmt:', item2.taxableAmt, '(expect 10000)');
  console.log('  cgst:      ', item2.cgst, '(expect 0)');
  console.log('  sgst:      ', item2.sgst, '(expect 0)');
  console.log('  igst:      ', item2.igst, '(expect 1800)');
  console.log('  lineTotal: ', item2.lineTotal, '(expect 11800)');
  const t2ok = item2.taxableAmt === '10000' && item2.cgst === '0' && item2.sgst === '0'
    && item2.igst === '1800' && item2.lineTotal === '11800';
  console.log('  Result:', t2ok ? 'PASS ✓' : 'FAIL ✗');

  // Test 3: 5% GST — odd paise split (₹123.45 × 3)
  console.log('\nTest 3: Intra-state 5% GST on 3 × ₹123.45 (odd paise)');
  const item3 = computeLineItem(3, 123.45, 5, 'CGST_SGST');
  console.log('  taxableAmt:', item3.taxableAmt, '(expect 370.35)');
  // 5% of 370.35 = 18.5175 → rounded to 18.52
  // CGST = 18.52 / 2 = 9.26, SGST = 18.52 - 9.26 = 9.26
  console.log('  cgst:      ', item3.cgst, '(expect 9.26)');
  console.log('  sgst:      ', item3.sgst, '(expect 9.26)');
  console.log('  lineTotal: ', item3.lineTotal, '(expect 388.87)');
  const t3ok = item3.taxableAmt === '370.35' && item3.cgst === '9.26' && item3.sgst === '9.26'
    && item3.lineTotal === '388.87';
  console.log('  Result:', t3ok ? 'PASS ✓' : 'FAIL ✗');

  // Test 4: Zero GST
  console.log('\nTest 4: Zero GST on 5 × ₹200');
  const item4 = computeLineItem(5, 200, 0, 'CGST_SGST');
  console.log('  taxableAmt:', item4.taxableAmt, '(expect 1000)');
  console.log('  cgst:      ', item4.cgst, '(expect 0)');
  console.log('  lineTotal: ', item4.lineTotal, '(expect 1000)');
  const t4ok = item4.taxableAmt === '1000' && item4.cgst === '0' && item4.lineTotal === '1000';
  console.log('  Result:', t4ok ? 'PASS ✓' : 'FAIL ✗');

  // Test 5: computeTotals with multiple items
  console.log('\nTest 5: computeTotals — 2 items');
  const totals = computeTotals([item1, item3]);
  console.log('  subtotal:  ', totals.subtotal, '(expect 10370.35)');
  console.log('  totalCgst: ', totals.totalCgst, '(expect 909.26)');
  console.log('  totalSgst: ', totals.totalSgst, '(expect 909.26)');
  console.log('  totalGst:  ', totals.totalGst, '(expect 1818.52)');
  console.log('  grandTotal:', totals.grandTotal, '(expect 12188.87)');
  const t5ok = totals.subtotal === '10370.35' && totals.totalCgst === '909.26'
    && totals.totalSgst === '909.26' && totals.totalGst === '1818.52'
    && totals.grandTotal === '12188.87';
  console.log('  Result:', t5ok ? 'PASS ✓' : 'FAIL ✗');

  // Test 6: determineGstType
  console.log('\nTest 6: determineGstType');
  const t6a = determineGstType('Maharashtra', 'Maharashtra') === 'CGST_SGST';
  const t6b = determineGstType('Maharashtra', 'Gujarat') === 'IGST';
  const t6c = determineGstType('maharashtra', 'MAHARASHTRA') === 'CGST_SGST'; // case insensitive
  const t6d = determineGstType(' Maharashtra ', 'Maharashtra') === 'CGST_SGST'; // trim
  console.log('  Same state:      ', t6a ? 'PASS ✓' : 'FAIL ✗');
  console.log('  Different state:  ', t6b ? 'PASS ✓' : 'FAIL ✗');
  console.log('  Case insensitive: ', t6c ? 'PASS ✓' : 'FAIL ✗');
  console.log('  Whitespace trim:  ', t6d ? 'PASS ✓' : 'FAIL ✗');

  // Summary
  const allPass = t1ok && t2ok && t3ok && t4ok && t5ok && t6a && t6b && t6c && t6d;
  console.log('\n' + (allPass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'));
}
