"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GoalDraft } from "@/components/goals/goal-editor";

export default function ManagerApprovalsPage() {
  const [pending, setPending] = useState<
    {
      id: string;
      name: string;
      sheetId: string;
      goals: GoalDraft[];
    }[]
  >([]);

  useEffect(() => {
    fetch("/api/manager/team")
      .then((r) => r.json())
      .then(async (d) => {
        const submitted = (d.team || []).filter(
          (t: { sheetStatus: string }) => t.sheetStatus === "SUBMITTED"
        );
        const details = await Promise.all(
          submitted.map(async (t: { sheetId: string; name: string }) => {
            const res = await fetch(`/api/checkins?sheetId=${t.sheetId}`);
            const data = await res.json();
            return {
              id: t.sheetId,
              name: t.name,
              sheetId: t.sheetId,
              goals: data.sheet?.goals || [],
            };
          })
        );
        setPending(details);
      });
  }, []);

  async function approve(sheetId: string, goals: GoalDraft[]) {
    const res = await fetch("/api/manager/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheetId, action: "approve", goals }),
    });
    const data = await res.json();
    if (data.error) alert(data.error);
    else window.location.reload();
  }

  async function reject(sheetId: string) {
    const note = prompt("Rejection reason:");
    const res = await fetch("/api/manager/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheetId, action: "reject", rejectionNote: note }),
    });
    if ((await res.json()).error) alert("Failed");
    else window.location.reload();
  }

  return (
    <DashboardShell title="Goal Approvals" subtitle="Review and approve team goal sheets">
      {pending.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No pending approvals
          </CardContent>
        </Card>
      ) : (
        pending.map((item) => (
          <Card key={item.sheetId} className="mb-4">
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {item.goals.map((g, i) => (
                  <div key={g.id || i} className="flex flex-wrap items-center gap-4 rounded-lg border p-3">
                      <div className="flex-1">
                        <p className="font-medium">{g.title}</p>
                        <p className="text-xs text-slate-500">{g.thrustArea}</p>
                        {g.isShared && <Badge variant="info">Shared — target locked</Badge>}
                      </div>
                      {!g.isShared && (
                        <Input
                          type="number"
                          className="w-24"
                          defaultValue={g.target}
                          onChange={(e) => {
                            item.goals[i].target = +e.target.value;
                          }}
                        />
                      )}
                      <Input
                        type="number"
                        className="w-20"
                        defaultValue={g.weightage}
                        onChange={(e) => {
                          item.goals[i].weightage = +e.target.value;
                        }}
                      />
                      <span className="text-xs text-slate-400">% weight</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => approve(item.sheetId, item.goals)}>Approve</Button>
                <Button variant="destructive" onClick={() => reject(item.sheetId)}>
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </DashboardShell>
  );
}