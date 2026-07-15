import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from './db';
import { z } from 'zod';

export const auditQuerySchema = z.object({
  search: z.string().max(200).optional(),
  action: z.string().max(80).optional(),
  resource: z.string().max(80).optional(),
  userId: z.string().cuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});

export function buildAuditWhere(raw: Record<string, unknown>) {
  const q = auditQuerySchema.parse(raw);
  const where: Prisma.AuditLogWhereInput = {};

  if (q.action) where.action = q.action;
  if (q.resource) where.resource = q.resource;
  if (q.userId) where.userId = q.userId;
  if (q.from || q.to) {
    where.createdAt = {};
    if (q.from) where.createdAt.gte = new Date(q.from);
    if (q.to) where.createdAt.lte = new Date(q.to);
  }
  if (q.search) {
    where.OR = [
      { action: { contains: q.search } },
      { resource: { contains: q.search } },
      { resourceId: { contains: q.search } },
    ];
  }

  return {
    where,
    take: q.pageSize,
    skip: (q.page - 1) * q.pageSize,
    page: q.page,
    pageSize: q.pageSize,
  };
}

export async function listAuditLogs(
  raw: Record<string, unknown>,
  client: PrismaClient = defaultPrisma,
) {
  const { where, take, skip, page, pageSize } = buildAuditWhere(raw);
  const [total, entries] = await client.$transaction([
    client.auditLog.count({ where }),
    client.auditLog.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true } } },
    }),
  ]);
  return {
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    entries,
  };
}

export function auditLogsToCsv(
  entries: Array<{
    createdAt: Date;
    action: string;
    resource: string;
    resourceId: string | null;
    userId: string | null;
    ipAddress: string | null;
    details: unknown;
  }>,
): string {
  const header = ['createdAt', 'action', 'resource', 'resourceId', 'userId', 'ipAddress', 'details'];
  const rows = entries.map((e) => [
    e.createdAt.toISOString(),
    e.action,
    e.resource,
    e.resourceId ?? '',
    e.userId ?? '',
    e.ipAddress ?? '',
    e.details == null ? '' : JSON.stringify(e.details),
  ]);
  return [header, ...rows].map(csvRow).join('\n');
}

function csvRow(cells: string[]): string {
  return cells
    .map((cell) => {
      if (/[",\n]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
      return cell;
    })
    .join(',');
}
