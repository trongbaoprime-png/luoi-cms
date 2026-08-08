import Redis from "ioredis";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "TELESALE" | "MARKETING" | "VIEWER";

export interface AdminSession {
  token: string;
  userId: string;
  username: string;
  email: string;
  role: AdminRole;
  permissions: string[];
  createdAt: number;
  expiresAt: number;
}

export interface AdminSessionCreateInput {
  userId: string;
  username: string;
  email: string;
  role?: string;
  permissions?: string[] | string | null;
  ttlSeconds?: number;
}

// In-Memory Fallback Session Store for local dev, testing, and offline fault-tolerance
const memorySessions = new Map<string, AdminSession>();

// Redis Client with graceful offline detection
let redisClient: Redis | null = null;
let isRedisAvailable = false;

function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL || process.env.REDIS_SESSION_URL;
  if (!redisUrl && process.env.NODE_ENV !== "production") {
    return null;
  }

  try {
    redisClient = new Redis(redisUrl || "redis://127.0.0.1:6379", {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 100, 1000);
      },
    });

    redisClient.on("connect", () => {
      isRedisAvailable = true;
    });

    redisClient.on("error", () => {
      isRedisAvailable = false;
    });
  } catch {
    isRedisAvailable = false;
    redisClient = null;
  }

  return redisClient;
}

const SESSION_PREFIX = "luoi:session:";
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Store a new Admin Session server-side
 */
export async function createAdminSession(
  token: string,
  input: AdminSessionCreateInput
): Promise<AdminSession> {
  const now = Date.now();
  const ttl = input.ttlSeconds || DEFAULT_TTL_SECONDS;
  const expiresAt = now + ttl * 1000;

  // Normalize Role
  let role: AdminRole = "ADMIN";
  const inputRole = (input.role || "ADMIN").toUpperCase();
  if (["SUPER_ADMIN", "ADMIN", "MANAGER", "TELESALE", "MARKETING", "VIEWER"].includes(inputRole)) {
    role = inputRole as AdminRole;
  }

  // Normalize Permissions
  let permissions: string[] = [];
  if (Array.isArray(input.permissions)) {
    permissions = input.permissions;
  } else if (typeof input.permissions === "string") {
    try {
      permissions = JSON.parse(input.permissions);
    } catch {
      permissions = [input.permissions];
    }
  }

  // Assign default permissions according to role
  if (permissions.length === 0) {
    permissions = getDefaultPermissionsForRole(role);
  }

  const session: AdminSession = {
    token,
    userId: input.userId,
    username: input.username,
    email: input.email,
    role,
    permissions,
    createdAt: now,
    expiresAt,
  };

  // 1. Try Saving to Redis
  const redis = getRedisClient();
  if (redis && isRedisAvailable) {
    try {
      await redis.setex(`${SESSION_PREFIX}${token}`, ttl, JSON.stringify(session));
    } catch {
      // Graceful fallback to memory store
    }
  }

  // 2. Always maintain memory store as fast cache / offline fallback
  memorySessions.set(token, session);

  // Clean up any expired sessions in memory
  cleanExpiredMemorySessions();

  return session;
}

/**
 * Retrieve and strictly validate an active Admin Session server-side
 */
export async function getAdminSession(token: string): Promise<AdminSession | null> {
  if (!token || typeof token !== "string") return null;

  const now = Date.now();

  // 1. Try Reading from Redis
  const redis = getRedisClient();
  if (redis && isRedisAvailable) {
    try {
      const data = await redis.get(`${SESSION_PREFIX}${token}`);
      if (data) {
        const session = JSON.parse(data) as AdminSession;
        if (session.expiresAt && session.expiresAt <= now) {
          // Strictly reject expired session server-side
          await destroyAdminSession(token);
          return null;
        }
        return session;
      }
    } catch {
      // Fallback to memory
    }
  }

  // 2. Check Memory Store
  const memorySession = memorySessions.get(token);
  if (memorySession) {
    if (memorySession.expiresAt && memorySession.expiresAt <= now) {
      memorySessions.delete(token);
      return null;
    }
    return memorySession;
  }

  return null;
}

/**
 * Destroy a session server-side on logout
 */
export async function destroyAdminSession(token: string): Promise<void> {
  if (!token) return;

  memorySessions.delete(token);

  const redis = getRedisClient();
  if (redis && isRedisAvailable) {
    try {
      await redis.del(`${SESSION_PREFIX}${token}`);
    } catch {}
  }
}

/**
 * Role-based default permissions map
 */
export function getDefaultPermissionsForRole(role: AdminRole): string[] {
  switch (role) {
    case "SUPER_ADMIN":
      return ["*"];
    case "ADMIN":
      return [
        "cms.*",
        "crm.*",
        "omni.*",
        "media.*",
        "articles.*",
        "pages.*",
        "deals.*",
        "settings.view",
        "settings.edit",
      ];
    case "MANAGER":
      return [
        "crm.leads.view",
        "crm.leads.edit",
        "crm.leads.sync",
        "crm.appointments",
        "articles.view",
        "articles.edit",
        "deals.view",
        "deals.edit",
        "subscribers.view",
        "reports.view",
      ];
    case "TELESALE":
      return [
        "crm.leads.view",
        "crm.leads.edit",
        "crm.leads.sync",
        "crm.appointments",
      ];
    case "MARKETING":
      return [
        "cms.pages.view",
        "cms.pages.edit",
        "cms.builder",
        "articles.*",
        "deals.*",
        "ads.settings",
        "crm.leads.view",
      ];
    case "VIEWER":
      return [
        "dashboard.view",
        "reports.view",
        "crm.leads.view",
        "articles.view",
      ];
    default:
      return ["dashboard.view"];
  }
}

/**
 * Check if a permission pattern matches a required permission
 */
export function hasPermission(grantedPermissions: string[], requiredPermission: string): boolean {
  if (grantedPermissions.includes("*")) return true;
  if (grantedPermissions.includes(requiredPermission)) return true;

  const [reqNamespace] = requiredPermission.split(".");
  if (grantedPermissions.includes(`${reqNamespace}.*`)) return true;

  return false;
}

function cleanExpiredMemorySessions() {
  const now = Date.now();
  for (const [token, session] of memorySessions.entries()) {
    if (session.expiresAt <= now) {
      memorySessions.delete(token);
    }
  }
}
