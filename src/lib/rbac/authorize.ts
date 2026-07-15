import { SystemRole } from '@prisma/client';

export interface AuthorizedUser {
  id: string;
  email: string;
  role: SystemRole;
  isActive: boolean;
  mfaEnabled?: boolean;
}

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class UnauthenticatedError extends Error {
  readonly status = 401;
  constructor(message = 'Unauthenticated') {
    super(message);
    this.name = 'UnauthenticatedError';
  }
}

/**
 * Strict system-admin guard. Throws typed errors so route handlers can return
 * the correct HTTP status codes (401 vs 403).
 */
export function requireSystemAdmin(user: AuthorizedUser | null | undefined): AuthorizedUser {
  if (!user) throw new UnauthenticatedError();
  if (!user.isActive) throw new ForbiddenError('Account is deactivated');
  if (user.role !== SystemRole.SYSTEM_ADMIN) throw new ForbiddenError();
  return user;
}

export function hasRole(user: AuthorizedUser | null | undefined, ...roles: SystemRole[]): boolean {
  if (!user || !user.isActive) return false;
  return roles.includes(user.role);
}
