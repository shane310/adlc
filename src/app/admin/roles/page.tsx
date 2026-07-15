import { listPermissions, listRoleSummaries } from '@/lib/roles-service';
import { RolesGrid } from '@/components/admin/RolesGrid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminRolesPage() {
  const [roles, permissions] = await Promise.all([listRoleSummaries(), listPermissions()]);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Role &amp; Permission Management</h1>
        <p className="text-sm text-slate-500">
          Review the six built-in roles and adjust permissions. SYSTEM_ADMIN is protected.
        </p>
      </div>
      <RolesGrid initialRoles={roles} permissions={permissions} />
    </div>
  );
}
