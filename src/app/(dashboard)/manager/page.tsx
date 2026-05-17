"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ManagerDashboard() {
  const [team, setTeam] = useState<
    {
      name: string;
      sheetStatus: string;
      avgProgress: number;
      goalCount: number;
    }[]
  >([]);

  useEffect(() => {
    fetch("/api/manager/team")
      .then((r) => r.json())
      .then((d) => setTeam(d.team || []));
  }, []);

  const pending = team.filter((t) => t.sheetStatus === "SUBMITTED").length;

  return (
    <DashboardShell title="Team Dashboard" subtitle="Monitor your direct reports">
      <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">Team Size</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{team.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Link href="/manager/approvals">
                <Button className="w-full">Review Approvals</Button>
              </Link>
            </CardContent>
          </Card>
      </div>
      <div className="space-y-3">
        {team.map((member) => (
          <Card key={member.name}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-xs text-slate-500">{member.goalCount} goals</p>
              </div>
              <Badge
                variant={
                  member.sheetStatus === "APPROVED"
                    ? "success"
                    : member.sheetStatus === "SUBMITTED"
                      ? "warning"
                      : "default"
                }
              >
                {member.sheetStatus}
              </Badge>
              <div className="w-32">
                <ProgressBar value={member.avgProgress} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}