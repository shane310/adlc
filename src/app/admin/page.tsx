import { DashboardClient } from '@/components/admin/DashboardClient';
import { assembleMetrics } from '@/lib/metrics';
import { collectAdminMetrics } from '@/lib/metrics-collectors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const input = await collectAdminMetrics();
  const initial = assembleMetrics(input);
  return <DashboardClient initial={initial} />;
}
