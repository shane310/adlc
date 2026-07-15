import { prisma } from './db';
import { getRedis } from './redis';

/**
 * Invalidates every persisted session (DB + Redis DB 0) for a user – used by
 * the "Deactivate Account" action in AC2 so the target user is forced to
 * re-authenticate immediately.
 */
export async function invalidateUserSessions(userId: string): Promise<number> {
  const dbSessions = await prisma.session.findMany({
    where: { userId },
    select: { sessionToken: true },
  });

  const redis = getRedis('session');
  const keys = dbSessions.map((s) => `sess:${s.sessionToken}`);
  if (keys.length > 0) {
    try {
      await redis.del(...keys);
    } catch (err) {
      console.warn('[session-store] redis del failed', err);
    }
  }

  const { count } = await prisma.session.deleteMany({ where: { userId } });
  return count;
}
