import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const session = await requireAuth(["ADMIN"]);
    const { sheetId } = await req.json();

    const before = await prisma.goalSheet.findUnique({ where: { id: sheetId } });
    const sheet = await prisma.goalSheet.update({
      where: { id: sheetId },
      data: { isLocked: false, status: "DRAFT" },
    });

    await logAudit({
      userId: session.user.id,
      entityType: "GoalSheet",
      entityId: sheetId,
      action: "UNLOCK",
      before,
      after: sheet,
      metadata: { reason: "Admin unlock" },
    });

    return jsonOk({ sheet });
  } catch (e) {
    return handleApiError(e);
  }
}
