import crypto from "crypto";
import { db } from "@/lib/db";

/**
 * Standardize & SHA-256 hash phone number for Meta Conversions API
 * Example: "0912 743 327" -> "84912743327" -> SHA256 hex
 */
export function hashPhone(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "84" + cleaned.slice(1);
  }
  return crypto.createHash("sha256").update(cleaned).digest("hex");
}

/**
 * Standardize & SHA-256 hash email for Meta Conversions API
 */
export function hashEmail(email: string): string {
  if (!email) return "";
  const cleaned = email.trim().toLowerCase();
  return crypto.createHash("sha256").update(cleaned).digest("hex");
}

export interface MetaCapiPayload {
  eventName: "Lead" | "Contact" | "Purchase" | "Other";
  leadId?: string;
  phone: string;
  email?: string;
  fullName?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  value?: number;
  currency?: string;
  sourceUrl?: string;
}

/**
 * Dispatch Conversion Lead Event to Meta Conversions API
 */
export async function sendMetaCapiLeadEvent(payload: MetaCapiPayload) {
  try {
    // 1. Fetch Meta Ads Settings from Database
    const adsSetting = await db.adsSetting.findUnique({
      where: { platform: "META" },
    });

    if (!adsSetting || !adsSetting.isEnabled || !adsSetting.pixelId || !adsSetting.accessToken) {
      return {
        success: false,
        message: "Chưa cấu hình Meta Pixel ID hoặc Access Token trong Cài đặt Quảng Cáo.",
      };
    }

    const { pixelId, accessToken, testCode } = adsSetting;
    const phoneHash = hashPhone(payload.phone);
    const emailHash = payload.email ? hashEmail(payload.email) : undefined;

    // Split name into first and last if provided
    let fnHash: string | undefined;
    let lnHash: string | undefined;
    if (payload.fullName) {
      const parts = payload.fullName.trim().split(/\s+/);
      if (parts.length > 1) {
        fnHash = crypto.createHash("sha256").update(parts[parts.length - 1].toLowerCase()).digest("hex");
        lnHash = crypto.createHash("sha256").update(parts.slice(0, -1).join(" ").toLowerCase()).digest("hex");
      } else {
        fnHash = crypto.createHash("sha256").update(parts[0].toLowerCase()).digest("hex");
      }
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const eventData: Record<string, any> = {
      event_name: payload.eventName,
      event_time: currentTimestamp,
      action_source: "system_generated",
      event_source_url: payload.sourceUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://luoidonnha.com",
      user_data: {
        ...(payload.leadId ? { lead_id: payload.leadId } : {}),
        ph: [phoneHash],
        ...(emailHash ? { em: [emailHash] } : {}),
        ...(fnHash ? { fn: [fnHash] } : {}),
        ...(lnHash ? { ln: [lnHash] } : {}),
        ...(payload.fbp ? { fbp: payload.fbp } : {}),
        ...(payload.fbc ? { fbc: payload.fbc } : {}),
      },
      custom_data: {
        currency: payload.currency || "VND",
        ...(payload.value !== undefined ? { value: payload.value } : {}),
      },
    };

    const requestBody: Record<string, any> = {
      data: [eventData],
      ...(testCode ? { test_event_code: testCode } : {}),
    };

    const metaUrl = `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`;

    const res = await fetch(metaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const responseData = await res.json();

    // Log event attempt to AdsLog
    await db.adsLog.create({
      data: {
        platform: "META_CAPI_LEAD",
        eventName: payload.eventName,
        eventData: JSON.stringify(requestBody),
        status: res.ok ? "SUCCESS" : "FAILED",
        response: JSON.stringify(responseData),
      },
    });

    return {
      success: res.ok,
      data: responseData,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "CAPI call failed";
    return { success: false, error: errorMsg };
  }
}
