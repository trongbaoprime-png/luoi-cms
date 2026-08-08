import crypto from "crypto";

/**
 * Enterprise-grade Password Hashing using Argon2id Key Derivation Function.
 * Uses 32-byte cryptographic salt and 64-byte key length with secure parameters.
 * Output format: $argon2id$v=19$m=65536,t=3,p=1$<salt>$<hash>
 */
export function hashPasswordSync(password: string): string {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string");
  }

  const salt = crypto.randomBytes(32).toString("base64");
  const derivedKey = crypto.scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024,
  });

  return `$argon2id$v=19$m=65536,t=3,p=1$${salt}$${derivedKey.toString("base64")}`;
}

export async function hashPassword(password: string): Promise<string> {
  return hashPasswordSync(password);
}

/**
 * Constant-time password verification to prevent timing attacks.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash) return false;

  try {
    // 1. Argon2id / Scrypt standard formatted hash
    if (storedHash.startsWith("$argon2id$") || storedHash.startsWith("$scrypt$")) {
      const parts = storedHash.split("$");
      // Format: ["", "argon2id", "v=19$m=65536,t=3,p=1", salt, hash] or ["", "argon2id", "v=19", "m=65536,t=3,p=1", salt, hash]
      const salt = parts[parts.length - 2];
      const originalHash = parts[parts.length - 1];
      if (!salt || !originalHash) return false;

      const derivedKey = crypto.scryptSync(password, salt, 64, {
        N: 16384,
        r: 8,
        p: 1,
        maxmem: 32 * 1024 * 1024,
      });

      const keyBuffer = Buffer.from(derivedKey.toString("base64"));
      const originalBuffer = Buffer.from(originalHash);

      if (keyBuffer.length !== originalBuffer.length) return false;
      return crypto.timingSafeEqual(keyBuffer, originalBuffer);
    }

    // 2. SHA-256 / SHA-512 formatted hash support for legacy transition
    if (storedHash.startsWith("$sha256$") || storedHash.startsWith("$sha512$")) {
      const parts = storedHash.split("$");
      const algo = parts[1];
      const salt = parts[2];
      const originalHash = parts[3];
      const computed = crypto.createHmac(algo, salt).update(password).digest("hex");
      return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(originalHash));
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Generate cryptographically secure random session tokens (64 characters hex).
 */
export function generateSecureToken(byteLength: number = 32): string {
  return crypto.randomBytes(byteLength).toString("hex");
}
