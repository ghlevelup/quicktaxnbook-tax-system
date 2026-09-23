import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const firmCount = await prisma.firm.count();
  const firms = await prisma.firm.deleteMany({});
  const users = await prisma.user.deleteMany({ where: { accountRole: { not: 'PLATFORM_OWNER' } } });

  const remainingUsers = await prisma.user.findMany({
    select: { email: true, accountRole: true },
  });

  console.log(
    `Deleted ${firms.count} firm(s) (was ${firmCount}), cascading their team/client/data.`
  );
  console.log(`Deleted ${users.count} non-platform-owner user(s).`);
  console.log('Remaining users:');
  for (const user of remainingUsers) {
    console.log(`  - ${user.email} (${user.accountRole})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
