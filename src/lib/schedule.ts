import type { PeriodType } from "@/lib/db-enums";

export const SCHEDULE: Record<
  PeriodType,
  { label: string; opensMonth: number; closesMonth?: number; description: string }
> = {
  GOAL_SETTING: {
    label: "Goal Setting",
    opensMonth: 5,
    description: "May — Create, submit & approve goals",
  },
  Q1: {
    label: "Q1 Check-in",
    opensMonth: 7,
    description: "July — Planned vs actual progress",
  },
  Q2: {
    label: "Q2 Check-in",
    opensMonth: 10,
    description: "October — Planned vs actual progress",
  },
  Q3: {
    label: "Q3 Check-in",
    opensMonth: 1,
    description: "January — Planned vs actual progress",
  },
  Q4: {
    label: "Q4 / Annual",
    opensMonth: 3,
    closesMonth: 4,
    description: "March–April — Final achievement capture",
  },
};

export function isDemoMode() {
  return process.env.DEMO_MODE === "true";
}

export function getCurrentPeriod(date = new Date()): PeriodType | null {
  const month = date.getMonth() + 1;
  if (month === 5) return "GOAL_SETTING";
  if (month === 7) return "Q1";
  if (month === 10) return "Q2";
  if (month === 1) return "Q3";
  if (month === 3 || month === 4) return "Q4";
  return null;
}

export function isPeriodActive(
  period: PeriodType,
  date = new Date(),
  windowOverrides?: { period: string; isOpen: boolean }[]
): boolean {
  if (isDemoMode()) return true;

  const override = windowOverrides?.find((w) => w.period === period);
  if (override !== undefined) return override.isOpen;

  const current = getCurrentPeriod(date);
  return current === period;
}

export function periodToQuarter(period: PeriodType): "Q1" | "Q2" | "Q3" | "Q4" | null {
  if (period === "Q1") return "Q1";
  if (period === "Q2") return "Q2";
  if (period === "Q3") return "Q3";
  if (period === "Q4") return "Q4";
  return null;
}
