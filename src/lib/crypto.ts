/**
 * LƯỜI BUSINESS OS — AES-256-GCM Encryption Engine
 * Encrypts and decrypts secret references, third-party API credentials, and webhook tokens.
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET_KEY = process.env.LUOI_MASTER_ENCRYPTION_KEY || "luoi-business-os-master-encryption-key-32bytes!";

/**
 * Ensures key is exactly 32 bytes for AES-256
 */
function getMasterKey(): Buffer {
  return crypto.createHash("sha256").update(SECRET_KEY).digest();
}

/**
 * Encrypt plaintext to AES-256-GCM ciphertext format: iv:authTag:encryptedText
 */
export function encryptSecret(plaintext: string): string {
  if (!plaintext) return "";
  const iv = crypto.randomBytes(12);
  const key = getMasterKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypt AES-256-GCM ciphertext back to plaintext
 */
export function decryptSecret(ciphertext: string): string {
  if (!ciphertext || !ciphertext.includes(":")) return ciphertext;

  try {
    const parts = ciphertext.split(":");
    if (parts.length !== 3) return ciphertext;

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const key = getMasterKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    console.error("[DECRYPT SECRET FAILED]", err);
    return "[DECRYPTION_ERROR]";
  }
}
