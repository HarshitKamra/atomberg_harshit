"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    completionRate: 0,
    totalSheets: 0,
    byStatus: {} as Record<string, number>,
  });

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  return (
    <DashboardShell title="HR Dashboard" subtitle="Organization-wide goal completion">
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.completionRate?.toFixed(0)}%</p>
            <ProgressBar value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Goal Sheets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalSheets}</p>
          </CardContent>
        </Card>
        {Object.entries(stats.byStatus || {}).map(([status, count]) => (
          <Card key={status}>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">{status}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{count as number}</p>
            </CardContent>
          </Card>
        ))}
      </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/admin/users"><Button>Manage Users</Button></Link>
            <Link href="/admin/cycles"><Button variant="outline">Cycles</Button></Link>
            <Link href="/admin/shared-goals"><Button variant="outline">Shared Goals</Button></Link>
            <Link href="/admin/reports"><Button variant="outline">Export Reports</Button></Link>
          </div>
    </DashboardShell>
  );
}