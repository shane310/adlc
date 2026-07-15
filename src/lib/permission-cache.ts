import { getRedis } from './redis';

const PREFIX = 'perms:role:';

/**
 * Invalidates the permission cache for every user attached to the given role.
 * Story 1.7 caches computed permission lists per user in Redis DB 1. When a
 * role's permissions change the cache must be dropped so users pick up new
 * permissions on their next request.
 */
export async function invalidateRolePermissionCache(roleId: string): Promise<number> {
  const redis = getRedis('cache');
  const pattern = `${PREFIX}${roleId}:*`;

  const stream = redis.scanStream({ match: pattern, count: 200 });
  const toDelete: string[] = [];
  await new Promise<void>((resolve, reject) => {
    stream.on('data', (keys: string[]) => toDelete.push(...keys));
    stream.on('end', () => resolve());
    stream.on('error', reject);
  });

  if (toDelete.length === 0) return 0;
  await redis.del(...toDelete);
  return toDelete.length;
}
