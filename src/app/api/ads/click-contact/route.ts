import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendMetaCAPIEvent, sendTikTokEvent, sendGoogleAdsEvent } from "@/lib/ads-service";
import { sendTelegramNotification, getVietnamFormattedTime } from "@/lib/notification-service";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    let body: any = {};
    const text = await req.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = {};
      }
    }

    const { channel = "HOTLINE", targetUrl = "", sourceUrl = "", gclid, fbclid, fbc, fbp, ttclid } = body;
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Mozilla/5.0";

    const channelName = channel.toUpperCase();
    const eventName = "Contact" as const;

    // Save lead interaction record in database
    await prisma.contactMessage.create({
      data: {
        name: `Khách Bấm ${channelName}`,
        email: `click_${channelName.toLowerCase()}@luoidonnha.com`,
        subject: `Bấm ${channelName}: ${targetUrl || sourceUrl}`,
        message: `[Auto Outbound Click] Kênh: ${channelName} | URL Nguồn: ${sourceUrl} | Đích: ${targetUrl}`,
        status: "UNREAD",
        conversionStage: `CLICK_${channelName}`,
        gclid: gclid || undefined,
        fbclid: fbclid || undefined,
        fbc: fbc || undefined,
        fbp: fbp || undefined,
        ttclid: ttclid || undefined,
      },
    });

    // Fire Ads CAPI & Telegram Notification in Background
    (async () => {
      try {
        const settings = await prisma.setting.findMany();
        const settingsMap: Record<string, string> = {};
        settings.forEach((s) => (settingsMap[s.key] = s.value));

        const conversionPayload = {
          eventName,
          clientIp: ip,
          userAgent: userAgent,
          sourceUrl: sourceUrl || "https://luoidonnha.com",
          value: 100000,
          currency: "VND",
          gclid,
          fbclid,
          fbc,
          fbp,
          ttclid,
        };

        // 1. Fire Meta CAPI
        if (settingsMap.meta_pixel_id && settingsMap.meta_access_token) {
          sendMetaCAPIEvent(
            settingsMap.meta_pixel_id,
            settingsMap.meta_access_token,
            conversionPayload,
            settingsMap.meta_test_code
          ).catch(() => {});
        }

        // 2. Fire TikTok Events API
        if (settingsMap.tiktok_pixel_code && settingsMap.tiktok_access_token) {
          sendTikTokEvent(
            settingsMap.tiktok_pixel_code,
            settingsMap.tiktok_access_token,
            conversionPayload
          ).catch(() => {});
        }

        // 3. Fire Google Ads Event
        if (settingsMap.google_conversion_id) {
          sendGoogleAdsEvent(
            settingsMap.google_conversion_id,
            settingsMap.google_conversion_label || "",
            conversionPayload
          ).catch(() => {});
        }

        // 4. Send Instant Telegram Bot Alert
        if (settingsMap.telegram_bot_token && settingsMap.telegram_chat_id) {
          let channelEmoji = "📞";
          if (channelName === "ZALO") channelEmoji = "💬";
          else if (channelName === "MESSENGER") channelEmoji = "⚡";
          else if (channelName === "WHATSAPP") channelEmoji = "🟢";

          const msg = `${channelEmoji} *KHÁCH BẤM KẾT NỐI TƯ VẤN (${channelName})!*\n` +
            `⏰ *Thời gian:* \`${getVietnamFormattedTime()}\` (Giờ VN)\n` +
            `📣 *Kênh Tương Tác:* *${channelName}*\n` +
            `🔗 *Đường Dẫn Đích:* ${targetUrl || "N/A"}\n` +
            `🌐 *Trang Nguồn:* ${sourceUrl}\n` +
            `📍 *IP Khách:* \`${ip}\`\n` +
            (fbclid ? `🔵 *FBCLID:* \`${fbclid}\`\n` : "") +
            (gclid ? `🔴 *GCLID:* \`${gclid}\`\n` : "") +
            (ttclid ? `🎵 *TTCLID:* \`${ttclid}\`\n` : "");

          fetch(`https://api.telegram.org/bot${settingsMap.telegram_bot_token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: settingsMap.telegram_chat_id,
              text: msg,
              parse_mode: "Markdown",
              disable_web_page_preview: true,
            }),
          }).catch(() => {});
        }
      } catch {}
    })();

    return NextResponse.json({ success: true, message: `Logged outbound ${channel} click!` });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error logging click";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
