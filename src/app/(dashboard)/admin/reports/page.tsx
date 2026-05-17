"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ReportsPage() {
  return (
    <DashboardShell title="Reports" subtitle="Export achievement and completion data">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-500">
                Planned target vs actual achievement for all employees
              </p>
              <div className="flex gap-2">
                <a href="/api/reports/export?format=csv">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> CSV
                  </Button>
                </a>
                <a href="/api/reports/export?format=xlsx">
                  <Button>
                    <Download className="mr-2 h-4 w-4" /> Excel
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Completion Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                View real-time completion on the HR Dashboard and Analytics pages.
              </p>
            </CardContent>
          </Card>
        </div>
    </DashboardShell>
  );
}