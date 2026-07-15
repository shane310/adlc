import Redis, { type RedisOptions } from 'ioredis';

export type RedisChannel = 'session' | 'cache' | 'pubsub';

const CHANNEL_ENV: Record<RedisChannel, string> = {
  session: 'REDIS_URL_SESSION',
  cache: 'REDIS_URL_CACHE',
  pubsub: 'REDIS_URL_PUBSUB',
};

const clients: Partial<Record<RedisChannel, Redis>> = {};

const baseOptions: RedisOptions = {
  maxRetriesPerRequest: 2,
  enableAutoPipelining: true,
  lazyConnect: false,
};

export function getRedis(channel: RedisChannel): Redis {
  const cached = clients[channel];
  if (cached) return cached;

  const url = process.env[CHANNEL_ENV[channel]];
  if (!url) {
    throw new Error(`Missing env var ${CHANNEL_ENV[channel]} for Redis channel "${channel}"`);
  }

  const client = new Redis(url, baseOptions);
  clients[channel] = client;
  return client;
}

/**
 * Non-throwing PING used by health checks. Returns latency (ms) when healthy,
 * or null when unreachable.
 */
export async function pingRedis(channel: RedisChannel, timeoutMs = 500): Promise<number | null> {
  try {
    const client = getRedis(channel);
    const started = Date.now();
    const result = await Promise.race([
      client.ping(),
      new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), timeoutMs)),
    ]);
    if (result === 'PONG') return Date.now() - started;
    return null;
  } catch {
    return null;
  }
}

export async function closeAllRedis(): Promise<void> {
  await Promise.all(Object.values(clients).map((c) => c?.quit().catch(() => undefined)));
  for (const key of Object.keys(clients) as RedisChannel[]) delete clients[key];
}
