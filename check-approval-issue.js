const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkApprovalIssue() {
  // Get all employees with their managers
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    include: { manager: { select: { name: true, email: true } } },
  });

  console.log('\n📋 EMPLOYEES & THEIR MANAGERS:');
  console.log('─'.repeat(70));
  employees.forEach(emp => {
    console.log(`${emp.email} (${emp.name})`);
    console.log(`  └─ Manager: ${emp.manager ? emp.manager.email : '❌ NO MANAGER ASSIGNED'}`);
  });

  // Get all submitted goal sheets
  const submitted = await prisma.goalSheet.findMany({
    where: { status: 'SUBMITTED' },
    include: { user: { select: { name: true, email: true, manager: { select: { email: true } } } } },
  });

  console.log('\n📝 SUBMITTED GOAL SHEETS:');
  console.log('─'.repeat(70));
  if (submitted.length === 0) {
    console.log('❌ No submitted goal sheets found');
  } else {
    submitted.forEach(sheet => {
      console.log(`Employee: ${sheet.user.email} (${sheet.user.name})`);
      console.log(`  └─ Manager: ${sheet.user.manager ? sheet.user.manager.email : '❌ NO MANAGER'}`);
      console.log(`  └─ Sheet Status: ${sheet.status}, Locked: ${sheet.isLocked}`);
    });
  }

  // Get all managers and their direct reports
  const managers = await prisma.user.findMany({
    where: { role: 'MANAGER' },
    include: {
      directReports: {
        include: {
          goalSheets: {
            where: { status: 'SUBMITTED' },
            select: { id: true, status: true },
          },
        },
      },
    },
  });

  console.log('\n👔 MANAGERS & THEIR TEAM:');
  console.log('─'.repeat(70));
  managers.forEach(mgr => {
    console.log(`Manager: ${mgr.email} (${mgr.name})`);
    if (mgr.directReports.length === 0) {
      console.log('  └─ ❌ No direct reports');
    } else {
      mgr.directReports.forEach(emp => {
        const pendingSheets = emp.goalSheets.filter(s => s.status === 'SUBMITTED');
        console.log(`  ├─ ${emp.email} (${pendingSheets.length} pending)`);
      });
    }
  });

  await prisma.$disconnect();
  console.log('\n' + '─'.repeat(70));
}

checkApprovalIssue().catch(console.error);
