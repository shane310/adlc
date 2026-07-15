import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireSystemAdmin } from '@/lib/rbac/authorize';
import { clientIp, handleRouteError } from '@/lib/http';
import { createUser, listUsers, DuplicateEmailError } from '@/lib/users-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    requireSystemAdmin(await getCurrentUser());
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const result = await listUsers(params);
    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = requireSystemAdmin(await getCurrentUser());
    const body = await req.json();
    const created = await createUser(body, {
      actorId: actor.id,
      ipAddress: clientIp(req.headers),
      userAgent: req.headers.get('user-agent'),
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof DuplicateEmailError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return handleRouteError(err);
  }
}
