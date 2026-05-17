"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SharedGoalsPage() {
  const [shared, setShared] = useState<
    {
      id: string;
      title: string;
      thrustArea: string;
      target: number;
      goals: { goalSheet: { user: { name: string } } }[];
    }[]
  >([]);

  useEffect(() => {
    fetch("/api/admin/shared-goals")
      .then((r) => r.json())
      .then((d) => setShared(d.shared || []));
  }, []);

  return (
    <DashboardShell
      title="Shared Goals"
      subtitle="Departmental KPIs assigned to multiple employees"
    >
      <div className="space-y-4">
        {shared.map((sg) => (
          <Card key={sg.id}>
            <CardHeader>
              <CardTitle className="text-base">{sg.title}</CardTitle>
              <p className="text-sm text-slate-500">{sg.thrustArea} · Target: {sg.target}</p>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-xs font-medium text-slate-400">Assigned to:</p>
                <div className="flex flex-wrap gap-2">
                  {sg.goals.map((g, i) => (
                    <Badge key={i} variant="info">
                      {g.goalSheet.user.name}
                    </Badge>
                  ))}
                </div>
              <p className="mt-3 text-xs text-slate-400">
                Employees can edit weightage only. Achievement syncs across linked sheets.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      {shared.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No shared goals configured. Use API or seed data.
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}