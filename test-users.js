const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany().then(u => {
    console.log("Total users:", u.length);
    if(u.length > 0) {
        console.log("First 3 users:", JSON.stringify(u.slice(0, 3).map(x=>({rollNo:x.rollNo, status:x.status})), null, 2));
    }
}).catch(console.error).finally(() => prisma.$disconnect());
