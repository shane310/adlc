'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MetricCard } from './MetricCard';
import { clsx } from '@/lib/clsx';
import type { AdminMetricsResponse } from '@/lib/metrics';

interface DashboardClientProps {
  initial: AdminMetricsResponse;
}

const ONLINE = '✅ Connected';
const OFFLINE = '❌ Disconnected';

export function DashboardClient({ initial }: DashboardClientProps) {
  const [metrics, setMetrics] = useState<AdminMetricsResponse>(initial);
  const [lastFetchAt, setLastFetchAt] = useState<Date>(() => new Date());
  const [tick, setTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/health', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const next = (await res.json()) as AdminMetricsResponse;
      setMetrics(next);
      setLastFetchAt(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh metrics');
    }
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const secondsAgo = useMemo(() => {
    const diff = Math.max(0, Math.floor((Date.now() - lastFetchAt.getTime()) / 1000));
    return diff;
    // rerender via `tick` state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, lastFetchAt]);

  const dbOnline = metrics.connectionPool.max > 0;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Overview of system health and platform activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span data-testid="last-updated" className="text-xs text-slate-500">
            Last updated: {secondsAgo} second{secondsAgo === 1 ? '' : 's'} ago
          </span>
          <button className="btn" onClick={refresh}>
            Refresh Metrics
          </button>
        </div>
      </header>

      {error ? (
        <div className="badge badge-danger" role="alert">
          {error}
        </div>
      ) : null}

      {metrics.alerts.length > 0 ? (
        <div className="space-y-2">
          {metrics.alerts.map((alert) => (
            <div
              key={alert.code}
              role="alert"
              className={clsx(
                'card px-4 py-2 text-sm',
                alert.level === 'error' ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-amber-300 bg-amber-50 text-amber-800',
              )}
            >
              {alert.message}
            </div>
          ))}
        </div>
      ) : null}

      <section aria-label="System health" className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <MetricCard
          label="Uptime"
          value={metrics.uptimeHuman}
          hint={`${metrics.uptimeSeconds.toLocaleString()} seconds`}
        />
        <MetricCard label="Active Sessions" value={metrics.activeSessions.toLocaleString()} />
        <MetricCard
          label="Database"
          value={dbOnline ? ONLINE : OFFLINE}
          tone={dbOnline ? 'success' : 'danger'}
        />
        <MetricCard
          label="Redis Sessions"
          value={metrics.redis.session.status === 'up' ? ONLINE : OFFLINE}
          hint={metrics.redis.session.keyCount != null ? `${metrics.redis.session.keyCount} keys` : undefined}
          tone={metrics.redis.session.status === 'up' ? 'success' : 'warning'}
        />
        <MetricCard
          label="Redis Cache"
          value={metrics.redis.cache.status === 'up' ? ONLINE : OFFLINE}
          hint={
            metrics.redis.cache.hitRate != null
              ? `Hit rate ${metrics.redis.cache.hitRate}%`
              : undefined
          }
          tone={metrics.redis.cache.status === 'up' ? 'success' : 'warning'}
        />
        <MetricCard
          label="Redis Pub/Sub"
          value={metrics.redis.pubsub.status === 'up' ? ONLINE : OFFLINE}
          hint={
            metrics.redis.pubsub.subscriptions != null
              ? `${metrics.redis.pubsub.subscriptions} subs`
              : undefined
          }
          tone={metrics.redis.pubsub.status === 'up' ? 'success' : 'warning'}
        />
        <MetricCard
          label="Disk Usage"
          value={
            metrics.disk.totalGb === 0
              ? 'n/a'
              : `${metrics.disk.usedGb} GB / ${metrics.disk.totalGb} GB`
          }
        />
        <MetricCard
          label="Memory Usage"
          value={`${metrics.memory.percent}%`}
          hint={`${bytesToGb(metrics.memory.usedBytes)} / ${bytesToGb(metrics.memory.totalBytes)} GB`}
          tone={metrics.memory.percent > 85 ? 'warning' : 'default'}
        />
        <MetricCard
          label="Recent Errors (24h)"
          value={metrics.recentErrorsLast24h.toLocaleString()}
          tone={metrics.recentErrorsLast24h > 10 ? 'warning' : 'default'}
        />
      </section>

      <section aria-label="Application metrics" className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <MetricCard label="Total Users" value={metrics.totalUsers.toLocaleString()} />
        <MetricCard
          label="Active Users (7d)"
          value={metrics.activeUsersLast7Days.toLocaleString()}
        />
        <MetricCard label="Applications (all time)" value={metrics.totalApplications.toLocaleString()} />
        <MetricCard
          label="Applications (this month)"
          value={metrics.applicationsThisMonth.toLocaleString()}
        />
        <MetricCard
          label="Certificates (this month)"
          value={metrics.certificatesThisMonth.toLocaleString()}
        />
      </section>
    </div>
  );
}

function bytesToGb(bytes: number): number {
  return Math.round((bytes / 1024 ** 3) * 10) / 10;
}
