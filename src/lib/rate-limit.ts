import { getRedisClient } from "./redis";

interface MemoryStoreEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryStoreEntry>();

/**
 * Sliding Window Rate Limiter
 * @param identifier Unique IP or User ID key
 * @param limit Max requests allowed in window
 * @param windowSeconds Window duration in seconds
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const redis = getRedisClient();

  // 1. Try Redis sliding window
  if (redis) {
    try {
      const windowStart = now - windowMs;
      const pipeline = redis.pipeline();
      pipeline.zremrangebyscore(key, 0, windowStart);
      pipeline.zadd(key, now.toString(), `${now}-${Math.random()}`);
      pipeline.zcard(key);
      pipeline.expire(key, windowSeconds);

      const results = await pipeline.exec();
      const requestCount = (results?.[2]?.[1] as number) || 1;

      const remaining = Math.max(0, limit - requestCount);
      const success = requestCount <= limit;

      return {
        success,
        limit,
        remaining,
        reset: Math.ceil((now + windowMs) / 1000),
      };
    } catch (err) {
      console.warn("[RateLimit]: Redis failed, falling back to memory store.", err);
    }
  }

  // 2. Memory Store Fallback
  const entry = memoryStore.get(key);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, limit, remaining: limit - 1, reset: Math.ceil((now + windowMs) / 1000) };
  }

  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  const success = entry.count <= limit;

  return {
    success,
    limit,
    remaining,
    reset: Math.ceil(entry.resetAt / 1000),
  };
}
