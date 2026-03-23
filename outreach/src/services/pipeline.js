const STAGES = ['NEW', 'RESEARCHED', 'CONTACTED', 'QUALIFIED', 'QUOTED', 'WON', 'LOST', 'DORMANT'];
const FORWARD_ORDER = ['NEW', 'RESEARCHED', 'CONTACTED', 'QUALIFIED', 'QUOTED'];

function isValidTransition(from, to) {
  if (from === to) return false;
  if (to === 'DORMANT') return true;
  if (from === 'DORMANT' && STAGES.includes(to)) return true;
  if ((to === 'WON' || to === 'LOST') && from === 'QUOTED') return true;
  const fromIdx = FORWARD_ORDER.indexOf(from);
  const toIdx = FORWARD_ORDER.indexOf(to);
  if (fromIdx >= 0 && toIdx >= 0 && toIdx === fromIdx + 1) return true;
  return false;
}

async function changeStage(prisma, leadId, newStage, notes) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error('Lead not found');
  if (!isValidTransition(lead.stage, newStage)) {
    throw new Error(`Cannot move from ${lead.stage} to ${newStage}`);
  }
  const updatedLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      stage: newStage,
      stageChangedAt: new Date(),
      lostReason: newStage === 'LOST' ? (notes || null) : lead.lostReason,
    },
  });
  await prisma.activity.create({
    data: {
      leadId,
      type: 'STAGE_CHANGE',
      subject: `Stage: ${lead.stage} → ${newStage}`,
      body: notes || null,
    },
  });
  return updatedLead;
}

async function getStaleLeads(prisma, daysSinceStageChange = 14) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysSinceStageChange);
  return prisma.lead.findMany({
    where: {
      stageChangedAt: { lt: cutoff },
      stage: { notIn: ['WON', 'LOST', 'DORMANT'] },
      isArchived: false,
    },
    orderBy: { stageChangedAt: 'asc' },
  });
}

module.exports = { STAGES, FORWARD_ORDER, isValidTransition, changeStage, getStaleLeads };
