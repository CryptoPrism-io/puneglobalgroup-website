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
