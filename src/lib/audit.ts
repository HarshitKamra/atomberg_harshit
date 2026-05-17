import type { AuditAction } from "@/lib/db-enums";
import { prisma } from "./prisma";

export async function logAudit(params: {
  userId: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
}) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      beforeData: params.before ? JSON.stringify(params.before) : null,
      afterData: params.after ? JSON.stringify(params.after) : null,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
}
