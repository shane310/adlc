'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

interface AuditEntry {
  id: string;
  createdAt: string;
  action: string;
  resource: string;
  resourceId: string | null;
  userId: string | null;
  ipAddress: string | null;
  details: unknown;
  user?: { id: string; email: string } | null;
}

interface AuditQuery {
  search: string;
  action: string;
  resource: string;
  from: string;
  to: string;
  page: number;
}

const DEFAULT_QUERY: AuditQuery = {
  search: '',
  action: '',
  resource: '',
  from: '',
  to: '',
  page: 1,
};

export function AuditLogsTable() {
  const [query, setQuery] = useState<AuditQuery>(DEFAULT_QUERY);
  const [data, setData] = useState<{
    entries: AuditEntry[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchString = useMemo(() => {
    const params = new URLSearchParams();
    if (query.search) params.set('search', query.search);
    if (query.action) params.set('action', query.action);
    if (query.resource) params.set('resource', query.resource);
    if (query.from) params.set('from', new Date(query.from).toISOString());
    if (query.to) params.set('to', new Date(query.to).toISOString());
    params.set('page', String(query.page));
    return params.toString();
  }, [query]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/audit-logs?${searchString}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    }
  }, [searchString]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col text-xs">
          Search
          <input
            className="w-64 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            value={query.search}
            onChange={(e) => setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))}
          />
        </label>
        <label className="flex flex-col text-xs">
          Action
          <input
            className="w-40 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            value={query.action}
            onChange={(e) => setQuery((q) => ({ ...q, action: e.target.value, page: 1 }))}
          />
        </label>
        <label className="flex flex-col text-xs">
          Resource
          <input
            className="w-40 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            value={query.resource}
            onChange={(e) => setQuery((q) => ({ ...q, resource: e.target.value, page: 1 }))}
          />
        </label>
        <label className="flex flex-col text-xs">
          From
          <input
            type="datetime-local"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            value={query.from}
            onChange={(e) => setQuery((q) => ({ ...q, from: e.target.value, page: 1 }))}
          />
        </label>
        <label className="flex flex-col text-xs">
          To
          <input
            type="datetime-local"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            value={query.to}
            onChange={(e) => setQuery((q) => ({ ...q, to: e.target.value, page: 1 }))}
          />
        </label>
        <a
          className="btn btn-primary self-end"
          href={`/api/admin/audit-logs?${searchString}&format=csv`}
          data-testid="export-csv"
        >
          Export CSV
        </a>
      </div>

      {error ? (
        <div className="badge badge-danger" role="alert">
          {error}
        </div>
      ) : null}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Timestamp</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Resource</th>
              <th className="px-3 py-2">Resource ID</th>
              <th className="px-3 py-2">IP</th>
              <th className="px-3 py-2">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-3 py-2 text-slate-500">
                  {new Date(entry.createdAt).toISOString()}
                </td>
                <td className="px-3 py-2">{entry.user?.email ?? entry.userId ?? '—'}</td>
                <td className="px-3 py-2 font-medium">{entry.action}</td>
                <td className="px-3 py-2">{entry.resource}</td>
                <td className="px-3 py-2 text-slate-500">{entry.resourceId ?? '—'}</td>
                <td className="px-3 py-2 text-slate-500">{entry.ipAddress ?? '—'}</td>
                <td className="px-3 py-2 text-slate-500">
                  <code className="text-xs">
                    {entry.details == null ? '' : JSON.stringify(entry.details)}
                  </code>
                </td>
              </tr>
            ))}
            {data && data.entries.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-slate-500" colSpan={7}>
                  No entries match the current filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {data ? (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {data.page} of {data.totalPages} · {data.total} entries
          </span>
          <div className="flex gap-2">
            <button
              className="btn"
              disabled={data.page <= 1}
              onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))}
            >
              Previous
            </button>
            <button
              className="btn"
              disabled={data.page >= data.totalPages}
              onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
