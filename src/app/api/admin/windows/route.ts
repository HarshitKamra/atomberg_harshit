import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth(["ADMIN"]);
    const cycles = await prisma.cycle.findMany({
      include: { windows: true },
      orderBy: { year: "desc" },
    });
    return jsonOk({ cycles });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAuth(["ADMIN"]);
    const { windowId, isOpen } = await req.json();
    const window = await prisma.checkInWindow.update({
      where: { id: windowId },
      data: { isOpen },
    });
    return jsonOk({ window });
  } catch (e) {
    return handleApiError(e);
  }
}
