export type Role = "EMPLOYEE" | "MANAGER" | "ADMIN";
export type GoalSheetStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
export type UomType = "NUMERIC" | "PERCENTAGE" | "TIMELINE" | "ZERO_BASED";
export type UomDirection = "MIN" | "MAX";
export type GoalStatus = "NOT_STARTED" | "ON_TRACK" | "COMPLETED";
export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";
export type PeriodType = "GOAL_SETTING" | "Q1" | "Q2" | "Q3" | "Q4";
export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "SUBMIT"
  | "APPROVE"
  | "REJECT"
  | "UNLOCK"
  | "CHECK_IN";

export const Role = {
  EMPLOYEE: "EMPLOYEE" as Role,
  MANAGER: "MANAGER" as Role,
  ADMIN: "ADMIN" as Role,
};

export const PeriodType = {
  GOAL_SETTING: "GOAL_SETTING" as PeriodType,
  Q1: "Q1" as PeriodType,
  Q2: "Q2" as PeriodType,
  Q3: "Q3" as PeriodType,
  Q4: "Q4" as PeriodType,
};
