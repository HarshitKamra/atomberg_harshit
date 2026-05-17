import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { getActiveCycle, getOrCreateGoalSheet } from "@/lib/goals-service";

export async function GET() {
  try {
    const session = await requireAuth();
    const cycle = await getActiveCycle();
    if (!cycle) return jsonOk({ sheet: null, cycle: null });

    const sheet = await getOrCreateGoalSheet(session.user.id, cycle.id);
    return jsonOk({ sheet, cycle });
  } catch (e) {
    return handleApiError(e);
  }
}
