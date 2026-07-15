import type { PrismaClient } from '@prisma/client';
import { SystemRole } from '@prisma/client';
import { prisma as defaultPrisma } from './db';
import { recordAudit } from './audit';
import { invalidateRolePermissionCache } from './permission-cache';
import { isProtectedRole } from './rbac/defaults';
import { rolePermissionUpdateSchema } from './validation';
import { ForbiddenError } from './rbac/authorize';

export interface RoleSummary {
  id: string;
  name: SystemRole;
  description: string;
  requiresMfa: boolean;
  userCount: number;
  permissions: Array<{ id: string; resource: string; action: string }>;
}

export async function listRoleSummaries(
  client: PrismaClient = defaultPrisma,
): Promise<RoleSummary[]> {
  const roles = await client.role.findMany({
    orderBy: { name: 'asc' },
    include: {
      rolePermissions: { include: { permission: true } },
      _count: { select: { users: true } },
    },
  });

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    requiresMfa: role.requiresMfa,
    userCount: role._count.users,
    permissions: role.rolePermissions
      .map((rp) => ({
        id: rp.permission.id,
        resource: rp.permission.resource,
        action: rp.permission.action,
      }))
      .sort((a, b) =>
        a.resource === b.resource ? a.action.localeCompare(b.action) : a.resource.localeCompare(b.resource),
      ),
  }));
}

export function groupPermissionsByResource<T extends { resource: string; action: string }>(
  permissions: T[],
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};
  for (const perm of permissions) {
    (grouped[perm.resource] ??= []).push(perm);
  }
  for (const key of Object.keys(grouped)) {
    grouped[key]!.sort((a, b) => a.action.localeCompare(b.action));
  }
  return grouped;
}

export interface UpdateRolePermissionsInput {
  add?: string[];
  remove?: string[];
}

export async function updateRolePermissions(
  roleId: string,
  raw: UpdateRolePermissionsInput,
  actor: { id: string; ipAddress?: string | null; userAgent?: string | null },
  client: PrismaClient = defaultPrisma,
) {
  const parsed = rolePermissionUpdateSchema.parse(raw);

  const role = await client.role.findUnique({ where: { id: roleId } });
  if (!role) return null;
  if (isProtectedRole(role.name)) {
    throw new ForbiddenError('SYSTEM_ADMIN role has all permissions by default and cannot be modified');
  }

  await client.$transaction(async (tx) => {
    if (parsed.remove.length > 0) {
      await tx.rolePermission.deleteMany({
        where: { roleId, permissionId: { in: parsed.remove } },
      });
    }
    for (const permissionId of parsed.add) {
      await tx.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        create: { roleId, permissionId },
        update: {},
      });
    }
  });

  try {
    await invalidateRolePermissionCache(roleId);
  } catch (err) {
    console.warn('[roles-service] failed to invalidate permission cache', err);
  }

  await recordAudit(
    {
      userId: actor.id,
      action: 'role_permissions_updated',
      resource: 'role',
      resourceId: roleId,
      details: { added: parsed.add, removed: parsed.remove },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    },
    client,
  );

  return { added: parsed.add.length, removed: parsed.remove.length };
}

export async function listPermissions(client: PrismaClient = defaultPrisma) {
  const permissions = await client.permission.findMany({
    orderBy: [{ resource: 'asc' }, { action: 'asc' }],
  });
  return permissions;
}
