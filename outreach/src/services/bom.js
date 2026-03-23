const Decimal = require('decimal.js');
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

function generateBom(quoteItems) {
  const materials = {};
  for (const item of quoteItems) {
    const qty = new Decimal(item.qty || 1);
    const area = new Decimal(item.sheetArea || 0);
    const totalArea = area.times(qty).toDecimalPlaces(4);

    let matKey, matName, matSpec, matUnit;
    if (item.productType && item.productType.startsWith('PP_')) {
      matKey = `PP_SHEET_${item.sheetThickness || '3'}mm`;
      matName = `${item.sheetThickness || 3}mm PP Corrugated Sheet`;
      matSpec = `Thickness: ${item.sheetThickness || 3}mm`;
      matUnit = 'sqm';
    } else {
      matKey = `PAPER_${item.grade || 'generic'}_${item.gsm || 0}GSM`;
      matName = `${item.grade || 'Paper'} ${item.gsm || ''}GSM`;
      matSpec = `Grade: ${item.grade || 'N/A'}, GSM: ${item.gsm || 'N/A'}`;
      matUnit = 'sqm';
    }

    if (materials[matKey]) {
      materials[matKey].quantity = new Decimal(materials[matKey].quantity)
        .plus(totalArea).toDecimalPlaces(4).toString();
    } else {
      materials[matKey] = {
        materialName: matName,
        specification: matSpec,
        quantity: totalArea.toString(),
        unit: matUnit,
        estimatedRate: item.sheetRatePerSqm || null,
      };
    }

    if (item.closureType === 'riveted' && item.productType && item.productType.startsWith('PP_')) {
      const rivetKey = 'RIVETS';
      const rivetQty = qty.times(8);
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
