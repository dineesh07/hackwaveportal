import { prisma } from '../src/lib/prisma';

async function main() {
  const teams = await prisma.team.findMany({
    where: {
      teamCode: null,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  console.log(`Found ${teams.length} teams without a teamCode.`);

  let counter = 1;
  for (const team of teams) {
    const code = `TEAM-${String(counter).padStart(3, '0')}`;
    await prisma.team.update({
      where: { id: team.id },
      data: { teamCode: code },
    });
    console.log(`Updated team ${team.teamName} with code ${code}`);
    counter++;
  }

  console.log('Migration complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
