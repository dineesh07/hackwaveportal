const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function run() {
  try {
    const team = await prisma.team.findFirst({ where: { registrationStatus: 'PENDING_VERIFICATION' } });
    if (!team) {
      console.log('No pending teams.');
      return;
    }
    
    console.log('Trying to approve team:', team.teamName);
    const passwordHash = 'dummyhash';

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { rollNo: team.leaderRollNo },
        update: {
          name: team.leaderName,
          phone: team.leaderPhone,
          email: team.leaderEmail
        },
        create: {
          name: team.leaderName,
          rollNo: team.leaderRollNo,
          email: team.leaderEmail,
          phone: team.leaderPhone,
          passwordHash,
          mustChangePassword: true,
          role: 'TEAM',
          status: 'ACTIVE'
        }
      });
      console.log('Upsert user success', user);
    });
  } catch (err) {
    console.error('ERROR OCCURRED:', err);
  }
}

run().then(() => prisma.$disconnect());
