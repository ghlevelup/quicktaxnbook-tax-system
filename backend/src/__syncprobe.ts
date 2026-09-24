import prisma from '@/client';
import { syncFirmOpportunities } from '@/modules/ghl/ghl.opportunity-sync';
(async () => {
  const firm = await prisma.firm.findFirstOrThrow({ where: { ghlLocationId: { not: null } }, select: { id: true, name: true } });
  console.log('firm:', firm.name, firm.id);
  const r = await syncFirmOpportunities(firm.id, { force: true });
  console.log('SYNC RESULT:', JSON.stringify(r));
  const pipes = await prisma.ghlPipeline.findMany({ select: { name: true, _count: { select: { stages: true, opportunities: true } } }, orderBy: { name: 'asc' } });
  for (const p of pipes) console.log(`  ${p.name.padEnd(34)} stages=${p._count.stages} opps=${p._count.opportunities}`);
  const opp = await prisma.ghlOpportunity.findFirst({ include: { stage: true, pipeline: true } });
  if (opp) console.log('sample opp:', opp.name, '| stage:', opp.stage?.name, '->', opp.stage?.clientStage, '| clientId:', opp.clientId);
  await prisma.$disconnect();
})().catch(e => { console.error('ERR', e); process.exit(1); });
