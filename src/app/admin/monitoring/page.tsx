import { DashboardClient } from '@/components/admin/DashboardClient';
import { assembleMetrics } from '@/lib/metrics';
import { collectAdminMetrics } from '@/lib/metrics-collectors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminMonitoringPage() {
  const initial = assembleMetrics(await collectAdminMetrics());
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">System Monitoring</h1>
      <p className="text-sm text-slate-500">
        Real-time database, Redis and server metrics with alerts. Auto-refreshes every 30
        seconds.
      </p>
      <DashboardClient initial={initial} />
    </div>
  );
}
