import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await requireAuth(["ADMIN"]);
    const users = await prisma.user.findMany({
      include: { department: true, manager: { select: { name: true } } },
      orderBy: { name: "asc" },
    });
    return jsonOk({ users });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth(["ADMIN"]);
    const body = await req.json();
    const password = await bcrypt.hash(body.password || "demo123", 10);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password,
        name: body.name,
        role: body.role,
        departmentId: body.departmentId,
        managerId: body.managerId,
      },
    });
    return jsonOk({ user });
  } catch (e) {
    return handleApiError(e);
  }
}
