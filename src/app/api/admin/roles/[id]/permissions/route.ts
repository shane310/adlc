import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireSystemAdmin } from '@/lib/rbac/authorize';
import { clientIp, handleRouteError, jsonError } from '@/lib/http';
import { updateRolePermissions } from '@/lib/roles-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const actor = requireSystemAdmin(await getCurrentUser());
    const body = await req.json();
    const result = await updateRolePermissions(params.id, body, {
      id: actor.id,
      ipAddress: clientIp(req.headers),
      userAgent: req.headers.get('user-agent'),
    });
    if (!result) return jsonError(404, 'Role not found');
    return NextResponse.json({ ...result, message: 'Role permissions updated successfully' });
  } catch (err) {
    return handleRouteError(err);
  }
}
