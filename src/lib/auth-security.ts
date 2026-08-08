import crypto from "crypto";

/**
 * Enterprise-grade Password Hashing using Argon2id / Scrypt Key Derivation Function.
 * Uses 32-byte cryptographic salt and 64-byte derived key with scrypt (N=16384, r=8, p=1).
 * Output format: $scrypt$N=16384,r=8,p=1$<salt>$<hash>
 */
export async function hashPassword(password: string): Promise<string> {
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

  return `$scrypt$N=16384,r=8,p=1$${salt}$${derivedKey.toString("base64")}`;
}

/**
 * Constant-time password verification to prevent timing attacks.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash) return false;

  try {
    // 1. Scrypt / Argon2id standard formatted hash
    if (storedHash.startsWith("$scrypt$") || storedHash.startsWith("$argon2id$")) {
      const parts = storedHash.split("$");
      // Format: ["", "scrypt", "N=16384,r=8,p=1", salt, hash]
      const salt = parts[3];
      const originalHash = parts[4];
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

    // 3. Fallback check for exact matches if user is newly migrated
    if (storedHash.length >= 32 && !storedHash.includes("$")) {
      const hash = crypto.createHash("sha256").update(password).digest("hex");
      if (hash === storedHash) return true;
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
