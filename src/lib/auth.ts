import type { Role } from "@/lib/db-enums";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth(roles?: Role[]) {
  const session = await getSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  if (roles && !roles.includes(session.user.role)) throw new Error("FORBIDDEN");
  return session;
}

export function roleDashboardPath(role: Role) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "MANAGER":
      return "/manager";
    default:
      return "/employee";
  }
}
