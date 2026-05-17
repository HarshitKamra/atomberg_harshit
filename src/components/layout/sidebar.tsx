"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Target,
  Users,
  CheckSquare,
  BarChart3,
  FileText,
  Shield,
  Settings,
  LogOut,
  Network,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/db-enums";

const navByRole: Record<Role, { href: string; label: string; icon: React.ElementType }[]> = {
  EMPLOYEE: [
    { href: "/employee", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employee/goals", label: "My Goals / Tasks", icon: Target },
    { href: "/employee/checkins", label: "Check-ins", icon: CheckSquare },
  ],
  MANAGER: [
    { href: "/manager", label: "Team Dashboard", icon: LayoutDashboard },
    { href: "/manager/approvals", label: "Approvals", icon: Target },
    { href: "/manager/assign", label: "Assign Goals", icon: UserPlus },
    { href: "/manager/checkins", label: "Check-ins", icon: CheckSquare },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ],
  ADMIN: [
    { href: "/admin", label: "HR Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/cycles", label: "Cycles & Windows", icon: Settings },
    { href: "/admin/shared-goals", label: "Shared Goals", icon: Target },
    { href: "/admin/audit", label: "Audit Logs", icon: Shield },
    { href: "/admin/reports", label: "Reports", icon: FileText },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user?.role || "EMPLOYEE") as Role;
  const items = navByRole[role] || navByRole.EMPLOYEE;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-950 text-white">
      <div className="border-b border-slate-800 p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 font-bold">
            A
          </div>
          <div>
            <p className="font-semibold">AtomGoals</p>
            <p className="text-xs text-slate-400">Goal Tracking Portal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/architecture"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
            pathname === "/architecture"
              ? "bg-indigo-600 text-white"
              : "text-slate-300 hover:bg-slate-800"
          )}
        >
          <Network className="h-4 w-4" />
          Architecture
        </Link>
      </nav>
      <div className="border-t border-slate-800 p-4">
        <div className="mb-3 rounded-lg bg-slate-900 p-3">
          <p className="text-sm font-medium">{session?.user?.name}</p>
          <p className="text-xs text-slate-400">{session?.user?.email}</p>
          <span className="mt-1 inline-block rounded bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
            {role}
          </span>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
