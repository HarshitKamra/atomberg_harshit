"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Target, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EmployeeDashboard() {
  const [data, setData] = useState<{
    sheet?: { status: string; isLocked: boolean; goals: { checkIns: { progressScore: number | null }[] }[] };
    cycle?: { name: string };
  } | null>(null);

  useEffect(() => {
    fetch("/api/goals")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) {
          setData({ sheet: undefined, cycle: undefined });
          return;
        }
        setData(json);
      })
      .catch(() => setData({ sheet: undefined, cycle: undefined }));
  }, []);

  const sheet = data?.sheet;
  const goals = sheet?.goals ?? [];
  const scores = goals.flatMap((g) =>
    (g.checkIns ?? []).map((c) => c.progressScore ?? 0)
  );
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return (
    <DashboardShell
      title="My Dashboard"
      subtitle={data?.cycle?.name || "Current performance cycle"}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Goal Sheet</CardTitle>
            <Target className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                sheet?.status === "APPROVED"
                  ? "success"
                  : sheet?.status === "SUBMITTED"
                    ? "warning"
                    : "default"
              }
            >
              {sheet?.status || "DRAFT"}
            </Badge>
            {sheet?.isLocked && (
              <p className="mt-2 text-xs text-slate-500">Goals locked after approval</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Avg Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avg.toFixed(0)}%</p>
            <ProgressBar value={avg} showLabel={false} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Goals</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{goals.length}</p>
            <p className="text-xs text-slate-500">Active goals this cycle</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 flex gap-4">
        <Link href="/employee/goals">
          <Button>Manage Goals</Button>
        </Link>
        <Link href="/employee/checkins">
          <Button variant="outline">Quarterly Check-ins</Button>
        </Link>
      </div>
    </DashboardShell>
  );
}
