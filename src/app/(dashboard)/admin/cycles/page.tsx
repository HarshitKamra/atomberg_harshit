"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SCHEDULE } from "@/lib/schedule";

export default function AdminCyclesPage() {
  const [cycles, setCycles] = useState<
    {
      id: string;
      name: string;
      year: number;
      windows: { id: string; period: string; isOpen: boolean }[];
    }[]
  >([]);

  useEffect(() => {
    fetch("/api/admin/windows")
      .then((r) => r.json())
      .then((d) => setCycles(d.cycles || []));
  }, []);

  async function toggleWindow(windowId: string, isOpen: boolean) {
    await fetch("/api/admin/windows", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ windowId, isOpen: !isOpen }),
    });
    const res = await fetch("/api/admin/windows");
    const d = await res.json();
    setCycles(d.cycles || []);
  }

  const cycle = cycles[0];

  return (
    <DashboardShell title="Cycles & Check-in Windows" subtitle="Configure quarterly schedule">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{cycle?.name || "Active Cycle"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-500">
            Quarterly schedule: May (Goals) · July (Q1) · October (Q2) · January (Q3) · March–April (Q4)
          </p>
            <div className="space-y-3">
              {cycle?.windows.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {SCHEDULE[w.period as keyof typeof SCHEDULE]?.label || w.period}
                    </p>
                    <p className="text-xs text-slate-500">
                      {SCHEDULE[w.period as keyof typeof SCHEDULE]?.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={w.isOpen ? "success" : "default"}>
                      {w.isOpen ? "Open" : "Closed"}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => toggleWindow(w.id, w.isOpen)}>
                      Toggle
                    </Button>
                  </div>
                </div>
              ))}
            </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}