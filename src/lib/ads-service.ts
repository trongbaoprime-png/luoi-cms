import crypto from "crypto";

export interface ConversionEventPayload {
  eventName: "CompleteRegistration" | "Lead" | "Contact" | "AuditBooking" | "Purchase";
  phone?: string;
  email?: string;
  value?: number;
  currency?: string;
  sourceUrl?: string;
  clientIp?: string;
  userAgent?: string;

  // Multi-Platform Click IDs & Attribution for Offline Conversion Import (OCI)
  gclid?: string;
  wbraid?: string;
  gbraid?: string;
  fbclid?: string;
  fbc?: string;
  fbp?: string;
  ttclid?: string;
}

// 1. Meta Conversions API (CAPI)
export async function sendMetaCAPIEvent(
  pixelId: string,
  accessToken: string,
  event: ConversionEventPayload,
  testCode?: string
) {
  if (!pixelId || !accessToken) return { success: false, message: "Thiếu Pixel ID hoặc Access Token" };

  const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;
  const now = Math.floor(Date.now() / 1000);

  // Normalize phone & email for Meta CAPI Customer Matching
  const normalizedPhone = event.phone ? normalizePhone(event.phone) : undefined;
  const hashedPhone = normalizedPhone ? hashSha256(normalizedPhone) : undefined;
  const hashedEmail = event.email ? hashSha256(event.email.trim().toLowerCase()) : undefined;

  const userData: Record<string, any> = {
    client_ip_address: event.clientIp || "127.0.0.1",
    client_user_agent:
      event.userAgent ||
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  };

  if (hashedPhone) userData.ph = [hashedPhone];
  if (hashedEmail) userData.em = [hashedEmail];

  // Click ID matching (fbc & fbp) for 100% precision matching
  if (event.fbc) {
    userData.fbc = event.fbc;
  } else if (event.fbclid) {
    userData.fbc = `fb.1.${now}.${event.fbclid}`;
  }
  if (event.fbp) {
    userData.fbp = event.fbp;
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: event.eventName,
        event_time: now,
        action_source: "website",
        event_source_url: event.sourceUrl || "https://luoidonnha.com",
        user_data: userData,
        custom_data: {
          currency: event.currency || "VND",
          value: event.value || 0,
        },
      },
    ],
  };

  if (testCode) {
    payload.test_event_code = testCode;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return { success: res.ok, data };
}

// 2. TikTok Events API
export async function sendTikTokEvent(
  pixelCode: string,
  accessToken: string,
  event: ConversionEventPayload,
  testCode?: string
) {
  if (!pixelCode || !accessToken) return { success: false, message: "Thiếu TikTok Pixel Code hoặc Access Token" };

  const url = "https://business-api.tiktok.com/open_api/v1.3/event/track/";
  const normalizedPhone = event.phone ? normalizePhone(event.phone) : undefined;

  const payload: Record<string, any> = {
    pixel_code: pixelCode,
    event:
      event.eventName === "CompleteRegistration"
        ? "CompleteRegistration"
        : event.eventName === "Lead"
        ? "SubmitForm"
        : event.eventName === "Purchase"
        ? "CompletePayment"
        : "Contact",
    event_id: `evt_${Date.now()}`,
    timestamp: new Date().toISOString(),
    context: {
      user: {
        phone_number: normalizedPhone ? hashSha256(normalizedPhone) : undefined,
        email: event.email ? hashSha256(event.email.trim().toLowerCase()) : undefined,
        ip: event.clientIp || "127.0.0.1",
        user_agent: event.userAgent || "Mozilla/5.0",
        ttclid: event.ttclid || undefined,
      },
      ad: event.ttclid ? { callback: event.ttclid } : undefined,
      page: { url: event.sourceUrl || "https://luoidonnha.com" },
    },
    properties: {
      currency: event.currency || "VND",
      value: event.value || 0,
    },
  };

  if (testCode) {
    payload.test_event_code = testCode;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Token": accessToken,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return { success: res.ok, data };
}

// 3. Google Ads Conversion API & GTAG Snippet Generator (GCLID + Enhanced Conversions)
export async function sendGoogleAdsEvent(
  conversionId: string,
  conversionLabel: string,
  event: ConversionEventPayload
) {
  if (!conversionId) return { success: false, message: "Thiếu Google Ads Conversion ID" };

  const normalizedPhone = event.phone ? normalizePhone(event.phone) : undefined;
  const hashedPhone = normalizedPhone ? hashSha256(normalizedPhone) : undefined;
  const hashedEmail = event.email ? hashSha256(event.email.trim().toLowerCase()) : undefined;

  const gtagSnippet = `
<!-- Google Tag (gtag.js) - Google Ads Enhanced Conversions + GCLID OCI -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${conversionId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${conversionId}', {
    'allow_enhanced_conversions': true
  });

  // Enhanced Conversions User Data (ECL / OCI)
  gtag('event', 'conversion', {
    'send_to': '${conversionId}/${conversionLabel}',
    'value': ${event.value || 0},
    'currency': '${event.currency || "VND"}',
    'gclid': '${event.gclid || ""}',
    'wbraid': '${event.wbraid || ""}',
    'gbraid': '${event.gbraid || ""}',
    'user_data': {
      'sha256_email_address': '${hashedEmail || ""}',
      'sha256_phone_number': '${hashedPhone || ""}'
    }
  });
</script>
`;

  return {
    success: true,
    message: "Đã sinh mã Google Enhanced Conversions (GCLID/ECL) snippet!",
    data: {
      conversionId,
      conversionLabel,
      eventName: event.eventName,
      gclid: event.gclid || null,
      wbraid: event.wbraid || null,
      gbraid: event.gbraid || null,
      hashedPhone,
      hashedEmail,
      gtagSnippet,
    },
  };
}

// Utility: Phone normalization to E.164 without leading plus (e.g. 0839186099 -> 84839186099)
export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "84" + cleaned.slice(1);
  }
  return cleaned;
}

// Utility: SHA-256 Hashing (64 hex characters)
export function hashSha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}
