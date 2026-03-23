const PUNE_CITIES = [
  'pune', 'pimpri', 'chinchwad', 'pimpri-chinchwad', 'pcmc',
  'hinjewadi', 'wakad', 'baner', 'kothrud', 'hadapsar',
  'chakan', 'talegaon', 'lonavala', 'ranjangaon', 'sanaswadi',
  'shirwal', 'satara', 'solapur', 'kolhapur', 'sangli',
  'nashik', 'ahmednagar', 'aurangabad',
];
const PAPER_INDUSTRIES = ['corrugator', 'printing', 'packaging', 'box-maker', 'converter'];
const PP_INDUSTRIES = ['automotive', 'pharma', 'electronics', 'fmcg', 'engineering'];
const REVENUE_SCORES = {
  '<1Cr': 1, '1-5Cr': 3, '5-10Cr': 5, '10-50Cr': 4, '50-100Cr': 3, '100Cr+': 2,
};

function computeFitScore(lead) {
  const icp = (lead.icpType || 'UNKNOWN').toUpperCase();
  if (icp === 'UNKNOWN') return null;
  let score = 0;
  const city = (lead.city || '').toLowerCase().trim();
  const industry = (lead.industry || '').toLowerCase().trim();
  const emp = lead.employeeCount || 0;
  const rev = lead.estimatedRevenue || '';

  if (icp === 'PAPER' || icp === 'BOTH') {
    if (PUNE_CITIES.includes(city)) score += 3;
    if (PAPER_INDUSTRIES.includes(industry)) score += 3;
    if (emp >= 5 && emp <= 50) score += 2;
    else if (emp > 0 && emp < 5) score += 1;
    if (rev && REVENUE_SCORES[rev]) {
      const rs = REVENUE_SCORES[rev];
      score += rs <= 5 ? Math.min(rs, 2) : 1;
    }
  }
  if (icp === 'PP' || icp === 'BOTH') {
    if (PP_INDUSTRIES.includes(industry)) score += 4;
    if (emp >= 50 && emp <= 500) score += 3;
    else if (emp > 500) score += 1;
    else if (emp >= 20) score += 1;
    if (rev === '10-50Cr' || rev === '50-100Cr') score += 3;
    else if (rev === '5-10Cr' || rev === '100Cr+') score += 2;
    else if (rev) score += 1;
  }
  return Math.max(1, Math.min(10, score));
}

module.exports = { computeFitScore, PUNE_CITIES, PAPER_INDUSTRIES, PP_INDUSTRIES };
