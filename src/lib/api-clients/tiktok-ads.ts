/**
 * TikTok Events API Client
 */
export async function sendTikTokEvent(eventName: string, eventSourceUrl: string, userIp?: string) {
  const pixelCode = process.env.TIKTOK_PIXEL_CODE;
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

  if (!pixelCode || !accessToken) {
    return { success: false, error: "TikTok Pixel Code or Access Token missing" };
  }

  const endpoint = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify({
        pixel_code: pixelCode,
        event: eventName,
        event_time: Math.floor(Date.now() / 1000),
        context: {
          page: { url: eventSourceUrl },
          ip: userIp,
        },
      }),
    });

    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
