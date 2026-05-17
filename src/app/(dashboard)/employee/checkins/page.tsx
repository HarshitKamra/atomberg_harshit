"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

export default function EmployeeCheckinsPage() {
  const [quarter, setQuarter] = useState("Q1");
  const [sheet, setSheet] = useState<{
    isLocked: boolean;
    goals: {
      id: string;
      title: string;
      target: number;
      uomType: string;
      isShared: boolean;
      checkIns: { actualAchievement: number | null; status: string; progressScore: number | null }[];
    }[];
  } | null>(null);

  async function load() {
    const res = await fetch(`/api/checkins?quarter=${quarter}`);
    const data = await res.json();
    setSheet(data.sheet);
  }

  useEffect(() => {
    load();
  }, [quarter]);

  async function saveCheckIn(
    goalId: string,
    actual: number,
    status: string,
    completionDate?: string
  ) {
    const res = await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalId,
        quarter,
        actualAchievement: actual,
        status,
        completionDate,
      }),
    });
    const data = await res.json();
    if (data.error) alert(data.error);
    await load();
  }

  if (!sheet?.isLocked) {
    return (
      <DashboardShell title="Quarterly Check-ins">
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Goals must be approved and locked before check-ins are available.
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Quarterly Check-ins"
      subtitle="Update actual achievement vs planned targets"
    >
      <div className="mb-6 flex gap-2">
        {QUARTERS.map((q) => (
          <Button
            key={q}
            variant={quarter === q ? "default" : "outline"}
            size="sm"
            onClick={() => setQuarter(q)}
          >
            {q}
          </Button>
        ))}
      </div>
      <div className="space-y-4">
        {sheet.goals.map((goal) => {
          const ci = goal.checkIns[0];
          return (
            <Card key={goal.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {goal.title}
                  {goal.isShared && <Badge variant="info">Shared</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xs text-slate-500">Target</p>
                  <p className="font-medium">{goal.target}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Actual</label>
                  <Input
                    type="number"
                    defaultValue={ci?.actualAchievement ?? ""}
                    onBlur={(e) =>
                      saveCheckIn(goal.id, +e.target.value, ci?.status || "ON_TRACK")
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Status</label>
                  <Select
                    defaultValue={ci?.status || "NOT_STARTED"}
                    onChange={(e) =>
                      saveCheckIn(
                        goal.id,
                        ci?.actualAchievement ?? 0,
                        e.target.value
                      )
                    }
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="ON_TRACK">On Track</option>
                    <option value="COMPLETED">Completed</option>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Progress</p>
                  <ProgressBar value={ci?.progressScore ?? 0} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}