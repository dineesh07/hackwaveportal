import { config } from 'dotenv';
config({ path: '.env' });
import bcrypt from 'bcryptjs';

async function run() {
  try {
    const { prisma } = await import('./src/lib/prisma');
    const rollNo = '24ISR001';
    
    // Test exact match
    const exactUser = await prisma.user.findUnique({ where: { rollNo } });
    console.log('Exact match for 24ISR001:', !!exactUser);

    // Test case insensitive match
    const insensitiveUser = await prisma.user.findFirst({ where: { rollNo: { equals: rollNo, mode: 'insensitive' } } });
    console.log('Case insensitive match:', !!insensitiveUser);
    
    if (insensitiveUser) {
        console.log('Stored Roll No:', insensitiveUser.rollNo);
        const isMatch = await bcrypt.compare('12345', insensitiveUser.passwordHash);
        console.log('Password 12345 matches?', isMatch);
        console.log('User status:', insensitiveUser.status);
    }
  } catch (err) {
    console.error('ERROR OCCURRED:', err);
  }
}

run().then(() => process.exit(0));
