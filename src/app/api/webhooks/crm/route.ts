import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendMetaCAPIEvent, sendTikTokEvent, sendGoogleAdsEvent } from "@/lib/ads-service";

const prisma = new PrismaClient();

// Helper: Normalize customer status to EventName
export function mapStatusToEventName(status: string, revenue?: number): {
  eventName: "CompleteRegistration" | "Lead" | "AuditBooking" | "Purchase";
  isPurchase: boolean;
} {
  const cleanStatus = (status || "").toLowerCase().trim();

  // If status indicates revenue / purchase or revenue > 0 with checkin
  if (
    cleanStatus.includes("mua hàng") ||
    cleanStatus.includes("purchase") ||
    cleanStatus.includes("thanh toán") ||
    (cleanStatus.includes("checkin") && revenue && revenue > 0)
  ) {
    return { eventName: "Purchase", isPurchase: true };
  }

  // Checkin / Audit booking
  if (
    cleanStatus.includes("checkin") ||
    cleanStatus.includes("auditbooking") ||
    cleanStatus.includes("đến khám")
  ) {
    return { eventName: "AuditBooking", isPurchase: false };
  }

  // Đặt hẹn / Lead
  if (
    cleanStatus.includes("đặt hẹn") ||
    cleanStatus.includes("lead") ||
    cleanStatus.includes("tư vấn")
  ) {
    return { eventName: "Lead", isPurchase: false };
  }

  // Default fallback for registration
  return { eventName: "CompleteRegistration", isPurchase: false };
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("x-crm-secret") || req.headers.get("authorization");
    const body = await req.json();

    const {
      name,
      phone,
      email,
      service,
      status,
      revenue,
      gclid,
      fbclid,
      ttclid,
      fbc,
      fbp,
      sourceUrl,
    } = body;

    if (!phone && !email) {
      return NextResponse.json(
        { error: "Bắt buộc phải cung cấp Số điện thoại hoặc Email khách hàng!" },
        { status: 400 }
      );
    }

    const numericRevenue = Number(revenue) || 0;
    const { eventName, isPurchase } = mapStatusToEventName(status || "", numericRevenue);

    // Save/update record in Database
    const savedMessage = await prisma.contactMessage.create({
      data: {
        name: name || "Khách từ CRM/Google Sheet",
        email: email ? String(email).trim() : "",
        subject: phone || "SĐT CRM",
        message: `[CRM Auto Postback] Dịch vụ: ${service || "TQ"} | Trạng thái: ${status} | Doanh thu: ${numericRevenue.toLocaleString("vi-VN")} VND`,
        status: isPurchase ? "READ" : "UNREAD",
        conversionStage: eventName,
        gclid: gclid || undefined,
        fbclid: fbclid || undefined,
        fbc: fbc || undefined,
        fbp: fbp || undefined,
        ttclid: ttclid || undefined,
      },
    });

    // Fetch Ads Credentials from Settings DB
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => (settingsMap[s.key] = s.value));

    const conversionPayload = {
      eventName,
      phone: phone ? String(phone) : undefined,
      email: email ? String(email) : undefined,
      value: numericRevenue || (eventName === "Lead" ? 200000 : eventName === "AuditBooking" ? 600000 : 0),
      currency: "VND",
      sourceUrl: sourceUrl || "https://luoidonnha.com/admin/deals",
      clientIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "CRM-Realtime-Webhook",
      gclid: gclid || undefined,
      fbclid: fbclid || undefined,
      fbc: fbc || undefined,
      fbp: fbp || undefined,
      ttclid: ttclid || undefined,
    };

    const apiResults: Record<string, any> = {};

    // 1. Fire Meta CAPI Realtime
    if (settingsMap.meta_pixel_id && settingsMap.meta_access_token) {
      apiResults.meta = await sendMetaCAPIEvent(
        settingsMap.meta_pixel_id,
        settingsMap.meta_access_token,
        conversionPayload,
        settingsMap.meta_test_code
      );
    }

    // 2. Fire TikTok Events API Realtime
    if (settingsMap.tiktok_pixel_code && settingsMap.tiktok_access_token) {
      apiResults.tiktok = await sendTikTokEvent(
        settingsMap.tiktok_pixel_code,
        settingsMap.tiktok_access_token,
        conversionPayload
      );
    }

    // 3. Fire Google Ads Enhanced Conversions Realtime
    if (settingsMap.google_conversion_id) {
      apiResults.google = await sendGoogleAdsEvent(
        settingsMap.google_conversion_id,
        settingsMap.google_conversion_label || "",
        conversionPayload
      );
    }

    return NextResponse.json({
      success: true,
      message: `[Realtime Postback] Đã xử lý sự kiện ${eventName} cho khách hàng ${name || phone}!`,
      data: {
        recordId: savedMessage.id,
        eventName,
        phone,
        service: service || "Mặc định",
        revenue: numericRevenue,
        apiResults,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Đã xảy ra lỗi hệ thống";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
