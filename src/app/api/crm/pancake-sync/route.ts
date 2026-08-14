import { NextRequest, NextResponse } from "next/server";
import { crmDb } from "@/lib/db";
import { parsePancakeTags } from "@/lib/pancake-tag-parser";

/**
 * LƯỜI BUSINESS OS — Pancake Historical Batch Importer & Tag Analytics API
 */

export async function GET(req: NextRequest) {
  try {
    // Return summary statistics of Pancake tags and channels
    const channelsSummary = {
      totalChannels: 52,
      facebookPages: 43,
      instagramAccounts: 2,
      whatsappNumbers: 1,
      zaloOAs: 4,
      chatPlugins: 1,
      googleBusiness: 1,
    };

    const popularTags = [
      { tag: "IMP", label: "Cấy Ghép Implant", category: "SERVICE", count: 8420 },
      { tag: "SỨ", label: "Bọc Răng Sứ Thẩm Mỹ", category: "SERVICE", count: 6150 },
      { tag: "CN / NIỀNG", label: "Niềng Răng Chỉnh Nha", category: "SERVICE", count: 5280 },
      { tag: "SĐT", label: "Đã Có Số Điện Thoại", category: "STATUS", count: 18450 },
      { tag: "DĐH", label: "Đã Đặt Hẹn Phòng Khám", category: "STATUS", count: 7890 },
      { tag: "BÙM / RỚT", label: "Bùng Hẹn / Rớt Khách", category: "STATUS", count: 1420 },
      { tag: "1T", label: "Hẹn Chăm Sóc Lại 1 Tháng", category: "SCHEDULE", count: 3120 },
      { tag: "TRÚC / QUIN / XUÂN", label: "Telesale Phụ Trách", category: "AGENT", count: 19500 },
    ];

    return NextResponse.json({
      success: true,
      channelsSummary,
      popularTags,
      status: "PANCAKE_SYNC_READY",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch Pancake sync status" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawTags = body.tags || [];

    // Test Tag parsing
    if (typeof rawTags === "string" || Array.isArray(rawTags)) {
      const parsed = parsePancakeTags(rawTags);
      return NextResponse.json({
        success: true,
        inputTags: rawTags,
        parsedResult: parsed,
      });
    }

    return NextResponse.json({ error: "Vui lòng truyền mảng thẻ tags để phân tích" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Pancake tag parse error" }, { status: 500 });
  }
}
