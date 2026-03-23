const Decimal = require('decimal.js');
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

const BUSINESS_STATE = 'Maharashtra';
const FLAP_ALLOWANCE = 30;

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
    case 'PP_TRAY':
      blankL = L.plus(H.times(2)).plus(flap.times(2));
      blankB = B.plus(H.times(2)).plus(flap.times(2));
      return blankL.times(blankB).dividedBy(million).toDecimalPlaces(4).toString();
    case 'PP_SEPARATOR':
    case 'PP_LAYER_PAD':
    case 'PP_FLOORING':
    case 'PAPER_SHEET':
    case 'BOARD_SHEET':
    default:
      return L.times(B).dividedBy(million).toDecimalPlaces(4).toString();
  }
}

function computeItemCost(item, gstType) {
  const sheetArea = new Decimal(item.sheetArea || calculateSheetArea(
    item.productType, item.length, item.breadth, item.height
  ));
  const sheetRatePerSqm = new Decimal(item.sheetRatePerSqm || 0);
  const qty = new Decimal(item.qty || 1);
  const marginPct = new Decimal(item.marginPercent || 0);
  const gstRate = new Decimal(item.gstRate || 18);

  const sheetCost = sheetArea.times(sheetRatePerSqm).toDecimalPlaces(2);

  const cutting = new Decimal(item.cuttingRate || 0);
  const welding = new Decimal(item.weldingRate || 0);
  const printing = new Decimal(item.printingRate || 0);
  const sheeting = new Decimal(item.sheetingRate || 0);
  const slitting = new Decimal(item.slittingRate || 0);
  const rewinding = new Decimal(item.rewindingRate || 0);
  const conversionCost = cutting.plus(welding).plus(printing)
    .plus(sheeting).plus(slitting).plus(rewinding).toDecimalPlaces(2);

  const extrasCost = new Decimal(item.extrasCost || 0).toDecimalPlaces(2);
  const unitCost = sheetCost.plus(conversionCost).plus(extrasCost).toDecimalPlaces(2);
  const sellingPrice = unitCost.times(
    new Decimal(1).plus(marginPct.dividedBy(100))
  ).toDecimalPlaces(2);
  const taxableAmt = sellingPrice.times(qty).toDecimalPlaces(2);

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

async function getDefaultRates(prisma) {
  const rates = await prisma.rateCard.findMany();
  const rateMap = {};
  for (const r of rates) {
    rateMap[`${r.category}:${r.name}`] = r.defaultRate;
  }
  return rateMap;
}

module.exports = { BUSINESS_STATE, FLAP_ALLOWANCE, calculateSheetArea, computeItemCost, computeQuoteTotals, getDefaultRates };
