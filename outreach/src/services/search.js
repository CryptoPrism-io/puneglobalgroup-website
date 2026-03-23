function buildFilterQuery(query) {
  const where = { isArchived: false };
  if (query.stage) where.stage = query.stage;
  if (query.icpType) where.icpType = query.icpType;
  if (query.source) where.source = query.source;
  if (query.industry) where.industry = query.industry;
  if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
  if (query.state) where.state = { contains: query.state, mode: 'insensitive' };
  if (query.scrapeBatchId) where.scrapeBatchId = parseInt(query.scrapeBatchId);
  if (query.fitScoreMin || query.fitScoreMax) {
    where.fitScore = {};
    if (query.fitScoreMin) where.fitScore.gte = parseInt(query.fitScoreMin);
    if (query.fitScoreMax) where.fitScore.lte = parseInt(query.fitScoreMax);
  }
  if (query.search) {
    where.OR = [
      { companyName: { contains: query.search, mode: 'insensitive' } },
      { notes: { contains: query.search, mode: 'insensitive' } },
      { painPoints: { contains: query.search, mode: 'insensitive' } },
      { opportunities: { contains: query.search, mode: 'insensitive' } },
      { city: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.archived === 'true') where.isArchived = true;
  return where;
}

module.exports = { buildFilterQuery };
