import { z } from "zod";

export const MIN_WEIGHTAGE = 10;
export const MAX_GOALS = 8;
export const TOTAL_WEIGHTAGE = 100;

export const goalSchema = z.object({
  thrustArea: z.string().min(1, "Thrust area is required"),
  title: z.string().min(1, "Goal title is required"),
  description: z.string().optional(),
  uomType: z.enum(["NUMERIC", "PERCENTAGE", "TIMELINE", "ZERO_BASED"]),
  uomDirection: z.enum(["MIN", "MAX"]).default("MIN"),
  target: z.number().min(0, "Target must be non-negative"),
  weightage: z
    .number()
    .min(MIN_WEIGHTAGE, `Minimum weightage is ${MIN_WEIGHTAGE}%`)
    .max(100),
  deadline: z.string().optional().nullable(),
});

export const goalsArraySchema = z
  .array(goalSchema)
  .max(MAX_GOALS, `Maximum ${MAX_GOALS} goals allowed`)
  .refine(
    (goals) => {
      const total = goals.reduce((sum, g) => sum + g.weightage, 0);
      return Math.abs(total - TOTAL_WEIGHTAGE) < 0.01;
    },
    { message: `Total weightage must equal ${TOTAL_WEIGHTAGE}%` }
  )
  .refine(
    (goals) => goals.every((g) => g.weightage >= MIN_WEIGHTAGE),
    { message: `Each goal must have at least ${MIN_WEIGHTAGE}% weightage` }
  );

export function validateGoals(goals: { weightage: number }[]) {
  const errors: string[] = [];
  if (goals.length > MAX_GOALS) {
    errors.push(`Maximum ${MAX_GOALS} goals allowed`);
  }
  const total = goals.reduce((s, g) => s + g.weightage, 0);
  if (Math.abs(total - TOTAL_WEIGHTAGE) > 0.01) {
    errors.push(`Total weightage must be ${TOTAL_WEIGHTAGE}% (currently ${total}%)`);
  }
  for (const g of goals) {
    if (g.weightage < MIN_WEIGHTAGE) {
      errors.push(`Each goal needs at least ${MIN_WEIGHTAGE}% weightage`);
      break;
    }
  }
  return errors;
}

export const THRUST_AREAS = [
  "Revenue Growth",
  "Customer Experience",
  "Operational Excellence",
  "Innovation & Digital",
  "People & Culture",
  "Quality & Compliance",
  "Cost Optimization",
  "Sustainability",
] as const;
