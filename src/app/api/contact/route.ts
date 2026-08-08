import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { ContactFormSchema } from "@/lib/validation";
import { PrismaClient } from "@prisma/client";
import { sendMetaCAPIEvent, sendTikTokEvent, sendGoogleAdsEvent } from "@/lib/ads-service";
import { sendTelegramNotification, pushToGoogleSheetsWebhook, getVietnamFormattedTime } from "@/lib/notification-service";

import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Mozilla/5.0";

  // Rate limit: 5 requests per 60 seconds
  const rateLimitResult = await checkRateLimit(`contact:${ip}`, 5, 60);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const validatedData = ContactFormSchema.parse(body);

    // Extract Click IDs & Attribution parameters
    const gclid = body.gclid || undefined;
    const wbraid = body.wbraid || undefined;
    const gbraid = body.gbraid || undefined;
    const fbclid = body.fbclid || undefined;
    const fbc = body.fbc || undefined;
    const fbp = body.fbp || undefined;
    const ttclid = body.ttclid || undefined;
    const utmSource = body.utmSource || undefined;
    const utmMedium = body.utmMedium || undefined;
    const utmCampaign = body.utmCampaign || undefined;
    const service = body.service || validatedData.message || undefined;
    const branch = body.branch || body.address || undefined;
    const gift = body.gift || undefined;

    const message = await prisma.contactMessage.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
        ipAddress: ip,
        conversionStage: "REGISTERED",
        gclid,
        wbraid,
        gbraid,
        fbclid,
        fbc,
        fbp,
        ttclid,
        utmSource,
        utmMedium,
        utmCampaign,
      },
    });

    // Background Async Tasks: Fire Meta CAPI, TikTok, Google Ads, Telegram & Google Sheets
    (async () => {
      try {
        const settings = await prisma.setting.findMany();
        const settingsMap: Record<string, string> = {};
        settings.forEach((s) => (settingsMap[s.key] = s.value));

        const conversionPayload = {
          eventName: "CompleteRegistration" as const,
          phone: validatedData.subject || undefined,
          email: validatedData.email || undefined,
          clientIp: ip,
          userAgent: userAgent,
          sourceUrl: "https://luoidonnha.com/cam-on",
          value: 7999000,
          currency: "VND",
          gclid,
          wbraid,
          gbraid,
          fbclid,
          fbc,
          fbp,
          ttclid,
        };

        // 1. Fire Meta CAPI (Only if Master Switch ON)
        if (
          settingsMap.meta_capi_enabled === "1" &&
          settingsMap.meta_pixel_id &&
          settingsMap.meta_access_token
        ) {
          sendMetaCAPIEvent(
            settingsMap.meta_pixel_id,
            settingsMap.meta_access_token,
            conversionPayload,
            settingsMap.meta_test_code
          ).catch(() => {});
        }

        // 2. Fire TikTok Events API (Only if Master Switch ON)
        if (
          settingsMap.tiktok_ads_enabled === "1" &&
          settingsMap.tiktok_pixel_code &&
          settingsMap.tiktok_access_token
        ) {
          sendTikTokEvent(
            settingsMap.tiktok_pixel_code,
            settingsMap.tiktok_access_token,
            conversionPayload
          ).catch(() => {});
        }

        // 3. Fire Google Ads Conversion (Only if Master Switch ON)
        if (
          settingsMap.google_ads_enabled === "1" &&
          settingsMap.google_conversion_id
        ) {
          sendGoogleAdsEvent(
            settingsMap.google_conversion_id,
            settingsMap.google_conversion_label || "",
            conversionPayload
          ).catch(() => {});
        }

        // 4. Send Instant Telegram Bot Notification
        if (settingsMap.telegram_bot_token && settingsMap.telegram_chat_id) {
          const enabledFields = settingsMap.telegram_fields
            ? JSON.parse(settingsMap.telegram_fields)
            : undefined;

          sendTelegramNotification(
            settingsMap.telegram_bot_token,
            settingsMap.telegram_chat_id,
            {
              time: getVietnamFormattedTime(),
              name: validatedData.name,
              phone: validatedData.subject || "Chưa nhập",
              email: validatedData.email || undefined,
              service: service,
              gift: gift,
              branch: branch,
              url: "https://luoidonnha.com",
              ip: ip,
              userAgent: userAgent,
              gclid,
              fbclid,
              ttclid,
              utmSource,
              utmMedium,
              enabledFields,
            }
          ).catch(() => {});
        }

        // 5. Push Lead directly to Google Sheets Webhook if configured
        if (settingsMap.google_sheets_webhook_url) {
          pushToGoogleSheetsWebhook(
            settingsMap.google_sheets_webhook_url,
            {
              time: getVietnamFormattedTime(),
              name: validatedData.name,
              phone: validatedData.subject || "Chưa nhập",
              email: validatedData.email || undefined,
              service: service,
              gift: gift,
              branch: branch,
              url: "https://luoidonnha.com",
              ip: ip,
              userAgent: userAgent,
              gclid,
              fbclid,
              ttclid,
              utmSource,
              utmMedium,
            }
          ).catch(() => {});
        }
      } catch {}
    })();

    return NextResponse.json({
      success: true,
      message: "Cảm ơn bạn đã liên hệ! Lười Dọn Nhà sẽ phản hồi sớm nhất.",
      redirectTo: "/cam-on",
      data: message,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
