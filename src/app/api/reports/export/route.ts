import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getActiveCycle } from "@/lib/goals-service";
import * as XLSX from "xlsx";

export async function GET(req: Request) {
  try {
    await requireAuth(["ADMIN", "MANAGER"]);
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";
    const cycle = await getActiveCycle();

    const sheets = await prisma.goalSheet.findMany({
      where: cycle ? { cycleId: cycle.id } : undefined,
      include: {
        user: { include: { department: true } },
        goals: { include: { checkIns: true } },
      },
    });

    const rows: Record<string, string | number>[] = [];
    for (const sheet of sheets) {
      for (const goal of sheet.goals) {
        for (const ci of goal.checkIns) {
          rows.push({
            Employee: sheet.user.name,
            Department: sheet.user.department?.name || "",
            Goal: goal.title,
            "Thrust Area": goal.thrustArea,
            UoM: goal.uomType,
            Target: goal.target,
            Weightage: goal.weightage,
            Quarter: ci.quarter,
            Actual: ci.actualAchievement ?? "",
            Status: ci.status,
            "Progress %": ci.progressScore ?? "",
            "Sheet Status": sheet.status,
          });
        }
        if (goal.checkIns.length === 0) {
          rows.push({
            Employee: sheet.user.name,
            Department: sheet.user.department?.name || "",
            Goal: goal.title,
            "Thrust Area": goal.thrustArea,
            UoM: goal.uomType,
            Target: goal.target,
            Weightage: goal.weightage,
            Quarter: "",
            Actual: "",
            Status: "",
            "Progress %": "",
            "Sheet Status": sheet.status,
          });
        }
      }
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Achievements");

    if (format === "xlsx") {
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      return new Response(buf, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="achievement-report.xlsx"',
        },
      });
    }

    const csv = XLSX.utils.sheet_to_csv(ws);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="achievement-report.csv"',
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}
