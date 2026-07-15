import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { pingRedis } from '@/lib/redis';
import { collectHealthReport, httpStatusFor } from '@/lib/health';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public health check endpoint (AC5) – used by load balancers.
 *   * No authentication.
 *   * Response < 100ms target.
 *   * 200 for healthy/degraded, 503 for unhealthy.
 */
export async function GET() {
  const report = await collectHealthReport({
    database: async () => {
      try {
        await prisma.$queryRawUnsafe('SELECT 1');
        return true;
      } catch {
        return false;
      }
    },
    redisSession: async () => (await pingRedis('session')) !== null,
    redisCache: async () => (await pingRedis('cache')) !== null,
    redisPubSub: async () => (await pingRedis('pubsub')) !== null,
    activeConnections: async () => {
      try {
        return await prisma.session.count({ where: { expires: { gt: new Date() } } });
      } catch {
        return 0;
      }
    },
  });

  return NextResponse.json(report, {
    status: httpStatusFor(report.status),
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Health-Status': report.status,
    },
  });
}
