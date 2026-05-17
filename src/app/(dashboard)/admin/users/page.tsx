"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<
    { id: string; name: string; email: string; role: string; department?: { name: string } }[]
  >([]);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []));
  }, []);

  return (
    <DashboardShell title="User Management" subtitle="Manage employees, managers, and admins">
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="p-4 text-left font-medium">Name</th>
                <th className="p-4 text-left font-medium">Email</th>
                <th className="p-4 text-left font-medium">Role</th>
                <th className="p-4 text-left font-medium">Department</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-slate-50">
                  <td className="p-4">{u.name}</td>
                  <td className="p-4 text-slate-500">{u.email}</td>
                  <td className="p-4">
                    <Badge variant={u.role === "ADMIN" ? "info" : "default"}>{u.role}</Badge>
                  </td>
                  <td className="p-4">{u.department?.name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
