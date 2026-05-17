const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEmployeeManager() {
  // Assign employee@atomberg.com to manager@atomberg.com
  const updated = await prisma.user.update({
    where: { email: 'employee@atomberg.com' },
    data: { managerId: (await prisma.user.findUnique({ where: { email: 'manager@atomberg.com' } }))?.id },
  });
  console.log('✅ Updated employee manager relationship');
  await prisma.$disconnect();
}

fixEmployeeManager().catch(console.error);
