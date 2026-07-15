import { SystemRole } from '@prisma/client';
import {
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLE_DEFINITIONS,
  isProtectedRole,
  toTitleCase,
} from '@/lib/rbac/defaults';

describe('rbac/defaults', () => {
  it('has all six required system roles', () => {
    const names = DEFAULT_ROLE_DEFINITIONS.map((r) => r.name).sort();
    expect(names).toEqual(
      [
        SystemRole.ADMINISTRATOR,
        SystemRole.BUSINESS_USER,
        SystemRole.GOVERNMENT_AGENCY,
        SystemRole.INSPECTOR,
        SystemRole.PUBLIC_CITIZEN,
        SystemRole.SYSTEM_ADMIN,
      ].sort(),
    );
  });

  it('marks INSPECTOR / ADMINISTRATOR / SYSTEM_ADMIN as requiring MFA', () => {
    const mfa = new Set(
      DEFAULT_ROLE_DEFINITIONS.filter((r) => r.requiresMfa).map((r) => r.name),
    );
    expect(mfa).toEqual(
      new Set([SystemRole.INSPECTOR, SystemRole.ADMINISTRATOR, SystemRole.SYSTEM_ADMIN]),
    );
  });

  it('gives SYSTEM_ADMIN every permission', () => {
    const systemAdmin = DEFAULT_ROLE_DEFINITIONS.find((r) => r.name === SystemRole.SYSTEM_ADMIN)!;
    expect(systemAdmin.permissions).toEqual(DEFAULT_PERMISSIONS);
  });

  it('treats SYSTEM_ADMIN as protected against edits', () => {
    expect(isProtectedRole(SystemRole.SYSTEM_ADMIN)).toBe(true);
    expect(isProtectedRole(SystemRole.ADMINISTRATOR)).toBe(false);
  });

  describe('toTitleCase', () => {
    it.each([
      [SystemRole.BUSINESS_USER, 'Business User'],
      [SystemRole.SYSTEM_ADMIN, 'System Admin'],
      [SystemRole.GOVERNMENT_AGENCY, 'Government Agency'],
    ])('converts %s -> %s', (input, expected) => {
      expect(toTitleCase(input)).toBe(expected);
    });
  });
});
