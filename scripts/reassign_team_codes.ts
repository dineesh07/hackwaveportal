import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

function getBatchWeight(rollNo: string): number {
  const clean = rollNo.trim().toUpperCase();
  if (clean.includes('23ISR')) return 1;
  if (clean.includes('24ISR')) return 2;
  if (clean.includes('25ISR')) return 3;
  if (clean.includes('26ISR')) return 4;
  return 5;
}

async function main() {
  // 1. Clear team codes for rejected teams
  await prisma.team.updateMany({
    where: { registrationStatus: 'REJECTED' },
    data: { teamCode: null }
  });
  console.log('Cleared teamCode for rejected teams.');

  // 2. Fetch all non-rejected teams
  const teams = await prisma.team.findMany({
    where: { registrationStatus: { not: 'REJECTED' } },
    select: {
      id: true,
      teamCode: true,
      teamName: true,
      leaderName: true,
      leaderRollNo: true,
      registrationStatus: true,
    }
  });

  console.log(`Found ${teams.length} valid teams to re-assign.`);

  // 3. Sort strictly:
  // 1st -> 23ISR
  // 2nd -> 24ISR
  // 3rd -> 25ISR
  // 4th -> 26ISR
  // Secondary sort by full roll number ascending
  teams.sort((a, b) => {
    const weightA = getBatchWeight(a.leaderRollNo || '');
    const weightB = getBatchWeight(b.leaderRollNo || '');
    if (weightA !== weightB) {
      return weightA - weightB;
    }
    const rollA = (a.leaderRollNo || '').trim().toUpperCase();
    const rollB = (b.leaderRollNo || '').trim().toUpperCase();
    return rollA.localeCompare(rollB, undefined, { numeric: true, sensitivity: 'base' });
  });

  // 4. Clear all existing teamCodes first to avoid unique constraint collisions during re-assignment
  for (const team of teams) {
    await prisma.team.update({
      where: { id: team.id },
      data: { teamCode: null }
    });
  }

  // 5. Assign CTPG01 .. CTPG31
  console.log('\n--- UPDATING TEAM CODES ---');
  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const newTeamCode = `CTPG${String(i + 1).padStart(2, '0')}`;
    await prisma.team.update({
      where: { id: team.id },
      data: { teamCode: newTeamCode }
    });
    console.log(`${i + 1}. [${newTeamCode}] Leader: ${team.leaderName} (${team.leaderRollNo}) | Team: ${team.teamName}`);
  }

  console.log('\nSuccessfully updated all team codes to CTPG format.');
}

main()
  .catch((e) => {
    console.error('Error during migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
