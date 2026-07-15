import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireSystemAdmin } from '@/lib/rbac/authorize';
import { clientIp, handleRouteError } from '@/lib/http';
import { getSettings, updateSettings, InvalidSettingValueError, UnknownSettingError } from '@/lib/settings-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    requireSystemAdmin(await getCurrentUser());
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const actor = requireSystemAdmin(await getCurrentUser());
    const body = await req.json();
    const updates = Array.isArray(body?.updates) ? body.updates : [];
    const settings = await updateSettings(updates, {
      id: actor.id,
      ipAddress: clientIp(req.headers),
      userAgent: req.headers.get('user-agent'),
    });
    return NextResponse.json({ settings, message: 'Settings updated successfully' });
  } catch (err) {
    if (err instanceof InvalidSettingValueError || err instanceof UnknownSettingError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return handleRouteError(err);
  }
}
