import { getSettings } from '@/lib/settings-service';
import { SettingsForm } from '@/components/admin/SettingsForm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Configuration Settings</h1>
        <p className="text-sm text-slate-500">
          Tune platform-wide security, workflow, notification and storage parameters.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
