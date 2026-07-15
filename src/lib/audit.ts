import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from './db';

export interface AuditEntry {
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Record an immutable audit log entry. Failures are logged but do not throw –
 * audit writes must never break the primary user action (Story 1.10).
 */
export async function recordAudit(
  entry: AuditEntry,
  client: PrismaClient = defaultPrisma,
): Promise<void> {
  try {
    await client.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId ?? null,
        details: entry.details ?? undefined,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
      },
    });
  } catch (err) {
    console.error('[audit] failed to persist entry', { entry, err });
  }
}

export function diffFields<T extends Record<string, unknown>>(
  before: T,
  after: Partial<T>,
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(after) as (keyof T)[]) {
    if (after[key] !== undefined && before[key] !== after[key]) {
      diff[String(key)] = { from: before[key], to: after[key] };
    }
  }
  return diff;
}
