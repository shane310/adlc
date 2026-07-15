import bcrypt from 'bcryptjs';
import { PrismaClient, SystemRole } from '@prisma/client';
import { DEFAULT_ROLE_DEFINITIONS, DEFAULT_PERMISSIONS } from '../src/lib/rbac/defaults';

const prisma = new PrismaClient();

async function main() {
  for (const perm of DEFAULT_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { resource_action: { resource: perm.resource, action: perm.action } },
      update: {},
      create: perm,
    });
  }

  for (const roleDef of DEFAULT_ROLE_DEFINITIONS) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { description: roleDef.description, requiresMfa: roleDef.requiresMfa },
      create: {
        name: roleDef.name,
        description: roleDef.description,
        requiresMfa: roleDef.requiresMfa,
      },
    });

    const permissions =
      roleDef.name === SystemRole.SYSTEM_ADMIN
        ? await prisma.permission.findMany()
        : await prisma.permission.findMany({
            where: { OR: roleDef.permissions.map((p) => ({ resource: p.resource, action: p.action })) },
          });

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    for (const p of permissions) {
      await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: p.id } });
    }
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: SystemRole.SYSTEM_ADMIN } });
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@nisit.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe!2024#Admin';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      hashedPassword: await bcrypt.hash(adminPassword, 12),
      firstName: 'Platform',
      lastName: 'Administrator',
      roleId: adminRole.id,
      mfaEnabled: true,
      isActive: true,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
