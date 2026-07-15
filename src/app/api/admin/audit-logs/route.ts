import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireSystemAdmin } from '@/lib/rbac/authorize';
import { handleRouteError } from '@/lib/http';
import { auditLogsToCsv, listAuditLogs } from '@/lib/audit-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    requireSystemAdmin(await getCurrentUser());
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const wantsCsv = req.nextUrl.searchParams.get('format') === 'csv';
    const result = await listAuditLogs(params);

    if (wantsCsv) {
      const csv = auditLogsToCsv(
        result.entries.map((e) => ({
          createdAt: e.createdAt,
          action: e.action,
          resource: e.resource,
          resourceId: e.resourceId,
          userId: e.userId,
          ipAddress: e.ipAddress,
          details: e.details,
        })),
      );
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'content-type': 'text/csv',
          'content-disposition': `attachment; filename="audit-logs-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err);
  }
}
