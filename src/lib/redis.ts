import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (process.env.NODE_ENV === "test") return null;

  if (!redisClient && process.env.REDIS_URL) {
    try {
      redisClient = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        lazyConnect: true,
      });

      redisClient.on("error", (err) => {
        console.warn("[Redis Warning]:", err.message);
      });
    } catch (e) {
      console.warn("[Redis Connection Failed]: Using in-memory rate limiting fallback.", e);
      redisClient = null;
    }
  }

  return redisClient;
}
