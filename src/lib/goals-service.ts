import type { PeriodType, Quarter, UomType, UomDirection } from "@/lib/db-enums";
import { prisma } from "./prisma";
import { logAudit } from "./audit";
import { calculateProgressScore } from "./progress";
import { validateGoals } from "./validations";
import { periodToQuarter } from "./schedule";

export async function getActiveCycle() {
  return prisma.cycle.findFirst({
    where: { isActive: true },
    include: { windows: true },
    orderBy: { year: "desc" },
  });
}

export async function getOrCreateGoalSheet(userId: string, cycleId: string) {
  let sheet = await prisma.goalSheet.findUnique({
    where: { userId_cycleId: { userId, cycleId } },
    include: {
      goals: { orderBy: { sortOrder: "asc" }, include: { checkIns: true } },
      cycle: true,
    },
  });
  if (!sheet) {
    sheet = await prisma.goalSheet.create({
      data: { userId, cycleId },
      include: {
        goals: { orderBy: { sortOrder: "asc" }, include: { checkIns: true } },
        cycle: true,
      },
    });
  }
  return sheet;
}

export async function syncSharedAchievement(
  sharedGoalId: string,
  quarter: Quarter,
  actual: number,
  completionDate?: Date | null
) {
  const linkedGoals = await prisma.goal.findMany({
    where: { sharedGoalId },
    include: { goalSheet: true },
  });

  const shared = await prisma.sharedGoal.findUnique({
    where: { id: sharedGoalId },
  });
  if (!shared) return;

  for (const goal of linkedGoals) {
    const score = calculateProgressScore({
      uomType: goal.uomType as UomType,
      uomDirection: goal.uomDirection as UomDirection,
      target: goal.target,
      actual,
      completionDate,
      deadline: goal.deadline,
    });

    await prisma.quarterlyCheckIn.upsert({
      where: { goalId_quarter: { goalId: goal.id, quarter } },
      create: {
        goalId: goal.id,
        quarter,
        actualAchievement: actual,
        completionDate,
        progressScore: score,
        status: score >= 100 ? "COMPLETED" : score > 0 ? "ON_TRACK" : "NOT_STARTED",
      },
      update: {
        actualAchievement: actual,
        completionDate,
        progressScore: score,
        status: score >= 100 ? "COMPLETED" : score > 0 ? "ON_TRACK" : "NOT_STARTED",
      },
    });
  }
}

export async function saveGoals(
  userId: string,
  sheetId: string,
  goals: {
    id?: string;
    thrustArea: string;
    title: string;
    description?: string;
    uomType: string;
    uomDirection: string;
    target: number;
    weightage: number;
    deadline?: string | null;
    isShared?: boolean;
    sharedGoalId?: string | null;
  }[]
) {
  const sheet = await prisma.goalSheet.findUnique({
    where: { id: sheetId },
    include: { goals: true },
  });
  if (!sheet || sheet.userId !== userId) throw new Error("Goal sheet not found");
  if (sheet.isLocked) throw new Error("Goals are locked");
  if (sheet.status === "SUBMITTED" || sheet.status === "APPROVED") {
    throw new Error("Cannot edit submitted goals");
  }

  const validationGoals = goals.map((g) => ({ weightage: g.weightage }));
  const errors = validateGoals(validationGoals);
  if (errors.length) throw new Error(errors[0]);

  await prisma.goal.deleteMany({ where: { goalSheetId: sheetId } });

  const created = await prisma.$transaction(
    goals.map((g, i) =>
      prisma.goal.create({
        data: {
          goalSheetId: sheetId,
          thrustArea: g.thrustArea,
          title: g.title,
          description: g.description,
          uomType: g.uomType as never,
          uomDirection: g.uomDirection as never,
          target: g.target,
          weightage: g.weightage,
          deadline: g.deadline ? new Date(g.deadline) : null,
          isShared: !!g.isShared,
          sharedGoalId: g.sharedGoalId || null,
          sortOrder: i,
        },
      })
    )
  );

  await logAudit({
    userId,
    entityType: "GoalSheet",
    entityId: sheetId,
    action: "UPDATE",
    after: { goalCount: created.length },
  });

  return created;
}

export function getQuarterFromPeriod(period: PeriodType): Quarter | null {
  return periodToQuarter(period);
}
