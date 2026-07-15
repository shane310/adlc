'use client';

import { useMemo, useState } from 'react';
import { SystemRole } from '@prisma/client';
import { clsx } from '@/lib/clsx';
import { isProtectedRole, toTitleCase } from '@/lib/rbac/defaults';
import { groupPermissionsByResource, type RoleSummary } from '@/lib/roles-service';

interface RolesGridProps {
  initialRoles: RoleSummary[];
  permissions: Array<{ id: string; resource: string; action: string }>;
}

export function RolesGrid({ initialRoles, permissions }: RolesGridProps) {
  const [roles, setRoles] = useState(initialRoles);
  const [active, setActive] = useState<RoleSummary | null>(null);

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <div key={role.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold">{toTitleCase(role.name)}</div>
                <div className="text-xs text-slate-500">{role.description}</div>
              </div>
              <span
                className={clsx('badge', role.requiresMfa ? 'badge-warning' : 'badge-neutral')}
              >
                MFA {role.requiresMfa ? 'Required' : 'Not Required'}
              </span>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              {role.userCount} user{role.userCount === 1 ? '' : 's'} · {role.permissions.length} permissions
            </div>
            <button className="btn mt-4" onClick={() => setActive(role)}>
              View Permissions
            </button>
          </div>
        ))}
      </div>

      {active ? (
        <PermissionEditor
          role={active}
          permissions={permissions}
          onClose={() => setActive(null)}
          onSaved={(updated) => {
            setRoles((rs) => rs.map((r) => (r.id === updated.id ? updated : r)));
            setActive(null);
          }}
        />
      ) : null}
    </div>
  );
}

interface PermissionEditorProps {
  role: RoleSummary;
  permissions: Array<{ id: string; resource: string; action: string }>;
  onClose: () => void;
  onSaved: (role: RoleSummary) => void;
}

function PermissionEditor({ role, permissions, onClose, onSaved }: PermissionEditorProps) {
  const grouped = useMemo(() => groupPermissionsByResource(permissions), [permissions]);
  const isProtected = isProtectedRole(role.name);

  const initial = useMemo(() => new Set(role.permissions.map((p) => p.id)), [role]);
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = async () => {
    if (isProtected) return;
    const add = [...selected].filter((id) => !initial.has(id));
    const remove = [...initial].filter((id) => !selected.has(id));
    if (add.length === 0 && remove.length === 0) {
      onClose();
      return;
    }
    if (
      typeof window !== 'undefined' &&
      !window.confirm('Changing permissions affects all users with this role. Continue?')
    ) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/roles/${role.id}/permissions`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ add, remove }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed: ${res.status}`);
      }
      const updated: RoleSummary = {
        ...role,
        permissions: permissions.filter((p) => selected.has(p.id)),
      };
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-perms-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    >
      <div className="card w-full max-w-2xl bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 id="role-perms-title" className="text-lg font-semibold">
              {toTitleCase(role.name)} Permissions
            </h2>
            <p className="text-xs text-slate-500">{role.description}</p>
          </div>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>

        {isProtected ? (
          <div
            className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800"
            role="note"
          >
            SYSTEM_ADMIN role has all permissions by default and cannot be modified.
          </div>
        ) : null}

        {error ? (
          <div className="mt-3 badge badge-danger" role="alert">
            {error}
          </div>
        ) : null}

        <div className="mt-4 max-h-[50vh] space-y-4 overflow-y-auto">
          {Object.entries(grouped).map(([resource, perms]) => (
            <div key={resource}>
              <div className="mb-1 text-xs font-semibold uppercase text-slate-500">{resource}</div>
              <div className="grid grid-cols-2 gap-1">
                {perms.map((perm) => (
                  <label key={perm.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.has(perm.id)}
                      disabled={isProtected}
                      onChange={() => toggle(perm.id)}
                    />
                    <span>
                      {perm.resource}:{perm.action}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving || isProtected}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
