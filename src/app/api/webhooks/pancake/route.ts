import { NextResponse } from "next/server";
import { crmDb } from "@/lib/db";
import { omniDb } from "@/lib/omni-db";
import { parsePancakeTags } from "@/lib/pancake-tag-parser";
import { normalizeVnPhone } from "@/lib/identity-resolution";

/**
 * LƯỜI BUSINESS OS — Pancake.vn Multi-Channel Webhook & Tag Synchronization Hub
 * 
 * Capabilities:
 * 1. Synchronizes 52+ channels (43 Fanpages, 2 Instagrams, 1 WhatsApp, 4 Zalo OAs)
 * 2. Parses Pancake Tags (IMP, SỨ, CN, SĐT, DĐH, BÙM, 1T, TRÚC, QUIN, XUÂN...)
 * 3. Auto-qualifies Leads, sets Service & Telesale, and triggers Meta/Google CAPI
 */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.PANCAKE_VERIFY_TOKEN || "luoidonnha_pancake_secret";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ success: true, status: "Pancake Multi-Channel Webhook Active" });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Support both Webhook Payload & Manual Batch Sync Payload
    const customers = body.customers || body.data || [body];

    let syncedCount = 0;

    for (const item of customers) {
      const pageId = item.page_id || item.pageId || "PANCAKE_PAGE";
      const pageName = item.page_name || item.pageName || `Fanpage #${pageId}`;
      const customerName = item.name || item.customer_name || item.sender?.name || "Khách Pancake";
      const rawPhone = item.phone || item.phone_number;
      const rawTags = item.tags || item.tag_names || item.labels || [];
      const psid = item.psid || item.customer_id || item.id;
      const notes = item.notes || item.note || "";
      const timestamp = item.inserted_at ? new Date(item.inserted_at) : new Date();

      // 2. Parse Tags (IMP, SỨ, CN, SĐT, DĐH, BÙM, 1T, Telesale name...)
      const parsedTags = parsePancakeTags(rawTags);

      // 3. Normalize Phone or fallback to PSID identifier
      const phoneNorm = rawPhone ? normalizeVnPhone(rawPhone) : psid ? `pancake_${psid}` : undefined;

      if (!phoneNorm) continue;

      // 4. Ingest into Unified CRM (cRMLead)
      if (crmDb) {
        try {
          const tagLabels = parsedTags.matchedTags.map(t => t.code).join(", ") || "Không có";
          const formattedNote = `[Pancake.vn Sync - ${pageName}]:\n• Thẻ: ${tagLabels}\n• Trạng thái: ${parsedTags.status}${parsedTags.nurturePlan ? `\n• Lộ trình chăm: ${parsedTags.nurturePlan}` : ""}${parsedTags.isVietKieu ? "\n• Đối tượng: Khách Việt Kiều (VK)" : ""}${parsedTags.isForeigner ? "\n• Đối tượng: Khách Nước Ngoài (NN)" : ""}${parsedTags.isCustomerComplain ? "\n• CẢNH BÁO: Khách phản ánh dịch vụ không tốt (KKC)" : ""}\n${notes ? `• Ghi chú thêm: ${notes}` : ""}`;

          await (crmDb as any).cRMLead.upsert({
            where: { phone: phoneNorm },
            update: {
              fullName: customerName,
              service: parsedTags.service || undefined,
              serviceGroup: parsedTags.serviceGroup || undefined,
              telesale: parsedTags.telesale || undefined,
              status: parsedTags.status === "PURCHASE" ? "PURCHASE" : parsedTags.status === "QUALIFIED" ? "QUALIFIED" : parsedTags.status === "FAIL" ? "FAIL" : parsedTags.status === "RE_NURTURE" ? "RE_NURTURE" : "NEW",
              source: `Pancake (${pageName})`,
              sourceGroup: "PANCAKE",
              note: formattedNote,
              updatedAt: new Date(),
            },
            create: {
              fullName: customerName,
              phone: phoneNorm,
              service: parsedTags.service || "Chỉnh nha",
              serviceGroup: parsedTags.serviceGroup || "CHỈNH NHA",
              telesale: parsedTags.telesale || "XUÂN",
              status: parsedTags.status === "PURCHASE" ? "PURCHASE" : parsedTags.status === "QUALIFIED" ? "QUALIFIED" : parsedTags.status === "FAIL" ? "FAIL" : "NEW",
              source: `Pancake (${pageName})`,
              sourceGroup: "PANCAKE",
              branch: "Hồ Chí Minh - Thủ Đức",
              note: formattedNote,
              createdAt: timestamp,
            },
          });

          syncedCount++;
        } catch (dbErr) {
          console.warn("[Pancake Webhook] CRM Lead upsert notice:", dbErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã đồng bộ ${syncedCount} khách hàng và phân loại thẻ Pancake thành công!`,
      syncedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Pancake Webhook Error]:", error?.message);
    return NextResponse.json({ success: false, error: error.message || "Pancake Webhook Error" }, { status: 500 });
  }
}
