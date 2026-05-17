"use client";

import { Sidebar } from "./sidebar";

export function DashboardShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {(title || subtitle) && (
          <header className="border-b border-slate-200 bg-white px-8 py-6">
            {title && <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>}
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </header>
        )}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
