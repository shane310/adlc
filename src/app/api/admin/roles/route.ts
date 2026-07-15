import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireSystemAdmin } from '@/lib/rbac/authorize';
import { handleRouteError } from '@/lib/http';
import { listPermissions, listRoleSummaries } from '@/lib/roles-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    requireSystemAdmin(await getCurrentUser());
    const [roles, permissions] = await Promise.all([listRoleSummaries(), listPermissions()]);
    return NextResponse.json({ roles, permissions });
  } catch (err) {
    return handleRouteError(err);
  }
}
