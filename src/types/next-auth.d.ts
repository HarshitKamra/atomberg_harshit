import type { Role } from "@/lib/db-enums";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    departmentId?: string | null;
    managerId?: string | null;
  }

  interface Session {
    user: User & {
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    departmentId?: string | null;
    managerId?: string | null;
  }
}
