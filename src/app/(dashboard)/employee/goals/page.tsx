"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { GoalEditor, GoalDraft } from "@/components/goals/goal-editor";
import { Badge } from "@/components/ui/badge";

export default function EmployeeGoalsPage() {
  const [sheet, setSheet] = useState<{
    id: string;
    status: string;
    isLocked: boolean;
    goals: GoalDraft[];
  } | null>(null);

  async function load() {
    const res = await fetch("/api/goals");
    const data = await res.json();
    if (data.sheet) {
      setSheet({
        id: data.sheet.id,
        status: data.sheet.status,
        isLocked: data.sheet.isLocked,
        goals: data.sheet.goals.map((g: GoalDraft & { deadline?: string }) => ({
          ...g,
          deadline: g.deadline ? new Date(g.deadline).toISOString() : null,
        })),
      });
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(goals: GoalDraft[]) {
    const res = await fetch("/api/goals/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goals }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    await load();
  }

  async function handleSubmit() {
    await handleSave(sheet?.goals || []);
    const res = await fetch("/api/goals/submit", { method: "POST" });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    await load();
  }

  const readOnly = sheet?.isLocked || sheet?.status === "APPROVED";

  return (
    <DashboardShell
      title="My Goals"
      subtitle="Create and manage your goal sheet for the current cycle"
    >
      {sheet && (
        <div className="mb-4">
          <Badge
            variant={
              sheet.status === "APPROVED"
                ? "success"
                : sheet.status === "REJECTED"
                  ? "danger"
                  : "info"
            }
          >
            Status: {sheet.status}
          </Badge>
        </div>
      )}
      <GoalEditor
        goals={sheet?.goals || []}
        onSave={handleSave}
        onSubmit={
          sheet?.status === "DRAFT" || sheet?.status === "REJECTED"
            ? handleSubmit
            : undefined
        }
        readOnly={readOnly}
        sheetStatus={sheet?.status}
      />
    </DashboardShell>
  );
}
