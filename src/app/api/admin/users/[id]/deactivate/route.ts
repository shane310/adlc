import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireSystemAdmin } from '@/lib/rbac/authorize';
import { clientIp, handleRouteError, jsonError } from '@/lib/http';
import { setActiveStatus } from '@/lib/users-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

/**
 * POST /api/admin/users/:id/deactivate      -> isActive=false + kill sessions
 * DELETE /api/admin/users/:id/deactivate    -> isActive=true (reactivate)
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  return toggleActive(req, params.id, false);
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  return toggleActive(req, params.id, true);
}

async function toggleActive(req: NextRequest, id: string, target: boolean) {
  try {
    const actor = requireSystemAdmin(await getCurrentUser());
    if (actor.id === id && !target) {
      return jsonError(400, 'You cannot deactivate your own account');
    }
    const updated = await setActiveStatus(id, target, {
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
