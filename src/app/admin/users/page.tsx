import { prisma } from '@/lib/db';
import { UsersTable } from '@/components/admin/UsersTable';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const roles = await prisma.role.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">User Management</h1>
        <p className="text-sm text-slate-500">
          Create, view, edit and deactivate platform accounts.
        </p>
      </div>
      <UsersTable roles={roles} />
    </div>
  );
}
