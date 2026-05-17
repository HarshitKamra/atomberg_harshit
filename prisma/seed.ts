import { PrismaClient } from "@prisma/client";
import { Role, PeriodType } from "../src/lib/db-enums";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.quarterlyCheckIn.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.goalSheet.deleteMany();
  await prisma.sharedGoal.deleteMany();
  await prisma.checkInWindow.deleteMany();
  await prisma.escalation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.cycle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  const password = await bcrypt.hash("demo123", 10);

  const engineering = await prisma.department.create({
    data: { name: "Engineering" },
  });
  const sales = await prisma.department.create({
    data: { name: "Sales" },
  });
  const hr = await prisma.department.create({ data: { name: "Human Resources" } });

  const admin = await prisma.user.create({
    data: {
      email: "admin@atomberg.com",
      password,
      name: "Priya Sharma",
      role: Role.ADMIN,
      departmentId: hr.id,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: "manager@atomberg.com",
      password,
      name: "Rahul Mehta",
      role: Role.MANAGER,
      departmentId: engineering.id,
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      email: "manager.sales@atomberg.com",
      password,
      name: "Anita Desai",
      role: Role.MANAGER,
      departmentId: sales.id,
    },
  });

  const employee = await prisma.user.create({
    data: {
      email: "employee@atomberg.com",
      password,
      name: "Arjun Patel",
      role: Role.EMPLOYEE,
      departmentId: engineering.id,
      managerId: manager.id,
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      email: "employee2@atomberg.com",
      password,
      name: "Sneha Iyer",
      role: Role.EMPLOYEE,
      departmentId: engineering.id,
      managerId: manager.id,
    },
  });

  const employee3 = await prisma.user.create({
    data: {
      email: "sales@atomberg.com",
      password,
      name: "Vikram Singh",
      role: Role.EMPLOYEE,
      departmentId: sales.id,
      managerId: manager2.id,
    },
  });

  const year = new Date().getFullYear();
  const cycle = await prisma.cycle.create({
    data: {
      year,
      name: `FY ${year}-${(year + 1).toString().slice(-2)}`,
      isActive: true,
      windows: {
        create: Object.values(PeriodType).map((period) => {
          const months: Record<PeriodType, number> = {
            GOAL_SETTING: 5,
            Q1: 7,
            Q2: 10,
            Q3: 1,
            Q4: 3,
          };
          return {
            period,
            opensMonth: months[period],
            isOpen: true,
          };
        }),
      },
    },
  });

  const sharedGoal = await prisma.sharedGoal.create({
    data: {
      cycleId: cycle.id,
      thrustArea: "Customer Experience",
      title: "Improve NPS score across product lines",
      description: "Departmental KPI — shared across all customer-facing teams",
      uomType: "PERCENTAGE",
      uomDirection: "MIN",
      target: 75,
      createdById: admin.id,
      primaryOwnerId: employee.id,
    },
  });

  const approvedSheet = await prisma.goalSheet.create({
    data: {
      userId: employee.id,
      cycleId: cycle.id,
      status: "APPROVED",
      isLocked: true,
      submittedAt: new Date(year, 4, 15),
      approvedAt: new Date(year, 4, 20),
      approvedById: manager.id,
      goals: {
        create: [
          {
            thrustArea: "Revenue Growth",
            title: "Increase enterprise ARR by 20%",
            description: "Focus on upsell and new logo acquisition in Q2–Q4",
            uomType: "PERCENTAGE",
            uomDirection: "MIN",
            target: 20,
            weightage: 30,
            sortOrder: 0,
          },
          {
            thrustArea: "Operational Excellence",
            title: "Reduce deployment lead time",
            description: "CI/CD pipeline optimization",
            uomType: "NUMERIC",
            uomDirection: "MAX",
            target: 4,
            weightage: 20,
            sortOrder: 1,
          },
          {
            thrustArea: "Customer Experience",
            title: "Improve NPS score across product lines",
            uomType: "PERCENTAGE",
            uomDirection: "MIN",
            target: 75,
            weightage: 25,
            isShared: true,
            sharedGoalId: sharedGoal.id,
            sortOrder: 2,
          },
          {
            thrustArea: "Quality & Compliance",
            title: "Zero safety incidents",
            uomType: "ZERO_BASED",
            uomDirection: "MIN",
            target: 0,
            weightage: 25,
            sortOrder: 3,
          },
        ],
      },
    },
    include: { goals: true },
  });

  await prisma.goalSheet.create({
    data: {
      userId: employee2.id,
      cycleId: cycle.id,
      status: "SUBMITTED",
      submittedAt: new Date(),
      goals: {
        create: [
          {
            thrustArea: "Innovation & Digital",
            title: "Launch mobile app v2",
            uomType: "TIMELINE",
            uomDirection: "MIN",
            target: 1,
            weightage: 40,
            deadline: new Date(year, 8, 30),
            sortOrder: 0,
          },
          {
            thrustArea: "People & Culture",
            title: "Mentor 3 junior engineers",
            uomType: "NUMERIC",
            uomDirection: "MIN",
            target: 3,
            weightage: 30,
            sortOrder: 1,
          },
          {
            thrustArea: "Customer Experience",
            title: "Improve NPS score across product lines",
            uomType: "PERCENTAGE",
            uomDirection: "MIN",
            target: 75,
            weightage: 30,
            isShared: true,
            sharedGoalId: sharedGoal.id,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  await prisma.goalSheet.create({
    data: {
      userId: employee3.id,
      cycleId: cycle.id,
      status: "DRAFT",
      goals: {
        create: [
          {
            thrustArea: "Revenue Growth",
            title: "Achieve quarterly sales quota",
            uomType: "PERCENTAGE",
            uomDirection: "MIN",
            target: 100,
            weightage: 50,
            sortOrder: 0,
          },
          {
            thrustArea: "Cost Optimization",
            title: "Reduce customer acquisition cost",
            uomType: "PERCENTAGE",
            uomDirection: "MAX",
            target: 15,
            weightage: 50,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  const goals = approvedSheet.goals;
  for (const goal of goals) {
    await prisma.quarterlyCheckIn.create({
      data: {
        goalId: goal.id,
        quarter: "Q1",
        actualAchievement:
          goal.uomType === "ZERO_BASED"
            ? 0
            : goal.uomType === "PERCENTAGE"
              ? 18
              : goal.uomType === "NUMERIC"
                ? 3.5
                : 72,
        status: goal.title.includes("NPS") ? "ON_TRACK" : "ON_TRACK",
        progressScore: 85,
        employeeComment: "On track for Q1 targets",
        managerComment: "Good progress — keep momentum",
        managerId: manager.id,
        completedAt: new Date(),
      },
    });
  }

  await prisma.auditLog.createMany({
    data: [
      {
        userId: manager.id,
        entityType: "GoalSheet",
        entityId: approvedSheet.id,
        action: "APPROVE",
        afterData: JSON.stringify({ status: "APPROVED" }),
        metadata: JSON.stringify({ note: "Goals approved for FY cycle" }),
      },
      {
        userId: employee.id,
        entityType: "GoalSheet",
        entityId: approvedSheet.id,
        action: "SUBMIT",
        afterData: JSON.stringify({ status: "SUBMITTED" }),
      },
    ],
  });

  await prisma.escalation.create({
    data: {
      type: "CHECK_IN_OVERDUE",
      userId: employee2.id,
      message: "Q1 check-in pending for Sneha Iyer",
      status: "OPEN",
      escalatedTo: manager.id,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: manager.id,
        title: "Goals submitted for review",
        message: "Sneha Iyer submitted goals for your approval",
        link: "/manager/approvals",
      },
      {
        userId: employee.id,
        title: "Goals approved",
        message: "Your FY goals have been approved by Rahul Mehta",
        link: "/employee/goals",
      },
    ],
  });

  console.log("Seed complete!");
  console.log("\nDemo accounts (password: demo123):");
  console.log("  Admin:    admin@atomberg.com");
  console.log("  Manager:  manager@atomberg.com");
  console.log("  Employee: employee@atomberg.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
