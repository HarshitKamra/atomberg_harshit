import type { Quarter } from "@/lib/db-enums";
import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { calculateProgressScore } from "@/lib/progress";
import { isPeriodActive } from "@/lib/schedule";
import { getActiveCycle, syncSharedAchievement } from "@/lib/goals-service";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const quarter = (searchParams.get("quarter") || "Q1") as Quarter;
    const sheetId = searchParams.get("sheetId");

    const sheet = sheetId
      ? await prisma.goalSheet.findUnique({
          where: { id: sheetId },
          include: {
            goals: { include: { checkIns: { where: { quarter } } } },
            user: true,
          },
        })
      : await prisma.goalSheet.findFirst({
          where: { userId: session.user.id },
          include: {
            goals: { include: { checkIns: { where: { quarter } } } },
            user: true,
          },
          orderBy: { createdAt: "desc" },
        });

    return jsonOk({ sheet, quarter });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { goalId, quarter, actualAchievement, completionDate, status, employeeComment, managerComment } = body;

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { goalSheet: true },
    });
    if (!goal) throw new Error("Goal not found");

    const cycle = await getActiveCycle();
    const periodMap: Record<Quarter, "Q1" | "Q2" | "Q3" | "Q4"> = {
      Q1: "Q1",
      Q2: "Q2",
      Q3: "Q3",
      Q4: "Q4",
    };
    const period = periodMap[quarter as Quarter];
    if (
      session.user.role === "EMPLOYEE" &&
      cycle &&
      !isPeriodActive(period, new Date(), cycle.windows)
    ) {
      throw new Error(`${quarter} check-in window is not active`);
    }

    const score = calculateProgressScore({
      uomType: goal.uomType as import("@/lib/db-enums").UomType,
      uomDirection: goal.uomDirection as import("@/lib/db-enums").UomDirection,
      target: goal.target,
      actual: actualAchievement,
      completionDate: completionDate ? new Date(completionDate) : null,
      deadline: goal.deadline,
    });

    const isManager = session.user.role === "MANAGER" || session.user.role === "ADMIN";

    const checkIn = await prisma.quarterlyCheckIn.upsert({
      where: { goalId_quarter: { goalId, quarter } },
      create: {
        goalId,
        quarter,
        actualAchievement,
        completionDate: completionDate ? new Date(completionDate) : null,
        status: status || "ON_TRACK",
        progressScore: score,
        employeeComment: isManager ? undefined : employeeComment,
        managerComment: isManager ? managerComment : undefined,
        managerId: isManager ? session.user.id : undefined,
        completedAt: new Date(),
      },
      update: {
        actualAchievement,
        completionDate: completionDate ? new Date(completionDate) : null,
        status,
        progressScore: score,
        ...(isManager
          ? { managerComment, managerId: session.user.id }
          : { employeeComment }),
        completedAt: new Date(),
      },
    });

    if (goal.sharedGoalId && actualAchievement != null) {
      await syncSharedAchievement(
        goal.sharedGoalId,
        quarter,
        actualAchievement,
        completionDate ? new Date(completionDate) : null
      );
    }

    await logAudit({
      userId: session.user.id,
      entityType: "QuarterlyCheckIn",
      entityId: checkIn.id,
      action: "CHECK_IN",
      after: checkIn,
    });

    return jsonOk({ checkIn });
  } catch (e) {
    return handleApiError(e);
  }
}
