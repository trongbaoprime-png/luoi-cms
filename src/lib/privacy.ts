/**
 * Utility for Customer Data Privacy & Phone Masking
 */

/**
 * Mask phone number for non-admin/telesale staff without unmask permission
 * e.g. "0908880354" -> "0908***354"
 */
export function maskPhoneNumber(phone?: string | null, allowUnmask: boolean = false): string {
  if (!phone) return "";
  if (allowUnmask) return phone;

  const clean = phone.trim();
  if (clean.length < 7) return clean;

  // Keep first 4 digits and last 3 digits, mask middle digits
  const first = clean.slice(0, 4);
  const last = clean.slice(-3);
  return `${first}***${last}`;
}

/**
 * Check if a user's permissions JSON includes a specific permission key
 */
export function hasPermission(permissionsJson?: string | null, permKey?: string): boolean {
  if (!permissionsJson || !permKey) return false;
  try {
    const list: string[] = JSON.parse(permissionsJson);
    return list.includes(permKey) || list.includes("all") || list.includes("ADMIN");
  } catch {
    return false;
  }
}
