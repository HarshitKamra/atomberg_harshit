import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ArchitecturePage() {
  return (
    <DashboardShell
      title="Architecture"
      subtitle="Technology stack, schema, and deployment"
    >
      <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tech Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p><strong>Frontend:</strong> Next.js 14, React, Tailwind CSS, Recharts</p>
              <p><strong>Backend:</strong> Next.js API Routes, Prisma ORM</p>
              <p><strong>Database:</strong> PostgreSQL (Neon + Prisma)</p>
              <p><strong>Auth:</strong> NextAuth.js (JWT, credentials)</p>
              <p><strong>Export:</strong> SheetJS (xlsx) for CSV/Excel reports</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recommended Deployment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p><strong>App:</strong> Vercel or Azure App Service</p>
              <p><strong>DB:</strong> Neon / Supabase / Azure PostgreSQL</p>
              <p><strong>CI/CD:</strong> GitHub Actions</p>
              <p><strong>SSO (bonus):</strong> Microsoft Entra ID via NextAuth Azure AD provider</p>
            </CardContent>
          </Card>
        </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Entity Relationship Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-300">
{`Department ──< User (Employee/Manager/Admin)
                    │
                    ├──< GoalSheet ──< Goal ──< QuarterlyCheckIn
                    │         │
Cycle ──────────────┘         └── SharedGoal (departmental KPI)
    │
    └── CheckInWindow (GOAL_SETTING, Q1–Q4)

AuditLog ── tracks all post-lock changes
Notification / Escalation ── workflow alerts`}
          </pre>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Feature Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
            <li className="text-emerald-600">Phase 1: Goal creation, validation, manager approval, shared goals</li>
            <li className="text-emerald-600">Phase 2: Quarterly check-ins, progress engine, manager comments</li>
            <li className="text-emerald-600">Reporting, audit trail, HR analytics dashboards</li>
            <li>Microsoft Entra ID SSO & org hierarchy sync</li>
            <li>Email / Teams notifications & adaptive cards</li>
            <li>Rule-based escalation engine</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Folder Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-slate-50 p-4 text-xs text-slate-700">
{`src/
├── app/
│   ├── api/          # REST endpoints
│   ├── (dashboard)/  # Role-based pages
│   └── login/
├── components/       # UI + goal editor
└── lib/              # Auth, prisma, progress, schedule
prisma/
├── schema.prisma
└── seed.ts`}
          </pre>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}