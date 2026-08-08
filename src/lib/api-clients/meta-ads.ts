/**
 * Meta Conversions API (CAPI) Client
 */
export interface MetaEventData {
  eventName: string; // e.g. 'PageView', 'Lead', 'Purchase', 'ViewContent'
  eventSourceUrl: string;
  userEmail?: string;
  userPhone?: string;
  ipAddress?: string;
  userAgent?: string;
  customData?: Record<string, unknown>;
}

export async function sendMetaCapiEvent(event: MetaEventData): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    return { success: false, error: "Meta Pixel ID or Access Token is missing" };
  }

  const endpoint = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: event.eventSourceUrl,
        action_source: "website",
        user_data: {
          client_ip_address: event.ipAddress,
          client_user_agent: event.userAgent,
          em: event.userEmail ? [hashSha256(event.userEmail)] : undefined,
          ph: event.userPhone ? [hashSha256(event.userPhone)] : undefined,
        },
        custom_data: event.customData,
      },
    ],
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: JSON.stringify(data) };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

function hashSha256(value: string): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}
