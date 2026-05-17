import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getActiveCycle } from "@/lib/goals-service";

export async function GET() {
  try {
    await requireAuth(["ADMIN", "MANAGER"]);
    const cycle = await getActiveCycle();
    const shared = await prisma.sharedGoal.findMany({
      where: cycle ? { cycleId: cycle.id } : undefined,
      include: { goals: { include: { goalSheet: { include: { user: true } } } } },
    });
    return jsonOk({ shared });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth(["ADMIN", "MANAGER"]);
    const body = await req.json();
    const cycle = await getActiveCycle();
    if (!cycle) throw new Error("No active cycle");

    const shared = await prisma.sharedGoal.create({
      data: {
        cycleId: cycle.id,
        thrustArea: body.thrustArea,
        title: body.title,
        description: body.description,
        uomType: body.uomType,
        uomDirection: body.uomDirection || "MIN",
        target: body.target,
        deadline: body.deadline ? new Date(body.deadline) : null,
        createdById: session.user.id,
        primaryOwnerId: body.primaryOwnerId,
      },
    });

    for (const userId of body.employeeIds || []) {
      let sheet = await prisma.goalSheet.findUnique({
        where: { userId_cycleId: { userId, cycleId: cycle.id } },
      });
      if (!sheet) {
        sheet = await prisma.goalSheet.create({
          data: { userId, cycleId: cycle.id },
        });
      }
      await prisma.goal.create({
        data: {
          goalSheetId: sheet.id,
          thrustArea: shared.thrustArea,
          title: shared.title,
          description: shared.description,
          uomType: shared.uomType,
          uomDirection: shared.uomDirection,
          target: shared.target,
          weightage: body.defaultWeightage || 10,
          isShared: true,
          sharedGoalId: shared.id,
        },
      });
    }

    return jsonOk({ shared });
  } catch (e) {
    return handleApiError(e);
  }
}
