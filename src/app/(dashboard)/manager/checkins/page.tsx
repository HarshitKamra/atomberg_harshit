"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress";

export default function ManagerCheckinsPage() {
  const [team, setTeam] = useState<{ name: string; sheetId?: string }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [sheet, setSheet] = useState<{
    goals: {
      id: string;
      title: string;
      target: number;
      checkIns: {
        quarter: string;
        actualAchievement: number | null;
        progressScore: number | null;
        managerComment?: string;
      }[];
    }[];
  } | null>(null);
  const [quarter, setQuarter] = useState("Q1");

  useEffect(() => {
    fetch("/api/manager/team")
      .then((r) => r.json())
      .then((d) => setTeam(d.team || []));
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/checkins?sheetId=${selected}&quarter=${quarter}`)
      .then((r) => r.json())
      .then((d) => setSheet(d.sheet));
  }, [selected, quarter]);

  async function addComment(goalId: string, comment: string) {
    const ci = sheet?.goals.find((g) => g.id === goalId)?.checkIns[0];
    await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalId,
        quarter,
        actualAchievement: ci?.actualAchievement ?? 0,
        status: "ON_TRACK",
        managerComment: comment,
      }),
    });
  }

  return (
    <DashboardShell title="Team Check-ins" subtitle="Planned vs actual & manager feedback">
      <div className="mb-4 flex gap-2">
        {["Q1", "Q2", "Q3", "Q4"].map((q) => (
          <Button
            key={q}
            size="sm"
            variant={quarter === q ? "default" : "outline"}
            onClick={() => setQuarter(q)}
          >
            {q}
          </Button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {team.map((m) => (
              <button
                key={m.name}
                type="button"
                onClick={() => m.sheetId && setSelected(m.sheetId)}
                className={`w-full rounded-lg border p-3 text-left text-sm transition ${
                  selected === m.sheetId ? "border-indigo-500 bg-indigo-50" : "hover:bg-slate-50"
                }`}
              >
                {m.name}
              </button>
            ))}
          </CardContent>
        </Card>
        <div className="lg:col-span-2 space-y-4">
          {sheet?.goals.map((goal) => {
            const ci = goal.checkIns[0];
            return (
              <Card key={goal.id}>
                <CardHeader>
                  <CardTitle className="text-base">{goal.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex gap-8 text-sm">
                    <div>
                      <p className="text-slate-500">Planned</p>
                      <p className="font-semibold">{goal.target}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Actual</p>
                      <p className="font-semibold">{ci?.actualAchievement ?? "—"}</p>
                    </div>
                    <div className="flex-1">
                      <ProgressBar value={ci?.progressScore ?? 0} />
                    </div>
                  </div>
                  <Textarea
                    placeholder="Check-in comment..."
                    defaultValue={ci?.managerComment || ""}
                    onBlur={(e) => addComment(goal.id, e.target.value)}
                  />
                </CardContent>
              </Card>
            );
          })}
          {!selected && (
            <p className="text-slate-500">Select a team member to view check-ins</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
