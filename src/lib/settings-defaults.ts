export interface SettingDefinition {
  key: string;
  category: 'security' | 'notifications' | 'workflow' | 'storage';
  label: string;
  description: string;
  type: 'number' | 'boolean' | 'string' | 'select';
  default: unknown;
  options?: Array<{ label: string; value: string | number }>;
  min?: number;
  max?: number;
}

export const SYSTEM_SETTING_DEFINITIONS: SettingDefinition[] = [
  {
    key: 'security.sessionTimeoutMinutes',
    category: 'security',
    label: 'Session timeout (minutes)',
    description: 'Idle user sessions are terminated after this duration.',
    type: 'number',
    default: 30,
    min: 5,
    max: 720,
  },
  {
    key: 'security.passwordComplexityEnabled',
    category: 'security',
    label: 'Password complexity enforcement',
    description:
      'Requires 12 characters, mixed case, numbers and special characters when enabled.',
    type: 'boolean',
    default: true,
  },
  {
    key: 'security.mfaEnforcement',
    category: 'security',
    label: 'MFA enforcement policy',
    description: 'Per-role enforcement follows the seeded role defaults; "global" forces MFA on every account.',
    type: 'select',
    default: 'per-role',
    options: [
      { label: 'Per role (default)', value: 'per-role' },
      { label: 'Global (all users)', value: 'global' },
      { label: 'Disabled', value: 'disabled' },
    ],
  },
  {
    key: 'notifications.systemErrorEmails',
    category: 'notifications',
    label: 'System error email recipients',
    description: 'Comma-separated list of emails receiving critical alerts.',
    type: 'string',
    default: '',
  },
  {
    key: 'workflow.applicationReviewDays',
    category: 'workflow',
    label: 'Application review SLA (days)',
    description: 'Applications not reviewed within this window trigger a warning banner.',
    type: 'number',
    default: 5,
    min: 1,
    max: 90,
  },
  {
    key: 'storage.maxUploadMb',
    category: 'storage',
    label: 'Maximum upload size (MB)',
    description: 'Enforced by the upload API for all attachments.',
    type: 'number',
    default: 25,
    min: 1,
    max: 500,
  },
];

export function getSettingDefinition(key: string): SettingDefinition | undefined {
  return SYSTEM_SETTING_DEFINITIONS.find((s) => s.key === key);
}
