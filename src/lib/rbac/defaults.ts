import { SystemRole } from '@prisma/client';

export interface PermissionSeed {
  resource: string;
  action: string;
}

export interface RoleSeed {
  name: SystemRole;
  description: string;
  requiresMfa: boolean;
  permissions: PermissionSeed[];
}

export const DEFAULT_PERMISSIONS: PermissionSeed[] = [
  { resource: 'applications', action: 'create' },
  { resource: 'applications', action: 'read' },
  { resource: 'applications', action: 'update' },
  { resource: 'applications', action: 'submit' },
  { resource: 'applications', action: 'review' },
  { resource: 'applications', action: 'approve' },
  { resource: 'certificates', action: 'read' },
  { resource: 'certificates', action: 'issue' },
  { resource: 'certificates', action: 'revoke' },
  { resource: 'users', action: 'read' },
  { resource: 'users', action: 'create' },
  { resource: 'users', action: 'update' },
  { resource: 'users', action: 'deactivate' },
  { resource: 'users', action: 'manage' },
  { resource: 'roles', action: 'read' },
  { resource: 'roles', action: 'update' },
  { resource: 'audit', action: 'read' },
  { resource: 'audit', action: 'export' },
  { resource: 'settings', action: 'read' },
  { resource: 'settings', action: 'update' },
  { resource: 'system', action: 'monitor' },
];

export const DEFAULT_ROLE_DEFINITIONS: RoleSeed[] = [
  {
    name: SystemRole.BUSINESS_USER,
    description: 'Business user submitting certification applications',
    requiresMfa: false,
    permissions: [
      { resource: 'applications', action: 'create' },
      { resource: 'applications', action: 'read' },
      { resource: 'applications', action: 'update' },
      { resource: 'applications', action: 'submit' },
      { resource: 'certificates', action: 'read' },
    ],
  },
  {
    name: SystemRole.INSPECTOR,
    description: 'Field inspector reviewing applications',
    requiresMfa: true,
    permissions: [
      { resource: 'applications', action: 'read' },
      { resource: 'applications', action: 'review' },
      { resource: 'certificates', action: 'read' },
    ],
  },
  {
    name: SystemRole.ADMINISTRATOR,
    description: 'Regulatory administrator approving certifications',
    requiresMfa: true,
    permissions: [
      { resource: 'applications', action: 'read' },
      { resource: 'applications', action: 'review' },
      { resource: 'applications', action: 'approve' },
      { resource: 'certificates', action: 'read' },
      { resource: 'certificates', action: 'issue' },
      { resource: 'certificates', action: 'revoke' },
      { resource: 'audit', action: 'read' },
    ],
  },
  {
    name: SystemRole.GOVERNMENT_AGENCY,
    description: 'Partner government agency with read access',
    requiresMfa: false,
    permissions: [
      { resource: 'applications', action: 'read' },
      { resource: 'certificates', action: 'read' },
    ],
  },
  {
    name: SystemRole.PUBLIC_CITIZEN,
    description: 'Public citizen with lookup access only',
    requiresMfa: false,
    permissions: [{ resource: 'certificates', action: 'read' }],
  },
  {
    name: SystemRole.SYSTEM_ADMIN,
    description: 'Full platform administrator (all permissions)',
    requiresMfa: true,
    permissions: DEFAULT_PERMISSIONS,
  },
];

export function isProtectedRole(role: SystemRole): boolean {
  return role === SystemRole.SYSTEM_ADMIN;
}

export function toTitleCase(role: SystemRole): string {
  return role
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}
