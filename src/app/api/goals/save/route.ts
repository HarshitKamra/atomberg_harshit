import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { getActiveCycle, getOrCreateGoalSheet, saveGoals } from "@/lib/goals-service";

export async function POST(req: Request) {
  try {
    const session = await requireAuth(["EMPLOYEE", "MANAGER", "ADMIN"]);
    const body = await req.json();
    const cycle = await getActiveCycle();
    if (!cycle) throw new Error("No active cycle");

    const sheet = await getOrCreateGoalSheet(session.user.id, cycle.id);
    const goals = await saveGoals(session.user.id, sheet.id, body.goals);
    return jsonOk({ goals });
  } catch (e) {
    return handleApiError(e);
  }
}
