import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getActiveCycle } from "@/lib/goals-service";
import { averageProgress } from "@/lib/progress";

export async function GET() {
  try {
    await requireAuth();
    const cycle = await getActiveCycle();

    const sheets = await prisma.goalSheet.findMany({
      where: cycle ? { cycleId: cycle.id } : undefined,
      include: {
        user: { include: { department: true, manager: true } },
        goals: { include: { checkIns: true } },
      },
    });

    const byStatus: Record<string, number> = {
      DRAFT: 0,
      SUBMITTED: 0,
      APPROVED: 0,
      REJECTED: 0,
    };
    const byThrust: Record<string, number> = {};
    const byUom: Record<string, number> = {};
    const qoqTrend: { quarter: string; avg: number }[] = [];
    const managerStats: Record<string, { name: string; completed: number; total: number }> = {};

    for (const sheet of sheets) {
      byStatus[sheet.status]++;
      for (const goal of sheet.goals) {
        byThrust[goal.thrustArea] = (byThrust[goal.thrustArea] || 0) + 1;
        byUom[goal.uomType] = (byUom[goal.uomType] || 0) + 1;
      }
      const mgrId = sheet.user.managerId;
      if (mgrId) {
        if (!managerStats[mgrId]) {
          managerStats[mgrId] = {
            name: sheet.user.manager?.name || "Unknown",
            completed: 0,
            total: 0,
          };
        }
        managerStats[mgrId].total++;
        if (sheet.status === "APPROVED") managerStats[mgrId].completed++;
      }
    }

    for (const q of ["Q1", "Q2", "Q3", "Q4"]) {
      const scores: number[] = [];
      for (const sheet of sheets) {
        for (const goal of sheet.goals) {
          const ci = goal.checkIns.find((c) => c.quarter === q);
          if (ci?.progressScore != null) scores.push(ci.progressScore);
        }
      }
      qoqTrend.push({ quarter: q, avg: averageProgress(scores) });
    }

    const completionRate =
      sheets.length > 0
        ? (sheets.filter((s) => s.status === "APPROVED").length / sheets.length) * 100
        : 0;

    const heatmap = sheets.map((s) => ({
      name: s.user.name,
      department: s.user.department?.name || "—",
      progress: averageProgress(
        s.goals.flatMap((g) => g.checkIns.map((c) => c.progressScore ?? 0))
      ),
      status: s.status,
    }));

    return jsonOk({
      byStatus,
      byThrust: Object.entries(byThrust).map(([name, value]) => ({ name, value })),
      byUom: Object.entries(byUom).map(([name, value]) => ({ name, value })),
      qoqTrend,
      managerStats: Object.values(managerStats),
      completionRate,
      heatmap,
      totalSheets: sheets.length,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
