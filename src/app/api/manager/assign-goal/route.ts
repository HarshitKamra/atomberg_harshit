import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getActiveCycle, getOrCreateGoalSheet } from "@/lib/goals-service";
import { logAudit } from "@/lib/audit";
import { MAX_GOALS } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await requireAuth(["MANAGER", "ADMIN"]);
    const { employeeId, goal } = await req.json();

    if (!employeeId || !goal?.title) {
      throw new Error("Employee and goal title are required");
    }

    const employee = await prisma.user.findUnique({ where: { id: employeeId } });
    if (!employee) throw new Error("Employee not found");
    if (
      session.user.role === "MANAGER" &&
      employee.managerId !== session.user.id
    ) {
      throw new Error("You can only assign goals to your direct reports");
    }

    const cycle = await getActiveCycle();
    if (!cycle) throw new Error("No active cycle");

    const sheet = await getOrCreateGoalSheet(employeeId, cycle.id);
    const existingCount = await prisma.goal.count({
      where: { goalSheetId: sheet.id },
    });

    if (existingCount >= MAX_GOALS) {
      throw new Error(`Maximum ${MAX_GOALS} goals per employee`);
    }

    if (
      sheet.isLocked ||
      sheet.status === "APPROVED" ||
      sheet.status === "SUBMITTED"
    ) {
      throw new Error(
        "This employee's goal sheet is locked or under review. Ask HR to unlock it, or wait until it is returned for rework."
      );
    }

    const created = await prisma.goal.create({
      data: {
        goalSheetId: sheet.id,
        thrustArea: goal.thrustArea || "Operational Excellence",
        title: goal.title,
        description: goal.description || `Assigned by ${session.user.name}`,
        uomType: goal.uomType || "NUMERIC",
        uomDirection: goal.uomDirection || "MIN",
        target: Number(goal.target) || 0,
        weightage: Number(goal.weightage) || 10,
        deadline: goal.deadline ? new Date(goal.deadline) : null,
        sortOrder: existingCount,
      },
    });

    if (sheet.status === "REJECTED") {
      await prisma.goalSheet.update({
        where: { id: sheet.id },
        data: { status: "DRAFT" },
      });
    }

    await prisma.notification.create({
      data: {
        userId: employeeId,
        title: "New goal assigned by your manager",
        message: `${session.user.name} assigned: "${goal.title}"`,
        link: "/employee/goals",
      },
    });

    await logAudit({
      userId: session.user.id,
      entityType: "Goal",
      entityId: created.id,
      action: "CREATE",
      after: created,
      metadata: { assignedTo: employeeId, assignedBy: "manager" },
    });

    return jsonOk({ goal: created, sheetId: sheet.id });
  } catch (e) {
    return handleApiError(e);
  }
}
