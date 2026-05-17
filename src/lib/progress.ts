import type { UomDirection, UomType } from "@/lib/db-enums";

export interface ProgressInput {
  uomType: UomType;
  uomDirection: UomDirection;
  target: number;
  actual?: number | null;
  completionDate?: Date | null;
  deadline?: Date | null;
}

/** Compute progress score (0–100) per BRD formulas */
export function calculateProgressScore(input: ProgressInput): number {
  const { uomType, uomDirection, target, actual, completionDate, deadline } =
    input;

  if (uomType === "ZERO_BASED") {
    const val = actual ?? 0;
    return val === 0 ? 100 : 0;
  }

  if (uomType === "TIMELINE") {
    if (!deadline) return 0;
    if (!completionDate) return 0;
    const deadlineTime = new Date(deadline).getTime();
    const completionTime = new Date(completionDate).getTime();
    if (completionTime <= deadlineTime) return 100;
    const overdueDays =
      (completionTime - deadlineTime) / (1000 * 60 * 60 * 24);
    return Math.max(0, 100 - overdueDays * 5);
  }

  const actualVal = actual ?? 0;
  if (target === 0) return 0;

  if (uomDirection === "MIN") {
    return Math.min(100, Math.max(0, (actualVal / target) * 100));
  }

  // MAX — lower is better
  if (actualVal === 0) return 100;
  return Math.min(100, Math.max(0, (target / actualVal) * 100));
}

export function averageProgress(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}
