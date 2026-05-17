import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { validateGoals } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await requireAuth(["MANAGER", "ADMIN"]);
    const { sheetId, action, goals, rejectionNote } = await req.json();

    const sheet = await prisma.goalSheet.findUnique({
      where: { id: sheetId },
      include: { goals: true, user: true },
    });
    if (!sheet) throw new Error("Sheet not found");
    if (sheet.status !== "SUBMITTED") throw new Error("Sheet not pending approval");

    if (session.user.role === "MANAGER" && sheet.user.managerId !== session.user.id) {
      throw new Error("Not your team member");
    }

    if (action === "reject") {
      const updated = await prisma.goalSheet.update({
        where: { id: sheetId },
        data: {
          status: "REJECTED",
          rejectionNote: rejectionNote || "Please revise your goals",
          isLocked: false,
        },
      });
      await prisma.notification.create({
        data: {
          userId: sheet.userId,
          title: "Goals returned for rework",
          message: rejectionNote || "Your manager requested changes",
          link: "/employee/goals",
        },
      });
      await logAudit({
        userId: session.user.id,
        entityType: "GoalSheet",
        entityId: sheetId,
        action: "REJECT",
        after: updated,
      });
      return jsonOk({ sheet: updated });
    }

    if (goals?.length) {
      const errors = validateGoals(goals);
      if (errors.length) throw new Error(errors[0]);
      await prisma.goal.deleteMany({ where: { goalSheetId: sheetId } });
      for (const [i, g] of goals.entries()) {
        const existing = sheet.goals.find((x) => x.id === g.id);
        await prisma.goal.create({
          data: {
            goalSheetId: sheetId,
            thrustArea: existing?.isShared ? existing.thrustArea : g.thrustArea,
            title: existing?.isShared ? existing.title : g.title,
            description: existing?.description ?? g.description,
            uomType: existing?.uomType ?? g.uomType,
            uomDirection: existing?.uomDirection ?? g.uomDirection,
            target: existing?.isShared ? existing.target : g.target,
            weightage: g.weightage,
            deadline: existing?.deadline,
            isShared: existing?.isShared ?? false,
            sharedGoalId: existing?.sharedGoalId,
            sortOrder: i,
          },
        });
      }
    }

    const updated = await prisma.goalSheet.update({
      where: { id: sheetId },
      data: {
        status: "APPROVED",
        isLocked: true,
        approvedAt: new Date(),
        approvedById: session.user.id,
      },
    });

    await prisma.notification.create({
      data: {
        userId: sheet.userId,
        title: "Goals approved",
        message: "Your goals are now locked",
        link: "/employee/goals",
      },
    });

    await logAudit({
      userId: session.user.id,
      entityType: "GoalSheet",
      entityId: sheetId,
      action: "APPROVE",
      after: updated,
    });

    return jsonOk({ sheet: updated });
  } catch (e) {
    return handleApiError(e);
  }
}
