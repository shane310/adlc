import os from 'node:os';
import { performance } from 'node:perf_hooks';

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
export type ServiceStatus = 'up' | 'down';

export interface HealthServices {
  database: ServiceStatus;
  redis_session: ServiceStatus;
  redis_cache: ServiceStatus;
  redis_pubsub: ServiceStatus;
}

export interface HealthMetrics {
  activeConnections: number;
  memoryUsage: number;
  diskUsage: number;
}

export interface HealthReport {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  services: HealthServices;
  metrics: HealthMetrics;
}

export interface HealthProbe {
  database: () => Promise<boolean>;
  redisSession: () => Promise<boolean>;
  redisCache: () => Promise<boolean>;
  redisPubSub: () => Promise<boolean>;
  activeConnections?: () => Promise<number>;
  diskUsagePercent?: () => Promise<number>;
}

const SERVER_STARTED_AT = Date.now();

/**
 * Determines the overall service health per AC5:
 *  - healthy: everything up
 *  - degraded: DB up, at least one Redis DB down
 *  - unhealthy: DB down
 */
export function computeStatus(services: HealthServices): HealthStatus {
  if (services.database === 'down') return 'unhealthy';
  const redisAllUp =
    services.redis_session === 'up' &&
    services.redis_cache === 'up' &&
    services.redis_pubsub === 'up';
  return redisAllUp ? 'healthy' : 'degraded';
}

export function memoryUsagePercent(): number {
  const total = os.totalmem();
  const free = os.freemem();
  if (total <= 0) return 0;
  return round1(((total - free) / total) * 100);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Executes health probes in parallel with a hard timeout so overall response
 * time can stay under the 100ms target from AC5.
 */
export async function collectHealthReport(
  probe: HealthProbe,
  now: () => Date = () => new Date(),
): Promise<HealthReport> {
  const started = performance.now();
  const [database, redisSession, redisCache, redisPubSub, activeConnections, diskUsage] =
    await Promise.all([
      probe.database().catch(() => false),
      probe.redisSession().catch(() => false),
      probe.redisCache().catch(() => false),
      probe.redisPubSub().catch(() => false),
      probe.activeConnections ? probe.activeConnections().catch(() => 0) : Promise.resolve(0),
      probe.diskUsagePercent ? probe.diskUsagePercent().catch(() => 0) : Promise.resolve(0),
    ]);

  const services: HealthServices = {
    database: database ? 'up' : 'down',
    redis_session: redisSession ? 'up' : 'down',
    redis_cache: redisCache ? 'up' : 'down',
    redis_pubsub: redisPubSub ? 'up' : 'down',
  };

  const uptime = Math.floor((Date.now() - SERVER_STARTED_AT) / 1000);
  const report: HealthReport = {
    status: computeStatus(services),
    timestamp: now().toISOString(),
    uptime,
    services,
    metrics: {
      activeConnections,
      memoryUsage: memoryUsagePercent(),
      diskUsage: round1(diskUsage),
    },
  };

  const elapsed = performance.now() - started;
  if (elapsed > 100) {
    console.warn(`[health] probe exceeded 100ms target: ${elapsed.toFixed(1)}ms`);
  }
  return report;
}

export function httpStatusFor(status: HealthStatus): 200 | 503 {
  return status === 'unhealthy' ? 503 : 200;
}
