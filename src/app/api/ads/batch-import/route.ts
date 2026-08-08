import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendMetaCAPIEvent, sendTikTokEvent, sendGoogleAdsEvent } from "@/lib/ads-service";
import { mapStatusToEventName } from "@/app/api/webhooks/crm/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rows } = body; // Array of customer rows

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "Danh sách khách hàng không hợp lệ hoặc rỗng!" },
        { status: 400 }
      );
    }

    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => (settingsMap[s.key] = s.value));

    let processedCount = 0;
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // Process rows in batches
    for (const row of rows) {
      processedCount++;
      const phone = row.phone || row.sdt || row["Số điện thoại"] || "";
      const email = row.email || row["Email"] || "";
      const name = row.name || row.hoten || row["Họ và Tên"] || "Khách hàng cũ";
      const status = row.status || row.trangthai || row["Trạng thái"] || "đặt hẹn";
      const revenue = Number(row.revenue || row.doanhthu || row["Doanh thu"]) || 0;
      const service = row.service || row.dichvu || row["Dịch vụ"] || "Mặc định";

      if (!phone && !email) {
        failCount++;
        errors.push(`Dòng ${processedCount}: Thiếu SĐT và Email`);
        continue;
      }

      const { eventName } = mapStatusToEventName(status, revenue);

      const conversionPayload = {
        eventName,
        phone: String(phone),
        email: email ? String(email) : undefined,
        value: revenue || (eventName === "Lead" ? 200000 : eventName === "AuditBooking" ? 600000 : 0),
        currency: "VND",
        sourceUrl: "https://luoidonnha.com/batch-import",
        clientIp: "127.0.0.1",
        userAgent: "Batch-Excel-Importer",
      };

      try {
        // Fire Meta CAPI
        if (settingsMap.meta_pixel_id && settingsMap.meta_access_token) {
          await sendMetaCAPIEvent(
            settingsMap.meta_pixel_id,
            settingsMap.meta_access_token,
            conversionPayload,
            settingsMap.meta_test_code
          );
        }

        // Fire TikTok Events
        if (settingsMap.tiktok_pixel_code && settingsMap.tiktok_access_token) {
          await sendTikTokEvent(
            settingsMap.tiktok_pixel_code,
            settingsMap.tiktok_access_token,
            conversionPayload
          );
        }

        // Fire Google Ads
        if (settingsMap.google_conversion_id) {
          await sendGoogleAdsEvent(
            settingsMap.google_conversion_id,
            settingsMap.google_conversion_label || "",
            conversionPayload
          );
        }

        successCount++;
      } catch (err: unknown) {
        failCount++;
        errors.push(`Dòng ${processedCount} (${phone}): ${err instanceof Error ? err.message : "Lỗi gửi CAPI"}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã xử lý xong batch import: ${successCount}/${processedCount} khách hàng thành công!`,
      data: {
        totalRows: processedCount,
        successCount,
        failCount,
        errors,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi hệ thống batch import";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
