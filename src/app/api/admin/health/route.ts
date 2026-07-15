import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireSystemAdmin } from '@/lib/rbac/authorize';
import { handleRouteError } from '@/lib/http';
import { assembleMetrics } from '@/lib/metrics';
import { collectAdminMetrics } from '@/lib/metrics-collectors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin-only detailed metrics endpoint (AC1 + AC4). Data auto-refreshed by
 * the dashboard every 30 seconds.
 */
export async function GET() {
  try {
    requireSystemAdmin(await getCurrentUser());
    const input = await collectAdminMetrics();
    return NextResponse.json(assembleMetrics(input), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
