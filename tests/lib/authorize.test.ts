import { SystemRole } from '@prisma/client';
import {
  ForbiddenError,
  UnauthenticatedError,
  hasRole,
  requireSystemAdmin,
} from '@/lib/rbac/authorize';

describe('rbac/authorize', () => {
  it('throws UnauthenticatedError when user is null', () => {
    expect(() => requireSystemAdmin(null)).toThrow(UnauthenticatedError);
  });

  it('throws ForbiddenError for non-admin users', () => {
    expect(() =>
      requireSystemAdmin({
        id: 'u1',
        email: 'a@b.c',
        role: SystemRole.INSPECTOR,
        isActive: true,
      }),
    ).toThrow(ForbiddenError);
  });

  it('throws ForbiddenError for deactivated admins', () => {
    expect(() =>
      requireSystemAdmin({
        id: 'u1',
        email: 'a@b.c',
        role: SystemRole.SYSTEM_ADMIN,
        isActive: false,
      }),
    ).toThrow(ForbiddenError);
  });

  it('returns the user for active SYSTEM_ADMIN', () => {
    const user = {
      id: 'u1',
      email: 'admin@b.c',
      role: SystemRole.SYSTEM_ADMIN,
      isActive: true,
    };
    expect(requireSystemAdmin(user)).toBe(user);
  });

  describe('hasRole', () => {
    const admin = { id: 'u1', email: '', role: SystemRole.ADMINISTRATOR, isActive: true } as const;
    it('returns true when role matches', () => {
      expect(hasRole(admin, SystemRole.ADMINISTRATOR, SystemRole.SYSTEM_ADMIN)).toBe(true);
    });
    it('returns false for inactive user', () => {
      expect(hasRole({ ...admin, isActive: false }, SystemRole.ADMINISTRATOR)).toBe(false);
    });
    it('returns false for null user', () => {
      expect(hasRole(null, SystemRole.ADMINISTRATOR)).toBe(false);
    });
  });
});
