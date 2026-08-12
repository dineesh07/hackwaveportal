import { config } from 'dotenv';
config({ path: '.env' }); // load .env first

async function run() {
  try {
    const { prisma } = await import('./src/lib/prisma');
    const team = await prisma.team.findFirst({ where: { registrationStatus: 'PENDING_VERIFICATION' } });
    if (!team) {
      console.log('No pending teams.');
      return;
    }
    
    console.log('Trying to approve team:', team.teamName);

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { rollNo: team.leaderRollNo },
          { email: team.leaderEmail }
        ]
      }
    });

    if (user) {
        const existingTeam = await prisma.team.findFirst({ where: { userId: user.id } });
        if (existingTeam && existingTeam.id !== team.id) {
            console.log(`User is already linked to another team: ${existingTeam.teamName}`);
        } else {
            console.log(`User is NOT linked to another team.`);
        }
    } else {
        console.log(`User does not exist yet.`);
    }

  } catch (err) {
    console.error('ERROR OCCURRED:', err);
  }
}

run().then(() => process.exit(0));
