import argon2 from "argon2";
import crypto from "crypto";

/**
 * Enterprise-grade Password Hashing using official Argon2id.
 * Configuration conforms to OWASP Password Hashing Recommendations:
 * - Type: Argon2id (hybrid memory-hard & side-channel resistant)
 * - Memory: 64 MB (65536 KiB)
 * - Iterations: 3
 * - Parallelism: 1
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string");
  }

  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });
}

/**
 * Checks if a stored password hash is legacy (scrypt, sha256) and needs rehashing to real Argon2id.
 */
export function needsRehash(storedHash: string): boolean {
  if (!storedHash) return true;
  // Real Argon2id hash begins with $argon2id$ and uses version v=19
  return !storedHash.startsWith("$argon2id$");
}

/**
 * Constant-time password verification using Argon2 for Argon2id hashes,
 * with secure backward-compatibility fallback for legacy hashes ($scrypt$, $sha256$).
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash) return false;

  try {
    // 1. Official Argon2id / Argon2 hash verification
    if (
      storedHash.startsWith("$argon2id$") ||
      storedHash.startsWith("$argon2i$") ||
      storedHash.startsWith("$argon2d$")
    ) {
      return await argon2.verify(storedHash, password);
    }

    // 2. Legacy $scrypt$ backward-compatibility verification
    if (storedHash.startsWith("$scrypt$")) {
      const parts = storedHash.split("$");
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

    // 3. Legacy SHA-256 / SHA-512 HMAC transition
    if (storedHash.startsWith("$sha256$") || storedHash.startsWith("$sha512$")) {
      const parts = storedHash.split("$");
      const algo = parts[1];
      const salt = parts[2];
      const originalHash = parts[3];
      const computed = crypto.createHmac(algo, salt).update(password).digest("hex");
      return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(originalHash));
    }

    // 4. Legacy raw SHA-256 hex
    if (storedHash.length === 64 && !storedHash.includes("$")) {
      const hash = crypto.createHash("sha256").update(password).digest("hex");
      return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
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
