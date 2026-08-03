import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const defaultPasswordHash = await bcrypt.hash('12345', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // Admin
  await prisma.user.upsert({
    where: { rollNo: 'admin' },
    update: {},
    create: {
      name: 'System Admin',
      rollNo: 'admin',
      passwordHash: adminPasswordHash,
      mustChangePassword: false,
      role: 'ADMIN',
    },
  });

  // Coordinator
  await prisma.user.upsert({
    where: { rollNo: 'coord01' },
    update: {},
    create: {
      name: 'Staff Coordinator',
      rollNo: 'coord01',
      passwordHash: defaultPasswordHash,
      mustChangePassword: true,
      role: 'COORDINATOR',
    },
  });

  // Mentors
  const mentors = ['mentor01', 'mentor02'];
  for (const mentor of mentors) {
    await prisma.user.upsert({
      where: { rollNo: mentor },
      update: {},
      create: {
        name: `Mentor ${mentor.replace('mentor', '')}`,
        rollNo: mentor,
        passwordHash: defaultPasswordHash,
        mustChangePassword: true,
        role: 'MENTOR',
      },
    });
  }

  // Jury
  const juries = ['jury01', 'jury02', 'jury03'];
  for (const jury of juries) {
    await prisma.user.upsert({
      where: { rollNo: jury },
      update: {},
      create: {
        name: `Jury Member ${jury.replace('jury', '')}`,
        rollNo: jury,
        passwordHash: defaultPasswordHash,
        mustChangePassword: true,
        role: 'JURY',
      },
    });
  }

  // Sample Teams
  const teams = ['team01', 'team02', 'team03', 'team04', 'team05'];
  for (let i = 0; i < teams.length; i++) {
    const leaderRollNo = teams[i];
    
    // Create the team
    const team = await prisma.team.upsert({
      where: { id: `team-${i+1}` }, // We can't query by leaderRollNo easily if it's not unique in schema, but we can query by teamName
      update: {},
      create: {
        teamName: `Alpha Squad ${i+1}`,
        leaderName: `Leader ${i+1}`,
        leaderRollNo: leaderRollNo,
        leaderPhone: '1234567890',
        registrationStatus: 'ACCOUNT_CREATED',
      },
    });

    // Create the user for the team
    await prisma.user.upsert({
      where: { rollNo: leaderRollNo },
      update: {},
      create: {
        name: team.teamName,
        rollNo: leaderRollNo,
        passwordHash: defaultPasswordHash,
        mustChangePassword: true,
        role: 'TEAM',
      },
    });

    // Link user to team
    const user = await prisma.user.findUnique({ where: { rollNo: leaderRollNo }});
    await prisma.team.update({
      where: { id: team.id },
      data: { userId: user?.id }
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
