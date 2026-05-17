import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getActiveCycle } from "@/lib/goals-service";
import { averageProgress } from "@/lib/progress";

export async function GET() {
  try {
    const session = await requireAuth(["MANAGER", "ADMIN"]);
    const cycle = await getActiveCycle();

    const reports = await prisma.user.findMany({
      where: {
        managerId: session.user.role === "MANAGER" ? session.user.id : undefined,
        role: "EMPLOYEE",
      },
      include: {
        department: true,
        goalSheets: {
          where: cycle ? { cycleId: cycle.id } : undefined,
          include: {
            goals: {
              include: { checkIns: true },
            },
          },
        },
      },
    });

    const team = reports.map((emp) => {
      const sheet = emp.goalSheets[0];
      const scores =
        sheet?.goals.flatMap((g) =>
          g.checkIns.map((c) => c.progressScore ?? 0)
        ) ?? [];
      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department?.name,
        sheetStatus: sheet?.status ?? "NO_SHEET",
        goalCount: sheet?.goals.length ?? 0,
        avgProgress: averageProgress(scores),
        isLocked: sheet?.isLocked ?? false,
        sheetId: sheet?.id,
      };
    });

    return jsonOk({ team, cycle });
  } catch (e) {
    return handleApiError(e);
  }
}
