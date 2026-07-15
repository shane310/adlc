import bcrypt from 'bcryptjs';
import type { Prisma, PrismaClient, SystemRole } from '@prisma/client';
import { prisma as defaultPrisma } from './db';
import { diffFields, recordAudit } from './audit';
import { invalidateUserSessions } from './session-store';
import {
  createUserSchema,
  updateUserSchema,
  usersQuerySchema,
  type CreateUserInput,
  type UpdateUserInput,
} from './validation';

const BCRYPT_ROUNDS = 12;

export interface UsersListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  phone: string | null;
  isActive: boolean;
  mfaEnabled: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  role: { id: string; name: SystemRole };
}

export interface UsersListResult {
  data: UsersListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditContext {
  actorId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export function buildUsersWhere(
  raw: Record<string, unknown>,
): { where: Prisma.UserWhereInput; take: number; skip: number; page: number; pageSize: number } {
  const q = usersQuerySchema.parse(raw);
  const where: Prisma.UserWhereInput = {};

  if (q.search) {
    where.OR = [
      { email: { contains: q.search } },
      { firstName: { contains: q.search } },
      { lastName: { contains: q.search } },
    ];
  }
  if (q.role) where.role = { name: q.role };
  if (q.active !== 'all') where.isActive = q.active === 'true';
  if (q.mfa !== 'all') where.mfaEnabled = q.mfa === 'true';

  return {
    where,
    take: q.pageSize,
    skip: (q.page - 1) * q.pageSize,
    page: q.page,
    pageSize: q.pageSize,
  };
}

export async function listUsers(
  raw: Record<string, unknown>,
  client: PrismaClient = defaultPrisma,
): Promise<UsersListResult> {
  const { where, take, skip, page, pageSize } = buildUsersWhere(raw);

  const [total, data] = await client.$transaction([
    client.user.count({ where }),
    client.user.findMany({
      where,
      take,
      skip,
      orderBy: [{ createdAt: 'desc' }],
      include: { role: { select: { id: true, name: true } } },
    }),
  ]);

  return {
    data: data.map(({ hashedPassword: _pw, roleId: _rid, ...rest }) => rest as UsersListItem),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getUser(id: string, client: PrismaClient = defaultPrisma) {
  const user = await client.user.findUnique({
    where: { id },
    include: { role: { select: { id: true, name: true } } },
  });
  if (!user) return null;
  const { hashedPassword: _pw, roleId: _rid, ...rest } = user;
  return rest as UsersListItem;
}

export class DuplicateEmailError extends Error {
  readonly status = 409;
  constructor() {
    super('Email already registered');
    this.name = 'DuplicateEmailError';
  }
}

export async function createUser(
  raw: CreateUserInput,
  ctx: AuditContext,
  client: PrismaClient = defaultPrisma,
): Promise<UsersListItem> {
  const parsed = createUserSchema.parse(raw);

  const existing = await client.user.findUnique({ where: { email: parsed.email } });
  if (existing) throw new DuplicateEmailError();

  const hashedPassword = await bcrypt.hash(parsed.password, BCRYPT_ROUNDS);

  const created = await client.user.create({
    data: {
      email: parsed.email,
      hashedPassword,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      companyName: parsed.companyName ?? null,
      phone: parsed.phone ?? null,
      roleId: parsed.roleId,
    },
    include: { role: { select: { id: true, name: true } } },
  });

  await recordAudit(
    {
      userId: ctx.actorId,
      action: 'user_created',
      resource: 'user',
      resourceId: created.id,
      details: { email: created.email, roleId: created.roleId },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    },
    client,
  );

  const { hashedPassword: _pw, roleId: _rid, ...rest } = created;
  return rest as UsersListItem;
}

export async function updateUser(
  id: string,
  raw: UpdateUserInput,
  ctx: AuditContext,
  client: PrismaClient = defaultPrisma,
): Promise<UsersListItem | null> {
  const parsed = updateUserSchema.parse(raw);
  const before = await client.user.findUnique({ where: { id } });
  if (!before) return null;

  const updated = await client.user.update({
    where: { id },
    data: parsed,
    include: { role: { select: { id: true, name: true } } },
  });

  await recordAudit(
    {
      userId: ctx.actorId,
      action: 'user_updated',
      resource: 'user',
      resourceId: id,
      details: diffFields(before as Record<string, unknown>, parsed),
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    },
    client,
  );

  const { hashedPassword: _pw, roleId: _rid, ...rest } = updated;
  return rest as UsersListItem;
}

export async function setActiveStatus(
  id: string,
  isActive: boolean,
  ctx: AuditContext,
  client: PrismaClient = defaultPrisma,
): Promise<UsersListItem | null> {
  const before = await client.user.findUnique({ where: { id } });
  if (!before) return null;

  const updated = await client.user.update({
    where: { id },
    data: { isActive },
    include: { role: { select: { id: true, name: true } } },
  });

  if (!isActive) {
    try {
      await invalidateUserSessions(id);
    } catch (err) {
      console.warn('[users-service] failed to invalidate sessions', err);
    }
  }

  await recordAudit(
    {
      userId: ctx.actorId,
      action: isActive ? 'user_reactivated' : 'user_deactivated',
      resource: 'user',
      resourceId: id,
      details: { isActive },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    },
    client,
  );

  const { hashedPassword: _pw, roleId: _rid, ...rest } = updated;
  return rest as UsersListItem;
}
