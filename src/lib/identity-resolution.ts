/**
 * LƯỜI BUSINESS OS — Customer 360 Identity Resolution Engine
 * Normalizes Vietnamese phone numbers, unifies multi-channel identities, and manages profile merges.
 */

export type ChannelIdentityType =
  | "PHONE"
  | "EMAIL"
  | "MESSENGER_PSID"
  | "ZALO_USER_ID"
  | "TELEGRAM_USER_ID"
  | "PANCAKE_CUSTOMER_ID"
  | "WHATSAPP_ID"
  | "VISITOR_COOKIE";

export interface NormalizedIdentity {
  type: ChannelIdentityType;
  raw: string;
  normalized: string;
  isVerified: boolean;
}

export interface CustomerProfile360 {
  id: string;
  workspaceId: string;
  primaryPhone?: string;
  primaryEmail?: string;
  fullName?: string;
  identities: NormalizedIdentity[];
  leadScore: number;
  lifetimeValue: number;
  assignedSalesId?: string;
}

/**
 * Standardize Vietnamese phone numbers to canonical format (+84xxxxxxxxx)
 * Handles: 0xxxxxxxxx, 84xxxxxxxxx, +84xxxxxxxxx, spaces, dots, dashes.
 */
export function normalizeVnPhone(phoneStr: string): string {
  if (!phoneStr) return "";

  // Remove spaces, dots, dashes, parentheses
  let cleaned = phoneStr.replace(/[\s\.\-\(\)]/g, "").trim();

  if (cleaned.startsWith("+84")) {
    cleaned = "84" + cleaned.slice(3);
  } else if (cleaned.startsWith("0")) {
    cleaned = "84" + cleaned.slice(1);
  }

  // Ensure valid 11-digit VN phone (84 + 9 digits)
  if (/^84\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  return phoneStr.trim();
}

/**
 * Normalize Email to lowercase & trimmed
 */
export function normalizeEmail(emailStr: string): string {
  if (!emailStr) return "";
  return emailStr.trim().toLowerCase();
}

/**
 * Parse and normalize an incoming channel identity
 */
export function normalizeIdentity(type: ChannelIdentityType, rawValue: string): NormalizedIdentity {
  let normalized = rawValue.trim();

  if (type === "PHONE") {
    normalized = normalizeVnPhone(rawValue);
  } else if (type === "EMAIL") {
    normalized = normalizeEmail(rawValue);
  }

  return {
    type,
    raw: rawValue,
    normalized,
    isVerified: type === "PHONE" || type === "EMAIL",
  };
}

/**
 * Resolve whether two identities belong to the same Customer 360 profile
 */
export function resolveCustomerIdentityMatch(
  existingCustomer: CustomerProfile360,
  incomingIdentity: NormalizedIdentity
): { isExactMatch: boolean; confidenceScore: number; reason: string } {
  // 1. Exact Phone Match
  if (incomingIdentity.type === "PHONE" && existingCustomer.primaryPhone) {
    if (normalizeVnPhone(incomingIdentity.normalized) === normalizeVnPhone(existingCustomer.primaryPhone)) {
      return { isExactMatch: true, confidenceScore: 1.0, reason: "Exact match on verified Vietnamese Phone number" };
    }
  }

  // 2. Exact Email Match
  if (incomingIdentity.type === "EMAIL" && existingCustomer.primaryEmail) {
    if (normalizeEmail(incomingIdentity.normalized) === normalizeEmail(existingCustomer.primaryEmail)) {
      return { isExactMatch: true, confidenceScore: 1.0, reason: "Exact match on verified Email address" };
    }
  }

  // 3. Existing Channel Identity Match
  const channelMatch = existingCustomer.identities.find(
    (i) => i.type === incomingIdentity.type && i.normalized === incomingIdentity.normalized
  );

  if (channelMatch) {
    return { isExactMatch: true, confidenceScore: 0.95, reason: `Exact match on ${incomingIdentity.type} channel identity` };
  }

  return { isExactMatch: false, confidenceScore: 0.0, reason: "No identity match found" };
}
