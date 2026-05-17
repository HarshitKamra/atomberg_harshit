"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { THRUST_AREAS } from "@/lib/validations";
import { UserPlus } from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  sheetStatus: string;
  isLocked: boolean;
};

export default function ManagerAssignPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thrustArea, setThrustArea] = useState<string>(THRUST_AREAS[0]);
  const [uomType, setUomType] = useState("NUMERIC");
  const [target, setTarget] = useState(100);
  const [weightage, setWeightage] = useState(10);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/manager/team")
      .then((r) => r.json())
      .then((d) => setTeam(d.team || []));
  }, []);

  const selected = team.find((t) => t.id === employeeId);
  const canAssign =
    selected &&
    !selected.isLocked &&
    selected.sheetStatus !== "APPROVED" &&
    selected.sheetStatus !== "SUBMITTED";

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/manager/assign-goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId,
        goal: { title, description, thrustArea, uomType, target, weightage },
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) {
      setMessage(data.error);
      return;
    }
    setMessage(`Goal assigned to ${selected?.name}. They will see it under My Goals.`);
    setTitle("");
    setDescription("");
  }

  return (
    <DashboardShell
      title="Assign Goal to Employee"
      subtitle="Managers can add goals/tasks to a team member's draft goal sheet"
    >
      <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-5 w-5 text-indigo-600" />
                New assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleAssign}>
                <div>
                  <label className="text-sm font-medium">Team member</label>
                  <Select
                    className="mt-1"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                  >
                    <option value="">Select employee…</option>
                    {team.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.sheetStatus})
                      </option>
                    ))}
                  </Select>
                </div>

                {selected && !canAssign && (
                  <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    {selected.name}&apos;s sheet is {selected.sheetStatus}. You cannot add goals
                    until HR unlocks it or the employee revises a rejected sheet.
                  </p>
                )}

                <div>
                  <label className="text-sm font-medium">Goal / task title</label>
                  <Input
                    className="mt-1"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Complete Q2 product launch"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    className="mt-1"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Thrust area</label>
                    <Select
                      className="mt-1"
                      value={thrustArea}
                      onChange={(e) => setThrustArea(e.target.value)}
                    >
                      {THRUST_AREAS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">UoM</label>
                    <Select
                      className="mt-1"
                      value={uomType}
                      onChange={(e) => setUomType(e.target.value)}
                    >
                      <option value="NUMERIC">Numeric</option>
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="TIMELINE">Timeline</option>
                      <option value="ZERO_BASED">Zero-based</option>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Target</label>
                    <Input
                      type="number"
                      className="mt-1"
                      value={target}
                      onChange={(e) => setTarget(+e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Weightage %</label>
                    <Input
                      type="number"
                      className="mt-1"
                      value={weightage}
                      onChange={(e) => setWeightage(+e.target.value)}
                      min={10}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading || !canAssign || !employeeId}>
                  {loading ? "Assigning…" : "Assign goal to employee"}
                </Button>
                {message && (
                  <p
                    className={`text-sm ${message.includes("assigned") ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {message}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {team.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <span>{m.name}</span>
                  <Badge
                    variant={
                      m.sheetStatus === "DRAFT" || m.sheetStatus === "REJECTED"
                        ? "info"
                        : m.sheetStatus === "APPROVED"
                          ? "success"
                          : "warning"
                    }
                  >
                    {m.sheetStatus}
                  </Badge>
                </div>
              ))}
              <p className="mt-4 text-xs text-slate-500">
                Assign goals when status is <strong>DRAFT</strong> or <strong>REJECTED</strong>.
                Demo: log in as <strong>manager@atomberg.com</strong> and assign to{" "}
                <strong>Vikram Singh</strong> (DRAFT sheet).
              </p>
            </CardContent>
          </Card>
      </div>
    </DashboardShell>
  );
}
