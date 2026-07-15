import { AuditLogsTable } from '@/components/admin/AuditLogsTable';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
        <p className="text-sm text-slate-500">
          Search and export the platform&apos;s immutable audit trail (Story 1.10).
        </p>
      </div>
      <AuditLogsTable />
    </div>
  );
}
