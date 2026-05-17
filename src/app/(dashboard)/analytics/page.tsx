"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

export default function AnalyticsPage() {
  const [data, setData] = useState<{
    byThrust: { name: string; value: number }[];
    byUom: { name: string; value: number }[];
    qoqTrend: { quarter: string; avg: number }[];
    heatmap: { name: string; department: string; progress: number }[];
    managerStats: { name: string; completed: number; total: number }[];
    completionRate: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <DashboardShell title="Analytics">
        <p className="text-slate-500">Loading analytics...</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Analytics" subtitle="QoQ trends, distribution & completion heatmaps">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quarter-on-Quarter Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.qoqTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="quarter" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Goals by Thrust Area</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byThrust}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>UoM Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.byUom} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {data.byUom.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manager Effectiveness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.managerStats.map((m) => (
                <div key={m.name} className="flex justify-between text-sm">
                  <span>{m.name}</span>
                  <span className="font-medium">
                    {m.completed}/{m.total} approved
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Progress Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.heatmap.map((h) => (
              <div
                key={h.name}
                className="rounded-lg border p-3"
                style={{
                  backgroundColor: `rgba(99, 102, 241, ${Math.min(h.progress / 100, 1) * 0.2})`,
                }}
              >
                <p className="font-medium text-sm">{h.name}</p>
                <p className="text-xs text-slate-500">{h.department}</p>
                <p className="mt-1 text-lg font-bold">{h.progress.toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}