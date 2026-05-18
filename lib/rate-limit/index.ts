import Redis from "ioredis";

declare global {
  var __donnaRedis: Redis | null | undefined;
}

function getRedis(): Redis | null {
  if (global.__donnaRedis !== undefined) return global.__donnaRedis;
  const url = process.env.REDIS_URL;
  if (!url) {
    global.__donnaRedis = null;
    return null;
  }
  const client = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });
  client.on("error", () => {});
  global.__donnaRedis = client;
  return client;
}

export interface LimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

async function checkLimit(prefix: string, id: string, limit: number, windowMs: number): Promise<LimitResult> {
  const redis = getRedis();
  if (!redis) {
    return { ok: true, remaining: limit, resetAt: Date.now() + windowMs };
  }
  const key = `${prefix}:${id}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    const pipeline = redis.multi();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zcard(key);
    const results = await pipeline.exec();
    if (!results) return { ok: true, remaining: limit, resetAt: now + windowMs };
    const count = (results[1][1] as number) ?? 0;

    if (count >= limit) {
      return { ok: false, remaining: 0, resetAt: now + windowMs };
    }

    const writePipeline = redis.multi();
    writePipeline.zadd(key, now, `${now}-${Math.random()}`);
    writePipeline.pexpire(key, windowMs + 1000);
    await writePipeline.exec();

    return { ok: true, remaining: limit - count - 1, resetAt: now + windowMs };
  } catch {
    return { ok: true, remaining: limit, resetAt: now + windowMs };
  }
}

export function limitByIp(ip: string): Promise<LimitResult> {
  return checkLimit("rl:ip", ip, 60, 60_000);
}

export function limitByKey(token: string): Promise<LimitResult> {
  return checkLimit("rl:key", token.slice(0, 32), 600, 60_000);
}
