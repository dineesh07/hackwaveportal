import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function backfillUsers() {
  console.log('Starting backfill for existing team members...');
  
  const passwordHash = await bcrypt.hash('12345', 10);
  
  const teams = await prisma.team.findMany({
    include: { members: true }
  });

  for (const team of teams) {
    if (team.registrationStatus !== 'ACCOUNT_CREATED') continue;
    
    for (const member of team.members) {
      if (!member.rollNo) continue;
      
      const userConditions = [{ rollNo: member.rollNo }];
      if (member.email && member.email.trim() !== '') {
        userConditions.push({ email: member.email.trim() });
      }

      const existingUser = await prisma.user.findFirst({
        where: { OR: userConditions }
      });

      if (!existingUser) {
        console.log(`Creating user for ${member.name} (${member.rollNo})`);
        const finalEmail = member.email && member.email.trim() !== '' ? member.email.trim() : null;
        
        await prisma.user.create({
          data: {
            name: member.name,
            rollNo: member.rollNo,
            email: finalEmail,
            phone: member.phone,
            passwordHash,
            mustChangePassword: true,
            role: 'TEAM',
            status: 'ACTIVE'
          }
        });
      } else {
        console.log(`User already exists for ${member.name} (${member.rollNo})`);
      }
    }
  }
  console.log('Backfill complete!');
}

backfillUsers()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
