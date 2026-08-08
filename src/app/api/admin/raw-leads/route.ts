import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const tab = (searchParams.get("tab") || "FORM").toUpperCase(); // "FORM" | "CLICKS"
    const channel = (searchParams.get("channel") || "ALL").toUpperCase();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(100, Math.max(10, Number(searchParams.get("pageSize")) || 30));

    // Base condition for Form submissions (Completed info + Phone number)
    const formBaseCondition: any = {
      subject: { not: "" },
      NOT: [
        { subject: null as any },
        { conversionStage: { startsWith: "CLICK_" } },
      ],
    };

    // Base condition for Button Clicks (Outbound Clicks)
    const clickBaseCondition: any = {
      conversionStage: { startsWith: "CLICK_" },
    };

    if (channel !== "ALL") {
      if (channel === "ZALO") {
        clickBaseCondition.conversionStage = { in: ["CLICK_ZALO", "CLICK_ZALO_CHAT"] };
      } else if (channel === "HOTLINE") {
        clickBaseCondition.conversionStage = { in: ["CLICK_HOTLINE", "CLICK_CALL", "CLICK_PHONE"] };
      } else if (channel === "MESSENGER") {
        clickBaseCondition.conversionStage = { in: ["CLICK_MESSENGER", "CLICK_MESS", "CLICK_FB_MESSENGER"] };
      } else if (channel === "WHATSAPP") {
        clickBaseCondition.conversionStage = { in: ["CLICK_WHATSAPP", "CLICK_WA"] };
      }
    }

    let where: any = tab === "CLICKS" ? clickBaseCondition : formBaseCondition;

    if (search) {
      where = {
        AND: [
          where,
          {
            OR: [
              { name: { contains: search } },
              { subject: { contains: search } },
              { email: { contains: search } },
              { message: { contains: search } },
              { conversionStage: { contains: search } },
            ],
          },
        ],
      };
    }

    // Query stats and paginated items simultaneously
    const [
      totalForms,
      totalClicks,
      clickZalo,
      clickHotline,
      clickMessenger,
      clickWhatsapp,
      totalCount,
      rawLeads,
    ] = await Promise.all([
      db.contactMessage.count({ where: formBaseCondition }),
      db.contactMessage.count({ where: { conversionStage: { startsWith: "CLICK_" } } }),
      db.contactMessage.count({ where: { conversionStage: { in: ["CLICK_ZALO", "CLICK_ZALO_CHAT"] } } }),
      db.contactMessage.count({ where: { conversionStage: { in: ["CLICK_HOTLINE", "CLICK_CALL", "CLICK_PHONE"] } } }),
      db.contactMessage.count({ where: { conversionStage: { in: ["CLICK_MESSENGER", "CLICK_MESS", "CLICK_FB_MESSENGER"] } } }),
      db.contactMessage.count({ where: { conversionStage: { in: ["CLICK_WHATSAPP", "CLICK_WA"] } } }),
      db.contactMessage.count({ where }),
      db.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: rawLeads,
      stats: {
        totalForms,
        totalClicks,
        clickZalo,
        clickHotline,
        clickMessenger,
        clickWhatsapp,
      },
      pagination: {
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize) || 1,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi tải dữ liệu khách thô" }, { status: 500 });
  }
}
