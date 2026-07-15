import os from 'node:os';

export interface RedisChannelMetrics {
  status: 'up' | 'down';
  latencyMs: number | null;
  keyCount: number | null;
  memoryUsedBytes: number | null;
  hitRate?: number | null;
  subscriptions?: number | null;
}

export interface AdminMetricsInput {
  totalUsers: number;
  activeUsersLast7Days: number;
  activeSessions: number;
  totalApplications: number;
  applicationsThisMonth: number;
  certificatesThisMonth: number;
  recentErrorsLast24h: number;
  failedLoginsLastHour: number;
  slowQueriesLast5min: number;
  averageQueryMs: number | null;
  connectionPool: { active: number; max: number };
  redis: {
    session: RedisChannelMetrics;
    cache: RedisChannelMetrics;
    pubsub: RedisChannelMetrics;
  };
  disk: { usedGb: number; totalGb: number };
}

export interface AdminMetricsAlert {
  level: 'error' | 'warning';
  code:
    | 'db-down'
    | 'redis-down'
    | 'disk-high'
    | 'memory-high'
    | 'errors-high';
  message: string;
}

export interface AdminMetricsResponse extends AdminMetricsInput {
  uptimeSeconds: number;
  uptimeHuman: string;
  memory: { usedBytes: number; totalBytes: number; percent: number };
  timestamp: string;
  alerts: AdminMetricsAlert[];
}

const started = Date.now();

/**
 * Server-side uptime formatting shared by the API and by the dashboard tests –
 * ensures the "Uptime: X% (D days, H hours)"–style copy exercised in AC1
 * has a single source of truth.
 */
export function formatUptime(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days === 1 ? '' : 's'}`);
  if (hours > 0 || days > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
  parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
  return parts.join(', ');
}

export function computeAlerts(input: {
  services: {
    databaseUp: boolean;
    redisSessionUp: boolean;
    redisCacheUp: boolean;
    redisPubSubUp: boolean;
  };
  diskUsagePercent: number;
  memoryUsagePercent: number;
  recentErrorsLastHour: number;
}): AdminMetricsAlert[] {
  const alerts: AdminMetricsAlert[] = [];

  if (!input.services.databaseUp) {
    alerts.push({ level: 'error', code: 'db-down', message: 'Database connection is down.' });
  }
  if (!input.services.redisSessionUp || !input.services.redisCacheUp || !input.services.redisPubSubUp) {
    alerts.push({
      level: 'warning',
      code: 'redis-down',
      message: 'One or more Redis databases are unreachable.',
    });
  }
  if (input.diskUsagePercent > 90) {
    alerts.push({
      level: 'warning',
      code: 'disk-high',
      message: `Disk usage above 90% (${input.diskUsagePercent.toFixed(1)}%).`,
    });
  }
  if (input.memoryUsagePercent > 85) {
    alerts.push({
      level: 'warning',
      code: 'memory-high',
      message: `Memory usage above 85% (${input.memoryUsagePercent.toFixed(1)}%).`,
    });
  }
  if (input.recentErrorsLastHour > 10) {
    alerts.push({
      level: 'warning',
      code: 'errors-high',
      message: `${input.recentErrorsLastHour} errors in the last hour exceeds threshold.`,
    });
  }
  return alerts;
}

export function assembleMetrics(
  input: AdminMetricsInput,
  now: () => Date = () => new Date(),
): AdminMetricsResponse {
  const uptimeSeconds = Math.floor((Date.now() - started) / 1000);
  const totalBytes = os.totalmem();
  const usedBytes = totalBytes - os.freemem();
  const memoryPercent = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;

  const alerts = computeAlerts({
    services: {
      databaseUp: input.connectionPool.active >= 0 && input.connectionPool.max > 0,
      redisSessionUp: input.redis.session.status === 'up',
      redisCacheUp: input.redis.cache.status === 'up',
      redisPubSubUp: input.redis.pubsub.status === 'up',
    },
    diskUsagePercent: input.disk.totalGb === 0 ? 0 : (input.disk.usedGb / input.disk.totalGb) * 100,
    memoryUsagePercent: memoryPercent,
    recentErrorsLastHour: input.recentErrorsLast24h,
  });

  return {
    ...input,
    uptimeSeconds,
    uptimeHuman: formatUptime(uptimeSeconds),
    memory: {
      usedBytes,
      totalBytes,
      percent: Math.round(memoryPercent * 10) / 10,
    },
    timestamp: now().toISOString(),
    alerts,
  };
}
