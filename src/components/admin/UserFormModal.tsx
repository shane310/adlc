'use client';

import { useState } from 'react';
import { SystemRole } from '@prisma/client';
import type { UsersListItem } from '@/lib/users-service';
import { toTitleCase } from '@/lib/rbac/defaults';

interface UserFormModalProps {
  mode: 'create' | 'edit';
  user: UsersListItem | null;
  roles: { id: string; name: SystemRole }[];
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface CreateFormState {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
  roleId: string;
}

interface UpdateFormState {
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
  roleId: string;
}

export function UserFormModal({ mode, user, roles, onClose, onSaved }: UserFormModalProps) {
  const initialRoleId = user?.role.id ?? roles[0]?.id ?? '';
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [createForm, setCreateForm] = useState<CreateFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    phone: '',
    roleId: initialRoleId,
  });

  const [updateForm, setUpdateForm] = useState<UpdateFormState>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    companyName: user?.companyName ?? '',
    phone: user?.phone ?? '',
    roleId: initialRoleId,
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (mode === 'create') {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            ...createForm,
            companyName: createForm.companyName || undefined,
            phone: createForm.phone || undefined,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Failed: ${res.status}`);
        }
        onSaved('User account created successfully');
      } else if (user) {
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            ...updateForm,
            companyName: updateForm.companyName || null,
            phone: updateForm.phone || null,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Failed: ${res.status}`);
        }
        onSaved('User updated successfully');
      }
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
      aria-labelledby="user-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    >
      <div className="card w-full max-w-lg bg-white p-6">
        <h2 id="user-modal-title" className="text-lg font-semibold">
          {mode === 'create' ? 'Add User' : `Edit ${user?.email ?? 'User'}`}
        </h2>
        {error ? (
          <div className="mt-3 badge badge-danger" role="alert">
            {error}
          </div>
        ) : null}
        <form className="mt-4 space-y-3" onSubmit={submit}>
          {mode === 'create' ? (
            <>
              <Input
                label="Email"
                type="email"
                value={createForm.email}
                onChange={(v) => setCreateForm((f) => ({ ...f, email: v }))}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Password"
                  type="password"
                  value={createForm.password}
                  onChange={(v) => setCreateForm((f) => ({ ...f, password: v }))}
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={createForm.confirmPassword}
                  onChange={(v) => setCreateForm((f) => ({ ...f, confirmPassword: v }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  value={createForm.firstName}
                  onChange={(v) => setCreateForm((f) => ({ ...f, firstName: v }))}
                  required
                />
                <Input
                  label="Last Name"
                  value={createForm.lastName}
                  onChange={(v) => setCreateForm((f) => ({ ...f, lastName: v }))}
                  required
                />
              </div>
              <Input
                label="Company"
                value={createForm.companyName}
                onChange={(v) => setCreateForm((f) => ({ ...f, companyName: v }))}
              />
              <Input
                label="Phone"
                value={createForm.phone}
                onChange={(v) => setCreateForm((f) => ({ ...f, phone: v }))}
              />
              <RoleSelect
                value={createForm.roleId}
                roles={roles}
                onChange={(v) => setCreateForm((f) => ({ ...f, roleId: v }))}
              />
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  value={updateForm.firstName}
                  onChange={(v) => setUpdateForm((f) => ({ ...f, firstName: v }))}
                  required
                />
                <Input
                  label="Last Name"
                  value={updateForm.lastName}
                  onChange={(v) => setUpdateForm((f) => ({ ...f, lastName: v }))}
                  required
                />
              </div>
              <Input
                label="Company"
                value={updateForm.companyName}
                onChange={(v) => setUpdateForm((f) => ({ ...f, companyName: v }))}
              />
              <Input
                label="Phone"
                value={updateForm.phone}
                onChange={(v) => setUpdateForm((f) => ({ ...f, phone: v }))}
              />
              <RoleSelect
                value={updateForm.roleId}
                roles={roles}
                onChange={(v) => setUpdateForm((f) => ({ ...f, roleId: v }))}
              />
            </>
          )}

          <div className="mt-4 flex items-center justify-end gap-2">
            <button type="button" className="btn" onClick={onClose} disabled={saving}>
              Close
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {mode === 'create' ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}

function Input({ label, value, onChange, required, type = 'text' }: InputProps) {
  return (
    <label className="flex flex-col text-xs">
      <span className="mb-1 font-medium text-slate-700">{label}</span>
      <input
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

interface RoleSelectProps {
  value: string;
  roles: { id: string; name: SystemRole }[];
  onChange: (value: string) => void;
}

function RoleSelect({ value, roles, onChange }: RoleSelectProps) {
  return (
    <label className="flex flex-col text-xs">
      <span className="mb-1 font-medium text-slate-700">Role</span>
      <select
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      >
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            {toTitleCase(r.name)}
          </option>
        ))}
      </select>
    </label>
  );
}
