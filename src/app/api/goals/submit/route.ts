import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { validateGoals } from "@/lib/validations";
import { isPeriodActive } from "@/lib/schedule";
import { getActiveCycle, getOrCreateGoalSheet } from "@/lib/goals-service";

export async function POST() {
  try {
    const session = await requireAuth(["EMPLOYEE"]);
    const cycle = await getActiveCycle();
    if (!cycle) throw new Error("No active cycle");

    if (!isPeriodActive("GOAL_SETTING", new Date(), cycle.windows as { period: string; isOpen: boolean }[])) {
      throw new Error("Goal setting window is not active");
    }

    const sheet = await getOrCreateGoalSheet(session.user.id, cycle.id);
    if (sheet.goals.length === 0) throw new Error("Add at least one goal");

    const errors = validateGoals(sheet.goals);
    if (errors.length) throw new Error(errors[0]);

    const updated = await prisma.goalSheet.update({
      where: { id: sheet.id },
      data: { status: "SUBMITTED", submittedAt: new Date() },
    });

    if (session.user.managerId) {
      await prisma.notification.create({
        data: {
          userId: session.user.managerId,
          title: "Goals submitted",
          message: `${session.user.name} submitted goals for review`,
          link: "/manager/approvals",
        },
      });
    }

    await logAudit({
      userId: session.user.id,
      entityType: "GoalSheet",
      entityId: sheet.id,
      action: "SUBMIT",
      after: updated,
    });

    return jsonOk({ sheet: updated });
  } catch (e) {
    return handleApiError(e);
  }
}
