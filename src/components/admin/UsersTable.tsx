'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SystemRole } from '@prisma/client';
import { clsx } from '@/lib/clsx';
import { formatDate, formatRelativeTime } from '@/lib/format';
import { toTitleCase } from '@/lib/rbac/defaults';
import type { UsersListItem, UsersListResult } from '@/lib/users-service';
import { UserFormModal } from './UserFormModal';

interface UsersTableProps {
  roles: { id: string; name: SystemRole }[];
}

interface Filters {
  search: string;
  role: SystemRole | 'all';
  active: 'all' | 'true' | 'false';
  mfa: 'all' | 'true' | 'false';
  page: number;
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  role: 'all',
  active: 'all',
  mfa: 'all',
  page: 1,
};

export function UsersTable({ roles }: UsersTableProps) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [data, setData] = useState<UsersListResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<UsersListItem | 'new' | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.role !== 'all') params.set('role', filters.role);
    if (filters.active !== 'all') params.set('active', filters.active);
    if (filters.mfa !== 'all') params.set('mfa', filters.mfa);
    params.set('page', String(filters.page));
    return params.toString();
  }, [filters]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users?${query}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setData((await res.json()) as UsersListResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeactivate = async (user: UsersListItem) => {
    const activate = !user.isActive;
    const msg = activate
      ? 'Reactivating this account will restore login access. Continue?'
      : 'Deactivating this account will immediately log out the user and prevent future logins. Continue?';
    if (typeof window !== 'undefined' && !window.confirm(msg)) return;

    const method = activate ? 'DELETE' : 'POST';
    const res = await fetch(`/api/admin/users/${user.id}/deactivate`, { method });
    if (!res.ok) {
      setError(`Failed: ${res.status}`);
      return;
    }
    setToast(activate ? 'User account reactivated' : 'User account deactivated');
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col text-xs">
            Search
            <input
              type="search"
              className="w-64 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
              placeholder="Email or name"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
            />
          </label>
          <label className="flex flex-col text-xs">
            Role
            <select
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={filters.role}
              onChange={(e) =>
                setFilters((f) => ({ ...f, role: e.target.value as Filters['role'], page: 1 }))
              }
            >
              <option value="all">All</option>
              {Object.values(SystemRole).map((r) => (
                <option key={r} value={r}>
                  {toTitleCase(r)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-xs">
            Active
            <select
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={filters.active}
              onChange={(e) =>
                setFilters((f) => ({ ...f, active: e.target.value as Filters['active'], page: 1 }))
              }
            >
              <option value="all">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <label className="flex flex-col text-xs">
            MFA
            <select
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={filters.mfa}
              onChange={(e) =>
                setFilters((f) => ({ ...f, mfa: e.target.value as Filters['mfa'], page: 1 }))
              }
            >
              <option value="all">All</option>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          Add User
        </button>
      </div>

      {toast ? (
        <div className="badge badge-success" role="status">
          {toast}
        </div>
      ) : null}
      {error ? (
        <div className="badge badge-danger" role="alert">
          {error}
        </div>
      ) : null}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Company</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">MFA</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Last Login</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && !data ? (
              <tr>
                <td className="px-3 py-4 text-slate-500" colSpan={9}>
                  Loading…
                </td>
              </tr>
            ) : null}
            {data?.data.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 font-medium">{user.email}</td>
                <td className="px-3 py-2">{user.firstName} {user.lastName}</td>
                <td className="px-3 py-2 text-slate-600">{user.companyName ?? '—'}</td>
                <td className="px-3 py-2">
                  <span className="badge badge-neutral">{toTitleCase(user.role.name)}</span>
                </td>
                <td className="px-3 py-2">
                  <span className={clsx('badge', user.mfaEnabled ? 'badge-success' : 'badge-neutral')}>
                    {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className={clsx('badge', user.isActive ? 'badge-success' : 'badge-danger')}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-600">{formatRelativeTime(user.lastLoginAt)}</td>
                <td className="px-3 py-2 text-slate-600">{formatDate(user.createdAt)}</td>
                <td className="px-3 py-2">
                  <button className="btn" onClick={() => setEditing(user)}>
                    View
                  </button>
                  <button className="btn ml-2" onClick={() => setEditing(user)}>
                    Edit
                  </button>
                  <button className="btn btn-danger ml-2" onClick={() => handleDeactivate(user)}>
                    {user.isActive ? 'Deactivate' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
            {data && data.data.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-slate-500" colSpan={9}>
                  No users match the current filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {data ? (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Showing {(data.page - 1) * data.pageSize + 1}–
            {Math.min(data.page * data.pageSize, data.total)} of {data.total}
          </span>
          <div className="flex gap-2">
            <button
              className="btn"
              disabled={data.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            >
              Previous
            </button>
            <button
              className="btn"
              disabled={data.page >= data.totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      {editing ? (
        <UserFormModal
          mode={editing === 'new' ? 'create' : 'edit'}
          user={editing === 'new' ? null : editing}
          roles={roles}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setToast(msg);
            setEditing(null);
            load();
          }}
        />
      ) : null}
    </div>
  );
}
