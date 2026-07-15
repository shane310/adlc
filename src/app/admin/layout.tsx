import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { ForbiddenError, UnauthenticatedError, requireSystemAdmin } from '@/lib/rbac/authorize';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'User Management' },
  { href: '/admin/roles', label: 'Role & Permission Management' },
  { href: '/admin/monitoring', label: 'System Monitoring' },
  { href: '/admin/audit-logs', label: 'Audit Logs' },
  { href: '/admin/settings', label: 'Configuration Settings' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    requireSystemAdmin(await getCurrentUser());
  } catch (err) {
    if (err instanceof UnauthenticatedError || err instanceof ForbiddenError) {
      notFound();
    }
    throw err;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-slate-200 bg-white">
        <div className="px-6 py-5 text-lg font-semibold text-brand">NISIT Admin</div>
        <nav aria-label="Admin sections" className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
