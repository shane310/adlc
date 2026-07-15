import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ForbiddenError, UnauthenticatedError } from './rbac/authorize';

export function jsonError(status: number, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function handleRouteError(err: unknown): NextResponse {
  if (err instanceof UnauthenticatedError) return jsonError(401, err.message);
  if (err instanceof ForbiddenError) return jsonError(403, err.message);
  if (err instanceof ZodError) return jsonError(400, 'Validation failed', { issues: err.issues });
  console.error('[route-error]', err);
  return jsonError(500, 'Internal Server Error');
}

export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return headers.get('x-real-ip');
}
