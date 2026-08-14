import { NextResponse } from "next/server";
import { omniDb } from "@/lib/omni-db";

/**
 * GET /api/admin/omnichannel/analytics
 * Thống kê tổng số lượng hội thoại theo từng kênh (Facebook, Zalo, Instagram, WhatsApp, Webchat)
 */
export async function GET() {
  try {
    const [
      totalConversations,
      totalWithPhone,
      allFanpages,
      recentConvs,
    ] = await Promise.all([
      omniDb.omniConversation.count(),
      omniDb.omniConversation.count({
        where: {
          OR: [
            { phone: { not: null } },
            { tags: { contains: "SDT" } },
          ],
        },
      }),
      omniDb.omniFanpage.findMany({
        select: { pageId: true, pageName: true, category: true },
      }),
      omniDb.omniConversation.findMany({
        select: { pageId: true, igsid: true, tags: true },
        take: 5000,
        orderBy: { lastMessageAt: "desc" },
      }),
    ]);

    let facebookCount = 0;
    let zaloCount = 0;
    let instagramCount = 0;
    let whatsappCount = 0;
    let webchatCount = 0;
    let qualifiedCount = 0;
    let purchaseCount = 0;

    const pageCategoryMap = new Map<string, string>();
    const pageNameMap = new Map<string, string>();
    allFanpages.forEach((p) => {
      pageCategoryMap.set(p.pageId, (p.category || "").toLowerCase());
      pageNameMap.set(p.pageId, (p.pageName || "").toLowerCase());
    });

    for (const c of recentConvs) {
      const cat = pageCategoryMap.get(c.pageId) || "";
      const name = pageNameMap.get(c.pageId) || "";

      if (c.igsid || cat.includes("instagram") || name.includes("instagram") || name.includes("ig ")) {
        instagramCount++;
      } else if (cat.includes("zalo") || name.includes("zalo")) {
        zaloCount++;
      } else if (cat.includes("whatsapp") || name.includes("whatsapp")) {
        whatsappCount++;
      } else if (cat.includes("web") || name.includes("webchat")) {
        webchatCount++;
      } else {
        facebookCount++;
      }

      if (c.tags) {
        if (c.tags.includes("DDH") || c.tags.includes("LỊCH") || c.tags.includes("QUALIFIED")) {
          qualifiedCount++;
        }
        if (c.tags.includes("#ĐẬU") || c.tags.includes("#") || c.tags.includes("PURCHASE")) {
          purchaseCount++;
        }
      }
    }

    // Tỉ lệ scale nếu tổng DB > 5000
    const ratio = totalConversations > 0 && recentConvs.length > 0
      ? totalConversations / recentConvs.length
      : 1;

    return NextResponse.json({
      success: true,
      data: {
        totalConversations,
        totalWithPhone,
        totalQualified: Math.round(qualifiedCount * ratio),
        totalPurchase: Math.round(purchaseCount * ratio),
        channels: {
          facebook: Math.round(facebookCount * ratio) || totalConversations,
          zalo: Math.round(zaloCount * ratio) || 0,
          instagram: Math.round(instagramCount * ratio) || 0,
          whatsapp: Math.round(whatsappCount * ratio) || 0,
          webchat: Math.round(webchatCount * ratio) || 0,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
