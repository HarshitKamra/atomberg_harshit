"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default function AuditPage() {
  const [logs, setLogs] = useState<
    {
      id: string;
      action: string;
      entityType: string;
      entityId: string;
      createdAt: string;
      user: { name: string };
      beforeData?: string;
      afterData?: string;
    }[]
  >([]);

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []));
  }, []);

  return (
    <DashboardShell title="Audit Trail" subtitle="Who changed what and when">
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Action</th>
                <th className="p-3 text-left">Entity</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="p-3 text-slate-500">{formatDate(log.createdAt)}</td>
                  <td className="p-3">{log.user.name}</td>
                  <td className="p-3 font-medium">{log.action}</td>
                  <td className="p-3">
                    {log.entityType} · {log.entityId.slice(0, 8)}…
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
