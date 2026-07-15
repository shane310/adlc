'use client';

import { useMemo, useState } from 'react';
import type { AggregatedSetting } from '@/lib/settings-service';

interface SettingsFormProps {
  initial: AggregatedSetting[];
}

export function SettingsForm({ initial }: SettingsFormProps) {
  const [settings, setSettings] = useState(initial);
  const [dirty, setDirty] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const grouped = useMemo(() => {
    const bucket: Record<string, AggregatedSetting[]> = {};
    for (const setting of settings) {
      (bucket[setting.definition.category] ??= []).push(setting);
    }
    return bucket;
  }, [settings]);

  const setValue = (key: string, value: unknown) => {
    setDirty((d) => ({ ...d, [key]: value }));
  };

  const currentValue = (setting: AggregatedSetting): unknown => {
    return dirty[setting.definition.key] ?? setting.effectiveValue;
  };

  const save = async () => {
    const updates = Object.entries(dirty).map(([key, value]) => ({ key, value }));
    if (updates.length === 0) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed: ${res.status}`);
      }
      const body = (await res.json()) as { settings: AggregatedSetting[] };
      setSettings(body.settings);
      setDirty({});
      setMessage({ tone: 'success', text: 'Settings updated successfully' });
    } catch (err) {
      setMessage({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Save failed',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {message ? (
        <div
          role="alert"
          className={message.tone === 'success' ? 'badge badge-success' : 'badge badge-danger'}
        >
          {message.text}
        </div>
      ) : null}

      {Object.entries(grouped).map(([category, group]) => (
        <section key={category} className="card p-4">
          <h2 className="mb-3 text-lg font-semibold capitalize">{category} settings</h2>
          <div className="space-y-4">
            {group.map((setting) => (
              <div key={setting.definition.key} className="grid gap-2 md:grid-cols-[1fr_2fr]">
                <div>
                  <label
                    htmlFor={setting.definition.key}
                    className="block text-sm font-medium text-slate-800"
                  >
                    {setting.definition.label}
                  </label>
                  <p className="text-xs text-slate-500">{setting.definition.description}</p>
                </div>
                <div>
                  <SettingInput
                    setting={setting}
                    value={currentValue(setting)}
                    onChange={(v) => setValue(setting.definition.key, v)}
                  />
                  {setting.updatedAt ? (
                    <p className="mt-1 text-xs text-slate-400">
                      Last changed: {new Date(setting.updatedAt).toISOString()}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="flex justify-end">
        <button
          className="btn btn-primary"
          onClick={save}
          disabled={saving || Object.keys(dirty).length === 0}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

interface SettingInputProps {
  setting: AggregatedSetting;
  value: unknown;
  onChange: (value: unknown) => void;
}

function SettingInput({ setting, value, onChange }: SettingInputProps) {
  const definition = setting.definition;
  const id = definition.key;

  switch (definition.type) {
    case 'boolean':
      return (
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{value ? 'Enabled' : 'Disabled'}</span>
        </label>
      );
    case 'number':
      return (
        <input
          id={id}
          type="number"
          className="w-40 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          value={typeof value === 'number' ? value : Number(value) || 0}
          min={definition.min}
          max={definition.max}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      );
    case 'select':
      return (
        <select
          id={id}
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        >
          {definition.options?.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    default:
      return (
        <input
          id={id}
          type="text"
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
