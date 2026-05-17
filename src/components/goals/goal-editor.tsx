"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { THRUST_AREAS, MAX_GOALS, TOTAL_WEIGHTAGE, MIN_WEIGHTAGE } from "@/lib/validations";
import { Plus, Trash2, Lock } from "lucide-react";

export type GoalDraft = {
  id?: string;
  thrustArea: string;
  title: string;
  description?: string;
  uomType: string;
  uomDirection: string;
  target: number;
  weightage: number;
  deadline?: string | null;
  isShared?: boolean;
  sharedGoalId?: string | null;
};

export function GoalEditor({
  goals: initial,
  onSave,
  onSubmit,
  readOnly = false,
  sheetStatus,
}: {
  goals: GoalDraft[];
  onSave: (goals: GoalDraft[]) => Promise<void>;
  onSubmit?: () => Promise<void>;
  readOnly?: boolean;
  sheetStatus?: string;
}) {
  const [goals, setGoals] = useState<GoalDraft[]>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const totalWeight = goals.reduce((s, g) => s + (g.weightage || 0), 0);

  function addGoal() {
    if (goals.length >= MAX_GOALS) return;
    setGoals([
      ...goals,
      {
        thrustArea: THRUST_AREAS[0],
        title: "",
        description: "",
        uomType: "NUMERIC",
        uomDirection: "MIN",
        target: 0,
        weightage: MIN_WEIGHTAGE,
      },
    ]);
  }

  function updateGoal(i: number, patch: Partial<GoalDraft>) {
    setGoals(goals.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));
  }

  function removeGoal(i: number) {
    const g = goals[i];
    if (g.isShared) return;
    setGoals(goals.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      await onSave(goals);
      setMessage("Goals saved");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed");
    }
    setSaving(false);
  }

  const canEdit = !readOnly && sheetStatus !== "SUBMITTED" && sheetStatus !== "APPROVED";

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Total weightage:{" "}
              <span
                className={
                  Math.abs(totalWeight - TOTAL_WEIGHTAGE) < 0.01
                    ? "font-semibold text-emerald-600"
                    : "font-semibold text-red-600"
                }
              >
                {totalWeight}%
              </span>{" "}
              / {TOTAL_WEIGHTAGE}%
            </p>
            <p className="text-xs text-slate-400">
              Min {MIN_WEIGHTAGE}% per goal · Max {MAX_GOALS} goals
            </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={addGoal} disabled={goals.length >= MAX_GOALS}>
              <Plus className="h-4 w-4" /> Add Goal
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Draft"}
            </Button>
            {onSubmit && (
              <Button variant="success" onClick={onSubmit} disabled={saving}>
                Submit for Approval
              </Button>
            )}
          </div>
        )}
      </div>

      {message && (
        <p className={`text-sm ${message.includes("saved") || message.includes("Success") ? "text-emerald-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No goals yet. Add your first goal to get started.
          </CardContent>
        </Card>
      ) : (
        goals.map((goal, i) => (
          <Card key={goal.id || i}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                Goal {i + 1}
                {goal.isShared && (
                  <Badge variant="info" className="ml-2">
                    <Lock className="mr-1 inline h-3 w-3" /> Shared KPI
                  </Badge>
                )}
              </CardTitle>
              {canEdit && !goal.isShared && (
                <Button variant="ghost" size="sm" onClick={() => removeGoal(i)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-500">Thrust Area</label>
                <Select
                  value={goal.thrustArea}
                  disabled={!canEdit || goal.isShared}
                  onChange={(e) => updateGoal(i, { thrustArea: e.target.value })}
                  className="mt-1"
                >
                  {THRUST_AREAS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">UoM Type</label>
                <Select
                  value={goal.uomType}
                  disabled={!canEdit || goal.isShared}
                  onChange={(e) => updateGoal(i, { uomType: e.target.value })}
                  className="mt-1"
                >
                  <option value="NUMERIC">Numeric</option>
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="TIMELINE">Timeline</option>
                  <option value="ZERO_BASED">Zero-based</option>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-500">Title</label>
                <Input
                  value={goal.title}
                  disabled={!canEdit || goal.isShared}
                  onChange={(e) => updateGoal(i, { title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-500">Description</label>
                <Textarea
                  value={goal.description || ""}
                  disabled={!canEdit || goal.isShared}
                  onChange={(e) => updateGoal(i, { description: e.target.value })}
                  className="mt-1"
                />
              </div>
              {(goal.uomType === "NUMERIC" || goal.uomType === "PERCENTAGE") && (
                <div>
                  <label className="text-xs font-medium text-slate-500">Direction</label>
                  <Select
                    value={goal.uomDirection}
                    disabled={!canEdit || goal.isShared}
                    onChange={(e) => updateGoal(i, { uomDirection: e.target.value })}
                    className="mt-1"
                  >
                    <option value="MIN">Higher is better (Min)</option>
                    <option value="MAX">Lower is better (Max)</option>
                  </Select>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-slate-500">Target</label>
                <Input
                  type="number"
                  value={goal.target}
                  disabled={!canEdit || goal.isShared}
                  onChange={(e) => updateGoal(i, { target: +e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Weightage %</label>
                <Input
                  type="number"
                  value={goal.weightage}
                  disabled={!canEdit}
                  onChange={(e) => updateGoal(i, { weightage: +e.target.value })}
                  className="mt-1"
                />
              </div>
              {goal.uomType === "TIMELINE" && (
                <div>
                  <label className="text-xs font-medium text-slate-500">Deadline</label>
                  <Input
                    type="date"
                    value={goal.deadline?.slice(0, 10) || ""}
                    disabled={!canEdit || goal.isShared}
                    onChange={(e) => updateGoal(i, { deadline: e.target.value })}
                    className="mt-1"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}