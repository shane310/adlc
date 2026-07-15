import { statfs } from 'node:fs/promises';
import { prisma } from './db';
import { getRedis, pingRedis, type RedisChannel } from './redis';
import type { AdminMetricsInput, RedisChannelMetrics } from './metrics';

async function inspectRedisChannel(channel: RedisChannel): Promise<RedisChannelMetrics> {
  const latency = await pingRedis(channel);
  if (latency === null) {
    return { status: 'down', latencyMs: null, keyCount: null, memoryUsedBytes: null };
  }

  const client = getRedis(channel);
  try {
    const dbsize = await client.dbsize();
    const info = await client.info('memory');
    const memMatch = info.match(/used_memory:(\d+)/);
    const memoryBytes = memMatch ? Number(memMatch[1]) : null;

    if (channel === 'cache') {
      const stats = await client.info('stats');
      const hits = Number(stats.match(/keyspace_hits:(\d+)/)?.[1] ?? 0);
      const misses = Number(stats.match(/keyspace_misses:(\d+)/)?.[1] ?? 0);
      const total = hits + misses;
      const hitRate = total > 0 ? Math.round((hits / total) * 1000) / 10 : null;
      return { status: 'up', latencyMs: latency, keyCount: dbsize, memoryUsedBytes: memoryBytes, hitRate };
    }

    if (channel === 'pubsub') {
      const clients = await client.info('clients');
      const pubsub = Number(clients.match(/pubsub_clients:(\d+)/)?.[1] ?? 0);
      return {
        status: 'up',
        latencyMs: latency,
        keyCount: dbsize,
        memoryUsedBytes: memoryBytes,
        subscriptions: pubsub,
      };
    }

    return { status: 'up', latencyMs: latency, keyCount: dbsize, memoryUsedBytes: memoryBytes };
  } catch {
    return { status: 'up', latencyMs: latency, keyCount: null, memoryUsedBytes: null };
  }
}

async function diskUsage(path = process.cwd()): Promise<{ usedGb: number; totalGb: number }> {
  try {
    const stats = await statfs(path);
    const total = stats.blocks * stats.bsize;
    const free = stats.bfree * stats.bsize;
    const used = total - free;
    const gb = (n: number) => Math.round((n / 1024 ** 3) * 10) / 10;
    return { usedGb: gb(used), totalGb: gb(total) };
  } catch {
    return { usedGb: 0, totalGb: 0 };
  }
}

async function count<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

/**
 * Collects the full metrics payload the admin dashboard renders. Each probe
 * is guarded so a single downstream failure does not blank out the entire UI.
 */
export async function collectAdminMetrics(): Promise<AdminMetricsInput> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000);
  const oneHourAgo = new Date(now.getTime() - 3_600_000);
  const oneDayAgo = new Date(now.getTime() - 86_400_000);

  const [
    totalUsers,
    activeUsersLast7Days,
    activeSessions,
    totalApplications,
    applicationsThisMonth,
    certificatesThisMonth,
    recentErrorsLast24h,
    failedLoginsLastHour,
    redisSession,
    redisCache,
    redisPubSub,
    disk,
  ] = await Promise.all([
    count(prisma.user.count(), 0),
    count(prisma.user.count({ where: { lastLoginAt: { gte: sevenDaysAgo } } }), 0),
    count(prisma.session.count({ where: { expires: { gt: now } } }), 0),
    count(prisma.auditLog.count({ where: { action: 'application_created' } }), 0),
    count(
      prisma.auditLog.count({
        where: { action: 'application_created', createdAt: { gte: startOfMonth } },
      }),
      0,
    ),
    count(
      prisma.auditLog.count({
        where: { action: 'certificate_issued', createdAt: { gte: startOfMonth } },
      }),
      0,
    ),
    count(
      prisma.auditLog.count({
        where: { action: { contains: 'error' }, createdAt: { gte: oneDayAgo } },
      }),
      0,
    ),
    count(
      prisma.auditLog.count({
        where: { action: 'user_signin_failed', createdAt: { gte: oneHourAgo } },
      }),
      0,
    ),
    inspectRedisChannel('session'),
    inspectRedisChannel('cache'),
    inspectRedisChannel('pubsub'),
    diskUsage(),
  ]);

  return {
    totalUsers,
    activeUsersLast7Days,
    activeSessions,
    totalApplications,
    applicationsThisMonth,
    certificatesThisMonth,
    recentErrorsLast24h,
    failedLoginsLastHour,
    slowQueriesLast5min: 0,
    averageQueryMs: null,
    connectionPool: { active: activeSessions, max: 5 },
    redis: { session: redisSession, cache: redisCache, pubsub: redisPubSub },
    disk,
  };
}
