"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Users, Shield } from "lucide-react";

const demoAccounts = [
  { role: "Employee", email: "employee@atomberg.com", icon: Target },
  { role: "Manager", email: "manager@atomberg.com", icon: Users },
  { role: "Admin", email: "admin@atomberg.com", icon: Shield },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(loginEmail?: string) {
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: loginEmail || email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid credentials");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-slate-950 p-12 text-white lg:flex">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-xl font-bold">A</div>
          <h1 className="mt-8 text-4xl font-bold leading-tight">
            In-House Goal Setting
            <br />
            & Tracking Portal
          </h1>
          <p className="mt-4 max-w-md text-slate-400">
            Align teams, track quarterly achievements, and gain performance visibility —
            built for Atomberg ATOMQUEST Hackathon 1.0
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {["Goal Creation", "Quarterly Check-ins", "HR Analytics"].map((f) => (
            <div key={f} className="rounded-lg border border-slate-800 p-4">
              <p className="font-medium">{f}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to your AtomGoals account</p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@atomberg.com"
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-8">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                Quick demo login
              </p>
              <div className="space-y-2">
                {demoAccounts.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleLogin(acc.email)}
                      className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      <Icon className="h-5 w-5 text-indigo-600" />
                      <div>
                        <p className="text-sm font-medium">{acc.role}</p>
                        <p className="text-xs text-slate-500">{acc.email}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-center text-xs text-slate-400">
                Password for all demo accounts: <strong>demo123</strong>
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}
