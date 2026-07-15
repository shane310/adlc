import { computeAlerts, formatUptime } from '@/lib/metrics';

describe('lib/metrics', () => {
  describe('formatUptime', () => {
    it('formats minutes only when uptime is under an hour', () => {
      expect(formatUptime(45 * 60)).toBe('45 minutes');
    });

    it('formats days and hours', () => {
      const uptime = 14 * 86_400 + 3 * 3600 + 5 * 60;
      expect(formatUptime(uptime)).toBe('14 days, 3 hours, 5 minutes');
    });

    it('handles zero seconds', () => {
      expect(formatUptime(0)).toBe('0 minutes');
    });

    it('clamps negative values to zero', () => {
      expect(formatUptime(-500)).toBe('0 minutes');
    });
  });

  describe('computeAlerts', () => {
    const base = {
      services: {
        databaseUp: true,
        redisSessionUp: true,
        redisCacheUp: true,
        redisPubSubUp: true,
      },
      diskUsagePercent: 50,
      memoryUsagePercent: 50,
      recentErrorsLastHour: 0,
    };

    it('returns no alerts when everything is nominal', () => {
      expect(computeAlerts(base)).toEqual([]);
    });

    it('emits a red database alert when DB is down', () => {
      const alerts = computeAlerts({ ...base, services: { ...base.services, databaseUp: false } });
      expect(alerts).toContainEqual(expect.objectContaining({ level: 'error', code: 'db-down' }));
    });

    it('emits a yellow warning when any Redis DB is down', () => {
      const alerts = computeAlerts({
        ...base,
        services: { ...base.services, redisCacheUp: false },
      });
      expect(alerts).toContainEqual(expect.objectContaining({ level: 'warning', code: 'redis-down' }));
    });

    it('flags disk > 90%, memory > 85%, and error spikes', () => {
      const alerts = computeAlerts({
        ...base,
        diskUsagePercent: 91,
        memoryUsagePercent: 88,
        recentErrorsLastHour: 25,
      });
      const codes = alerts.map((a) => a.code);
      expect(codes).toEqual(expect.arrayContaining(['disk-high', 'memory-high', 'errors-high']));
    });
  });
});
