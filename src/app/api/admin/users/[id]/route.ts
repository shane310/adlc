import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireSystemAdmin } from '@/lib/rbac/authorize';
import { clientIp, handleRouteError, jsonError } from '@/lib/http';
import { getUser, updateUser } from '@/lib/users-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    requireSystemAdmin(await getCurrentUser());
    const user = await getUser(params.id);
    if (!user) return jsonError(404, 'User not found');
    return NextResponse.json(user);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const actor = requireSystemAdmin(await getCurrentUser());
    const body = await req.json();
    const updated = await updateUser(params.id, body, {
      actorId: actor.id,
      ipAddress: clientIp(req.headers),
      userAgent: req.headers.get('user-agent'),
    });
    if (!updated) return jsonError(404, 'User not found');
    return NextResponse.json(updated);
  } catch (err) {
    return handleRouteError(err);
  }
}
