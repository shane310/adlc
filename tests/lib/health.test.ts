import {
  collectHealthReport,
  computeStatus,
  httpStatusFor,
  memoryUsagePercent,
  type HealthProbe,
} from '@/lib/health';

describe('lib/health', () => {
  describe('computeStatus', () => {
    it('returns "healthy" when every service is up', () => {
      expect(
        computeStatus({
          database: 'up',
          redis_session: 'up',
          redis_cache: 'up',
          redis_pubsub: 'up',
        }),
      ).toBe('healthy');
    });

    it('returns "degraded" when the database is up but a Redis DB is down', () => {
      expect(
        computeStatus({
          database: 'up',
          redis_session: 'up',
          redis_cache: 'down',
          redis_pubsub: 'up',
        }),
      ).toBe('degraded');
    });

    it('returns "unhealthy" when the database is down', () => {
      expect(
        computeStatus({
          database: 'down',
          redis_session: 'up',
          redis_cache: 'up',
          redis_pubsub: 'up',
        }),
      ).toBe('unhealthy');
    });
  });

  describe('httpStatusFor', () => {
    it.each([
      ['healthy', 200],
      ['degraded', 200],
      ['unhealthy', 503],
    ] as const)('%s -> %s', (input, expected) => {
      expect(httpStatusFor(input)).toBe(expected);
    });
  });

  describe('memoryUsagePercent', () => {
    it('returns a value between 0 and 100', () => {
      const usage = memoryUsagePercent();
      expect(usage).toBeGreaterThanOrEqual(0);
      expect(usage).toBeLessThanOrEqual(100);
    });
  });

  describe('collectHealthReport', () => {
    const okProbe: HealthProbe = {
      database: async () => true,
      redisSession: async () => true,
      redisCache: async () => true,
      redisPubSub: async () => true,
      activeConnections: async () => 42,
      diskUsagePercent: async () => 12.3,
    };

    it('produces the AC5 JSON contract when everything is up', async () => {
      const report = await collectHealthReport(okProbe, () => new Date('2024-01-15T10:30:00Z'));
      expect(report).toEqual(
        expect.objectContaining({
          status: 'healthy',
          timestamp: '2024-01-15T10:30:00.000Z',
          services: {
            database: 'up',
            redis_session: 'up',
            redis_cache: 'up',
            redis_pubsub: 'up',
          },
        }),
      );
      expect(report.metrics.activeConnections).toBe(42);
      expect(report.metrics.diskUsage).toBe(12.3);
      expect(typeof report.uptime).toBe('number');
    });

    it('marks unhealthy and never throws when the database probe rejects', async () => {
      const brokenProbe: HealthProbe = {
        ...okProbe,
        database: async () => {
          throw new Error('boom');
        },
      };
      const report = await collectHealthReport(brokenProbe);
      expect(report.status).toBe('unhealthy');
      expect(report.services.database).toBe('down');
    });

    it('marks degraded when only a single Redis DB fails', async () => {
      const partial: HealthProbe = {
        ...okProbe,
        redisPubSub: async () => false,
      };
      const report = await collectHealthReport(partial);
      expect(report.status).toBe('degraded');
      expect(report.services.redis_pubsub).toBe('down');
    });

    it('completes within a reasonable time budget', async () => {
      const started = Date.now();
      await collectHealthReport(okProbe);
      expect(Date.now() - started).toBeLessThan(500);
    });
  });
});
